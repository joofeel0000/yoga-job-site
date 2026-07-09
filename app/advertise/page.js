'use client';

import Link from 'next/link';

const AD_PRODUCTS = [
  { id: 'main_slide', label: '메인 슬라이드', position: 'home_top', slots: 5, pricePerSlot: 500000, totalMonthly: 2500000, desc: '홈 화면 최상단 전체 너비 캐러셀. 사이트 진입 시 가장 먼저 노출, 3초마다 자동 슬라이드.', tag: '가장 높은 노출', tagColor: '#C2922F', tagBg: '#FDF3E3', icon: '🏆' },
  { id: 'main_wide', label: '메인 와이드', position: 'home_strip', slots: 2, pricePerSlot: 300000, totalMonthly: 600000, desc: '메인 페이지 통계 바 아래 풀width 띠 배너. 스크롤 없이 바로 보이는 영역.', tag: '풀width', tagColor: '#9333EA', tagBg: '#F5F3FF', icon: '📣' },
  { id: 'main_sponsor', label: '메인 스폰서 카드', position: 'home_bottom', slots: 3, pricePerSlot: 150000, totalMonthly: 450000, desc: '홈 화면 하단 3열 스폰서 카드 그리드. 메인 콘텐츠 탐색 후 자연스럽게 노출.', tag: '3개 슬롯', tagColor: '#4B5CB8', tagBg: '#EEF2FF', icon: '📌' },
  { id: 'jobs_sidebar', label: '구인구직 사이드바', position: 'jobs_top', slots: 10, pricePerSlot: 100000, totalMonthly: 1000000, desc: '구인공고 목록 우측 사이드바. 구직·구인 의도가 명확한 타겟 방문자에게 노출.', tag: '타겟 노출', tagColor: '#16A34A', tagBg: '#F0FDF4', icon: '🎯' },
  { id: 'jobs_bottom', label: '구인구직 하단 카드', position: 'jobs_bottom', slots: 3, pricePerSlot: 50000, totalMonthly: 150000, desc: '구인공고 페이지 하단 스폰서 카드. 콘텐츠 열람 후 자연스럽게 도달.', tag: '3개 슬롯', tagColor: '#76705F', tagBg: '#F4F1E9', icon: '📋' },
  { id: 'resumes_sidebar', label: '강사찾기 사이드바', position: 'resumes_top', slots: 10, pricePerSlot: 100000, totalMonthly: 1000000, desc: '강사찾기 목록 우측 사이드바. 채용 의도가 명확한 타겟 방문자에게 노출.', tag: '타겟 노출', tagColor: '#16A34A', tagBg: '#F0FDF4', icon: '🎯' },
  { id: 'resumes_bottom', label: '강사찾기 하단 카드', position: 'resumes_bottom', slots: 3, pricePerSlot: 50000, totalMonthly: 150000, desc: '강사찾기 페이지 하단 스폰서 카드. 콘텐츠 열람 후 자연스럽게 도달.', tag: '3개 슬롯', tagColor: '#76705F', tagBg: '#F4F1E9', icon: '📋' },
  { id: 'property_wide', label: '매물정보 와이드', position: 'property_strip', slots: 1, pricePerSlot: 200000, totalMonthly: 200000, desc: '매물정보 페이지 풀width 띠 배너. 공간 임대·매매에 관심 있는 방문자에게 노출.', tag: '풀width', tagColor: '#0369A1', tagBg: '#E0F2FE', icon: '🏠' },
  { id: 'community_wide', label: '커뮤니티 와이드', position: 'community_strip', slots: 1, pricePerSlot: 200000, totalMonthly: 200000, desc: '커뮤니티 페이지 풀width 띠 배너. 요가 종사자 커뮤니티 방문자에게 노출.', tag: '풀width', tagColor: '#0369A1', tagBg: '#E0F2FE', icon: '💬' },
];

