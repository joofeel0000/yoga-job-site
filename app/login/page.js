'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LogoMark({ size = 32 }) {
  const leafSize = Math.round(size * 0.5);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: '#23211C' }} />
      <div style={{
        position: 'absolute', bottom: Math.round(size * 0.1), right: Math.round(size * 0.1),
        width: leafSize, height: leafSize, background: '#CFC9BB',
        borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)',
      }} />
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
      else if (error.message.includes('Email not confirmed')) alert('이메일 인증이 필요합니다.');
      else alert('로그인에 실패했습니다. 다시 시도해주세요.');
    } else {
      router.push(redirect ? `/${redirect}` : '/');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '13px 16px', border: '1px solid #E3DDD0', borderRadius: 10,
    fontSize: 14, color: '#23211C', background: '#F4F1E9', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <main style={{ minHeight: '100vh', background: '#F4F1E9', paddingTop: 68, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '68px 16px 40px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <LogoMark size={48} />
          <span style={{ fontSize: 20, fontWeight: 800, color: '#23211C', marginTop: 10, letterSpacing: '-0.02em' }}>요가잡</span>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E3DDD0', padding: '36px 32px', boxShadow: '0 4px 24px rgba(30,28,24,0.06)' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#23211C', textAlign: 'center', marginBottom: 6 }}>
            다시 오신 걸 환영해요
          </h1>
          <p style={{ fontSize: 14, color: '#9A9382', textAlign: 'center', marginBottom: 28 }}>요가잡 계정으로 로그인하세요</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#76705F', display: 'block', marginBottom: 7 }}>이메일</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com" required style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#76705F', display: 'block', marginBottom: 7 }}>비밀번호</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required style={inputStyle} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: '#76705F' }}>
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                  style={{ width: 15, height: 15, accentColor: '#23211C' }} />
                로그인 상태 유지
              </label>
              <Link href="/reset-password" style={{ fontSize: 13, color: '#9A9382', textDecoration: 'none' }}>
                비밀번호 찾기
              </Link>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px 0', borderRadius: 12, fontSize: 15, fontWeight: 700,
              background: loading ? '#E3DDD0' : '#23211C', color: loading ? '#9A9382' : '#fff',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
            }}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 14, color: '#76705F' }}>
              아직 계정이 없으신가요?{' '}
              <Link href="/signup" style={{ color: '#23211C', fontWeight: 700, textDecoration: 'none' }}>회원가입</Link>
            </p>
            <Link href="/" style={{ fontSize: 13, color: '#9A9382', textDecoration: 'none' }}>← 홈으로 돌아가기</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', background: '#F4F1E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9A9382' }}>로딩 중...</p>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
