'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// 커피 쿠폰 이벤트 브로셔 팝업 (홈에서만 사용)
//  - 이미지: public/event/brochure.jpg (없으면 팝업을 띄우지 않음)
//  - 마감/선착순 소진은 서버(feedback_status)의 open 값으로 판단 → 코드 수정 없이 자동 종료
//  - "오늘 하루 보지 않기"는 브라우저(localStorage)에 저장
const IMG_SRC = '/event/brochure.jpg';
const HIDE_KEY = 'eventPopupHideUntil';

export default function EventPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const until = Number(localStorage.getItem(HIDE_KEY) || 0);
        if (until && Date.now() < until) return;
      } catch {}

      const { data: s } = await supabase.rpc('feedback_status');
      if (cancelled || !s?.open) return;

      // 이미지가 실제로 로드될 때만 노출 (파일이 없으면 조용히 포기)
      const img = new window.Image();
      img.onload = () => { if (!cancelled) setVisible(true); };
      img.src = IMG_SRC;
    })();
    return () => { cancelled = true; };
  }, []);

  const close = () => setVisible(false);
  const hideToday = () => {
    try { localStorage.setItem(HIDE_KEY, String(Date.now() + 24 * 60 * 60 * 1000)); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="커피 쿠폰 이벤트"
      onClick={close}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(35,33,28,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 420, maxHeight: '100%', display: 'flex', flexDirection: 'column', background: '#F25937', borderRadius: 18, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <Link href="/feedback" onClick={close} style={{ display: 'block' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG_SRC} alt="의견 남기고 커피 한 잔 받아 가세요 - 12월 15일까지 이벤트" style={{ display: 'block', width: '100%', height: 'auto' }} />
          </Link>
          <div style={{ padding: '6px 24px 22px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#23211C', marginBottom: 2 }}>선착순 100명 · 1인 1회</p>
            <p style={{ fontSize: 12, color: '#23211C', marginBottom: 12 }}>커피 쿠폰은 이벤트 종료 후 일괄 발송됩니다.</p>
            <Link href="/feedback" onClick={close} style={{ display: 'block', textAlign: 'center', padding: '14px 0', borderRadius: 12, fontSize: 15, fontWeight: 700, background: '#23211C', color: '#fff', textDecoration: 'none' }}>
              의견 남기러 가기 →
            </Link>
          </div>
        </div>
        <div style={{ display: 'flex', borderTop: '1px solid #E3DDD0', flexShrink: 0 }}>
          <button onClick={hideToday} style={{ flex: 1, padding: '13px 0', fontSize: 13, color: '#76705F', background: '#F4F1E9', border: 'none', borderRight: '1px solid #E3DDD0', cursor: 'pointer' }}>오늘 하루 보지 않기</button>
          <button onClick={close} style={{ flex: 1, padding: '13px 0', fontSize: 13, fontWeight: 700, color: '#23211C', background: '#fff', border: 'none', cursor: 'pointer' }}>닫기</button>
        </div>
      </div>
    </div>
  );
}
