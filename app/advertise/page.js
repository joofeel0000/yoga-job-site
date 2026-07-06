'use client';

import Link from 'next/link';

const AD_PRODUCTS = [
  {
    id: 'home_top',
    label: '메인 슬라이드 배너',
    position: 'home_top',
    size: '970 × 250',
    slots: 1,
    price: 300000,
    desc: '홈 화면 최상단 전체 너비 캐러셀 배너. 사이트 진입 시 가장 먼저 노출되며 3초마다 자동 슬라이드.',
    tag: '가장 높은 노출',
    tagColor: '#C2922F',
    tagBg: '#FDF3E3',
    icon: '🏆',
  },
  {
    id: 'home_strip',
    label: '메인 와이드 배너',
    position: 'home_strip',
    size: '1200 × 90',
    slots: 1,
    price: 200000,
    desc: '메인 페이지 통계 바 아래 풀width 띠 배너. 스크롤 없이 바로 보이는 영역으로 브랜드 인지도에 효과적.',
    tag: '풀width',
    tagColor: '#9333EA',
    tagBg: '#F5F3FF',
    icon: '📣',
  },
  {
    id: 'home_bottom',
    label: '메인 스폰서 카드',
    position: 'home_bottom',
    size: '300 × 250',
    slots: 3,
    price: 150000,
    desc: '홈 화면 하단 3열 스폰서 카드 그리드. 메인 콘텐츠 탐색 후 자연스럽게 노출되는 영역.',
    tag: '3개 슬롯',
    tagColor: '#4B5CB8',
    tagBg: '#EEF2FF',
    icon: '📌',
  },
  {
    id: 'sidebar',
    label: '구인공고 · 강사찾기 사이드바',
    position: 'jobs_top / resumes_top',
    size: '300 × 250',
    slots: 1,
    price: 100000,
    desc: '구인공고·강사찾기 목록 우측 사이드바. 구직·구인 의도가 명확한 타겟 방문자에게 노출.',
    tag: '타겟 노출',
    tagColor: '#16A34A',
    tagBg: '#F0FDF4',
    icon: '🎯',
  },
  {
    id: 'page_bottom',
    label: '페이지 하단 스폰서 카드',
    position: 'jobs_bottom / resumes_bottom 등',
    size: '300 × 250',
    slots: 3,
    price: 100000,
    desc: '구인공고·강사찾기·커뮤니티·매물 페이지 하단 스폰서 카드. 콘텐츠 열람 후 자연스럽게 도달.',
    tag: '전 페이지',
    tagColor: '#76705F',
    tagBg: '#F4F1E9',
    icon: '📋',
  },
  {
    id: 'property_community_strip',
    label: '매물정보 & 커뮤니티 와이드 배너',
    position: 'property_strip + community_strip',
    size: '1200 × 90',
    slots: 1,
    price: 200000,
    desc: '매물정보·커뮤니티 두 페이지에 동시 노출되는 풀width 띠 배너. 두 페이지를 하나의 소재로 커버해 가성비가 뛰어납니다.',
    tag: '2페이지 동시',
    tagColor: '#0369A1',
    tagBg: '#E0F2FE',
    icon: '🏠💬',
  },
];

function PriceTag({ price }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span style={{ fontSize: 22, fontWeight: 800, color: '#23211C' }}>
        {price.toLocaleString('ko-KR')}원
      </span>
      <span style={{ fontSize: 13, color: '#9A9382' }}>/월</span>
    </div>
  );
}

