'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// ── 통계 추적 헬퍼 ──────────────────────────────────────────
function detectDeviceType() {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPod/i.test(ua) && !/iPad/i.test(ua)) return 'mobile';
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  return 'desktop';
}

function trackEvent(bannerId, eventType) {
  supabase.auth.getSession().then(({ data: { session } }) => {
    supabase.from('banner_clicks').insert({
      banner_id:   bannerId,
      event_type:  eventType,
      page_url:    typeof window !== 'undefined' ? window.location.pathname : null,
      user_agent:  typeof navigator !== 'undefined' ? navigator.userAgent : null,
      referrer:    typeof document !== 'undefined' ? (document.referrer || null) : null,
      device_type: detectDeviceType(),
      user_id:     session?.user?.id || null,
    }).then(() => {});
  });
}

// 세션 당 한 번만 노출 카운트
function trackView(bannerId) {
  if (typeof sessionStorage === 'undefined') return;
  const key = `bv_${bannerId}`;
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, '1');
    trackEvent(bannerId, 'view');
  }
}

// ── 공통 이미지 래퍼 ────────────────────────────────────────
function BannerImg({ banner, imgClass }) {
  const img = (
    <img
      src={banner.image_url}
      alt={banner.title}
      className={imgClass}
      onError={(e) => { e.target.parentElement.style.display = 'none'; }}
    />
  );
  if (banner.link_url) {
    return (
      <a href={banner.link_url} target="_blank" rel="noopener noreferrer"
        className="block hover:opacity-95 transition"
        onClick={() => trackEvent(banner.id, 'click')}>
        {img}
      </a>
    );
  }
  return <div>{img}</div>;
}

// ── home_top: Swiper 캐러셀 ────────────────────────────────
// heroMode=true → 부모 relative 컨테이너를 꽉 채움 (히어로 이미지 슬롯용)
function CarouselBanner({ banners, heroMode = false }) {
  useEffect(() => { banners.forEach(b => trackView(b.id)); }, [banners]);

  const outerStyle = heroMode
    ? { position: 'absolute', inset: 0, overflow: 'hidden' }
    : { borderRadius: 16, overflow: 'hidden', position: 'relative', marginBottom: 0 };

  const swiperHeight = heroMode ? '100%' : 250;

  const adBadge = (
    <span style={{
      position: 'absolute', top: 10, right: 12, zIndex: 10,
      fontSize: 11, color: 'rgba(255,255,255,0.7)',
      background: 'rgba(0,0,0,0.28)', padding: '2px 8px', borderRadius: 20,
      pointerEvents: 'none',
    }}>광고</span>
  );

  // 단일 배너 — 정적 표시
  if (banners.length === 1) {
    const b = banners[0];
    const img = (
      <img src={b.image_url} alt={b.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={e => { e.target.style.display = 'none'; }} />
    );
    return (
      <div style={outerStyle}>
        {adBadge}
        {b.link_url
          ? <a href={b.link_url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', height: '100%' }} onClick={() => trackEvent(b.id, 'click')}>{img}</a>
          : img}
      </div>
    );
  }

  // 복수 배너 — Swiper 슬라이드
  return (
    <div className="bz-carousel" style={outerStyle}>
      {adBadge}
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true }}
        navigation
        scrollbar={false}
        loop
        style={{ height: swiperHeight }}
      >
        {banners.map(b => (
          <SwiperSlide key={b.id} style={{ height: swiperHeight }}>
            {b.link_url ? (
              <a href={b.link_url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', height: '100%' }}
                onClick={() => trackEvent(b.id, 'click')}>
                <img src={b.image_url} alt={b.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.style.display = 'none'; }} />
              </a>
            ) : (
              <img src={b.image_url} alt={b.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { e.target.style.display = 'none'; }} />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
      <style>{`
        .bz-carousel .swiper-button-next,
        .bz-carousel .swiper-button-prev {
          width: 32px !important;
          height: 32px !important;
          margin-top: -16px !important;
          background: rgba(255,255,255,0.85);
          border-radius: 50%;
          transition: background 0.15s;
          color: #23211C !important;
        }
        .bz-carousel .swiper-button-next svg,
        .bz-carousel .swiper-button-prev svg {
          width: 14px !important;
          height: 14px !important;
        }
        .bz-carousel .swiper-button-next:hover,
        .bz-carousel .swiper-button-prev:hover {
          background: rgba(255,255,255,1);
        }
        .bz-carousel .swiper-pagination {
          background: transparent !important;
        }
        .bz-carousel .swiper-pagination-bullet {
          background: rgba(255,255,255,0.5) !important;
          opacity: 1 !important;
          width: 7px !important;
          height: 7px !important;
          transition: all 0.25s;
        }
        .bz-carousel .swiper-pagination-bullet-active {
          background: #fff !important;
          width: 20px !important;
          border-radius: 4px !important;
        }
      `}</style>
    </div>
  );
}

// ── home_bottom: 3열 스폰서 카드 그리드 ────────────────────
function GridBanner({ banners }) {
  useEffect(() => { banners.forEach(b => trackView(b.id)); }, [banners]);
  return (
    <section style={{ marginBottom: 56 }}>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#9A9382', letterSpacing: '0.1em' }}>SPONSORED</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {banners.map(b => <SponsorCard key={b.id} banner={b} height={200} />)}
      </div>
    </section>
  );
}

// ── home_strip: 풀width 와이드 배너 (160px, 그라데이션) ──────
function StripBanner({ banners }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => { banners.forEach(b => trackView(b.id)); }, [banners]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  const b = banners[idx];
  const inner = (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: 160, marginBottom: 56 }}>
      <img
        src={b.image_url} alt={b.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, rgba(30,28,24,0.72) 0%, rgba(30,28,24,0) 60%)',
      }} />
      <span style={{
        position: 'absolute', top: 12, left: 12,
        background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)',
        color: '#fff', fontSize: 11, fontWeight: 700,
        padding: '2px 7px', borderRadius: 4,
      }}>AD</span>
      {b.title && (
        <div style={{ position: 'absolute', top: '50%', left: 32, transform: 'translateY(-50%)' }}>
          <p style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0 }}>{b.title}</p>
        </div>
      )}
    </div>
  );
  if (b.link_url) {
    return <a href={b.link_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }} onClick={() => trackEvent(b.id, 'click')}>{inner}</a>;
  }
  return inner;
}

