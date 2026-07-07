'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BannerZone from '@/app/components/BannerZone';

const HERO_IMG = 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&auto=format&fit=crop&q=80';
const POPULAR_KEYWORDS = ['하타요가', '강남', '정규직', '대강', '빈야사'];

const JOB_IMGS = [
  'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=96&h=96&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=96&h=96&fit=crop&q=80',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=96&h=96&fit=crop&q=80',
];

const AVATAR_IMGS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&h=128&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&q=80',
];

const STUDIO_IMGS = [
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=160&h=160&fit=crop&q=80',
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=160&h=160&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=160&h=160&fit=crop&q=80',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=160&h=160&fit=crop&q=80',
];

function SectionHeader({ title, moreHref, moreLabel = '더보기' }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-[26px] font-extrabold tracking-tight text-[#26241D]">{title}</h2>
      {moreHref && (
        <Link href={moreHref}>
          <button className="btn-secondary text-[13px]">{moreLabel}</button>
        </Link>
      )}
    </div>
  );
}

function Chip({ children }) {
  return <span className="tag">{children}</span>;
}

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRegion, setSearchRegion] = useState('전체 지역');
  const [recentJobs, setRecentJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [stats, setStats] = useState([
    { num: '—', label: '등록 공고' },
    { num: '—', label: '강사 프로필' },
    { num: '—', label: '스튜디오' },
    { num: '96%', label: '만족도' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const [jobsRes, candidatesRes, propertiesRes, postsRes, jobCountRes, candidateCountRes, propertyCountRes] = await Promise.all([
        supabase.from('job').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(3),
        supabase.from('candidate').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(4),
        supabase.from('property').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(3),
        supabase.from('community_posts').select('*').order('views', { ascending: false }).limit(5),
        supabase.from('job').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('candidate').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('property').select('*', { count: 'exact', head: true }),
      ]);
      if (jobsRes.data) setRecentJobs(jobsRes.data);
      if (candidatesRes.data) setCandidates(candidatesRes.data);
      if (propertiesRes.data) setRecentProperties(propertiesRes.data);
      if (postsRes.data) setRecentPosts(postsRes.data);
      setStats([
        { num: jobCountRes.count != null ? `${jobCountRes.count.toLocaleString()}+` : '0', label: '등록 공고' },
        { num: candidateCountRes.count != null ? `${candidateCountRes.count.toLocaleString()}+` : '0', label: '강사 프로필' },
        { num: propertyCountRes.count != null ? `${propertyCountRes.count.toLocaleString()}+` : '0', label: '스튜디오' },
        { num: '96%', label: '만족도' },
      ]);
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('keyword', searchQuery);
    if (searchRegion !== '전체 지역') params.set('location', searchRegion);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <main className="page-root">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#ECE9E1] to-[#F4F1E9] pt-14 pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-[1.05fr_0.95fr] gap-12 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center bg-[#EAE7DE] border border-[#E3DDD0] rounded-full px-[14px] py-[6px] mb-5">
                <span className="text-xs font-semibold text-[#23211C]">요가 강사·스튜디오 채용 플랫폼</span>
              </div>

              <h1 className="text-5xl font-extrabold leading-[1.18] tracking-[-0.03em] text-[#26241D] mb-4">
                요가 강사와 스튜디오를,<br />가장 가깝게 잇다
              </h1>

              <p className="text-[15px] leading-relaxed text-[#76705F] mb-7">
                지역·전문분야별 맞춤 공고부터 검증된 강사 프로필, 스튜디오<br />매물까지. 요가 일자리의 모든 것.
              </p>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="mb-[14px]">
                <div className="bg-white rounded-[14px] shadow-[0_8px_24px_rgba(30,28,24,0.10)] border border-[#E3DDD0] flex items-center pr-[5px] py-[5px]">
                  <div className="flex items-center gap-[6px] px-4 border-r border-[#E3DDD0] min-w-[130px]">
                    <span className="text-sm">📍</span>
                    <select
                      value={searchRegion}
                      onChange={e => setSearchRegion(e.target.value)}
                      className="border-none bg-transparent text-sm font-semibold text-[#23211C] cursor-pointer outline-none"
                    >
                      {['전체 지역', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '기타'].map(r => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="포지션, 스튜디오, 키워드 검색"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 border-none outline-none text-sm text-[#29271F] px-4 py-[10px] bg-transparent"
                  />
                  <button
                    type="submit"
                    className="bg-[#23211C] hover:bg-black text-white border-none rounded-[10px] px-[18px] py-[10px] text-sm font-bold cursor-pointer transition-colors shrink-0"
                  >
                    검색
                  </button>
                </div>
              </form>

              {/* Popular keywords */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] text-[#9A9382]">인기 검색:</span>
                {POPULAR_KEYWORDS.map(kw => (
                  <button
                    key={kw}
                    onClick={() => router.push(`/jobs?keyword=${encodeURIComponent(kw)}`)}
                    className="text-[13px] text-[#76705F] hover:text-[#23211C] bg-transparent border-none cursor-pointer p-0 transition-colors"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: hero image / home_top 배너 */}
            <div className="rounded-[20px] overflow-hidden aspect-[4/3] relative">
              <BannerZone
                position="home_top"
                heroMode
                fallback={
                  <Image
                    src={HERO_IMG}
                    alt="요가 클래스"
                    fill
                    className="object-cover"
                    priority
                  />
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6 -mt-7">
        <div className="grid-4col">
          {stats.map(stat => (
            <div key={stat.label} className="bg-white border border-[#E3DDD0] rounded-2xl px-6 py-5 text-center shadow-[0_4px_12px_rgba(30,28,24,0.06)]">
              <div className="text-[28px] font-extrabold text-[#23211C] tracking-tight">{stat.num}</div>
              <div className="text-[13px] text-[#9A9382] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6 pt-14">

        <BannerZone position="home_strip" />

        {/* Recommended jobs */}
        <section className="mb-14">
          <SectionHeader title="오늘의 추천 공고" moreHref="/jobs" moreLabel="전체 공고 보기" />
          <div className="grid-3col">
            {(recentJobs.length > 0 ? recentJobs : [null, null, null]).map((job, i) => (
              job ? (
                <Link key={job.id} href={`/jobs/${job.id}`} className="no-underline">
                  <JobCard job={job} idx={i} />
                </Link>
              ) : (
                <JobCardSkeleton key={i} />
              )
            ))}
          </div>
        </section>

        <BannerZone position="home_bottom" />

        {/* Featured instructors */}
        <section className="mb-14">
          <SectionHeader title="주목받는 강사" moreHref="/resumes" moreLabel="전체 강사 보기" />
          <div className="grid-4col">
            {(candidates.length > 0 ? candidates : [null, null, null, null]).map((c, i) => (
              c ? (
                <Link key={c.id} href={`/resumes/${c.id}`} className="no-underline">
                  <InstructorCard candidate={c} idx={i} />
                </Link>
              ) : (
                <InstructorCardSkeleton key={i} />
              )
            ))}
          </div>
        </section>

        {/* Property + Community */}
        <section className="mb-14">
          <div className="grid grid-cols-[1.4fr_1fr] gap-6">

            {/* Property */}
            <div>
              <SectionHeader title="요가원 매물" moreHref="/property" />
              <div className="flex flex-col gap-[10px]">
                {recentProperties.length === 0 ? (
                  <div className="bg-white border border-dashed border-[#E3DDD0] rounded-2xl p-7 text-center text-sm text-[#9A9382]">
                    등록된 매물이 없습니다
                  </div>
                ) : (
                  recentProperties.map((p, i) => (
                    <Link key={p.id} href={`/property/${p.id}`} className="no-underline">
                      <PropertyCard property={p} idx={i} />
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Community */}
            <div>
              <SectionHeader title="커뮤니티 인기글" moreHref="/community" />
              <div className="bg-white border border-[#E3DDD0] rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#F0ECE2] flex gap-[6px] items-center">
                  <span>🔥</span>
                  <span className="text-[13px] font-bold text-[#23211C]">주간 인기글</span>
                </div>
                {recentPosts.length === 0 ? (
                  <div className="p-6 text-center text-[#9A9382] text-sm">게시글이 없습니다</div>
                ) : (
                  recentPosts.map((post, idx) => (
                    <Link key={post.id} href={`/community/${post.id}`} className="no-underline">
                      <CommunityRow post={post} rank={idx + 1} isLast={idx === recentPosts.length - 1} />
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ── Sub-components ──────────────────────────────────────── */

function JobCard({ job, idx = 0 }) {
  const styles = Array.isArray(job.yoga_style) ? job.yoga_style : job.yoga_style ? [job.yoga_style] : [];
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E3DDD0] hover:border-[#23211C] hover:shadow-[0_10px_28px_rgba(30,28,24,0.12)] transition-all duration-150 cursor-pointer h-full">
      <div className="w-12 h-12 rounded-[10px] mb-3 overflow-hidden shrink-0">
        <Image
          src={JOB_IMGS[idx % JOB_IMGS.length]}
          alt="공고 이미지"
          width={48} height={48}
          className="object-cover w-full h-full"
        />
      </div>
      <p className="text-xs text-[#9A9382] mb-1">{job.location}</p>
      <h3 className="text-base font-bold text-[#26241D] mb-[10px] leading-snug">{job.title}</h3>
      <div className="flex gap-[6px] flex-wrap mb-[10px]">
        {styles.slice(0, 2).map(s => <Chip key={s}>{s}</Chip>)}
        {job.experience && <Chip>{job.experience}</Chip>}
      </div>
      {job.salary && (
        <p className="text-sm font-bold text-[#23211C]">{job.salary}</p>
      )}
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E3DDD0] min-h-[180px]">
      <div className="w-12 h-12 bg-[#F4F1E9] rounded-[10px] mb-3" />
      <div className="w-3/5 h-[14px] bg-[#F4F1E9] rounded mb-2" />
      <div className="w-4/5 h-[18px] bg-[#F4F1E9] rounded mb-3" />
      <div className="w-2/5 h-[22px] bg-[#F4F1E9] rounded-full" />
    </div>
  );
}

function InstructorCard({ candidate, idx = 0 }) {
  const styles = Array.isArray(candidate.yoga_styles)
    ? candidate.yoga_styles
    : candidate.yoga_styles ? [candidate.yoga_styles] : [];
  return (
    <div className="bg-white rounded-2xl py-6 px-4 text-center border border-[#E3DDD0] hover:border-[#23211C] hover:shadow-[0_8px_22px_rgba(30,28,24,0.10)] transition-all duration-150 cursor-pointer">
      <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 shrink-0">
        <Image
          src={AVATAR_IMGS[idx % AVATAR_IMGS.length]}
          alt={candidate.name}
          width={64} height={64}
          className="object-cover w-full h-full"
        />
      </div>
      <h3 className="text-[15px] font-bold text-[#26241D] mb-1">{candidate.name}</h3>
      <p className="text-[13px] text-[#9A9382] mb-[10px]">
        {candidate.experience_years ? `경력 ${candidate.experience_years}년` : ''}
        {candidate.experience_years && candidate.location ? ' · ' : ''}
        {candidate.location || ''}
      </p>
      <div className="flex gap-1 flex-wrap justify-center">
        {styles.slice(0, 2).map(s => <Chip key={s}>{s}</Chip>)}
      </div>
    </div>
  );
}

function InstructorCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl py-6 px-4 text-center border border-[#E3DDD0]">
      <div className="w-16 h-16 rounded-full bg-[#F4F1E9] mx-auto mb-3" />
      <div className="w-3/5 h-4 bg-[#F4F1E9] rounded mx-auto mb-2" />
      <div className="w-4/5 h-3 bg-[#F4F1E9] rounded mx-auto" />
    </div>
  );
}

function PropertyCard({ property: p, idx = 0 }) {
  return (
    <div className="flex gap-[14px] items-center bg-white rounded-2xl px-4 py-[14px] border border-[#E3DDD0] hover:border-[#23211C] hover:shadow-[0_8px_22px_rgba(30,28,24,0.10)] transition-all duration-150 cursor-pointer">
      <div className="w-[60px] h-[60px] rounded-xl overflow-hidden shrink-0">
        <Image
          src={STUDIO_IMGS[idx % STUDIO_IMGS.length]}
          alt={p.title}
          width={60} height={60}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-1">
          <span className="text-[11px] font-bold bg-[#23211C] text-white px-[7px] py-[2px] rounded">{p.property_type}</span>
        </div>
        <p className="text-[15px] font-bold text-[#26241D] mb-[2px] truncate">{p.title}</p>
        <p className="text-[13px] text-[#9A9382]">{p.location}{p.area ? ` · ${p.area}` : ''}</p>
        {p.price && <p className="text-sm font-bold text-[#23211C] mt-1">{p.price}</p>}
      </div>
    </div>
  );
}

function CommunityRow({ post, rank, isLast }) {
  return (
    <div className={`px-4 py-3 flex gap-[10px] items-start cursor-pointer hover:bg-[#FAF8F2] transition-colors duration-100 ${isLast ? '' : 'border-b border-[#F0ECE2]'}`}>
      <span className={`text-xs font-extrabold mt-[2px] shrink-0 min-w-[16px] ${rank <= 3 ? 'text-[#23211C]' : 'text-[#C4BEB0]'}`}>{rank}</span>
      <div className="flex-1 min-w-0">
        {post.category && (
          <span className="text-[11px] font-semibold bg-[#EFEBE1] text-[#76705F] px-[7px] py-[1px] rounded-full mb-1 inline-block">
            {post.category}
          </span>
        )}
        <p className="text-sm font-semibold text-[#26241D] mb-[2px] leading-snug truncate">{post.title}</p>
        <p className="text-xs text-[#9A9382]">
          {post.author_email?.split('@')[0]} · 조회 {post.views ?? 0}
        </p>
      </div>
    </div>
  );
}
