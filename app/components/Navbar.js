'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef } from 'react';
import NotificationBell from './NotificationBell';

function LogoMark({ size = 34, innerSize = 14 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: '#23211C',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <div style={{
        width: innerSize, height: innerSize,
        background: '#CFC9BB',
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(45deg)',
      }} />
    </div>
  );
}

function HamburgerIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      {open ? (
        <>
          <line x1="4" y1="4" x2="18" y2="18" stroke="#23211C" strokeWidth="2" strokeLinecap="round"/>
          <line x1="18" y1="4" x2="4" y2="18" stroke="#23211C" strokeWidth="2" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="19" y2="6" stroke="#23211C" strokeWidth="2" strokeLinecap="round"/>
          <line x1="3" y1="11" x2="19" y2="11" stroke="#23211C" strokeWidth="2" strokeLinecap="round"/>
          <line x1="3" y1="16" x2="19" y2="16" stroke="#23211C" strokeWidth="2" strokeLinecap="round"/>
        </>
      )}
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(60);
  const navRef = useRef(null);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 메뉴 열릴 때 스크롤 잠금 + 드로어 top 위치 계산
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    if (menuOpen && navRef.current) {
      setMenuTop(navRef.current.getBoundingClientRect().bottom);
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // 라우트 변경 시 메뉴 닫기
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  const navItems = [
    { href: '/', label: '홈', exact: true },
    { href: '/jobs', label: '구인구직', prefix: true },
    { href: '/resumes', label: '강사찾기', prefix: true },
    { href: '/property', label: '매물정보', prefix: true },
    { href: '/community', label: '커뮤니티', prefix: true },
    { href: '/advertise', label: '광고 문의', prefix: true },
  ];

  const isActive = ({ href, exact, prefix }) =>
    exact ? pathname === href : prefix ? pathname?.startsWith(href) : false;

  return (
    <>
      <nav ref={navRef} style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E3DDD0',
        height: 60,
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 16px', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>

          {/* 로고 */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <LogoMark size={30} innerSize={12} />
            <span style={{ fontSize: 19, fontWeight: 800, color: '#23211C', letterSpacing: '-0.01em' }}>요가잡</span>
          </Link>

          {/* 데스크탑 네비게이션 */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 2 }}>
            {navItems.map(item => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    fontSize: 14, fontWeight: active ? 700 : 600,
                    color: active ? '#23211C' : '#6B6558',
                    background: active ? '#EAE7DE' : 'transparent',
                    borderRadius: 9, padding: '9px 14px',
                    textDecoration: 'none', transition: 'background .12s, color .12s',
                  }}
                  onMouseOver={e => { if (!active) e.currentTarget.style.background = '#F2EEE4'; }}
                  onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* 데스크탑 인증 버튼 */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 8 }}>
            {user ? (
              <>
                <NotificationBell />
                <Link href="/mypage" style={{ fontSize: 14, fontWeight: 600, color: '#6B6558', textDecoration: 'none', padding: '9px 14px', borderRadius: 9, transition: 'background .12s' }}
                  onMouseOver={e => { e.currentTarget.style.background = '#F2EEE4'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                >마이페이지</Link>
                <button onClick={handleLogout} style={{ fontSize: 14, fontWeight: 600, color: '#6B6558', background: 'none', border: 'none', cursor: 'pointer', padding: '9px 14px', borderRadius: 9, transition: 'background .12s' }}
                  onMouseOver={e => { e.currentTarget.style.background = '#F2EEE4'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                >로그아웃</button>
              </>
            ) : (
              <>
                <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: '#6B6558', textDecoration: 'none', padding: '9px 14px', borderRadius: 9, transition: 'background .12s' }}
                  onMouseOver={e => { e.currentTarget.style.background = '#F2EEE4'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                >로그인</Link>
                <Link href="/signup" style={{ fontSize: 14, fontWeight: 700, color: '#fff', background: '#23211C', borderRadius: 10, padding: '10px 18px', textDecoration: 'none', transition: 'background .12s' }}
                  onMouseOver={e => { e.currentTarget.style.background = '#000'; }}
                  onMouseOut={e => { e.currentTarget.style.background = '#23211C'; }}
                >회원가입</Link>
              </>
            )}
          </div>

          {/* 모바일: 알림 + 햄버거 */}
          <div className="flex md:hidden" style={{ alignItems: 'center', gap: 4 }}>
            {user && <NotificationBell />}
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={menuOpen}
              style={{
                width: 40, height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: menuOpen ? '#EAE7DE' : 'none',
                border: 'none', cursor: 'pointer', borderRadius: 8,
                transition: 'background .12s',
              }}
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </nav>

      {/* 모바일 메뉴 드로어 */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed', top: menuTop, left: 0, right: 0, bottom: 0,
            zIndex: 40,
            background: 'rgba(35,33,28,0.35)',
          }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderBottom: '1px solid #E3DDD0',
              boxShadow: '0 12px 40px rgba(30,28,24,0.14)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* 네비 링크 */}
            <div style={{ paddingTop: 4, paddingBottom: 4 }}>
              {navItems.map(item => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex', alignItems: 'center',
                      padding: '14px 20px',
                      fontSize: 16, fontWeight: active ? 700 : 500,
                      color: active ? '#23211C' : '#5C5751',
                      background: active ? '#F4F1E9' : 'transparent',
                      borderLeft: `3px solid ${active ? '#23211C' : 'transparent'}`,
                      textDecoration: 'none',
                      transition: 'background .1s',
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* 인증 버튼 */}
            <div style={{ padding: '12px 16px 20px', borderTop: '1px solid #F4F1E9' }}>
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link href="/mypage" style={{
                    display: 'block', textAlign: 'center', padding: '14px',
                    borderRadius: 11, border: '1px solid #E3DDD0',
                    fontSize: 15, fontWeight: 600, color: '#23211C', textDecoration: 'none',
                  }}>마이페이지</Link>
                  <button onClick={handleLogout} style={{
                    width: '100%', padding: '14px', borderRadius: 11,
                    border: '1px solid #E3DDD0', background: 'none',
                    fontSize: 15, fontWeight: 600, color: '#76705F', cursor: 'pointer',
                  }}>로그아웃</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href="/login" style={{
                    flex: 1, display: 'block', textAlign: 'center', padding: '14px',
                    borderRadius: 11, border: '1px solid #E3DDD0',
                    fontSize: 15, fontWeight: 600, color: '#23211C', textDecoration: 'none',
                  }}>로그인</Link>
                  <Link href="/signup" style={{
                    flex: 1, display: 'block', textAlign: 'center', padding: '14px',
                    borderRadius: 11, background: '#23211C',
                    fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: 'none',
                  }}>회원가입</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
