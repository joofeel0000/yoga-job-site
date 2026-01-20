'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setValidSession(true);
    } else {
      alert('유효하지 않은 링크입니다');
      router.push('/login');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다');
      return;
    }

    if (password.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
        if (error.message.includes('should be different')) {
            alert('이전 비밀번호는 사용할 수 없습니다. 다른 비밀번호를 입력해주세요.');
        } else {
            alert('비밀번호 변경 실패: ' + error.message);
        }
    } else {
      alert('비밀번호가 변경되었습니다! 로그인 페이지로 이동합니다.');
      await supabase.auth.signOut();
      router.push('/login');
    }

    setLoading(false);
  };

  if (!validSession) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <p className="text-gray-500">확인 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            새 비밀번호 설정
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            새로운 비밀번호를 입력해주세요
          </p>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                새 비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 재입력"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-gray-400"
            >
              {loading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-gray-500 hover:underline text-sm">
              ← 로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}