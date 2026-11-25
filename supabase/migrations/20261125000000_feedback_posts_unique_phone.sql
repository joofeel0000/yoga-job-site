-- 의견 게시판 이벤트: 같은 휴대폰 번호로 여러 계정이 중복 참여하는 것을 DB에서 차단
-- (phone 은 010-0000-0000 형식으로 강제되므로 단순 UNIQUE 로 충분)
alter table public.feedback_posts
  add constraint feedback_posts_phone_key unique (phone);