const PREMIUM_PACKAGES = [
  { id: 'pkg_yoga_target', name: '요가원 타겟', icon: '🧘', includes: ['메인 스폰서 카드 1개', '구인구직 사이드바 1개'], originalPrice: 250000, packagePrice: 200000, discount: 20, desc: '강사를 채용하는 요가원에 최적. 메인에서 관심을 끌고 구인 지면에서 재노출.' },
  { id: 'pkg_instructor_target', name: '강사 타겟', icon: '🌟', includes: ['강사찾기 사이드바 1개', '커뮤니티 와이드 1개'], originalPrice: 300000, packagePrice: 240000, discount: 20, desc: '우수 강사를 찾는 스튜디오에 최적. 강사찾기와 커뮤니티 동시 노출.' },
  { id: 'pkg_jobs_cross', name: '구인구직 교차', icon: '🔄', includes: ['구인구직 사이드바 1개', '강사찾기 사이드바 1개'], originalPrice: 200000, packagePrice: 160000, discount: 20, desc: '구인구직 양쪽 모두 커버. 구인·구직 방문자 모두에게 동시 노출.' },
  { id: 'pkg_brand', name: '브랜드 노출', icon: '📢', includes: ['메인 와이드 1개', '매물정보 와이드 1개'], originalPrice: 500000, packagePrice: 400000, discount: 20, desc: '메인과 매물정보 두 페이지에서 브랜드 인지도 극대화.' },
  { id: 'pkg_full', name: '풀 브랜딩', icon: '🚀', includes: ['메인 슬라이드 1개', '구인구직 사이드바 1개', '강사찾기 사이드바 1개'], originalPrice: 700000, packagePrice: 550000, discount: 21, desc: '메인 + 구인구직 + 강사찾기 전방위 노출. 사이트 최대 커버리지.', highlight: true },
];

const BETA_BENEFITS = [
  { icon: '🆓', title: '베타 기간 전체 무료', desc: '현재 운영 중인 모든 광고 위치를 비용 없이 게재할 수 있습니다.' },
  { icon: '🎁', title: '정식 오픈 후 3개월 50% 할인', desc: '베타 기간 내 광고를 집행한 광고주에게 정식 오픈 시 할인 혜택을 드립니다.' },
  { icon: '⭐', title: '우선 노출 보장', desc: '정식 오픈 후 6개월간 동일 카테고리 광고주 중 상단 우선 배치를 보장합니다.' },
  { icon: '📊', title: '노출 데이터 공유', desc: '베타 기간 동안의 실 노출 수와 클릭 데이터를 정식 오픈 전에 공유드립니다.' },
];

// ─── SVG 광고 위치 일러스트 ────────────────────────────────────────────────────

const ADF = 'rgba(245,158,11,0.13)';  // ad fill
const ADS = '#F59E0B';                 // ad stroke
const ADT = '#D97706';                 // ad text
const CON = '#DDD8CF';                 // content fill
const COND = '#C8C2B8';               // content nested

function Navbar() {
  return (
    <g>
      <rect width="400" height="18" fill="#2C2A24" rx="5"/>
      <rect y="13" width="400" height="5" fill="#2C2A24"/>
      <circle cx="17" cy="9" r="5" fill="#3D3B34"/>
      <rect x="13" y="6" width="6" height="6" rx="5" fill="#FAF8F4" opacity="0.15"/>
      <rect x="155" y="6" width="14" height="6" rx="1" fill="#3D3B34"/>
      <rect x="175" y="6" width="14" height="6" rx="1" fill="#3D3B34"/>
      <rect x="195" y="6" width="14" height="6" rx="1" fill="#3D3B34"/>
      <rect x="215" y="6" width="14" height="6" rx="1" fill="#3D3B34"/>
      <rect x="346" y="4" width="48" height="10" rx="4" fill="#C2922F"/>
    </g>
  );
}

