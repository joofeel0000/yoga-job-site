'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const HERO_IMG = 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&auto=format&fit=crop&q=80';
const BANNER_IMG = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80';
const SMALL_ADS = [
  {
    img: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80',
    brand: '루루레몬 코리아',
    category: '요가복 브랜드',
  },
  {
    img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80',
    brand: '스튜디오 무브먼트',
    category: '필라테스 스튜디오',
  },
  {
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop&q=80',
    brand: '제주 웰니스 리트릿',
    category: '웰니스 리트릿',
  },
];
const POPULAR_KEYWORDS = ['하타요가', '강남', '정규직', '대강', '빈야사'];

// 공고 카드 아이콘 이미지 풀
const JOB_IMGS = [
  'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=96&h=96&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=96&h=96&fit=crop&q=80',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=96&h=96&fit=crop&q=80',
];

// 강사 아바타 이미지 풀
const AVATAR_IMGS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&h=128&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&q=80',
];

// 매물 썸네일 이미지 풀
const STUDIO_IMGS = [
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=160&h=160&fit=crop&q=80',
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=160&h=160&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=160&h=160&fit=crop&q=80',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=160&h=160&fit=crop&q=80',
];

function CardHover({ children, style, ...props }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      {...props}
      style={{
        ...style,
        borderColor: hovered ? '#23211C' : '#E3DDD0',
        boxShadow: hovered ? '0 10px 28px rgba(30,28,24,0.12)' : 'none',
        transition: 'all .15s',
      }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

function OutlineBtn({ href, children }) {
  const [hovered, setHovered] = useState(false);
  const btn = (
    <button
      style={{
        border: '1px solid #E3DDD0',
        background: hovered ? '#EFEBE1' : 'transparent',
        borderRadius: 9,
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: 600,
        color: '#23211C',
        cursor: 'pointer',
        transition: 'background .12s',
        whiteSpace: 'nowrap',
      }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
      {children}
    </button>
  );
  return href ? <Link href={href}>{btn}</Link> : btn;
}

function SectionHeader({ title, moreHref, moreLabel = '더보기' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
      <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: '#26241D', margin: 0 }}>
        {title}
      </h2>
      {moreHref && <OutlineBtn href={moreHref}>{moreLabel}</OutlineBtn>}
    </div>
  );
}

function Chip({ children }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 600,
      background: '#EFEBE1', color: '#23211C',
      padding: '3px 10px', borderRadius: 999,
      display: 'inline-block',
    }}>
      {children}
    </span>
  );
}

