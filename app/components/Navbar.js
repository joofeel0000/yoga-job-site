'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';

function LogoMark({ size = 34, innerSize = 14, dark = false }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: dark ? '#3E3B33' : '#23211C',
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

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

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

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid #E3DDD0',
      height: 68,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <LogoMark />
          <span style={{ fontSize: 20, fontWeight: 800, color: '#23211C', letterSpacing: '-0.01em' }}>요가잡</span>
        </Link>

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navItems.map(({ href, label, exact, prefix }) => {
            const isActive = exact ? pathname === href : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#23211C' : '#6B6558',
                  background: isActive ? '#EAE7DE' : 'transparent',
                  borderRadius: 9,
                  padding: '9px 14px',
                  textDecoration: 'none',
                  transition: 'background .12s, color .12s',
                  display: 'block',
                }}
                onMouseOver={e => { if (!isActive) e.currentTarget.style.background = '#F2EEE4'; }}
                onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <>
              <NotificationBell />
              <Link
                href="/mypage"
                style={{
                  fontSize: 14, fontWeight: 600, color: '#6B6558',
                  textDecoration: 'none', padding: '9px 14px',
                  borderRadius: 9, transition: 'background .12s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#F2EEE4'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                마이페이지
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  fontSize: 14, fontWeight: 600, color: '#6B6558',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '9px 14px', borderRadius: 9, transition: 'background .12s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#F2EEE4'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  fontSize: 14, fontWeight: 600, color: '#6B6558',
                  textDecoration: 'none', padding: '9px 14px',
                  borderRadius: 9, transition: 'background .12s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#F2EEE4'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                로그인
              </Link>
              <Link
                href="/signup"
                style={{
                  fontSize: 14, fontWeight: 700, color: '#fff',
                  background: '#23211C', borderRadius: 10,
                  padding: '10px 18px', textDecoration: 'none',
                  transition: 'background .12s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#000'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#23211C'; }}
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
