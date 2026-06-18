'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';

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

  const navLink = (href, label, matchPrefix = false) => {
    const isActive = matchPrefix ? pathname?.startsWith(href) : pathname === href;
    return (
      <Link
        href={href}
        className={`text-sm font-medium transition-colors ${
          isActive ? 'text-green-700' : 'text-stone-500 hover:text-green-700'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🌿</span>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold text-stone-800 tracking-tight">요가잡</span>
              <span className="text-[10px] text-stone-400 tracking-[0.15em] font-medium">YOGAJOB</span>
            </div>
          </Link>

          {/* 메뉴 */}
          <div className="flex items-center gap-6">
            {navLink('/jobs', '구인공고')}
            {navLink('/resumes', '강사찾기')}
            {navLink('/property', '매물정보')}
            {navLink('/community', '커뮤니티')}

            {user ? (
              <>
                <NotificationBell />
                {navLink('/chat', '💬 채팅', true)}
                {navLink('/mypage', '마이페이지')}
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-stone-500 hover:text-green-700 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-stone-500 hover:text-green-700 transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-full hover:bg-green-800 transition"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 하단 포인트 라인 */}
      <div className="h-px bg-gradient-to-r from-transparent via-green-300 to-transparent opacity-50" />
    </nav>
  );
}
