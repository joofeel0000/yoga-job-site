-- =============================================
-- 요가 매물 게시판 테이블
-- =============================================
CREATE TABLE property (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  property_type TEXT NOT NULL DEFAULT '임대',
  location TEXT,
  area TEXT,
  price TEXT,
  description TEXT,
  contact TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE property ENABLE ROW LEVEL SECURITY;

CREATE POLICY "property_read_all"   ON property FOR SELECT USING (true);
CREATE POLICY "property_insert_auth" ON property FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "property_update_own" ON property FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "property_delete_own" ON property FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 커뮤니티 게시글 테이블
-- =============================================
CREATE TABLE community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT '자유게시판',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_email TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_read_all"    ON community_posts FOR SELECT USING (true);
CREATE POLICY "posts_insert_auth" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_own"  ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete_own"  ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 커뮤니티 댓글 테이블
-- =============================================
CREATE TABLE community_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_email TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_read_all"    ON community_comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_auth" ON community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update_own"  ON community_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comments_delete_own"  ON community_comments FOR DELETE USING (auth.uid() = user_id);
