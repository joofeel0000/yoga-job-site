'use client';

import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

const USER_TYPES = [
  { id: 'instructor', label: '요가강사', desc: '채용 공고에 지원하거나 이력서를 등록하세요', icon: '🧘‍♀️' },
  { id: 'studio', label: '스튜디오 · 센터', desc: '구인 공고를 등록하고 강사를 채용하세요', icon: '🏢' },
];

export default function Signup() {
  const router = useRouter();
  const [userType, setUserType] = useState('instructor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!agreeTerms) { alert('이용약관에 동의해주세요.'); return; }
    if (password !== confirmPassword) { alert('비밀번호가 일치하지 않습니다.'); return; }
    if (password.length < 6) { alert('비밀번호는 6자 이상이어야 합니다.'); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, user_type: userType } },
    });
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered'))
        alert('이미 가입된 이메일입니다.');
      else
        alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    } else {
      if (data.user) {
        await supabase.from('profiles').upsert(
          { id: data.user.id, email, name, role: 'user' },
          { onConflict: 'id' }
        );
      }
      alert('회원가입 성공! 이메일을 확인해주세요.');
      router.push('/login');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '13px 16px', border: '1px solid #E3DDD0', borderRadius: 10,
    fontSize: 14, color: '#23211C', background: '#F4F1E9', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <main style={{ minHeight: '100vh', background: '#F4F1E9', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 16px 40px' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <LogoMark size={44} />
          <span style={{ fontSize: 19, fontWeight: 800, color: '#23211C', marginTop: 10, letterSpacing: '-0.02em' }}>요가잡</span>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E3DDD0', boxShadow: '0 4px 24px rgba(30,28,24,0.06)' }} className="px-5 py-8 sm:px-8">
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#23211C', textAlign: 'center', marginBottom: 6 }}>회원가입</h1>
          <p style={{ fontSize: 14, color: '#9A9382', textAlign: 'center', marginBottom: 24 }}>요가잡에 오신 것을 환영합니다</p>

          {/* Type selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {USER_TYPES.map(t => {
              const active = userType === t.id;
              return (
                <button key={t.id} type="button" onClick={() => setUserType(t.id)} style={{
                  padding: '16px 12px', borderRadius: 12, textAlign: 'center',
                  border: `2px solid ${active ? '#23211C' : '#E3DDD0'}`,
                  background: active ? '#23211C' : '#fff',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: active ? '#fff' : '#23211C', marginBottom: 4 }}>{t.label}</p>
                  <p style={{ fontSize: 11, color: active ? '#CFC9BB' : '#9A9382', lineHeight: 1.4 }}>{t.desc}</p>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#76705F', display: 'block', marginBottom: 7 }}>이름</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="홍길동" required style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#76705F', display: 'block', marginBottom: 7 }}>이메일</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com" required style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#76705F', display: 'block', marginBottom: 7 }}>비밀번호</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="6자 이상" required style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#76705F', display: 'block', marginBottom: 7 }}>비밀번호 확인</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 재입력" required style={inputStyle} />
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: 13, color: '#76705F', marginTop: 4 }}>
              <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)}
                style={{ width: 15, height: 15, accentColor: '#23211C', marginTop: 1, flexShrink: 0 }} />
              <span>
                <Link href="/terms" style={{ color: '#23211C', fontWeight: 700, textDecoration: 'underline' }}>이용약관</Link> 및{' '}
                <Link href="/privacy" style={{ color: '#23211C', fontWeight: 700, textDecoration: 'underline' }}>개인정보처리방침</Link>에 동의합니다
              </span>
            </label>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px 0', borderRadius: 12, fontSize: 15, fontWeight: 700,
              background: loading ? '#E3DDD0' : '#23211C', color: loading ? '#9A9382' : '#fff',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 6,
            }}>
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#76705F' }}>
              이미 계정이 있으신가요?{' '}
              <Link href="/login" style={{ color: '#23211C', fontWeight: 700, textDecoration: 'none' }}>로그인</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
