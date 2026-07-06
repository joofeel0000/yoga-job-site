-- ============================================================
-- Supabase Storage 버킷 생성 + RLS 정책
-- Supabase Dashboard → SQL Editor 에서 실행하세요
-- ============================================================

-- 1. 버킷 생성 (이미 있으면 무시)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('banners', 'banners', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2. banners 버킷 정책
CREATE POLICY "Public banners select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

CREATE POLICY "Authenticated banners insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'banners');

CREATE POLICY "Owner banners delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'banners' AND auth.uid() = owner::uuid);

-- 3. avatars 버킷 정책
CREATE POLICY "Public avatars select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated avatars insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Owner avatars delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid() = owner::uuid);