function AdLabel({ x, y, w, h, line1, line2, line3, fontSize1 = 9, fontSize2 = 7.5, fontSize3 = 7 }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const offset = line3 ? 10 : line2 ? 6 : 0;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={ADF} stroke={ADS} strokeWidth="1.5" rx="3"/>
      <text x={cx} y={cy - offset} textAnchor="middle" fill={ADT} fontSize={fontSize1} fontWeight="700" fontFamily="sans-serif">{line1}</text>
      {line2 && <text x={cx} y={cy + (line3 ? 3 : 7)} textAnchor="middle" fill={ADT} fontSize={fontSize2} fontFamily="sans-serif">{line2}</text>}
      {line3 && <text x={cx} y={cy + 14} textAnchor="middle" fill={ADT} fontSize={fontSize3} fontFamily="sans-serif">{line3}</text>}
    </g>
  );
}

function Legend({ y = 238 }) {
  return (
    <g>
      <rect x="5" y={y} width="8" height="8" fill={ADF} stroke={ADS} strokeWidth="1" rx="1"/>
      <text x="16" y={y + 6} fill="#9A9382" fontSize="7" fontFamily="sans-serif">광고 위치 (AD)</text>
      <rect x="90" y={y} width="8" height="8" fill={CON} rx="1"/>
      <text x="101" y={y + 6} fill="#9A9382" fontSize="7" fontFamily="sans-serif">일반 콘텐츠</text>
    </g>
  );
}

function MainPageSVG() {
  return (
    <svg viewBox="0 0 400 256" width="100%" style={{ display: 'block' }}>
      <rect width="400" height="256" fill="#FAF8F4" rx="6"/>
      <Navbar/>

      {/* 메인 슬라이드 배너 */}
      <AdLabel x={5} y={22} w={390} h={62}
        line1="● 메인 슬라이드 배너"
        line2="5슬롯 · 500,000원/슬롯"
        line3="월 최대 2,500,000원"
        fontSize1={10} fontSize2={8} fontSize3={7.5}
      />

      {/* 통계 바 */}
      <rect x="5" y="88" width="390" height="18" fill={CON} rx="3"/>
      {[0,1,2,3].map(i => <rect key={i} x={14 + i*60} y="93" width="44" height="8" rx="2" fill={COND}/>)}

      {/* 와이드 배너 */}
      <AdLabel x={5} y={110} w={390} h={16}
        line1="● 메인 와이드 배너 · 2슬롯 · 300,000원/슬롯"
        fontSize1={8}
      />

      {/* 콘텐츠 그리드 */}
      <rect x="5" y="130" width="390" height="36" fill={CON} rx="3"/>
      {[0,1,2].map(i => <rect key={i} x={13 + i*126} y="136" width="118" height="24" rx="2" fill={COND}/>)}

      {/* 스폰서 카드 3개 */}
      {[0,1,2].map(i => (
        <AdLabel key={i}
          x={5 + i*132} y={170} w={126} h={52}
          line1="AD"
          line2="메인 스폰서 카드"
          line3="150,000원/슬롯"
          fontSize1={11} fontSize2={7.5} fontSize3={7}
        />
      ))}

      <Legend y={232}/>
    </svg>
  );
}

