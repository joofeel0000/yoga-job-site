'use client';

import { useState, useEffect } from 'react';

export default function BetaBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('betaBannerDismissed')) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('betaBannerDismissed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      background: '#23211C',
      color: '#CFC9BB',
      fontSize: 12,
      padding: '7px 48px 7px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      lineHeight: 1.4,
    }}>
      <span>🚧 현재 베타 운영 중입니다. 일부 데이터는 실제 데이터가 아닌 샘플입니다.</span>
      <button
        onClick={dismiss}
        aria-label="닫기"
        style={{
          position: 'absolute',
          right: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: '#76705F',
          cursor: 'pointer',
          fontSize: 14,
          lineHeight: 1,
          padding: '4px',
        }}
      >
        ✕
      </button>
    </div>
  );
}
