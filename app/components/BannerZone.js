'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

// ── 통계 추적 헬퍼 ──────────────────────────────────────────
function trackEvent(bannerId, eventType) {
  supabase.from('banner_clicks').insert({
    banner_id:  bannerId,
    event_type: eventType,
    page_url:   typeof window !== 'undefined' ? window.location.pathname : null,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  }).then(() => {});
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

// ── home_top: 자동 슬라이드 캐러셀 ─────────────────────────
function CarouselBanner({ banners }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    banners.forEach(b => trackView(b.id));
  }, [banners]);

  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 3000);
    return () => clearInterval(t);
  }, [banners.length, paused]);

  const prev = () => setIdx(i => (i - 1 + banners.length) % banners.length);
  const next = () => setIdx(i => (i + 1) % banners.length);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden group my-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="absolute top-2 right-2 z-10 text-xs text-white/60 bg-black/20 px-1.5 py-0.5 rounded-full">광고</span>

      <BannerImg banner={banners[idx]} imgClass="w-full h-auto block" />

      {banners.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xl font-bold">
            ‹
          </button>
          <button onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xl font-bold">
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === idx ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/70'
                }`} />
            ))}
          </div>
        </>
      )}
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

// ── jobs_top / resumes_top: 우측 사이드바 ──────────────────
function SidebarBanner({ banners }) {
  useEffect(() => { banners.forEach(b => trackView(b.id)); }, [banners]);
  return (
    <aside className="w-44 shrink-0 hidden lg:block">
      <div className="sticky top-6">
        <p className="text-xs text-stone-300 text-right mb-2">광고</p>
        <div className="space-y-3">
          {banners.map(b => (
            <BannerImg key={b.id} banner={b} imgClass="w-full h-auto rounded-xl" />
          ))}
        </div>
      </div>
    </aside>
  );
}

// ── 메인 export ────────────────────────────────────────────
export default function BannerZone({ position }) {
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

  if (banners.length === 0) return null;

  switch (position) {
    case 'home_top':    return <CarouselBanner banners={banners} />;
    case 'home_bottom': return <GridBanner banners={banners} />;
    case 'home_strip':  return <StripBanner banners={banners} />;
    case 'jobs_top':
    case 'resumes_top':    return <SidebarBanner banners={banners} />;
    case 'jobs_bottom':
    case 'resumes_bottom': return <SponsorGridBanner banners={banners} />;
    case 'community_top':
    case 'property_top':   return <WideTopBanner banners={banners} />;
    case 'property_strip':
    case 'community_strip': return <StripBanner banners={banners} />;
    default:               return null;
  }
}
