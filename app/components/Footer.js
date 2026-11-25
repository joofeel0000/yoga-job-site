'use client';

import Link from 'next/link';

function FooterCol({ title, items }) {
  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#C9C3B4', margin: '0 0 14px' }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {items.map((it) => (
          <Link
            key={it.label}
            href={it.href}
            style={{ fontSize: 13, color: '#7E786B', textDecoration: 'none' }}
          >
            {it.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: '#2A2A23', marginTop: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo/yogajob-a-white.svg" alt="YOGAJOB 요가잡" style={{ height: 22, width: 'auto', display: 'block' }} />
            </div>
            <p style={{ fontSize: 13, color: '#7E786B', lineHeight: 1.7, margin: 0 }}>
              요가 강사와 스튜디오를 연결하는<br />채용 플랫폼
            </p>
          </div>
          <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
            <FooterCol title="서비스" items={[
              { label: '구인구직', href: '/jobs' },
              { label: '강사찾기', href: '/resumes' },
              { label: '매물정보', href: '/property' },
              { label: '커뮤니티', href: '/community' },
            ]} />
            <FooterCol title="고객지원" items={[
              { label: '공지사항', href: '/community' },
              { label: '이용약관', href: '/terms' },
              { label: '개인정보처리방침', href: '/privacy' },
              { label: '광고문의', href: '/advertise' },
            ]} />
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #3E3B33' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px' }}>
          <p style={{ fontSize: 12, color: '#7E786B', margin: '0 0 6px', lineHeight: 1.7 }}>
            상호: 스리퍼 <span style={{ margin: '0 6px', color: '#4A463D' }}>|</span> 대표: 주필규 <span style={{ margin: '0 6px', color: '#4A463D' }}>|</span> 문의: <a href="tel:010-2812-1138" style={{ color: '#7E786B', textDecoration: 'none' }}>010-2812-1138</a>
          </p>
          <p style={{ fontSize: 12, color: '#7E786B', margin: 0 }}>© 2026 요가잡. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
