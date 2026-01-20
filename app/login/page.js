'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const loginRequired = sessionStorage.getItem('loginRequired');
  if (loginRequired) {
    alert('로그인이 필요합니다');
    sessionStorage.removeItem('loginRequired');
  }
}, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
  if (error.message.includes('Invalid login credentials')) {
    alert('이메일 또는 비밀번호가 맞지 않습니다.');
  } else if (error.message.includes('Email not confirmed')) {
    alert('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
  } else if (error.message.includes('User not found')) {
    alert('가입되지 않은 이메일입니다.');
  } else {
    alert('로그인에 실패했습니다. 다시 시도해주세요.');
  }
} else {
      alert('로그인 성공!');
      if (redirect) {
        router.push(`/${redirect}`);
      } else {
        router.push('/');
      }
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            로그인
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            요가 구인구직 플랫폼에 오신 것을 환영합니다
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-gray-400"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              계정이 없으신가요?{' '}
              <Link href="/signup" className="text-purple-600 hover:underline font-semibold">
                회원가입
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/reset-password" className="text-gray-600 hover:underline text-sm">
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-gray-500 hover:underline text-sm">
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </main>
);
}

export default function Login() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center p-8">
        <p className="text-gray-500">로딩 중...</p>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}