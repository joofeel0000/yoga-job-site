-- ============================================================
-- banners 테이블 position 체크 제약조건에
-- property_strip, community_strip 추가
-- Supabase Dashboard → SQL Editor 에서 실행하세요
-- ============================================================

-- 1. 기존 제약조건 이름 확인 (실행 후 아래 DROP 구문에 사용)
SELECT conname
FROM pg_constraint
WHERE conrelid = 'banners'::regclass
  AND contype = 'c'
  AND conname ILIKE '%position%';

-- 2. 기존 position 체크 제약조건 삭제 (이름이 다를 경우 아래 conname 으로 교체)
ALTER TABLE banners DROP CONSTRAINT IF EXISTS banners_position_check;

-- 3. 새 제약조건 추가 (기존 값 + property_strip, community_strip)
ALTER TABLE banners
  ADD CONSTRAINT banners_position_check CHECK (
    position IN (
      'home_top',
      'home_strip',
      'home_bottom',
      'jobs_top',
      'jobs_bottom',
      'resumes_top',
      'resumes_bottom',
      'community_top',
      'community_strip',
      'property_top',
      'property_strip'
    )
  );