function JobsLayoutSVG({ variant }) {
  const isJobs = variant === 'jobs';
  const sideLabel = isJobs ? '구인구직 사이드바' : '강사찾기 사이드바';
  const bottomLabel = isJobs ? '구인구직 하단 카드' : '강사찾기 하단 카드';

  return (
    <svg viewBox="0 0 400 256" width="100%" style={{ display: 'block' }}>
      <rect width="400" height="256" fill="#FAF8F4" rx="6"/>
      <Navbar/>

      {/* 왼쪽 필터 */}
      <rect x="5" y="22" width="68" height="126" fill={CON} rx="3"/>
      <text x="39" y="34" textAnchor="middle" fill="#9A9382" fontSize="7" fontFamily="sans-serif">필터</text>
      {[0,1,2,3,4].map(i => <rect key={i} x="9" y={39 + i*21} width="60" height="13" rx="2" fill={COND}/>)}

      {/* 중앙 목록 */}
      <rect x="79" y="22" width="152" height="126" fill={CON} rx="3"/>
      <text x="155" y="34" textAnchor="middle" fill="#9A9382" fontSize="7" fontFamily="sans-serif">공고 목록</text>
      {[0,1,2,3].map(i => <rect key={i} x="83" y={39 + i*28} width="144" height="22" rx="2" fill={COND}/>)}

      {/* 우측 사이드바 AD — 10슬롯 */}
      <rect x="237" y="22" width="158" height="126" fill={ADF} stroke={ADS} strokeWidth="1.5" rx="3"/>
      <text x="316" y="33" textAnchor="middle" fill={ADT} fontSize="7.5" fontWeight="700" fontFamily="sans-serif">● {sideLabel}</text>
      <text x="316" y="42" textAnchor="middle" fill={ADT} fontSize="6.5" fontFamily="sans-serif">10슬롯 · 100,000원/슬롯</text>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x="241" y={47 + i * 9} width="150" height="7" fill={ADF} stroke={ADS} strokeWidth="0.8" rx="2"/>
      ))}
      <text x="316" y="141" textAnchor="middle" fill={ADT} fontSize="6" fontFamily="sans-serif">× 10</text>

      {/* 하단 카드 3개 AD */}
      {[0,1,2].map(i => (
        <AdLabel key={i}
          x={5 + i*132} y={154} w={126} h={50}
          line1="AD"
          line2={bottomLabel}
          line3="50,000원/슬롯"
          fontSize1={11} fontSize2={7} fontSize3={6.5}
        />
      ))}

      <Legend y={216}/>
    </svg>
  );
}

function PropertyCommunitySVG() {
  return (
    <svg viewBox="0 0 400 256" width="100%" style={{ display: 'block' }}>
      <rect width="400" height="256" fill="#FAF8F4" rx="6"/>
      <Navbar/>

      {/* 와이드 배너 AD */}
      <AdLabel x={5} y={22} w={390} h={22}
        line1="● 와이드 배너 · 1슬롯 · 200,000원/슬롯"
        fontSize1={8.5}
      />

      {/* 콘텐츠 영역 — 카드 그리드 2×3 */}
      <rect x="5" y="48" width="390" height="158" fill={CON} rx="3"/>
      {[0,1].map(row =>
        [0,1,2].map(col => (
          <rect key={`${row}-${col}`}
            x={13 + col * 126} y={56 + row * 74}
            width="118" height="66"
            rx="3" fill={COND}
          />
        ))
      )}

      {/* 페이지 라벨 */}
      <text x="200" y="220" textAnchor="middle" fill="#9A9382" fontSize="8" fontFamily="sans-serif">매물정보 / 커뮤니티 공통 적용</text>

      <Legend y={236}/>
    </svg>
  );
}

function LayoutCard({ title, desc, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E3DDD0', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid #F4F1E9' }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: '#23211C', margin: 0 }}>{title}</p>
        {desc && <p style={{ fontSize: 12, color: '#9A9382', margin: '3px 0 0' }}>{desc}</p>}
      </div>
      <div style={{ padding: '16px 16px 12px' }}>{children}</div>
    </div>
  );
}

// ─── 기존 광고 카드 컴포넌트 ────────────────────────────────────────────────────

function AdCard({ product }) {
  return (
    <div
      style={{
        background: '#fff', border: '1px solid #E3DDD0', borderRadius: 18,
        padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', gap: 14,
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(30,28,24,0.10)'; e.currentTarget.style.borderColor = '#23211C'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E3DDD0'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 26 }}>{product.icon}</span>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#23211C', margin: 0 }}>{product.label}</p>
            <p style={{ fontSize: 11, color: '#9A9382', margin: '2px 0 0' }}>{product.position}</p>
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: product.tagColor, background: product.tagBg, padding: '3px 9px', borderRadius: 8, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {product.tag}
        </span>
      </div>

      <span style={{ fontSize: 12, color: '#76705F', background: '#F4F1E9', border: '1px solid #E3DDD0', padding: '3px 10px', borderRadius: 7, width: 'fit-content' }}>
        슬롯 {product.slots}개
      </span>

      <p style={{ fontSize: 13, color: '#76705F', lineHeight: 1.7, margin: 0 }}>{product.desc}</p>

      <div style={{ borderTop: '1px solid #F4F1E9', paddingTop: 14, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 11, color: '#9A9382', margin: '0 0 4px', fontWeight: 600 }}>정식 오픈 후 예정가</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#23211C' }}>
              {product.pricePerSlot.toLocaleString('ko-KR')}원
            </span>
            <span style={{ fontSize: 12, color: '#9A9382' }}>/슬롯·월</span>
          </div>
          {product.slots > 1 && (
            <p style={{ fontSize: 12, color: '#76705F', margin: '3px 0 0' }}>
              월 최대 {product.totalMonthly.toLocaleString('ko-KR')}원
            </p>
          )}
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '5px 12px', borderRadius: 9 }}>
          베타 무료
        </span>
      </div>
    </div>
  );
}

