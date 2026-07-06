-- ============================================================
-- banners 테이블 RLS 완전 설정
-- BannerZone에서 익명 사용자도 활성 배너를 조회할 수 있도록 수정
-- Supabase Dashboard → SQL Editor 에서 실행하세요
-- ============================================================

-- 기존 정책 제거 (이름 충돌 방지)
DROP POLICY IF EXISTS "Users can select their own banners"       ON banners;
DROP POLICY IF EXISTS "Authenticated users can apply for banners" ON banners;

-- RLS 활성화 (이미 활성화돼 있어도 에러 없음)
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- 1. 공개 SELECT: 활성 배너만 (BannerZone — 비로그인 포함 모든 방문자)
CREATE POLICY "Public select active banners"
  ON banners FOR SELECT
  USING (is_active = true);

-- 2. 사용자 SELECT: 본인이 신청한 배너 전체 (마이페이지 통계용)
CREATE POLICY "Users select own banners"
  ON banners FOR SELECT
  USING (auth.uid() = user_id);

-- 3. 관리자 SELECT: 전체 (비활성·미승인 포함)
CREATE POLICY "Admins select all banners"
  ON banners FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. 사용자 INSERT: 본인 광고 신청
CREATE POLICY "Users insert own banner"
  ON banners FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5. 관리자 UPDATE: 승인·수정
CREATE POLICY "Admins update banners"
  ON banners FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. 관리자 DELETE: 삭제·거절
CREATE POLICY "Admins delete banners"
  ON banners FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