function LogoMark({ size = 32, inner = 12, dark = false }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: dark ? '#3E3B33' : '#23211C',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <div style={{
        width: inner, height: inner,
        background: '#CFC9BB',
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(45deg)',
      }} />
    </div>
  );
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
    <main style={{ background: '#F4F1E9', minHeight: '100vh' }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(180deg,#ECE9E1 0%,#F4F1E9 100%)', paddingTop: 56, paddingBottom: 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 48, alignItems: 'center' }}>

            {/* Left */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                background: '#EAE7DE', border: '1px solid #E3DDD0',
                borderRadius: 999, padding: '6px 14px', marginBottom: 20,
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#23211C' }}>요가 강사·스튜디오 채용 플랫폼</span>
              </div>

              <h1 style={{
                fontSize: 48, fontWeight: 800, lineHeight: 1.18,
                letterSpacing: '-0.03em', color: '#26241D',
                margin: '0 0 16px',
              }}>
                요가 강사와 스튜디오를,<br />가장 가깝게 잇다
              </h1>

              <p style={{ fontSize: 15, lineHeight: 1.6, color: '#76705F', margin: '0 0 28px' }}>
                지역·전문분야별 맞춤 공고부터 검증된 강사 프로필, 스튜디오<br />매물까지. 요가 일자리의 모든 것.
              </p>

              {/* Search bar */}
              <form onSubmit={handleSearch} style={{ marginBottom: 14 }}>
                <div style={{
                  background: '#fff',
                  borderRadius: 14,
                  boxShadow: '0 8px 24px rgba(30,28,24,0.10)',
                  border: '1px solid #E3DDD0',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '5px 5px 5px 0',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '0 16px', borderRight: '1px solid #E3DDD0',
                    minWidth: 130,
                  }}>
                    <span style={{ fontSize: 14 }}>📍</span>
                    <select
                      value={searchRegion}
                      onChange={e => setSearchRegion(e.target.value)}
                      style={{
                        border: 'none', background: 'transparent',
                        fontSize: 14, fontWeight: 600, color: '#23211C',
                        cursor: 'pointer', outline: 'none',
                        fontFamily: 'inherit',
                      }}
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
                    style={{
                      flex: 1, border: 'none', outline: 'none',
                      fontSize: 14, color: '#29271F',
                      padding: '10px 16px', background: 'transparent',
                      fontFamily: 'inherit',
                    }}
                  />
                  <SearchButton />
                </div>
              </form>

              {/* Popular keywords */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: '#9A9382' }}>인기 검색:</span>
                {POPULAR_KEYWORDS.map(kw => (
                  <KeywordLink key={kw} kw={kw} onSelect={() => router.push(`/jobs?keyword=${encodeURIComponent(kw)}`)} />
                ))}
              </div>
            </div>

            {/* Right: hero image */}
            <div style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: '4/3', position: 'relative' }}>
              <Image
                src={HERO_IMG}
                alt="요가 클래스"
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '-28px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {stats.map(stat => (
            <div key={stat.label} style={{
              background: '#fff',
              border: '1px solid #E3DDD0',
              borderRadius: 16, padding: '20px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(30,28,24,0.06)',
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#23211C', letterSpacing: '-0.02em' }}>{stat.num}</div>
              <div style={{ fontSize: 13, color: '#9A9382', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 0' }}>

        {/* Main banner ad */}
        <div style={{
          position: 'relative', borderRadius: 16, overflow: 'hidden',
          height: 160, marginBottom: 56,
        }}>
          <Image src={BANNER_IMG} alt="광고 배너" fill sizes="(max-width: 1200px) 100vw, 1200px" style={{ objectFit: 'cover' }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg,rgba(30,28,24,0.72) 0%,rgba(30,28,24,0) 60%)',
          }} />
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)',
            color: '#fff', fontSize: 11, fontWeight: 700,
            padding: '2px 7px', borderRadius: 4,
          }}>AD</span>
          <div style={{ position: 'absolute', top: '50%', left: 32, transform: 'translateY(-50%)' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '0 0 6px' }}>광고 문의</p>
            <p style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0 }}>요가브릿지와 함께 성장하세요</p>
          </div>
        </div>

        {/* Recommended jobs */}
        <section style={{ marginBottom: 56 }}>
          <SectionHeader title="오늘의 추천 공고" moreHref="/jobs" moreLabel="전체 공고 보기" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {(recentJobs.length > 0 ? recentJobs : [null, null, null]).map((job, i) => (
              job ? (
                <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
                  <JobCard job={job} idx={i} />
                </Link>
              ) : (
                <JobCardSkeleton key={i} />
              )
            ))}
          </div>
        </section>

        {/* Sponsor ads */}
        <section style={{ marginBottom: 56 }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9A9382', letterSpacing: '0.1em' }}>SPONSORED</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {SMALL_ADS.map((ad, i) => (
              <div key={i} style={{
                borderRadius: 16, overflow: 'hidden',
                border: '1px solid #E3DDD0', cursor: 'pointer',
                position: 'relative', height: 200,
              }}>
                <Image
                  src={ad.img}
                  alt={ad.brand}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  style={{ objectFit: 'cover' }}
                />
                {/* bottom gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(30,28,24,0.78) 0%, rgba(30,28,24,0) 55%)',
                }} />
                {/* AD label — top right */}
                <span style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)',
                  color: '#fff', fontSize: 10, fontWeight: 700,
                  padding: '2px 7px', borderRadius: 4,
                }}>AD</span>
                {/* brand text — bottom left */}
                <div style={{ position: 'absolute', bottom: 14, left: 14 }}>
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, margin: '0 0 2px' }}>{ad.category}</p>
                  <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: 0 }}>{ad.brand}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured instructors */}
        <section style={{ marginBottom: 56 }}>
          <SectionHeader title="주목받는 강사" moreHref="/resumes" moreLabel="전체 강사 보기" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {(candidates.length > 0 ? candidates : [null, null, null, null]).map((c, i) => (
              c ? (
                <Link key={c.id} href={`/resumes/${c.id}`} style={{ textDecoration: 'none' }}>
                  <InstructorCard candidate={c} idx={i} />
                </Link>
              ) : (
                <InstructorCardSkeleton key={i} />
              )
            ))}
          </div>
        </section>

        {/* Property + Community */}
        <section style={{ marginBottom: 56 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>

            {/* Property */}
            <div>
              <SectionHeader title="요가원 매물" moreHref="/property" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentProperties.length === 0 ? (
                  <div style={{
                    background: '#fff', border: '1px dashed #E3DDD0',
                    borderRadius: 16, padding: 28, textAlign: 'center',
                    fontSize: 14, color: '#9A9382',
                  }}>등록된 매물이 없습니다</div>
                ) : (
                  recentProperties.map((p, i) => (
                    <Link key={p.id} href={`/property/${p.id}`} style={{ textDecoration: 'none' }}>
                      <PropertyCard property={p} idx={i} />
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Community */}
            <div>
              <SectionHeader title="커뮤니티 인기글" moreHref="/community" />
              <div style={{
                background: '#fff', border: '1px solid #E3DDD0',
                borderRadius: 16, overflow: 'hidden',
              }}>
                <div style={{
                  padding: '12px 16px', borderBottom: '1px solid #F0ECE2',
                  display: 'flex', gap: 6, alignItems: 'center',
                }}>
                  <span>🔥</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#23211C' }}>주간 인기글</span>
                </div>
                {recentPosts.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#9A9382', fontSize: 14 }}>
                    게시글이 없습니다
                  </div>
                ) : (
                  recentPosts.map((post, idx) => (
                    <Link key={post.id} href={`/community/${post.id}`} style={{ textDecoration: 'none' }}>
                      <CommunityRow post={post} rank={idx + 1} isLast={idx === recentPosts.length - 1} />
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ background: '#2A2A23', marginTop: 24 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <LogoMark size={32} inner={12} dark />
                <span style={{ fontSize: 18, fontWeight: 800, color: '#C9C3B4' }}>요가브릿지</span>
              </div>
              <p style={{ fontSize: 13, color: '#7E786B', lineHeight: 1.7, margin: 0 }}>
                요가 강사와 스튜디오를 연결하는<br />채용 플랫폼
              </p>
            </div>
            <div style={{ display: 'flex', gap: 56 }}>
              <FooterCol title="서비스" items={[
                { label: '구인구직', href: '/jobs' },
                { label: '강사찾기', href: '/resumes' },
                { label: '매물정보', href: '/property' },
                { label: '커뮤니티', href: '/community' },
              ]} />
              <FooterCol title="고객지원" items={[
                { label: '공지사항', href: '/community' },
                { label: '이용약관', href: '/' },
                { label: '개인정보처리방침', href: '/' },
                { label: '광고문의', href: '/' },
              ]} />
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #3E3B33' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px' }}>
            <p style={{ fontSize: 12, color: '#7E786B', margin: 0 }}>© 2026 요가브릿지. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */

function SearchButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="submit"
      style={{
        background: hovered ? '#000' : '#23211C',
        color: '#fff', border: 'none',
        borderRadius: 10, padding: '10px 18px',
        fontSize: 14, fontWeight: 700,
        cursor: 'pointer', transition: 'background .12s',
        fontFamily: 'inherit', flexShrink: 0,
      }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
      검색
    </button>
  );
}

function KeywordLink({ kw, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onSelect}
      style={{
        fontSize: 13, color: hovered ? '#23211C' : '#76705F',
        background: 'none', border: 'none', cursor: 'pointer',
        padding: 0, fontFamily: 'inherit', transition: 'color .12s',
      }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
      {kw}
    </button>
  );
}

function JobCard({ job, idx = 0 }) {
  const [hovered, setHovered] = useState(false);
  const styles = Array.isArray(job.yoga_style) ? job.yoga_style : job.yoga_style ? [job.yoga_style] : [];
  return (
    <div
      style={{
        background: '#fff', borderRadius: 16, padding: '20px',
        border: `1px solid ${hovered ? '#23211C' : '#E3DDD0'}`,
        boxShadow: hovered ? '0 10px 28px rgba(30,28,24,0.12)' : 'none',
        transition: 'all .15s', cursor: 'pointer', height: '100%',
      }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 10, marginBottom: 12,
        overflow: 'hidden', flexShrink: 0,
      }}>
        <Image
          src={JOB_IMGS[idx % JOB_IMGS.length]}
          alt="공고 이미지"
          width={48} height={48}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      </div>
      <p style={{ fontSize: 12, color: '#9A9382', margin: '0 0 4px' }}>{job.location}</p>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#26241D', margin: '0 0 10px', lineHeight: 1.4 }}>{job.title}</h3>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {styles.slice(0, 2).map(s => <Chip key={s}>{s}</Chip>)}
        {job.experience && <Chip>{job.experience}</Chip>}
      </div>
      {job.salary && (
        <p style={{ fontSize: 14, fontWeight: 700, color: '#23211C', margin: 0 }}>{job.salary}</p>
      )}
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '20px',
      border: '1px solid #E3DDD0', minHeight: 180,
    }}>
      <div style={{ width: 48, height: 48, background: '#F4F1E9', borderRadius: 10, marginBottom: 12 }} />
      <div style={{ width: '60%', height: 14, background: '#F4F1E9', borderRadius: 6, marginBottom: 8 }} />
      <div style={{ width: '80%', height: 18, background: '#F4F1E9', borderRadius: 6, marginBottom: 12 }} />
      <div style={{ width: '40%', height: 22, background: '#F4F1E9', borderRadius: 999 }} />
    </div>
  );
}

function InstructorCard({ candidate, idx = 0 }) {
  const [hovered, setHovered] = useState(false);
  const styles = Array.isArray(candidate.yoga_styles)
    ? candidate.yoga_styles
    : candidate.yoga_styles ? [candidate.yoga_styles] : [];
  return (
    <div
      style={{
        background: '#fff', borderRadius: 16, padding: '24px 16px',
        textAlign: 'center',
        border: `1px solid ${hovered ? '#23211C' : '#E3DDD0'}`,
        boxShadow: hovered ? '0 8px 22px rgba(30,28,24,0.10)' : 'none',
        transition: 'all .15s', cursor: 'pointer',
      }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        overflow: 'hidden', margin: '0 auto 12px', flexShrink: 0,
      }}>
        <Image
          src={AVATAR_IMGS[idx % AVATAR_IMGS.length]}
          alt={candidate.name}
          width={64} height={64}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#26241D', margin: '0 0 4px' }}>{candidate.name}</h3>
      <p style={{ fontSize: 13, color: '#9A9382', margin: '0 0 10px' }}>
        {candidate.experience_years ? `경력 ${candidate.experience_years}년` : ''}
        {candidate.experience_years && candidate.location ? ' · ' : ''}
        {candidate.location || ''}
      </p>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        {styles.slice(0, 2).map(s => <Chip key={s}>{s}</Chip>)}
      </div>
    </div>
  );
}

function InstructorCardSkeleton() {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '24px 16px',
      textAlign: 'center', border: '1px solid #E3DDD0',
    }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F4F1E9', margin: '0 auto 12px' }} />
      <div style={{ width: '60%', height: 16, background: '#F4F1E9', borderRadius: 6, margin: '0 auto 8px' }} />
      <div style={{ width: '80%', height: 12, background: '#F4F1E9', borderRadius: 6, margin: '0 auto' }} />
    </div>
  );
}

