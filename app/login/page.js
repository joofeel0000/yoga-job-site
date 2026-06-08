'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const inputClass = "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm";
const labelClass = "block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2";

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

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes('Invalid login credentials')) alert('이메일 또는 비밀번호가 맞지 않습니다.');
      else if (error.message.includes('Email not confirmed')) alert('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
      else if (error.message.includes('User not found')) alert('가입되지 않은 이메일입니다.');
      else alert('로그인에 실패했습니다. 다시 시도해주세요.');
    } else {
      alert('로그인 성공!');
      router.push(redirect ? `/${redirect}` : '/');
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-stone-50 via-amber-50/30 to-emerald-50/20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🌿</span>
          <p className="text-stone-400 text-sm mt-2">요가 구인구직 플랫폼</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-stone-800 mb-1 text-center">로그인</h1>
          <p className="text-stone-400 text-sm mb-8 text-center">반갑습니다, 다시 오셨군요</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className={labelClass}>이메일</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>비밀번호</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className={inputClass} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded-2xl font-semibold hover:bg-green-800 transition disabled:bg-stone-300 active:scale-95 mt-2">
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <p className="text-stone-500 text-sm">
              계정이 없으신가요?{' '}
              <Link href="/signup" className="text-green-700 hover:text-green-800 font-semibold">회원가입</Link>
            </p>
            <Link href="/reset-password" className="block text-stone-400 hover:text-stone-500 text-xs">
              비밀번호를 잊으셨나요?
            </Link>
            <Link href="/" className="block text-stone-400 hover:text-stone-500 text-xs">
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
      <main className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-4xl animate-pulse">🌿</div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
