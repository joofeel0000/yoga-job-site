'use client';

import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const inputClass = "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm";
const labelClass = "block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) { alert('비밀번호가 일치하지 않습니다.'); return; }
    if (password.length < 6) { alert('비밀번호는 6자 이상이어야 합니다.'); return; }

    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered'))
        alert('이미 가입된 이메일입니다. 다른 이메일을 사용해주세요.');
      else if (error.message.includes('Password should be'))
        alert('비밀번호는 6자 이상이어야 합니다.');
      else
        alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    } else {
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      router.push('/login');
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
          <h1 className="text-2xl font-bold text-stone-800 mb-1 text-center">회원가입</h1>
          <p className="text-stone-400 text-sm mb-8 text-center">요가잡에 오신 것을 환영합니다</p>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className={labelClass}>이메일</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>비밀번호</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>비밀번호 확인</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 재입력" className={inputClass} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded-2xl font-semibold hover:bg-green-800 transition disabled:bg-stone-300 active:scale-95 mt-2">
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <p className="text-stone-500 text-sm">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-green-700 hover:text-green-800 font-semibold">로그인</Link>
            </p>
            <Link href="/" className="block text-stone-400 hover:text-stone-500 text-xs">
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
