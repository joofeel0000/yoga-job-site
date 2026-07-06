-- ============================================================
-- banners 테이블 notes 컬럼 추가 + 사용자 INSERT RLS 정책
-- Supabase Dashboard → SQL Editor 에서 실행하세요
-- ============================================================

-- 1. notes 컬럼 추가 (광고 신청 시 문의 내용)
ALTER TABLE banners ADD COLUMN IF NOT EXISTS notes text;

-- 2. 인증 사용자가 광고를 신청(INSERT)할 수 있도록 정책 추가
--    (이미 동일 이름의 정책이 있으면 에러 발생 → 해당 줄 주석 처리)
CREATE POLICY "Authenticated users can apply for banners"
  ON banners FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
