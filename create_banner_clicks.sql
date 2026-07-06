-- ============================================================
-- 배너 광고 통계 시스템
-- Supabase Dashboard → SQL Editor 에서 실행하세요
-- ============================================================

-- 1. banners 테이블에 user_id 추가 (광고주 식별용)
ALTER TABLE banners ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. banner_clicks 테이블 생성
CREATE TABLE IF NOT EXISTS banner_clicks (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  banner_id   uuid        NOT NULL REFERENCES banners(id) ON DELETE CASCADE,
  event_type  text        NOT NULL CHECK (event_type IN ('view', 'click')),
  clicked_at  timestamptz DEFAULT now() NOT NULL,
  page_url    text,
  user_agent  text
);

-- 3. 인덱스
CREATE INDEX IF NOT EXISTS idx_banner_clicks_banner_id  ON banner_clicks(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_clicked_at ON banner_clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_event_type ON banner_clicks(event_type);

-- 4. RLS 활성화
ALTER TABLE banner_clicks ENABLE ROW LEVEL SECURITY;

-- 5. RLS 정책
--   누구나 insert 가능 (비로그인 방문자도 노출/클릭 기록)
CREATE POLICY "Anyone can insert banner_clicks"
  ON banner_clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

--   관리자 또는 배너 소유자만 조회 가능 (두 조건을 OR로 통합)
CREATE POLICY "Select banner_clicks"
  ON banner_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM banners
      WHERE banners.id = banner_clicks.banner_id
        AND banners.user_id = auth.uid()
    )
  );

-- 6. banners RLS: 광고주 본인 배너 조회 허용 (mypage용)
--    (이미 정책이 있다면 중복 에러 발생 시 해당 줄 주석 처리)
CREATE POLICY "Users can select their own banners"
  ON banners FOR SELECT
  USING (user_id = auth.uid());
