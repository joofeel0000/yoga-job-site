'use client';

import { supabase } from '@/lib/supabase';
import { getOrCreateChatRoom } from '@/lib/chat';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import BannerZone from '@/app/components/BannerZone';

const PAGE_SIZE = 12;

const AVATAR_IMGS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
];

const REGIONS = ['서울', '경기', '인천', '부산', '대전', '광주'];
const SPECIALTIES = ['하타', '빈야사', '아쉬탕가', '인요가', '키즈', '명상'];

function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`px-[11px] py-1 rounded-2xl text-xs border cursor-pointer transition-all duration-150 ${
      active
        ? 'bg-[#23211C] text-white border-[#23211C] font-semibold'
        : 'bg-transparent text-[#76705F] border-[#E3DDD0] font-normal'
    }`}>
      {label}
    </button>
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

function ResumeCard({ resume, idx, onSuggest, isSuggesting }) {
  const rating = (4.5 + (idx % 5) * 0.1).toFixed(1);
  const styles = (resume.yoga_styles || '').split(/[,，、]/).map(s => s.trim()).filter(Boolean).slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-[#E3DDD0] hover:border-[#23211C] hover:shadow-[0_10px_28px_rgba(30,28,24,0.12)] px-5 py-6 flex flex-col items-center transition-all duration-150">
      <div className="w-[72px] h-[72px] rounded-full overflow-hidden relative mb-[10px] border-2 border-[#E3DDD0] shrink-0">
        <Image src={resume.photo_url || AVATAR_IMGS[idx % AVATAR_IMGS.length]} alt={resume.name} fill sizes="72px" className="object-cover" />
      </div>

      <div className="flex items-center gap-1 mb-1">
        <span className="text-[#C2922F] text-[13px]">★</span>
        <span className="text-[13px] font-semibold text-[#26241D]">{rating}</span>
      </div>

      <div className="flex items-center gap-[6px] mb-1">
        <h3 className="text-base font-bold text-[#23211C]">{resume.name}</h3>
        {resume.is_dummy && (
          <span className="text-[11px] text-[#A09B8E] bg-[#EDEBE5] border border-[#DEDAD2] px-[7px] py-[1px] rounded-[6px]">샘플</span>
        )}
      </div>

      {resume.location && (
        <p className="text-xs text-[#9A9382] mb-[10px]">📍 {resume.location}</p>
      )}

      {resume.introduction && (
        <p className="text-xs text-[#76705F] text-center leading-relaxed mb-3 line-clamp-2 w-full">
          {resume.introduction}
        </p>
      )}

      {styles.length > 0 && (
        <div className="flex gap-[5px] flex-wrap justify-center mb-[10px]">
          {styles.map(s => (
            <span key={s} className="text-[11px] text-[#76705F] bg-[#F4F1E9] px-2 py-[2px] rounded-[8px] border border-[#E3DDD0]">
              {s}
            </span>
          ))}
        </div>
      )}

      {resume.experience_years && (
        <span className="text-[11px] font-semibold text-[#23211C] border border-[#23211C] px-[10px] py-[2px] rounded-[10px] mb-4">
          경력 {resume.experience_years}
        </span>
      )}

      <div className="flex gap-2 w-full mt-auto">
        <button
          onClick={() => onSuggest(resume)}
          disabled={isSuggesting}
          className="flex-1 py-[9px] rounded-[9px] text-[13px] font-semibold bg-[#23211C] text-white border-none cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1"
        >
          {isSuggesting ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              처리 중
            </>
          ) : '제안하기'}
        </button>
        <Link href={`/resumes/${resume.id}`} className="flex-1">
          <button className="w-full py-[9px] rounded-[9px] text-[13px] font-semibold bg-transparent text-[#23211C] border border-[#23211C] cursor-pointer">
            프로필
          </button>
        </Link>
      </div>
    </div>
  );
}

function ResumesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [suggestingId, setSuggestingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const skipReset = useRef(true);

  useEffect(() => {
    fetchResumes();
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, []);

  useEffect(() => {
    if (skipReset.current) { skipReset.current = false; return; }
    setCurrentPage(1);
    const params = new URLSearchParams(window.location.search);
    params.delete('page');
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchTerm, selectedRegions, selectedSpecialties]);

  const fetchResumes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('candidate').select('*').order('created_at', { ascending: false });
    if (error) console.error('에러:', error);
    else setResumes(data || []);
    setLoading(false);
  };

  const handleSuggest = async (resume) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login?redirect=resumes');
      return;
    }

    setSuggestingId(resume.id);
    const { data: room, error } = await getOrCreateChatRoom(resume.user_id, null, resume.id);
    setSuggestingId(null);

    if (error || !room) {
      alert('채팅방을 만들 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    router.push(`/chat/${room.id}`);
  };

  const toggleFilter = (selected, setSelected, val) => {
    setSelected(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  const filteredResumes = resumes.filter(r => {
    const term = searchTerm.toLowerCase();
    const matchSearch = !term || r.name?.toLowerCase().includes(term) || r.yoga_styles?.toLowerCase().includes(term) || r.location?.toLowerCase().includes(term);
    const matchRegion = selectedRegions.length === 0 || selectedRegions.some(reg => r.location?.includes(reg));
    const matchSpecialty = selectedSpecialties.length === 0 || selectedSpecialties.some(s => r.yoga_styles?.includes(s));
    return matchSearch && matchRegion && matchSpecialty;
  });

  const hasFilters = selectedRegions.length > 0 || selectedSpecialties.length > 0 || searchTerm;

  const clearAll = () => {
    setSelectedRegions([]);
    setSelectedSpecialties([]);
    setSearchTerm('');
  };

  const totalPages = Math.ceil(filteredResumes.length / PAGE_SIZE);
  const pagedResumes = filteredResumes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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

        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-[#23211C] mb-1">강사 찾기</h1>
          <p className="text-sm text-[#9A9382]">센터에 어울리는 요가 강사를 찾아보세요</p>
        </div>

        <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0">
            {/* Filter Bar */}
            <div className="bg-white rounded-[14px] border border-[#E3DDD0] px-5 py-4 mb-6">
              <div className="flex gap-5 items-start flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="이름, 전문분야, 지역으로 검색..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-[14px] py-[9px] border border-[#E3DDD0] rounded-[9px] text-[13px] text-[#23211C] bg-[#F4F1E9] outline-none box-border"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#9A9382] uppercase tracking-[0.07em] mb-[7px]">지역</p>
                  <div className="flex gap-[5px] flex-wrap">
                    {REGIONS.map(r => (
                      <FilterChip key={r} label={r} active={selectedRegions.includes(r)} onClick={() => toggleFilter(selectedRegions, setSelectedRegions, r)} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#9A9382] uppercase tracking-[0.07em] mb-[7px]">전문분야</p>
                  <div className="flex gap-[5px] flex-wrap">
                    {SPECIALTIES.map(s => (
                      <FilterChip key={s} label={s} active={selectedSpecialties.includes(s)} onClick={() => toggleFilter(selectedSpecialties, setSelectedSpecialties, s)} />
                    ))}
                  </div>
                </div>
                {hasFilters && (
                  <button onClick={clearAll} className="self-end px-[14px] py-[7px] border border-[#E3DDD0] rounded-[8px] text-[13px] text-[#76705F] bg-white cursor-pointer">
                    초기화
                  </button>
                )}
              </div>
            </div>

            <p className="text-[13px] text-[#9A9382] mb-3">
              총 <strong className="text-[#23211C]">{filteredResumes.length}</strong>명
              {totalPages > 1 && <span className="ml-1">· {currentPage} / {totalPages} 페이지</span>}
            </p>

            {loading ? (
              <div className="state-center">불러오는 중...</div>
            ) : filteredResumes.length === 0 ? (
              <div className="card-empty">
                <p className="text-[#76705F] text-[15px] font-semibold">강사를 찾을 수 없습니다</p>
                <p className="text-[#9A9382] text-[13px] mt-[6px]">다른 조건으로 검색해보세요</p>
              </div>
            ) : (
              <>
                <div className="grid-3col">
                  {pagedResumes.map((resume, idx) => (
                    <ResumeCard
                      key={resume.id}
                      resume={resume}
                      idx={(currentPage - 1) * PAGE_SIZE + idx}
                      onSuggest={handleSuggest}
                      isSuggesting={suggestingId === resume.id}
                    />
                  ))}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </>
            )}
            <BannerZone position="resumes_bottom" />
          </div>
          {/* 우측 광고 사이드바: resumes_top(기존) + resumes_sidebar(신규) 통합 */}
          <aside className="w-44 shrink-0 hidden lg:block">
            <div style={{ position: 'sticky', top: 24 }}>
              <p className="text-xs text-stone-300 text-right mb-2">광고</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', paddingRight: 1 }}>
                <BannerZone position="resumes_top" inline />
                <BannerZone position="resumes_sidebar" inline />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function Resumes() {
  return (
    <Suspense fallback={null}>
      <ResumesContent />
    </Suspense>
  );
}
