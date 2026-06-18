'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const CATEGORIES = ['전체', '자유게시판', '요가정보', 'Q&A', '후기'];

const categoryColor = {
  '자유게시판': 'bg-stone-100 text-stone-600',
  '요가정보': 'bg-green-100 text-green-700',
  'Q&A': 'bg-blue-100 text-blue-700',
  '후기': 'bg-amber-100 text-amber-700',
};

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');

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
    else setPosts(data || []);
    setLoading(false);
  };

  const filtered = posts.filter((p) => {
    const matchSearch =
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = activeCategory === '전체' || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-emerald-50/20">
      <div className="max-w-4xl mx-auto px-8 py-10">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 tracking-tight">커뮤니티</h1>
            <p className="text-stone-400 text-sm mt-1">요가 강사와 센터가 소통하는 공간</p>
          </div>
          <div className="flex gap-3">
            <Link href="/post-community">
              <button className="px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-full hover:bg-green-800 transition">
                + 글쓰기
              </button>
            </Link>
            <Link href="/" className="text-sm text-green-700 hover:text-green-800 font-medium transition-colors self-center">
              ← 홈으로
            </Link>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === cat
                  ? 'bg-green-700 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-green-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 mb-6">
          <input
            type="text"
            placeholder="제목, 작성자로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-stone-400">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-stone-100">
            <span className="text-5xl mb-4">💬</span>
            <p className="text-stone-500 font-medium">게시글이 없습니다</p>
            <Link href="/post-community" className="mt-4 text-green-700 hover:underline text-sm">
              첫 글을 작성해보세요
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">
            {filtered.map((post) => {
              const commentCount = post.community_comments?.[0]?.count ?? 0;
              return (
                <Link key={post.id} href={`/community/${post.id}`}>
                  <div className="p-5 hover:bg-green-50/50 transition cursor-pointer">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${categoryColor[post.category] || 'bg-stone-100 text-stone-600'}`}>
                        {post.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-stone-800 text-sm truncate">{post.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-400">
                      <span>{post.author_email?.split('@')[0]}</span>
                      <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                      <span>👁 {post.views ?? 0}</span>
                      {commentCount > 0 && <span>💬 {commentCount}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
