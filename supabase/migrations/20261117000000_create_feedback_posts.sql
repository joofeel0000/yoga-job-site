-- =============================================================
-- 커피 쿠폰 이벤트 "의견 게시판" (/feedback) — 비공개
--   · 로그인 회원만 작성, 1인 1회 (user_id UNIQUE)
--   · 선착순 100명 — INSERT 시점에 advisory lock 으로 직렬화 후 개수 확인
--   · 마감: 2026-12-15 23:59:59 KST (= 2026-12-15T14:59:59Z), DB 서버 시간(now()) 기준
--   · 삭제 불가 (선착순 자리가 바뀌므로) — DELETE 정책/권한 없음
--   · 열람: 작성자는 자기 글만, 관리자(profiles.role='admin')는 전체
-- 이 테이블에는 더미데이터 시드(scripts/seed-dummy-data.js, /api/cron/seed)가
-- 절대 INSERT 하지 않는다. is_dummy 컬럼도 두지 않는다.
-- =============================================================

-- ─── 관리자 판별 (RLS 재귀 방지용 SECURITY DEFINER) ─────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ─── 테이블 ─────────────────────────────────────────────────────
create table public.feedback_posts (
  id               uuid primary key default gen_random_uuid(),
  seq              integer not null unique,                       -- 선착순 번호 (트리거가 부여)
  user_id          uuid unique references auth.users(id) on delete set null,
  author_email     text,                                          -- 작성 시점 스냅샷 (트리거가 채움)
  author_name      text,                                          -- 작성 시점 스냅샷 (트리거가 채움)
  member_type      text not null check (member_type in ('center', 'instructor')),
  pain_point       text not null check (char_length(btrim(pain_point)) between 1 and 3000),
  wish             text check (wish is null or char_length(wish) <= 3000),
  phone            text not null check (phone ~ '^010-[0-9]{4}-[0-9]{4}$'),
  privacy_agreed   boolean not null check (privacy_agreed = true),
  privacy_agreed_at timestamptz not null default now(),
  admin_reply      text,
  admin_replied_at timestamptz,
  coupon_sent_at   timestamptz,                                   -- 쿠폰 발송일 (null = 미발송)
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.feedback_posts is
  '커피 쿠폰 이벤트 의견 게시판. 선착순 100명, 마감 2026-12-15 23:59:59 KST. 삭제 불가. 더미 시드 금지.';

-- ─── INSERT 트리거: 마감 · 선착순 · 서버 값 강제 ────────────────
-- SECURITY DEFINER: RLS 때문에 호출자는 자기 글만 보이므로, 전체 개수는 소유자 권한으로 센다.
create or replace function public.feedback_posts_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deadline constant timestamptz := timestamptz '2026-12-15 23:59:59+09';
  v_cap      constant integer := 100;
  v_next     integer;
begin
  -- 동시 INSERT 직렬화. 트랜잭션 종료 시 자동 해제.
  perform pg_advisory_xact_lock(hashtext('feedback_posts_cap'));

  if now() > v_deadline then
    raise exception 'FEEDBACK_CLOSED: 이벤트가 마감되었습니다.' using errcode = 'P0001';
  end if;

  select coalesce(max(seq), 0) + 1 into v_next from public.feedback_posts;
  if (select count(*) from public.feedback_posts) >= v_cap then
    raise exception 'FEEDBACK_FULL: 선착순 % 명이 모두 참여했습니다.', v_cap using errcode = 'P0001';
  end if;

  -- 클라이언트가 보낸 서버 관리 값은 무시
  NEW.seq              := v_next;
  NEW.created_at       := now();
  NEW.updated_at       := now();
  NEW.privacy_agreed_at := now();
  NEW.admin_reply      := null;
  NEW.admin_replied_at := null;
  NEW.coupon_sent_at   := null;

  if NEW.user_id is not null then
    select u.email into NEW.author_email from auth.users u where u.id = NEW.user_id;
    select p.name  into NEW.author_name  from public.profiles p where p.id = NEW.user_id;
  end if;

  return NEW;
end;
$$;

create trigger feedback_posts_before_insert
  before insert on public.feedback_posts
  for each row execute function public.feedback_posts_before_insert();

-- ─── UPDATE 트리거: 작성자 수정 범위·마감 제한 ──────────────────
-- 관리자(is_admin) 와 service_role/SQL 편집기(auth.uid() is null)는 제한 없음.
-- 그 외(작성자)는 member_type / pain_point / wish / phone 만, 마감 전에만 수정 가능.
create or replace function public.feedback_posts_before_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deadline constant timestamptz := timestamptz '2026-12-15 23:59:59+09';
begin
  -- 어느 경우에도 불변
  if NEW.id is distinct from OLD.id
     or NEW.seq is distinct from OLD.seq
     or NEW.user_id is distinct from OLD.user_id
     or NEW.created_at is distinct from OLD.created_at then
    raise exception 'FEEDBACK_IMMUTABLE: 번호·작성자·작성일은 변경할 수 없습니다.' using errcode = 'P0001';
  end if;

  if auth.uid() is not null and not public.is_admin() then
    if now() > v_deadline then
      raise exception 'FEEDBACK_CLOSED: 마감 후에는 수정할 수 없습니다.' using errcode = 'P0001';
    end if;
    if NEW.admin_reply is distinct from OLD.admin_reply
       or NEW.admin_replied_at is distinct from OLD.admin_replied_at
       or NEW.coupon_sent_at is distinct from OLD.coupon_sent_at
       or NEW.author_email is distinct from OLD.author_email
       or NEW.author_name is distinct from OLD.author_name
       or NEW.privacy_agreed is distinct from OLD.privacy_agreed
       or NEW.privacy_agreed_at is distinct from OLD.privacy_agreed_at then
      raise exception 'FEEDBACK_FORBIDDEN: 수정할 수 없는 항목입니다.' using errcode = 'P0001';
    end if;
  end if;

  NEW.updated_at := now();
  return NEW;
end;
$$;

create trigger feedback_posts_before_update
  before update on public.feedback_posts
  for each row execute function public.feedback_posts_before_update();

-- ─── RLS ────────────────────────────────────────────────────────
alter table public.feedback_posts enable row level security;

create policy feedback_select_own on public.feedback_posts
  for select to authenticated using (user_id = auth.uid());

create policy feedback_select_admin on public.feedback_posts
  for select to authenticated using (public.is_admin());

create policy feedback_insert_own on public.feedback_posts
  for insert to authenticated with check (user_id = auth.uid());

create policy feedback_update_own on public.feedback_posts
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy feedback_update_admin on public.feedback_posts
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- DELETE 정책 없음 + 권한 회수 (삭제 불가)
revoke all on public.feedback_posts from anon, authenticated;
grant select, insert, update on public.feedback_posts to authenticated;

-- ─── 공개 현황 RPC: 남은 쿠폰 / 마감 여부 (서버 시간 기준) ─────
create or replace function public.feedback_status()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'cap',      100,
    'taken',    t.n,
    'remaining', greatest(100 - t.n, 0),
    'deadline', timestamptz '2026-12-15 23:59:59+09',
    'now',      now(),
    'open',     (t.n < 100 and now() <= timestamptz '2026-12-15 23:59:59+09')
  )
  from (select count(*)::int as n from public.feedback_posts) t;
$$;

revoke all on function public.feedback_status() from public;
grant execute on function public.feedback_status() to anon, authenticated;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
