'use client';

import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import Link from 'next/link';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      alert('오류: ' + error.message);
    } else {
      setSent(true);
      alert('비밀번호 재설정 이메일을 전송했습니다. 이메일을 확인해주세요.');
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-[#F4F1E9]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-[#E3DDD0] shadow-sm p-8">
          <h1 className="text-2xl font-extrabold text-[#26241D] mb-2 text-center tracking-[-0.02em]">
            비밀번호 찾기
          </h1>
          <p className="text-[#76705F] text-sm mb-8 text-center">
            가입한 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다
          </p>

          {!sent ? (
            <form onSubmit={handleReset} className="space-y-6">
              <div>
                <label className="block text-[13px] font-bold text-[#3A3830] mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 bg-stone-50 border border-[#E3DDD0] rounded-xl text-[#29271F] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#23211C] focus:border-transparent transition text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#23211C] text-white py-3.5 rounded-xl font-bold text-base hover:bg-black transition disabled:opacity-50"
              >
                {loading ? '전송 중...' : '재설정 링크 보내기'}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-[#EAE7DE] text-[#23211C] text-2xl flex items-center justify-center mx-auto mb-4">✓</div>
              <p className="text-[#3A3830] font-semibold mb-2">
                이메일을 전송했습니다!
              </p>
              <p className="text-[#76705F] text-sm">
                이메일 함을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-[#76705F] hover:text-[#23211C] text-sm transition-colors">
              ← 로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}