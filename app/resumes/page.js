'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    <button onClick={onClick} style={{
      padding: '4px 11px', borderRadius: 16, fontSize: 12,
      fontWeight: active ? 600 : 400,
      background: active ? '#23211C' : 'transparent',
      color: active ? '#fff' : '#76705F',
      border: `1px solid ${active ? '#23211C' : '#E3DDD0'}`,
      cursor: 'pointer', transition: 'all 0.15s',
    }}>
      {label}
    </button>
  );
}

function ResumeCard({ resume, idx }) {
  const [hover, setHover] = useState(false);
  const rating = (4.5 + (idx % 5) * 0.1).toFixed(1);
  const styles = (resume.yoga_styles || '').split(/[,，、]/).map(s => s.trim()).filter(Boolean).slice(0, 3);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', borderRadius: 16,
        border: `1px solid ${hover ? '#23211C' : '#E3DDD0'}`,
        boxShadow: hover ? '0 10px 28px rgba(30,28,24,0.12)' : 'none',
        padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', position: 'relative', marginBottom: 10, border: '2px solid #E3DDD0', flexShrink: 0 }}>
        <Image src={AVATAR_IMGS[idx % AVATAR_IMGS.length]} alt={resume.name} fill sizes="72px" style={{ objectFit: 'cover' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <span style={{ color: '#C2922F', fontSize: 13 }}>★</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#26241D' }}>{rating}</span>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#23211C', marginBottom: 4 }}>{resume.name}</h3>

      {resume.location && (
        <p style={{ fontSize: 12, color: '#9A9382', marginBottom: 10 }}>📍 {resume.location}</p>
      )}

      {resume.introduction && (
        <p style={{
          fontSize: 12, color: '#76705F', textAlign: 'center', lineHeight: 1.6, marginBottom: 12,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          width: '100%',
        }}>
          {resume.introduction}
        </p>
      )}

      {styles.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10 }}>
          {styles.map(s => (
            <span key={s} style={{ fontSize: 11, color: '#76705F', background: '#F4F1E9', padding: '2px 8px', borderRadius: 8, border: '1px solid #E3DDD0' }}>
              {s}
            </span>
          ))}
        </div>
      )}

      {resume.experience_years && (
        <span style={{ fontSize: 11, fontWeight: 600, color: '#23211C', border: '1px solid #23211C', padding: '2px 10px', borderRadius: 10, marginBottom: 16 }}>
          경력 {resume.experience_years}
        </span>
      )}

      <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 'auto' }}>
        <button style={{
          flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 600,
          background: '#23211C', color: '#fff', border: 'none', cursor: 'pointer',
        }}>
          제안하기
        </button>
        <Link href={`/resumes/${resume.id}`} style={{ flex: 1 }}>
          <button style={{
            width: '100%', padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 600,
            background: 'transparent', color: '#23211C', border: '1px solid #23211C', cursor: 'pointer',
          }}>
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
    <main style={{ minHeight: '100vh', background: '#F4F1E9' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#23211C', marginBottom: 4 }}>강사 찾기</h1>
            <p style={{ fontSize: 14, color: '#9A9382' }}>센터에 어울리는 요가 강사를 찾아보세요</p>
          </div>
          <p style={{ fontSize: 13, color: '#9A9382' }}>총 <strong style={{ color: '#23211C' }}>{filteredResumes.length}</strong>명</p>
        </div>

        {/* Filter Bar */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E3DDD0', padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input
                type="text"
                placeholder="이름, 전문분야, 지역으로 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '9px 14px', border: '1px solid #E3DDD0', borderRadius: 9,
                  fontSize: 13, color: '#23211C', background: '#F4F1E9', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#9A9382', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>지역</p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {REGIONS.map(r => (
                  <FilterChip key={r} label={r} active={selectedRegions.includes(r)} onClick={() => toggleFilter(selectedRegions, setSelectedRegions, r)} />
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#9A9382', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>전문분야</p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {SPECIALTIES.map(s => (
                  <FilterChip key={s} label={s} active={selectedSpecialties.includes(s)} onClick={() => toggleFilter(selectedSpecialties, setSelectedSpecialties, s)} />
                ))}
              </div>
            </div>
            {hasFilters && (
              <button onClick={clearAll} style={{ alignSelf: 'flex-end', padding: '7px 14px', border: '1px solid #E3DDD0', borderRadius: 8, fontSize: 13, color: '#76705F', background: '#fff', cursor: 'pointer' }}>
                초기화
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9A9382', fontSize: 14 }}>불러오는 중...</div>
        ) : filteredResumes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: 16, border: '1px solid #E3DDD0' }}>
            <p style={{ color: '#76705F', fontSize: 15, fontWeight: 600 }}>강사를 찾을 수 없습니다</p>
            <p style={{ color: '#9A9382', fontSize: 13, marginTop: 6 }}>다른 조건으로 검색해보세요</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {filteredResumes.map((resume, idx) => (
              <ResumeCard key={resume.id} resume={resume} idx={idx} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
