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
    <main className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            비밀번호 찾기
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            가입한 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다
          </p>

          {!sent ? (
            <form onSubmit={handleReset} className="space-y-6">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-gray-400"
              >
                {loading ? '전송 중...' : '재설정 링크 보내기'}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <p className="text-gray-700 mb-4">
                이메일을 전송했습니다!
              </p>
              <p className="text-gray-600 text-sm">
                이메일 함을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-purple-600 hover:underline">
              ← 로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}