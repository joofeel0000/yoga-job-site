'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BannerZone from '@/app/components/BannerZone';

const PAGE_SIZE = 12;
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

function PostRow({ post, commentCount, isLast }) {
  return (
    <Link href={`/community/${post.id}`} className="no-underline block">
      <div className={`px-5 py-4 hover:bg-[#FAFAF8] transition-colors duration-100 ${isLast ? '' : 'border-b border-[#F4F1E9]'}`}>
        <div className="flex items-center gap-2 mb-[6px]">
          <CatBadge cat={post.category} />
          {post.is_dummy && (
            <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 6, background: '#EDEBE5', color: '#A09B8E', border: '1px solid #DEDAD2' }}>샘플</span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-[#23211C] mb-[6px] truncate">
          {post.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-[#9A9382]">
          <span>{post.author_email?.split('@')[0]}</span>
          <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
          <span>👁 {post.views ?? 0}</span>
          {commentCount > 0 && <span className="text-[#23211C] font-semibold">💬 {commentCount}</span>}
        </div>
      </div>
    </Link>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('…');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-1 mt-6 mb-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-[9px] border border-[#E3DDD0] bg-white text-[#76705F] text-base font-bold disabled:opacity-30 hover:bg-[#F4F1E9] transition"
      >‹</button>
      {getPages().map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-[#9A9382] text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-[9px] text-sm font-semibold border transition ${
              p === currentPage
                ? 'bg-[#23211C] text-white border-[#23211C]'
                : 'bg-white text-[#76705F] border-[#E3DDD0] hover:bg-[#F4F1E9]'
            }`}
          >{p}</button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-[9px] border border-[#E3DDD0] bg-white text-[#76705F] text-base font-bold disabled:opacity-30 hover:bg-[#F4F1E9] transition"
      >›</button>
    </div>
  );
}

function CommunityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [hotPosts, setHotPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('전체');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const skipReset = useRef(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (skipReset.current) { skipReset.current = false; return; }
    setCurrentPage(1);
    const params = new URLSearchParams(window.location.search);
    params.delete('page');
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [activeTab]);

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

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedPosts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const params = new URLSearchParams(window.location.search);
    params.set('page', page);
    router.push(`?${params.toString()}`);
  };

  return (
    <main className="page-root">
      <div className="content-wrap">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-[#23211C] mb-1">커뮤니티</h1>
            <p className="text-sm text-[#9A9382]">요가 강사와 센터가 소통하는 공간</p>
          </div>
          <Link href="/post-community">
            <button className="btn-primary px-5 py-[10px] text-sm">+ 글쓰기</button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex mb-5 border-b-2 border-[#E3DDD0]">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-[10px] text-sm border-none cursor-pointer bg-transparent transition-all duration-150 -mb-[2px] border-b-2 ${
                activeTab === tab
                  ? 'font-bold text-[#23211C] border-b-[#23211C]'
                  : 'font-normal text-[#76705F] border-b-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <BannerZone position="community_top" />

        {/* 2-col layout */}
        <div className="flex gap-5 items-start">

          {/* Left: post list */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="state-center">불러오는 중...</div>
            ) : filtered.length === 0 ? (
              <div className="card-empty">
                <p className="text-[#76705F] text-[15px] font-semibold">게시글이 없습니다</p>
                <Link href="/post-community" className="inline-block mt-3 text-[13px] text-[#23211C] underline">
                  첫 글을 작성해보세요
                </Link>
              </div>
            ) : (
              <>
                <p className="text-[13px] text-[#9A9382] mb-3">
                  총 <strong className="text-[#23211C]">{filtered.length}</strong>개 게시글
                  {totalPages > 1 && <span className="ml-1">· {currentPage} / {totalPages} 페이지</span>}
                </p>
                <div className="bg-white rounded-[14px] border border-[#E3DDD0] overflow-hidden">
                  {pagedPosts.map((post, idx) => {
                    const commentCount = post.community_comments?.[0]?.count ?? 0;
                    return (
                      <PostRow key={post.id} post={post} commentCount={commentCount} isLast={idx === pagedPosts.length - 1} />
                    );
                  })}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </>
            )}
          </div>

          {/* Right sidebar */}
          <div className="w-[260px] shrink-0 flex flex-col gap-[14px]">

            {/* 주간 인기글 */}
            <div className="bg-white rounded-[14px] border border-[#E3DDD0] px-[18px] py-5">
              <h3 className="text-sm font-bold text-[#23211C] mb-[14px] flex items-center gap-[6px]">
                🔥 주간 인기글
              </h3>
              {hotPosts.length === 0 ? (
                <p className="text-[13px] text-[#9A9382]">인기글이 없습니다</p>
              ) : (
                <div className="flex flex-col gap-[10px]">
                  {hotPosts.map((p, i) => (
                    <Link key={p.id} href={`/community/${p.id}`} className="no-underline">
                      <div className="flex gap-[10px] items-start">
                        <span className={`text-[13px] font-bold shrink-0 w-4 ${i < 3 ? 'text-[#C2922F]' : 'text-[#9A9382]'}`}>{i + 1}</span>
                        <p className="text-[13px] text-[#23211C] leading-snug truncate">{p.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 강사 인증 프로모 */}
            <div className="bg-[#23211C] rounded-[14px] px-[18px] py-5">
              <p className="text-xs text-[#CFC9BB] mb-[6px] font-semibold tracking-[0.05em] uppercase">강사 인증</p>
              <h3 className="text-[15px] font-bold text-white mb-2 leading-snug">
                자격증을 등록하고<br />신뢰도를 높이세요
              </h3>
              <p className="text-xs text-[#9A9382] mb-4">인증 배지로 더 많은 기회를</p>
              <Link href="/certify">
                <button className="w-full py-[10px] rounded-[9px] text-[13px] font-bold bg-[#C2922F] text-white border-none cursor-pointer">
                  인증 신청하기
                </button>
              </Link>
            </div>
          </div>
        </div>

        <BannerZone position="community_strip" />
      </div>
    </main>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={null}>
      <CommunityContent />
    </Suspense>
  );
}
