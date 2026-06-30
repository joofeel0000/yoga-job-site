'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import BannerZone from '@/app/components/BannerZone';

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
      style={{
        padding: '5px 12px', borderRadius: 20, fontSize: 13,
        fontWeight: active ? 600 : 400,
        background: active ? '#23211C' : 'transparent',
        color: active ? '#fff' : '#76705F',
        border: `1px solid ${active ? '#23211C' : '#E3DDD0'}`,
        cursor: 'pointer', transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function FilterSection({ title, options, selected, onToggle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#9A9382', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map(opt => (
          <Chip key={opt} label={opt} active={selected.includes(opt)} onClick={() => onToggle(opt)} />
        ))}
      </div>
    </div>
  );
}

function JobsContent() {
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

  useEffect(() => {
    fetchJobs();
    checkUser();
  }, []);

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

  const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 86400) return '오늘';
    if (diff < 86400 * 2) return '1일 전';
    const d = Math.floor(diff / 86400);
    return `${d}일 전`;
  };

  return (
    <main style={{ minHeight: '100vh', background: '#F4F1E9' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Left Sidebar */}
        <aside style={{
          width: 216, flexShrink: 0,
          background: '#fff', borderRadius: 16, border: '1px solid #E3DDD0',
          padding: '22px 18px', position: 'sticky', top: 88,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#23211C' }}>필터</span>
            {hasFilters && (
              <button onClick={clearAll} style={{
                fontSize: 12, color: '#9A9382', cursor: 'pointer',
                background: 'none', border: 'none', padding: 0,
              }}>초기화</button>
            )}
          </div>
          <FilterSection title="지역" options={REGIONS} selected={selectedRegions} onToggle={(v) => toggleFilter(selectedRegions, setSelectedRegions, v)} />
          <FilterSection title="고용형태" options={EMPLOYMENT_TYPES} selected={selectedTypes} onToggle={(v) => toggleFilter(selectedTypes, setSelectedTypes, v)} />
          <FilterSection title="요가종류" options={YOGA_STYLES} selected={selectedStyles} onToggle={(v) => toggleFilter(selectedStyles, setSelectedStyles, v)} />
        </aside>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Search + Sort */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="공고명, 스튜디오명으로 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                flex: 1, padding: '10px 16px', border: '1px solid #E3DDD0', borderRadius: 10,
                fontSize: 14, color: '#23211C', background: '#fff', outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid #E3DDD0', borderRadius: 10, padding: 4 }}>
              {SORT_OPTIONS.map(opt => (
                <button key={opt} onClick={() => setSortBy(opt)} style={{
                  padding: '6px 13px', borderRadius: 7, fontSize: 13,
                  fontWeight: sortBy === opt ? 600 : 400,
                  background: sortBy === opt ? '#23211C' : 'transparent',
                  color: sortBy === opt ? '#fff' : '#76705F',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#9A9382', marginBottom: 14 }}>
            총 <strong style={{ color: '#23211C' }}>{sortedJobs.length}</strong>개 공고
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#9A9382', fontSize: 14 }}>불러오는 중...</div>
          ) : sortedJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: 16, border: '1px solid #E3DDD0' }}>
              <p style={{ color: '#76705F', fontSize: 15, fontWeight: 600 }}>공고가 없습니다</p>
              <p style={{ color: '#9A9382', fontSize: 13, marginTop: 6 }}>다른 조건으로 검색해보세요</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sortedJobs.map((job, idx) => (
                <JobCard
                  key={job.id}
                  job={job}
                  idx={idx}
                  isBookmarked={!!bookmarks[job.id]}
                  onBookmark={toggleBookmark}
                  timeAgo={timeAgo}
                />
              ))}
            </div>
          )}
          <BannerZone position="jobs_bottom" />
        </div>
        <BannerZone position="jobs_top" />
      </div>
    </main>
  );
}

function JobCard({ job, idx, isBookmarked, onBookmark, timeAgo }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', borderRadius: 14,
        border: `1px solid ${hover ? '#23211C' : '#E3DDD0'}`,
        boxShadow: hover ? '0 4px 16px rgba(30,28,24,0.08)' : 'none',
        padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center',
        transition: 'all 0.15s',
      }}
    >
      {/* Thumbnail */}
      <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
        <Image src={JOB_IMGS[idx % JOB_IMGS.length]} alt={job.title} fill sizes="60px" style={{ objectFit: 'cover' }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 12, color: '#9A9382' }}>요가스튜디오</span>
          {idx % 4 === 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#C2922F', background: '#FDF3E3', padding: '1px 7px', borderRadius: 10 }}>추천</span>
          )}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#23211C', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {job.title}
        </h3>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {job.location && (
            <span style={{ fontSize: 12, color: '#76705F', background: '#F4F1E9', padding: '2px 8px', borderRadius: 6 }}>{job.location}</span>
          )}
          {job.yoga_style && (
            <span style={{ fontSize: 12, color: '#76705F', background: '#F4F1E9', padding: '2px 8px', borderRadius: 6 }}>{job.yoga_style}</span>
          )}
          {job.experience && (
            <span style={{ fontSize: 12, color: '#76705F', background: '#F4F1E9', padding: '2px 8px', borderRadius: 6 }}>{job.experience}</span>
          )}
        </div>
      </div>

      {/* Salary + time */}
      <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 8 }}>
        {job.salary && (
          <p style={{ fontSize: 14, fontWeight: 700, color: '#23211C', marginBottom: 4 }}>{job.salary}</p>
        )}
        <p style={{ fontSize: 12, color: '#9A9382' }}>{timeAgo(job.created_at)}</p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <button
          onClick={(e) => onBookmark(e, job.id)}
          style={{
            width: 36, height: 36, borderRadius: 8,
            border: `1px solid ${isBookmarked ? '#C2922F' : '#E3DDD0'}`,
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 17,
            color: isBookmarked ? '#C2922F' : '#9A9382', transition: 'all 0.15s',
          }}
        >
          {isBookmarked ? '♥' : '♡'}
        </button>
        <Link href={`/jobs/${job.id}`}>
          <button style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: '#23211C', color: '#fff', border: 'none', cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>
            상세보기
          </button>
        </Link>
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