// ── 스폰서 카드 (이미지 꽉 채움 + 하단 그라데이션 오버레이) ──
function SponsorCard({ banner, height = 180 }) {
  useEffect(() => { trackView(banner.id); }, [banner.id]);
  const card = (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      border: '1px solid #E3DDD0',
      position: 'relative', height,
    }}>
      <img
        src={banner.image_url}
        alt={banner.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(30,28,24,0.78) 0%, rgba(30,28,24,0) 55%)',
      }} />
      <span style={{
        position: 'absolute', top: 10, right: 10,
        background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)',
        color: '#fff', fontSize: 10, fontWeight: 700,
        padding: '2px 7px', borderRadius: 4,
      }}>AD</span>
      {banner.title && (
        <div style={{ position: 'absolute', bottom: 14, left: 14 }}>
          <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0 }}>{banner.title}</p>
        </div>
      )}
    </div>
  );
  if (banner.link_url) {
    return (
      <a href={banner.link_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }} onClick={() => trackEvent(banner.id, 'click')}>
        {card}
      </a>
    );
  }
  return card;
}

// ── jobs_bottom / resumes_bottom: 3열 스폰서 카드 그리드 ──────
function SponsorGridBanner({ banners }) {
  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#9A9382', letterSpacing: '0.1em' }}>SPONSORED</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {banners.map(b => <SponsorCard key={b.id} banner={b} />)}
      </div>
    </div>
  );
}

// ── community_top / property_top: 풀width 와이드 배너 ──────────
function WideTopBanner({ banners }) {
  const b = banners[0];
  useEffect(() => { trackView(b.id); }, [b.id]);
  const inner = (
    <div style={{
      position: 'relative', borderRadius: 16, overflow: 'hidden',
      height: 140, marginBottom: 24,
    }}>
      <img
        src={b.image_url}
        alt={b.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, rgba(30,28,24,0.72) 0%, rgba(30,28,24,0) 60%)',
      }} />
      <span style={{
        position: 'absolute', top: 12, right: 12,
        background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)',
        color: '#fff', fontSize: 10, fontWeight: 700,
        padding: '2px 7px', borderRadius: 4,
      }}>AD</span>
      {b.title && (
        <div style={{ position: 'absolute', top: '50%', left: 28, transform: 'translateY(-50%)' }}>
          <p style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>{b.title}</p>
        </div>
      )}
    </div>
  );
  if (b.link_url) {
    return (
      <a href={b.link_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }} onClick={() => trackEvent(b.id, 'click')}>
        {inner}
      </a>
    );
  }
  return inner;
}