function AdCard({ product }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E3DDD0',
      borderRadius: 18,
      padding: '28px 28px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      transition: 'box-shadow 0.15s, border-color 0.15s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(30,28,24,0.10)';
        e.currentTarget.style.borderColor = '#23211C';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#E3DDD0';
      }}
    >
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>{product.icon}</span>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#23211C', margin: 0 }}>{product.label}</p>
            <p style={{ fontSize: 12, color: '#9A9382', margin: '2px 0 0' }}>{product.position}</p>
          </div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: product.tagColor, background: product.tagBg,
          padding: '3px 9px', borderRadius: 8, whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {product.tag}
        </span>
      </div>

      {/* meta */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 12, color: '#76705F', background: '#F4F1E9',
          border: '1px solid #E3DDD0', padding: '3px 10px', borderRadius: 7,
        }}>
          📐 {product.size}
        </span>
        <span style={{
          fontSize: 12, color: '#76705F', background: '#F4F1E9',
          border: '1px solid #E3DDD0', padding: '3px 10px', borderRadius: 7,
        }}>
          슬롯 {product.slots}개
        </span>
      </div>

      {/* desc */}
      <p style={{ fontSize: 13, color: '#76705F', lineHeight: 1.7, margin: 0 }}>{product.desc}</p>

      {/* price */}
      <div style={{
        borderTop: '1px solid #F4F1E9', paddingTop: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontSize: 11, color: '#9A9382', margin: '0 0 3px', fontWeight: 600 }}>정식 오픈 후 예정가</p>
          <PriceTag price={product.price} />
        </div>
        <span style={{
          fontSize: 12, fontWeight: 700,
          color: '#16A34A', background: '#F0FDF4',
          border: '1px solid #BBF7D0', padding: '5px 12px', borderRadius: 9,
        }}>
          베타 무료
        </span>
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
          <Link href="/admin">
            <button style={{
              background: '#C2922F', color: '#fff', border: 'none', borderRadius: 11,
              padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'background 0.12s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#A87A24'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#C2922F'; }}
            >
              지금 무료로 신청하기 →
            </button>
          </Link>
        </div>

        {/* 광고 상품 카드 */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#23211C', margin: '0 0 20px' }}>
            광고 위치별 상품
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {AD_PRODUCTS.map(p => <AdCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* 요금표 */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#23211C', margin: '0 0 6px' }}>
            정식 오픈 후 예정 요금표
          </h2>
          <p style={{ fontSize: 13, color: '#9A9382', margin: '0 0 20px' }}>베타 기간 중 무료이며, 요금은 정식 오픈 시점에 확정됩니다.</p>

          <div style={{ background: '#fff', border: '1px solid #E3DDD0', borderRadius: 16, overflow: 'hidden' }}>
            {/* 헤더 */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 140px 120px 120px',
              background: '#F4F1E9', padding: '12px 24px',
              fontSize: 12, fontWeight: 700, color: '#9A9382', letterSpacing: '0.06em',
            }}>
              <span>광고 상품</span>
              <span style={{ textAlign: 'center' }}>사이즈</span>
              <span style={{ textAlign: 'center' }}>슬롯 수</span>
              <span style={{ textAlign: 'right' }}>월 요금</span>
            </div>

            {AD_PRODUCTS.map((p, i) => (
              <div key={p.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 140px 120px 120px',
                padding: '16px 24px', alignItems: 'center',
                borderTop: i === 0 ? 'none' : '1px solid #F4F1E9',
              }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#23211C' }}>{p.label}</span>
                  <span style={{
                    marginLeft: 8, fontSize: 11, fontWeight: 700,
                    color: p.tagColor, background: p.tagBg,
                    padding: '1px 7px', borderRadius: 6,
                  }}>{p.tag}</span>
                </div>
                <span style={{ fontSize: 13, color: '#76705F', textAlign: 'center' }}>{p.size}</span>
                <span style={{ fontSize: 13, color: '#76705F', textAlign: 'center' }}>{p.slots}개</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#23211C' }}>
                    {p.price.toLocaleString('ko-KR')}원
                  </span>
                  <span style={{ fontSize: 11, color: '#9A9382' }}>/월</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 베타 혜택 섹션 */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#23211C', margin: '0 0 20px' }}>
            베타 참여 혜택
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {[
              { icon: '🆓', title: '베타 기간 전 슬롯 무료', desc: '현재 운영 중인 모든 광고 위치를 비용 없이 게재할 수 있습니다.' },
              { icon: '🎁', title: '정식 오픈 후 3개월 50% 할인', desc: '베타 기간 내 광고를 집행한 광고주에게 정식 오픈 시 할인 혜택을 드립니다.' },
              { icon: '📊', title: '노출 데이터 공유', desc: '베타 기간 동안의 실 노출 수와 클릭 데이터를 정식 오픈 전에 공유드립니다.' },
              { icon: '⭐', title: '우선 노출 보장', desc: '정식 오픈 후 6개월간 동일 카테고리 광고주 중 상단 우선 배치를 보장합니다.' },
            ].map(b => (
              <div key={b.title} style={{
                background: '#fff', border: '1px solid #E3DDD0', borderRadius: 14, padding: '20px 20px 18px',
              }}>
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
            <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
              광고 문의 및 신청
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, color: '#9A9382' }}>📧</span>
                <span style={{ fontSize: 14, color: '#CFC9BB' }}>yogajob.ad@gmail.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, color: '#9A9382' }}>💬</span>
                <span style={{ fontSize: 14, color: '#CFC9BB' }}>카카오 채널 @요가잡</span>
              </div>
              <p style={{ fontSize: 12, color: '#76705F', margin: '6px 0 0' }}>
                광고 이미지 소재 제작 가이드는 문의 시 안내드립니다
              </p>
            </div>
          </div>
          <Link href="/admin">
            <button style={{
              background: '#fff', color: '#23211C', border: 'none', borderRadius: 11,
              padding: '14px 28px', fontSize: 15, fontWeight: 800, cursor: 'pointer',
              transition: 'background 0.12s', whiteSpace: 'nowrap', flexShrink: 0,
            }}
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
