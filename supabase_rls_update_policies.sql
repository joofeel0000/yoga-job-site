-- ============================================================
-- RLS UPDATE 정책 — 본인 데이터만 수정 가능
-- Supabase Dashboard > SQL Editor 에서 실행하세요
-- ============================================================

-- 1. candidate 테이블: 본인 이력서만 UPDATE
CREATE POLICY "본인 이력서 수정"
  ON candidate
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. job 테이블: 본인 구인공고만 UPDATE
CREATE POLICY "본인 구인공고 수정"
  ON job
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 이미 정책이 있으면 DROP 후 재생성:
-- ============================================================
-- DROP POLICY IF EXISTS "본인 이력서 수정" ON candidate;
-- DROP POLICY IF EXISTS "본인 구인공고 수정" ON job;
-- (위 두 줄을 먼저 실행한 후 CREATE POLICY 다시 실행)
-- ============================================================

-- avatars 버킷 업로드 허용 (이미 있으면 스킵)
-- Storage > Policies 에서 설정하거나 아래 SQL 실행:
INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "인증된 사용자 아바타 업로드"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "아바타 공개 조회"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
