-- ============================================================
-- 배너 광고 테이블 생성 SQL
-- Supabase Dashboard → SQL Editor 에 복붙하여 실행하세요
-- ============================================================

create table if not exists banners (
  id             uuid         default gen_random_uuid() primary key,
  title          text         not null,
  image_url      text         not null,
  link_url       text,
  position       text         not null
                   check (position in ('home_top', 'home_strip', 'home_bottom', 'jobs_top', 'resumes_top')),
  is_active      boolean      not null default true,
  starts_at      timestamptz,
  ends_at        timestamptz,
  display_order  integer      not null default 0,
  created_at     timestamptz  not null default now()
);

-- position + display_order 기준 조회 최적화
create index if not exists banners_position_order_idx
  on banners (position, is_active, display_order);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table banners enable row level security;

-- 누구나 배너를 조회할 수 있습니다 (클라이언트에서 활성/기간 필터링)
create policy "Anyone can view banners"
  on banners for select
  to public
  using (true);

-- 관리자만 배너를 등록할 수 있습니다
create policy "Admins can insert banners"
  on banners for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- 관리자만 배너를 수정할 수 있습니다
create policy "Admins can update banners"
  on banners for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- 관리자만 배너를 삭제할 수 있습니다
create policy "Admins can delete banners"
  on banners for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- ============================================================
-- position 값 설명
--   home_top      : 메인 페이지 상단 (자동 슬라이드 캐러셀)
--   home_strip    : 메인 페이지 히어로 아래 풀width 띠배너
--   home_bottom   : 메인 페이지 하단 (3열 그리드 카드)
--   jobs_top      : 구인공고 목록 우측 사이드바
--   resumes_top   : 강사찾기 목록 우측 사이드바
-- ============================================================
