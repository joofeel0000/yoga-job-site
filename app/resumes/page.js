'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BannerZone from '@/app/components/BannerZone';

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

function ResumeCard({ resume, idx }) {
  const rating = (4.5 + (idx % 5) * 0.1).toFixed(1);
  const styles = (resume.yoga_styles || '').split(/[,，、]/).map(s => s.trim()).filter(Boolean).slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-[#E3DDD0] hover:border-[#23211C] hover:shadow-[0_10px_28px_rgba(30,28,24,0.12)] px-5 py-6 flex flex-col items-center transition-all duration-150">
      <div className="w-[72px] h-[72px] rounded-full overflow-hidden relative mb-[10px] border-2 border-[#E3DDD0] shrink-0">
        <Image src={AVATAR_IMGS[idx % AVATAR_IMGS.length]} alt={resume.name} fill sizes="72px" className="object-cover" />
      </div>

      <div className="flex items-center gap-1 mb-1">
        <span className="text-[#C2922F] text-[13px]">★</span>
        <span className="text-[13px] font-semibold text-[#26241D]">{rating}</span>
      </div>

      <h3 className="text-base font-bold text-[#23211C] mb-1">{resume.name}</h3>

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
        <button className="flex-1 py-[9px] rounded-[9px] text-[13px] font-semibold bg-[#23211C] text-white border-none cursor-pointer">
          제안하기
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

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('candidate').select('*').order('created_at', { ascending: false });
    if (error) console.error('에러:', error);
    else setResumes(data || []);
    setLoading(false);
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

            <p className="text-[13px] text-[#9A9382] mb-3">총 <strong className="text-[#23211C]">{filteredResumes.length}</strong>명</p>

            {loading ? (
              <div className="state-center">불러오는 중...</div>
            ) : filteredResumes.length === 0 ? (
              <div className="card-empty">
                <p className="text-[#76705F] text-[15px] font-semibold">강사를 찾을 수 없습니다</p>
                <p className="text-[#9A9382] text-[13px] mt-[6px]">다른 조건으로 검색해보세요</p>
              </div>
            ) : (
              <div className="grid-3col">
                {filteredResumes.map((resume, idx) => (
                  <ResumeCard key={resume.id} resume={resume} idx={idx} />
                ))}
              </div>
            )}
            <BannerZone position="resumes_bottom" />
          </div>
          <BannerZone position="resumes_top" />
        </div>
      </div>
    </main>
  );
}
