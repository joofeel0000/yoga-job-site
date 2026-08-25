'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import BannerZone from '@/app/components/BannerZone';

const PAGE_SIZE = 12;

const JOB_IMGS = [
  'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=120&auto=format&fit=crop&q=80',
];

const REGIONS = ['서울', '경기', '인천', '부산', '대전', '광주'];
const EMPLOYMENT_TYPES = ['정규직', '파트타임', '프리랜서', '대강'];
const YOGA_STYLES = ['하타', '빈야사', '아쉬탕가', '인요가', '키즈', '명상'];
const SORT_OPTIONS = ['최신순', '인기순', '급여순'];

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-[5px] rounded-full text-[13px] border cursor-pointer transition-all duration-150 whitespace-nowrap ${
        active
          ? 'bg-[#23211C] text-white border-[#23211C] font-semibold'
          : 'bg-transparent text-[#76705F] border-[#E3DDD0] font-normal'
      }`}
    >
      {label}
    </button>
  );
}

function FilterSection({ title, options, selected, onToggle }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-bold text-[#9A9382] tracking-[0.08em] uppercase mb-[10px]">{title}</p>
      <div className="flex flex-wrap gap-[6px]">
        {options.map(opt => (
          <Chip key={opt} label={opt} active={selected.includes(opt)} onClick={() => onToggle(opt)} />
        ))}
      </div>
    </div>
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
    <div className="flex justify-center items-center gap-1 mt-8 mb-2">
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

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('keyword') || '');
  const [selectedRegions, setSelectedRegions] = useState(
    searchParams.get('location') ? [searchParams.get('location')] : []
  );
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState(
    searchParams.get('yoga_style') ? [searchParams.get('yoga_style')] : []
  );
  const [sortBy, setSortBy] = useState('최신순');
  const [bookmarks, setBookmarks] = useState({});
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const skipReset = useRef(true);

  useEffect(() => {
    fetchJobs();
    checkUser();
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileFilterOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileFilterOpen]);

  useEffect(() => {
    if (skipReset.current) { skipReset.current = false; return; }
    setCurrentPage(1);
    const params = new URLSearchParams(window.location.search);
    params.delete('page');
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchTerm, selectedRegions, selectedTypes, selectedStyles, sortBy]);

  const checkUser = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u);
    if (u) {
      const { data } = await supabase.from('bookmarks').select('job_id').eq('user_id', u.id).not('job_id', 'is', null);
      if (data) {
        const map = {};
        data.forEach(b => { map[b.job_id] = true; });
        setBookmarks(map);
      }
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('job').select('*').order('created_at', { ascending: false });
    if (error) console.error('에러:', error);
    else setJobs(data || []);
    setLoading(false);
  };

  const toggleFilter = (selected, setSelected, val) => {
    setSelected(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  const clearAll = () => {
    setSelectedRegions([]);
    setSelectedTypes([]);
    setSelectedStyles([]);
    setSearchTerm('');
  };

  const toggleBookmark = async (e, jobId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { alert('로그인이 필요합니다'); return; }
    if (bookmarks[jobId]) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('job_id', jobId);
      setBookmarks(prev => ({ ...prev, [jobId]: false }));
    } else {
      await supabase.from('bookmarks').insert([{ user_id: user.id, job_id: jobId, candidate_id: null }]);
      setBookmarks(prev => ({ ...prev, [jobId]: true }));
    }
  };

  const hasFilters = selectedRegions.length > 0 || selectedTypes.length > 0 || selectedStyles.length > 0 || searchTerm;
  const filterCount = selectedRegions.length + selectedTypes.length + selectedStyles.length;

  const filteredJobs = jobs.filter(job => {
    const term = searchTerm.toLowerCase();
    const matchSearch = !term || job.title?.toLowerCase().includes(term) || job.location?.toLowerCase().includes(term);
    const matchRegion = selectedRegions.length === 0 || selectedRegions.some(r => job.location?.includes(r));
    const matchType = selectedTypes.length === 0 || selectedTypes.some(t => job.experience?.includes(t) || job.description?.includes(t));
    const matchStyle = selectedStyles.length === 0 || selectedStyles.some(s => job.yoga_style?.includes(s));
    return matchSearch && matchRegion && matchType && matchStyle;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === '최신순') return new Date(b.created_at) - new Date(a.created_at);
    return 0;
  });

  const totalPages = Math.ceil(sortedJobs.length / PAGE_SIZE);
  const pagedJobs = sortedJobs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const params = new URLSearchParams(window.location.search);
    params.set('page', page);
    router.push(`?${params.toString()}`);
  };

  const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 86400) return '오늘';
    if (diff < 86400 * 2) return '1일 전';
    const d = Math.floor(diff / 86400);
    return `${d}일 전`;
  };

  return (
    <main className="page-root">
      <div className="content-wrap flex gap-6 items-start">

        {/* Left Sidebar */}
        <aside className="hidden md:block w-[216px] shrink-0 bg-white rounded-2xl border border-[#E3DDD0] px-[18px] py-[22px] sticky top-[88px]">
          <div className="flex justify-between items-center mb-5">
            <span className="text-[15px] font-bold text-[#23211C]">필터</span>
            {hasFilters && (
              <button onClick={clearAll} className="text-xs text-[#9A9382] cursor-pointer bg-transparent border-none p-0">
                초기화
              </button>
            )}
          </div>
          <FilterSection title="지역" options={REGIONS} selected={selectedRegions} onToggle={(v) => toggleFilter(selectedRegions, setSelectedRegions, v)} />
          <FilterSection title="고용형태" options={EMPLOYMENT_TYPES} selected={selectedTypes} onToggle={(v) => toggleFilter(selectedTypes, setSelectedTypes, v)} />
          <FilterSection title="요가종류" options={YOGA_STYLES} selected={selectedStyles} onToggle={(v) => toggleFilter(selectedStyles, setSelectedStyles, v)} />
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">

          {/* 모바일 필터 버튼 (md 이상에서는 사이드바가 있으므로 숨김) */}
          <div className="flex items-center gap-2 mb-3 md:hidden">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center gap-[7px] px-4 py-[9px] bg-white border border-[#E3DDD0] rounded-[10px] text-sm font-semibold text-[#23211C] cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M1 3h13M3 7.5h9M5.5 12h4" stroke="#23211C" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              필터
              {filterCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#23211C] text-white text-[11px] font-bold flex items-center justify-center">
                  {filterCount}
                </span>
              )}
            </button>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="text-xs text-[#9A9382] bg-transparent border-none cursor-pointer p-0"
              >
                전체 초기화
              </button>
            )}
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="공고명, 스튜디오명으로 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full sm:flex-1 px-4 py-[10px] border border-[#E3DDD0] rounded-[10px] text-sm text-[#23211C] bg-white outline-none"
            />
            <div className="flex gap-1 bg-white border border-[#E3DDD0] rounded-[10px] p-1 shrink-0">
              {SORT_OPTIONS.map(opt => (
                <button key={opt} onClick={() => setSortBy(opt)} className={`px-[13px] py-[6px] rounded-[7px] text-[13px] border-none cursor-pointer transition-all duration-150 ${
                  sortBy === opt
                    ? 'bg-[#23211C] text-white font-semibold'
                    : 'bg-transparent text-[#76705F] font-normal'
                }`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[13px] text-[#9A9382] mb-[14px]">
            총 <strong className="text-[#23211C]">{sortedJobs.length}</strong>개 공고
            {totalPages > 1 && <span className="ml-1">· {currentPage} / {totalPages} 페이지</span>}
          </p>

          {loading ? (
            <div className="state-center">불러오는 중...</div>
          ) : sortedJobs.length === 0 ? (
            <div className="card-empty">
              <p className="text-[#76705F] text-[15px] font-semibold">공고가 없습니다</p>
              <p className="text-[#9A9382] text-[13px] mt-[6px]">다른 조건으로 검색해보세요</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-[10px]">
                {pagedJobs.map((job, idx) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    idx={(currentPage - 1) * PAGE_SIZE + idx}
                    isBookmarked={!!bookmarks[job.id]}
                    onBookmark={toggleBookmark}
                    timeAgo={timeAgo}
                  />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          )}
          <BannerZone position="jobs_bottom" />
        </div>
        {/* 우측 광고 사이드바: jobs_top(기존) + jobs_sidebar(신규) 통합 */}
        <aside className="w-44 shrink-0 hidden lg:block">
          <div style={{ position: 'sticky', top: 24 }}>
            <p className="text-xs text-stone-300 text-right mb-2">광고</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', paddingRight: 1 }}>
              <BannerZone position="jobs_top" inline />
              <BannerZone position="jobs_sidebar" inline />
            </div>
          </div>
        </aside>
      </div>

      {/* 모바일 필터 바텀시트 */}
      {mobileFilterOpen && (
        <>
          {/* 백드롭 */}
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileFilterOpen(false)}
          />
          {/* 시트 */}
          <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white rounded-t-[20px] shadow-[0_-8px_40px_rgba(30,28,24,0.16)] flex flex-col max-h-[80vh]">
            {/* 헤더 */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-[#F0ECE2] shrink-0">
              <span className="text-[15px] font-bold text-[#23211C]">
                필터
                {filterCount > 0 && (
                  <span className="ml-2 text-[13px] font-normal text-[#9A9382]">{filterCount}개 선택됨</span>
                )}
              </span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F4F1E9] border-none cursor-pointer text-[#23211C] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* 필터 항목 (스크롤 가능) */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <FilterSection
                title="지역"
                options={REGIONS}
                selected={selectedRegions}
                onToggle={(v) => toggleFilter(selectedRegions, setSelectedRegions, v)}
              />
              <FilterSection
                title="고용형태"
                options={EMPLOYMENT_TYPES}
                selected={selectedTypes}
                onToggle={(v) => toggleFilter(selectedTypes, setSelectedTypes, v)}
              />
              <FilterSection
                title="요가종류"
                options={YOGA_STYLES}
                selected={selectedStyles}
                onToggle={(v) => toggleFilter(selectedStyles, setSelectedStyles, v)}
              />
            </div>

            {/* 푸터 버튼 */}
            <div className="flex gap-3 px-5 py-4 border-t border-[#F0ECE2] shrink-0">
              <button
                onClick={() => { clearAll(); setMobileFilterOpen(false); }}
                className="flex-1 py-[13px] rounded-[10px] border border-[#E3DDD0] text-sm font-semibold text-[#76705F] bg-white cursor-pointer"
              >
                초기화
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-[2] py-[13px] rounded-[10px] bg-[#23211C] text-white text-sm font-bold cursor-pointer border-none"
              >
                적용하기
                {filterCount > 0 && ` (${filterCount})`}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function JobCard({ job, idx, isBookmarked, onBookmark, timeAgo }) {
  return (
    <div className="bg-white rounded-[14px] border border-[#E3DDD0] hover:border-[#23211C] hover:shadow-[0_4px_16px_rgba(30,28,24,0.08)] px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 transition-all duration-150">
      {/* 이미지 + 정보 */}
      <div className="flex gap-4 items-center flex-1 min-w-0">
        <div className="w-[60px] h-[60px] rounded-xl overflow-hidden shrink-0 relative bg-[#F4F1E9] flex items-center justify-center">
          {job.image_url ? (
            <Image src={job.image_url} alt={job.title} fill sizes="60px" className="object-cover" />
          ) : (
            <span className="text-2xl select-none">🧘</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[6px] mb-1">
            <span className="text-xs text-[#9A9382]">요가스튜디오</span>
            {job.is_dummy && (
              <span className="text-[11px] text-[#A09B8E] bg-[#EDEBE5] border border-[#DEDAD2] px-[7px] py-[1px] rounded-[6px]">샘플</span>
            )}
            {idx % 4 === 0 && (
              <span className="text-[11px] font-bold text-[#C2922F] bg-[#FDF3E3] px-[7px] py-[1px] rounded-[10px]">추천</span>
            )}
          </div>
          <h3 className="text-[15px] font-bold text-[#23211C] mb-[6px] truncate">{job.title}</h3>
          <div className="flex gap-[5px] flex-wrap">
            {job.location && (
              <span className="text-xs text-[#76705F] bg-[#F4F1E9] px-2 py-[2px] rounded-[6px]">{job.location}</span>
            )}
            {job.yoga_style && (
              <span className="text-xs text-[#76705F] bg-[#F4F1E9] px-2 py-[2px] rounded-[6px]">{job.yoga_style}</span>
            )}
            {job.experience && (
              <span className="text-xs text-[#76705F] bg-[#F4F1E9] px-2 py-[2px] rounded-[6px]">{job.experience}</span>
            )}
          </div>
        </div>
      </div>

      {/* 급여 + 액션 */}
      <div className="flex items-center justify-between sm:justify-normal sm:gap-4">
        <div className="text-left sm:text-right shrink-0 sm:mr-2">
          {job.salary && (
            <p className="text-sm font-bold text-[#23211C] mb-1">{job.salary}</p>
          )}
          <p className="text-xs text-[#9A9382]">{timeAgo(job.created_at)}</p>
        </div>
        <div className="flex gap-2 items-center shrink-0">
          <button
            onClick={(e) => onBookmark(e, job.id)}
            className={`w-9 h-9 rounded-[8px] border flex items-center justify-center cursor-pointer text-[17px] transition-all duration-150 bg-white ${
              isBookmarked
                ? 'border-[#C2922F] text-[#C2922F]'
                : 'border-[#E3DDD0] text-[#9A9382]'
            }`}
          >
            {isBookmarked ? '♥' : '♡'}
          </button>
          <Link href={`/jobs/${job.id}`}>
            <button className="btn-primary text-[13px]">상세보기</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Jobs() {
  return (
    <Suspense fallback={null}>
      <JobsContent />
    </Suspense>
  );
}
