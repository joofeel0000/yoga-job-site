-- 의견 게시판 이벤트: 로그인 회원에게 '참여 현황' 목록 공개 (내용·휴대폰·이메일은 비공개 유지)
--  · 노출 항목: 선착순 번호, 참여일시, 회원 유형, 마스킹된 이름, 쿠폰 발송 여부
--  · 테이블 RLS 는 그대로(작성자/관리자만 조회). 이 함수만 SECURITY DEFINER 로 일부 컬럼을 열어 준다.

create or replace function public.feedback_mask_name(p text)
returns text
language sql
immutable
as $$
  select case
    when p is null or btrim(p) = '' then '회원'
    when char_length(btrim(p)) = 1 then btrim(p)
    when char_length(btrim(p)) = 2 then left(btrim(p), 1) || '*'
    else left(btrim(p), 1) || repeat('*', char_length(btrim(p)) - 2) || right(btrim(p), 1)
  end;
$$;

create or replace function public.feedback_participants()
returns table (
  seq          integer,
  created_at   timestamptz,
  member_type  text,
  display_name text,
  coupon_sent  boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select f.seq,
         f.created_at,
         f.member_type,
         public.feedback_mask_name(coalesce(nullif(btrim(f.author_name), ''), split_part(f.author_email, '@', 1))),
         (f.coupon_sent_at is not null)
  from public.feedback_posts f
  where auth.uid() is not null          -- 로그인 회원만
  order by f.seq;
$$;

revoke all on function public.feedback_participants() from public;
revoke all on function public.feedback_mask_name(text) from public;
grant execute on function public.feedback_participants() to authenticated;