// ── jobs_top / resumes_top: 우측 사이드바 (소수 배너) ─────────
// inline=true: <aside> 없이 내용만 반환 (복합 사이드바 조합용)
function SidebarBanner({ banners, inline = false }) {
  useEffect(() => { banners.forEach(b => trackView(b.id)); }, [banners]);
  const content = (
    <div className="space-y-3">
      {banners.map(b => (
        <BannerImg key={b.id} banner={b} imgClass="w-full h-auto rounded-xl" />
      ))}
    </div>
  );
  if (inline) return content;
  return (
    <aside className="w-44 shrink-0 hidden lg:block">
      <div className="sticky top-6">
        <p className="text-xs text-stone-300 text-right mb-2">광고</p>
        {content}
      </div>
    </aside>
  );
}

// ── jobs_sidebar / resumes_sidebar: 우측 사이드바 (최대 10개 스택) ──
// inline=true: <aside> 없이 내용만 반환 (복합 사이드바 조합용)
function SidebarStackBanner({ banners, inline = false }) {
  useEffect(() => { banners.forEach(b => trackView(b.id)); }, [banners]);

  const items = banners.map(b => {
    const inner = (
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #E3DDD0', position: 'relative', height: 100, flexShrink: 0 }}>
        <img
          src={b.image_url} alt={b.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => { e.target.parentElement.style.display = 'none'; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(30,28,24,0.62) 0%, rgba(30,28,24,0) 52%)' }} />
        <span style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3 }}>AD</span>
        {b.title && (
          <p style={{ position: 'absolute', bottom: 8, left: 8, right: 8, color: '#fff', fontSize: 12, fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</p>
        )}
      </div>
    );
    if (b.link_url) {
      return (
        <a key={b.id} href={b.link_url} target="_blank" rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'block', flexShrink: 0 }}
          onClick={() => trackEvent(b.id, 'click')}>
          {inner}
        </a>
      );
    }
    return <div key={b.id} style={{ flexShrink: 0 }}>{inner}</div>;
  });

  if (inline) return <>{items}</>;

  return (
    <aside className="w-44 shrink-0 hidden lg:block">
      <div style={{ position: 'sticky', top: 24 }}>
        <p style={{ fontSize: 11, color: '#C4BEB0', textAlign: 'right', marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em' }}>광고</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', paddingRight: 1 }}>
          {items}
        </div>
      </div>
    </aside>
  );
}

// ── 메인 export ────────────────────────────────────────────
// fallback: 배너가 없을 때 렌더할 콘텐츠 (히어로 이미지 슬롯 등)
// heroMode: home_top 배너를 부모 relative 컨테이너에 꽉 채울 때 사용
export default function BannerZone({ position, fallback = null, heroMode = false, inline = false }) {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('banners')
        .select('id, title, image_url, link_url, starts_at, ends_at')
        .eq('position', position)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (data) {
        const now = new Date();
        setBanners(
          data.filter(b => {
            const startOk = b.starts_at == null || new Date(b.starts_at) <= now;
            const endOk   = b.ends_at   == null || new Date(b.ends_at)   >= now;
            return startOk && endOk;
          })
        );
      }
    };
    load();
  }, [position]);

  if (banners.length === 0) return fallback;

  switch (position) {
    case 'home_top':    return <CarouselBanner banners={banners} heroMode={heroMode} />;
    case 'home_bottom': return <GridBanner banners={banners} />;
    case 'home_strip':  return <StripBanner banners={banners} />;
    case 'jobs_top':
    case 'resumes_top':     return <SidebarBanner banners={banners} inline={inline} />;
    case 'jobs_sidebar':
    case 'resumes_sidebar': return <SidebarStackBanner banners={banners} inline={inline} />;
    case 'jobs_bottom':
    case 'resumes_bottom': return <SponsorGridBanner banners={banners} />;
    case 'community_top':
    case 'property_top':   return <WideTopBanner banners={banners} />;
    case 'property_strip':
    case 'community_strip': return <StripBanner banners={banners} />;
    default:               return null;
  }
}
