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
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-purple-600">🧘 요가잡</span>
          </Link>

          {/* 메뉴 */}
          <div className="flex items-center gap-6">
            <Link
              href="/jobs"
              className={`text-sm font-medium transition ${
                pathname === '/jobs'
                  ? 'text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              구인공고
            </Link>
            <Link
              href="/resumes"
              className={`text-sm font-medium transition ${
                pathname === '/resumes'
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              강사찾기
            </Link>

            {user ? (
              <>
                {/* 알림 벨 */}
                <NotificationBell />

                <Link
                  href="/mypage"
                  className={`text-sm font-medium transition ${
                    pathname === '/mypage'
                      ? 'text-purple-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  마이페이지
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}