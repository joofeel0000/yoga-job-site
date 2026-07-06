-- ============================================================
-- is_dummy 컬럼 추가 + 기존 더미 데이터 일괄 업데이트
-- Supabase Dashboard → SQL Editor 에서 실행하세요
-- ============================================================

-- 1. 컬럼 추가 (이미 있으면 무시)
ALTER TABLE job             ADD COLUMN IF NOT EXISTS is_dummy boolean NOT NULL DEFAULT false;
ALTER TABLE candidate       ADD COLUMN IF NOT EXISTS is_dummy boolean NOT NULL DEFAULT false;
ALTER TABLE property        ADD COLUMN IF NOT EXISTS is_dummy boolean NOT NULL DEFAULT false;
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS is_dummy boolean NOT NULL DEFAULT false;

-- ============================================================
-- 2. 기존 더미 데이터 is_dummy = true 로 업데이트
--
-- 판별 기준:
--   job / candidate  : user_id IS NULL  (SEED_USER_ID 없이 삽입된 경우)
--   property         : user_id IS NULL  OR  contact 가 seed 스크립트 더미 패턴
--   community_posts  : user_id IS NULL  OR  author_email 이 seed 스크립트 더미 이메일
--
-- ※ SEED_USER_ID 를 환경변수로 지정해 삽입된 데이터가 있다면
--   아래 주석 처리된 구문의 '<YOUR_SEED_USER_ID>' 를 실제 UUID 로 교체 후 실행하세요.
-- ============================================================

-- job
UPDATE job SET is_dummy = true
WHERE user_id IS NULL;
-- OR user_id = '<YOUR_SEED_USER_ID>';  -- SEED_USER_ID 를 지정했던 경우 추가

-- candidate
UPDATE candidate SET is_dummy = true
WHERE user_id IS NULL;
-- OR user_id = '<YOUR_SEED_USER_ID>';

-- property: contact 번호가 seed 스크립트에 하드코딩된 더미 번호와 일치하면 추가 마킹
UPDATE property SET is_dummy = true
WHERE user_id IS NULL
   OR contact IN (
       '010-1111-2222', '010-2222-3333', '010-3333-4444', '010-4444-5555',
       '010-5555-6666', '010-6666-7777', '010-7777-8888', '010-8888-9999',
       '010-9999-1111', '010-1234-5678'
   );

-- community_posts: author_email 이 seed 스크립트의 AUTHOR_EMAILS 목록과 일치하면 더미
UPDATE community_posts SET is_dummy = true
WHERE user_id IS NULL
   OR author_email IN (
       'yoga.teacher01@gmail.com',
       'studio.owner.kr@naver.com',
       'hatha.lover@gmail.com',
       'vinyasa.pro@naver.com',
       'mindful.yoga@gmail.com',
       'yogini2024@naver.com',
       'breathe.flow@gmail.com',
       'zen.yoga.kr@naver.com',
       'sunrise.asana@gmail.com',
       'lotus.instructor@naver.com',
       'morning.flow@gmail.com',
       'yin.yang.yoga@naver.com'
   );

-- 확인 쿼리 (실행 후 결과 검증용)
SELECT 'job'             AS tbl, COUNT(*) FILTER (WHERE is_dummy) AS dummy, COUNT(*) FILTER (WHERE NOT is_dummy) AS real FROM job
UNION ALL
SELECT 'candidate',      COUNT(*) FILTER (WHERE is_dummy), COUNT(*) FILTER (WHERE NOT is_dummy) FROM candidate
UNION ALL
SELECT 'property',       COUNT(*) FILTER (WHERE is_dummy), COUNT(*) FILTER (WHERE NOT is_dummy) FROM property
UNION ALL
SELECT 'community_posts',COUNT(*) FILTER (WHERE is_dummy), COUNT(*) FILTER (WHERE NOT is_dummy) FROM community_posts;
