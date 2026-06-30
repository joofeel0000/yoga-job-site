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
              <span style={{ width: 32, height: 32, borderRadius: 10, background: '#3E3B33', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <circle cx="20" cy="11.5" r="4.3" fill="#CFC9BB" />
                  <path d="M20 17c-4.2 0-7.6 2.6-9 5.8-1.6 1.9-4 3.4-4 6 0 1.5 1.4 2.1 2.9 1.6l5-1.7c1.6.7 3.4 1.1 5.1 1.1s3.5-.4 5.1-1.1l5 1.7c1.5.5 2.9-.1 2.9-1.6 0-2.6-2.4-4.1-4-6-1.4-3.2-4.8-5.8-9-5.8Z" fill="#CFC9BB" />
                </svg>
              </span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#F4F1E9', letterSpacing: '-0.02em' }}>요가잡</span>
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
              { label: '이용약관', href: '/' },
              { label: '개인정보처리방침', href: '/' },
              { label: '광고문의', href: '/' },
            ]} />
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #3E3B33' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px' }}>
          <p style={{ fontSize: 12, color: '#7E786B', margin: 0 }}>© 2026 요가잡. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