function PackageCard({ pkg }) {
  return (
    <div
      style={{
        background: pkg.highlight ? '#23211C' : '#fff',
        border: pkg.highlight ? '2px solid #C2922F' : '1px solid #E3DDD0',
        borderRadius: 18,
        padding: '24px 24px 20px',
        display: 'flex', flexDirection: 'column', gap: 14,
        position: 'relative',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = pkg.highlight ? '0 8px 28px rgba(194,146,47,0.20)' : '0 8px 28px rgba(30,28,24,0.10)'; if (!pkg.highlight) e.currentTarget.style.borderColor = '#23211C'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; if (!pkg.highlight) e.currentTarget.style.borderColor = '#E3DDD0'; }}
    >
      {pkg.highlight && (
        <span style={{ position: 'absolute', top: -12, right: 20, fontSize: 11, fontWeight: 700, color: '#fff', background: '#C2922F', padding: '4px 12px', borderRadius: 10 }}>
          BEST
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>{pkg.icon}</span>
          <p style={{ fontSize: 16, fontWeight: 800, color: pkg.highlight ? '#fff' : '#23211C', margin: 0 }}>{pkg.name}</p>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#C2922F', background: pkg.highlight ? 'rgba(194,146,47,0.15)' : '#FDF3E3', padding: '3px 9px', borderRadius: 8 }}>
          {pkg.discount}% 할인
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {pkg.includes.map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#16A34A', flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: 13, color: pkg.highlight ? '#CFC9BB' : '#76705F' }}>{item}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: pkg.highlight ? '#9A9382' : '#76705F', lineHeight: 1.7, margin: 0 }}>{pkg.desc}</p>

      <div style={{ borderTop: `1px solid ${pkg.highlight ? 'rgba(255,255,255,0.1)' : '#F4F1E9'}`, paddingTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: '#9A9382', textDecoration: 'line-through' }}>
            개별 {pkg.originalPrice.toLocaleString('ko-KR')}원
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: pkg.highlight ? '#C2922F' : '#23211C' }}>
              {pkg.packagePrice.toLocaleString('ko-KR')}원
            </span>
            <span style={{ fontSize: 12, color: '#9A9382' }}>/월</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '5px 12px', borderRadius: 9 }}>
            베타 무료
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdvertisePage() {
  return (
    <main className="page-root">
      <div className="content-wrap">

        {/* 헤드라인 */}
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-[#23211C] mb-1">요가잡 광고 안내</h1>
          <p className="text-sm text-[#9A9382]">요가 강사·센터·스튜디오를 찾는 실 방문자에게 직접 노출하세요</p>
        </div>

        {/* 베타 혜택 강조 배너 */}
        <div style={{
          background: 'linear-gradient(135deg, #23211C 60%, #3E3B33)',
          borderRadius: 18, padding: '24px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          marginBottom: 48, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#C2922F', background: 'rgba(194,146,47,0.15)', padding: '2px 8px', borderRadius: 6 }}>
                베타 운영 중
              </span>
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 5px' }}>
              🎉 지금은 모든 광고 슬롯 무료입니다
            </p>
            <p style={{ fontSize: 13, color: '#9A9382', margin: 0 }}>
              베타 참여 광고주는 정식 오픈 후 3개월간 50% 할인 혜택 제공
            </p>
          </div>
          <Link href="/advertise/apply">
            <button
              style={{ background: '#C2922F', color: '#fff', border: 'none', borderRadius: 11, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'background 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#A87A24'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#C2922F'; }}
            >
              지금 무료로 신청하기 →
            </button>
          </Link>
        </div>

        {/* 기본 광고 슬롯 */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#23211C', margin: '0 0 6px' }}>기본 광고 슬롯</h2>
          <p style={{ fontSize: 13, color: '#9A9382', margin: '0 0 20px' }}>위치별 개별 슬롯을 선택해 광고를 집행하세요.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AD_PRODUCTS.map(p => <AdCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* 프리미엄 패키지 */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#23211C', margin: '0 0 6px' }}>프리미엄 패키지</h2>
          <p style={{ fontSize: 13, color: '#9A9382', margin: '0 0 20px' }}>다른 페이지를 교차 노출해 더 넓은 도달을 확보하세요. 개별 구매 대비 최대 21% 할인.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PREMIUM_PACKAGES.map(p => <PackageCard key={p.id} pkg={p} />)}
          </div>
        </section>

        {/* 광고 노출 위치 안내 */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#23211C', margin: '0 0 6px' }}>광고 노출 위치 안내</h2>
          <p style={{ fontSize: 13, color: '#9A9382', margin: '0 0 20px' }}>
            각 페이지에서 광고가 노출되는 정확한 위치를 확인하세요.
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 8, fontSize: 12, fontWeight: 700, color: '#D97706', background: 'rgba(245,158,11,0.12)', border: '1px solid #F59E0B', padding: '1px 8px', borderRadius: 6 }}>
              주황색 = 광고 지면
            </span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LayoutCard title="메인 페이지" desc="슬라이드 배너 · 와이드 배너 · 스폰서 카드 3개">
              <MainPageSVG />
            </LayoutCard>
            <LayoutCard title="구인구직 페이지" desc="우측 사이드바 10슬롯 · 하단 카드 3개">
              <JobsLayoutSVG variant="jobs" />
            </LayoutCard>
            <LayoutCard title="강사찾기 페이지" desc="우측 사이드바 10슬롯 · 하단 카드 3개">
              <JobsLayoutSVG variant="resumes" />
            </LayoutCard>
            <LayoutCard title="매물정보 · 커뮤니티" desc="페이지 상단 풀width 와이드 배너">
              <PropertyCommunitySVG />
            </LayoutCard>
          </div>
        </section>

        {/* 요금표 */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#23211C', margin: '0 0 6px' }}>정식 오픈 후 예정 요금표</h2>
          <p style={{ fontSize: 13, color: '#9A9382', margin: '0 0 20px' }}>베타 기간 중 무료이며, 요금은 정식 오픈 시점에 확정됩니다.</p>

          {/* 기본 슬롯 테이블 */}
          <div style={{ overflowX: 'auto', marginBottom: 24 }}>
          <div style={{ background: '#fff', border: '1px solid #E3DDD0', borderRadius: 16, overflow: 'hidden', minWidth: 480 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 80px 130px 130px',
              background: '#F4F1E9', padding: '12px 24px',
              fontSize: 12, fontWeight: 700, color: '#9A9382', letterSpacing: '0.06em',
            }}>
              <span>광고 상품</span>
              <span style={{ textAlign: 'center' }}>슬롯 수</span>
              <span style={{ textAlign: 'right' }}>슬롯당 요금</span>
              <span style={{ textAlign: 'right' }}>월 매출</span>
            </div>
            {AD_PRODUCTS.map((p, i) => (
              <div key={p.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 80px 130px 130px',
                padding: '14px 24px', alignItems: 'center',
                borderTop: i === 0 ? 'none' : '1px solid #F4F1E9',
              }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#23211C' }}>{p.label}</span>
                  <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: p.tagColor, background: p.tagBg, padding: '1px 7px', borderRadius: 6 }}>
                    {p.tag}
                  </span>
                </div>
                <span style={{ fontSize: 13, color: '#76705F', textAlign: 'center' }}>{p.slots}개</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#23211C' }}>
                    {p.pricePerSlot.toLocaleString('ko-KR')}원
                  </span>
                  <span style={{ fontSize: 11, color: '#9A9382' }}>/월</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#23211C' }}>
                    {p.totalMonthly.toLocaleString('ko-KR')}원
                  </span>
                </div>
              </div>
            ))}
          </div>
          </div>

          {/* 패키지 테이블 */}
          <div style={{ overflowX: 'auto' }}>
          <div style={{ background: '#fff', border: '1px solid #E3DDD0', borderRadius: 16, overflow: 'hidden', minWidth: 480 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '140px 1fr 120px 120px',
              background: '#F4F1E9', padding: '12px 24px',
              fontSize: 12, fontWeight: 700, color: '#9A9382', letterSpacing: '0.06em',
            }}>
              <span>패키지</span>
              <span>구성</span>
              <span style={{ textAlign: 'right' }}>개별가</span>
              <span style={{ textAlign: 'right' }}>패키지가</span>
            </div>
            {PREMIUM_PACKAGES.map((p, i) => (
              <div key={p.id} style={{
                display: 'grid', gridTemplateColumns: '140px 1fr 120px 120px',
                padding: '14px 24px', alignItems: 'center',
                borderTop: i === 0 ? 'none' : '1px solid #F4F1E9',
                background: p.highlight ? '#FFFBF4' : 'transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{p.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#23211C' }}>{p.name}</span>
                  {p.highlight && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#C2922F', background: '#FDF3E3', padding: '1px 6px', borderRadius: 5 }}>BEST</span>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {p.includes.map(item => (
                    <span key={item} style={{ fontSize: 11, color: '#76705F', background: '#F4F1E9', border: '1px solid #E3DDD0', padding: '2px 7px', borderRadius: 5 }}>
                      {item}
                    </span>
                  ))}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 13, color: '#9A9382', textDecoration: 'line-through' }}>
                    {p.originalPrice.toLocaleString('ko-KR')}원
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#23211C' }}>
                    {p.packagePrice.toLocaleString('ko-KR')}원
                  </span>
                  <span style={{ fontSize: 11, color: '#C2922F', fontWeight: 700, marginLeft: 4 }}>
                    {p.discount}%↓
                  </span>
                </div>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* 베타 참여 혜택 */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#23211C', margin: '0 0 20px' }}>베타 참여 혜택</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {BETA_BENEFITS.map(b => (
              <div key={b.title} style={{ background: '#fff', border: '1px solid #E3DDD0', borderRadius: 14, padding: '20px 20px 18px' }}>
                <span style={{ fontSize: 28 }}>{b.icon}</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#23211C', margin: '10px 0 6px' }}>{b.title}</p>
                <p style={{ fontSize: 13, color: '#76705F', lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 문의 & CTA */}
        <section style={{
          background: '#23211C', borderRadius: 18, padding: '36px 36px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>광고 문의 및 신청</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, color: '#9A9382' }}>📧</span>
                <span style={{ fontSize: 14, color: '#CFC9BB' }}>yogajob.ad@gmail.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, color: '#9A9382' }}>💬</span>
                <span style={{ fontSize: 14, color: '#CFC9BB' }}>카카오 채널 @요가잡</span>
              </div>
              <p style={{ fontSize: 12, color: '#76705F', margin: '6px 0 0' }}>광고 이미지 소재 제작 가이드는 문의 시 안내드립니다</p>
            </div>
          </div>
          <Link href="/advertise/apply">
            <button
              style={{ background: '#fff', color: '#23211C', border: 'none', borderRadius: 11, padding: '14px 28px', fontSize: 15, fontWeight: 800, cursor: 'pointer', transition: 'background 0.12s', whiteSpace: 'nowrap', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = '#EAE7DE'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
            >
              광고 신청하기 →
            </button>
          </Link>
        </section>

      </div>
    </main>
  );
}