function PropertyCard({ property: p, idx = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        display: 'flex', gap: 14, alignItems: 'center',
        background: '#fff', borderRadius: 16, padding: '14px 16px',
        border: `1px solid ${hovered ? '#23211C' : '#E3DDD0'}`,
        boxShadow: hovered ? '0 8px 22px rgba(30,28,24,0.10)' : 'none',
        transition: 'all .15s', cursor: 'pointer',
      }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
      <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
        <Image
          src={STUDIO_IMGS[idx % STUDIO_IMGS.length]}
          alt={p.title}
          width={60} height={60}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, background: '#23211C', color: '#fff',
            padding: '2px 7px', borderRadius: 4,
          }}>{p.property_type}</span>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#26241D', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
        <p style={{ fontSize: 13, color: '#9A9382', margin: 0 }}>{p.location}{p.area ? ` · ${p.area}` : ''}</p>
        {p.price && <p style={{ fontSize: 14, fontWeight: 700, color: '#23211C', margin: '4px 0 0' }}>{p.price}</p>}
      </div>
    </div>
  );
}

function CommunityRow({ post, rank, isLast }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: isLast ? 'none' : '1px solid #F0ECE2',
        background: hovered ? '#FAF8F2' : 'transparent',
        transition: 'background .12s',
        display: 'flex', gap: 10, alignItems: 'flex-start',
        cursor: 'pointer',
      }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
      <span style={{
        fontSize: 12, fontWeight: 800,
        color: rank <= 3 ? '#23211C' : '#C4BEB0',
        minWidth: 16, marginTop: 2, flexShrink: 0,
      }}>{rank}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {post.category && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            background: '#EFEBE1', color: '#76705F',
            padding: '1px 7px', borderRadius: 999,
            marginBottom: 4, display: 'inline-block',
          }}>{post.category}</span>
        )}
        <p style={{
          fontSize: 14, fontWeight: 600, color: '#26241D',
          margin: '0 0 2px', lineHeight: 1.4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{post.title}</p>
        <p style={{ fontSize: 12, color: '#9A9382', margin: 0 }}>
          {post.author_email?.split('@')[0]} · 조회 {post.views ?? 0}
        </p>
      </div>
    </div>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#C9C3B4', marginBottom: 14, letterSpacing: '0.05em' }}>{title}</p>
      {items.map(({ label, href }) => (
        <Link key={label} href={href} style={{ display: 'block', fontSize: 13, color: '#7E786B', marginBottom: 10, textDecoration: 'none' }}>
          {label}
        </Link>
      ))}
    </div>
  );
}
