'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import BannerZone from '@/app/components/BannerZone';

const TABS = ['전체', '자유게시판', '강사Q&A', '노하우', '후기'];

const catColor = {
  '자유게시판': { bg: '#F4F1E9', text: '#76705F' },
  '강사Q&A': { bg: '#EEF2FF', text: '#4B5CB8' },
  '노하우': { bg: '#F0FDF4', text: '#16A34A' },
  '후기': { bg: '#FDF3E3', text: '#C2922F' },
  'Q&A': { bg: '#EEF2FF', text: '#4B5CB8' },
  '요가정보': { bg: '#F0FDF4', text: '#16A34A' },
};

function CatBadge({ cat }) {
  const c = catColor[cat] || { bg: '#F4F1E9', text: '#76705F' };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: c.bg, color: c.text }}>
      {cat}
    </span>
  );
}

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [hotPosts, setHotPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('전체');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('community_posts')
      .select(`*, community_comments(count)`)
      .order('created_at', { ascending: false });

    if (error) console.error('에러:', error);
    else {
      setPosts(data || []);
      const sorted = [...(data || [])].sort((a, b) => (b.views || 0) - (a.views || 0));
      setHotPosts(sorted.slice(0, 5));
    }
    setLoading(false);
  };

  const filtered = posts.filter(p => {
    if (activeTab === '전체') return true;
    return p.category === activeTab;
  });

  return (
    <main style={{ minHeight: '100vh', background: '#F4F1E9' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#23211C', marginBottom: 4 }}>커뮤니티</h1>
            <p style={{ fontSize: 14, color: '#9A9382' }}>요가 강사와 센터가 소통하는 공간</p>
          </div>
          <Link href="/post-community">
            <button style={{
              padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: '#23211C', color: '#fff', border: 'none', cursor: 'pointer',
            }}>
              + 글쓰기
            </button>
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #E3DDD0' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 20px', fontSize: 14, fontWeight: activeTab === tab ? 700 : 400,
              color: activeTab === tab ? '#23211C' : '#76705F',
              background: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #23211C' : '2px solid transparent',
              marginBottom: -2, transition: 'all 0.15s',
            }}>
              {tab}
            </button>
          ))}
        </div>

        <BannerZone position="community_top" />

        {/* 2-col layout */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* Left: post list */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9A9382', fontSize: 14 }}>불러오는 중...</div>
            ) : filtered.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E3DDD0', padding: '60px 24px', textAlign: 'center' }}>
                <p style={{ color: '#76705F', fontSize: 15, fontWeight: 600 }}>게시글이 없습니다</p>
                <Link href="/post-community" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: '#23211C', textDecoration: 'underline' }}>
                  첫 글을 작성해보세요
                </Link>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E3DDD0', overflow: 'hidden' }}>
                {filtered.map((post, idx) => {
                  const commentCount = post.community_comments?.[0]?.count ?? 0;
                  return (
                    <PostRow key={post.id} post={post} commentCount={commentCount} isLast={idx === filtered.length - 1} />
                  );
                })}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* 주간 인기글 */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E3DDD0', padding: '20px 18px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#23211C', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                🔥 주간 인기글
              </h3>
              {hotPosts.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9A9382' }}>인기글이 없습니다</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {hotPosts.map((p, i) => (
                    <Link key={p.id} href={`/community/${p.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: i < 3 ? '#C2922F' : '#9A9382', flexShrink: 0, width: 16 }}>{i + 1}</span>
                        <p style={{ fontSize: 13, color: '#23211C', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 강사 인증 프로모 */}
            <div style={{ background: '#23211C', borderRadius: 14, padding: '20px 18px' }}>
              <p style={{ fontSize: 12, color: '#CFC9BB', marginBottom: 6, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>강사 인증</p>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8, lineHeight: 1.4 }}>
                자격증을 등록하고<br />신뢰도를 높이세요
              </h3>
              <p style={{ fontSize: 12, color: '#9A9382', marginBottom: 16 }}>인증 배지로 더 많은 기회를</p>
              <Link href="/certify">
                <button style={{
                  width: '100%', padding: '10px 0', borderRadius: 9, fontSize: 13, fontWeight: 700,
                  background: '#C2922F', color: '#fff', border: 'none', cursor: 'pointer',
                }}>
                  인증 신청하기
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function PostRow({ post, commentCount, isLast }) {
  const [hover, setHover] = useState(false);
  return (
    <Link href={`/community/${post.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          padding: '16px 20px',
          borderBottom: isLast ? 'none' : '1px solid #F4F1E9',
          background: hover ? '#FAFAF8' : '#fff',
          transition: 'background 0.1s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <CatBadge cat={post.category} />
        </div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#23211C', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {post.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#9A9382' }}>
          <span>{post.author_email?.split('@')[0]}</span>
          <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
          <span>👁 {post.views ?? 0}</span>
          {commentCount > 0 && <span style={{ color: '#23211C', fontWeight: 600 }}>💬 {commentCount}</span>}
        </div>
      </div>
    </Link>
  );
}
