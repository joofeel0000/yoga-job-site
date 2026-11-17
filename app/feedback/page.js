'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const MEMBER_TYPES = [
  { id: 'center', label: '센터(원장님)' },
  { id: 'instructor', label: '강사' },
];
const PHONE_RE = /^010-\d{4}-\d{4}$/;

const labelStyle = { fontSize: 12, fontWeight: 700, color: '#9A9382', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 };
const inputStyle = {
  width: '100%', padding: '12px 16px', border: '1px solid #E3DDD0', borderRadius: 10,
  fontSize: 15, color: '#23211C', background: '#F4F1E9', outline: 'none', boxSizing: 'border-box',
};

// 숫자만 추출해 010-0000-0000 형태로
function formatPhone(raw) {
  const d = (raw || '').replace(/\D/g, '').slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

// user_type(가입 시 저장) → 센터/강사
function memberTypeFromUser(user) {
  const t = user?.user_metadata?.user_type;
  if (t === 'studio') return 'center';
  if (t === 'instructor') return 'instructor';
  return '';
}

function fmtKst(ts) {
  return new Date(ts).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function dbErrorMessage(error) {
  const m = error?.message || '';
  if (m.includes('FEEDBACK_FULL')) return '아쉽게도 선착순 100명이 모두 참여해 마감되었습니다.';
  if (m.includes('FEEDBACK_CLOSED')) return '이벤트가 마감되어 더 이상 작성/수정할 수 없습니다.';
  if (error?.code === '23505') return '이미 참여하셨습니다. 이벤트는 1인 1회만 참여할 수 있습니다.';
  if (error?.code === '23514') return '입력값을 확인해 주세요. (휴대폰 번호는 010-0000-0000 형식)';
  return '처리에 실패했습니다. 잠시 후 다시 시도해 주세요.';
}

function Card({ children }) {
  return <div className="bg-white rounded-[18px] border border-[#E3DDD0] p-5 sm:p-8 mb-5">{children}</div>;
}

function StatusBox({ status }) {
  if (!status) return null;
  return (
    <div className="bg-white rounded-[18px] border border-[#E3DDD0] p-5 sm:p-6 mb-5">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 13, color: '#76705F', fontWeight: 600 }}>남은 쿠폰</span>
        <span data-testid="remaining" style={{ fontSize: 28, fontWeight: 800, color: '#23211C' }}>
          {status.remaining} <span style={{ fontSize: 16, fontWeight: 600, color: '#9A9382' }}>/ {status.cap}</span>
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: '#EAE7DE', margin: '12px 0' }}>
        <div style={{ height: 6, borderRadius: 3, background: '#23211C', width: `${Math.min(100, (status.taken / status.cap) * 100)}%` }} />
      </div>
      <p style={{ fontSize: 13, color: '#9A9382' }}>마감: 2026년 12월 15일(화) 23:59까지 · 선착순 마감 시 조기 종료</p>
    </div>
  );
}

function FeedbackContent() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);
  const [mine, setMine] = useState(null);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ member_type: '', pain_point: '', wish: '', phone: '', agree: false });

  const load = useCallback(async () => {
    const { data: s } = await supabase.rpc('feedback_status');
    setStatus(s);
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u);
    if (u) {
      const [{ data: p }, { data: m }] = await Promise.all([
        supabase.from('profiles').select('name, phone').eq('id', u.id).maybeSingle(),
        supabase.from('feedback_posts').select('*').eq('user_id', u.id).maybeSingle(),
      ]);
      setMine(m);
      setForm(f => ({ ...f, member_type: memberTypeFromUser(u), phone: formatPhone(p?.phone || '') }));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const autoType = user ? memberTypeFromUser(user) : '';
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const startEdit = () => {
    setForm({ member_type: mine.member_type, pain_point: mine.pain_point, wish: mine.wish || '', phone: mine.phone, agree: true });
    setErrorMsg('');
    setEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.member_type) return setErrorMsg('회원 유형을 선택해 주세요.');
    if (!form.pain_point.trim()) return setErrorMsg('불편했던 점을 입력해 주세요.');
    if (!PHONE_RE.test(form.phone)) return setErrorMsg('휴대폰 번호는 010-0000-0000 형식으로 입력해 주세요.');
    if (!form.agree) return setErrorMsg('개인정보 수집·이용에 동의하셔야 이벤트에 참여할 수 있습니다.');

    setSubmitting(true);
    const fields = {
      member_type: form.member_type,
      pain_point: form.pain_point.trim(),
      wish: form.wish.trim() || null,
      phone: form.phone,
    };
    const { error } = editing
      ? await supabase.from('feedback_posts').update(fields).eq('user_id', user.id)
      : await supabase.from('feedback_posts').insert([{ ...fields, user_id: user.id, privacy_agreed: true }]);
    setSubmitting(false);
    if (error) {
      setErrorMsg(dbErrorMessage(error));
      await load(); // 상태(남은 수/마감) 갱신
      return;
    }
    setEditing(false);
    await load();
  };

  const wrapStyle = { minHeight: '100vh', background: '#F4F1E9' };

  if (loading) {
    return (
      <main style={{ ...wrapStyle, paddingTop: 68, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9A9382', fontSize: 14 }}>로딩 중...</p>
      </main>
    );
  }

  const open = status?.open;

  return (
    <main style={wrapStyle}>
      <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#23211C', marginBottom: 4 }}>의견 남기고 커피 쿠폰 받기</h1>
          <p style={{ fontSize: 14, color: '#9A9382' }}>요가잡 이용 중 불편했던 점을 알려 주세요. 선착순 100분께 커피 쿠폰을 드립니다. 작성한 글은 본인과 운영자만 볼 수 있습니다.</p>
        </div>

        <StatusBox status={status} />

        {/* 비로그인 */}
        {!user && (
          open ? (
            <Card>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#23211C', marginBottom: 6 }}>로그인 후 참여할 수 있어요</p>
              <p style={{ fontSize: 13, color: '#76705F', marginBottom: 18 }}>로그인 또는 회원가입을 마치면 이 페이지로 돌아옵니다.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/login?redirect=feedback" style={{ padding: '12px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: '#23211C', color: '#fff', textDecoration: 'none' }}>로그인</Link>
                <Link href="/signup?redirect=feedback" style={{ padding: '12px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: '#F4F1E9', color: '#23211C', border: '1px solid #E3DDD0', textDecoration: 'none' }}>회원가입</Link>
              </div>
            </Card>
          ) : <ClosedNotice status={status} />
        )}

        {/* 로그인 + 참여 완료 */}
        {user && mine && !editing && (
          <Card>
            <p data-testid="done" style={{ fontSize: 17, fontWeight: 800, color: '#23211C', marginBottom: 4 }}>참여 완료 ✓</p>
            <p style={{ fontSize: 13, color: '#76705F', marginBottom: 20 }}>선착순 {mine.seq}번째로 참여하셨습니다. 쿠폰은 입력하신 번호로 발송됩니다.{mine.coupon_sent_at && ` (발송 완료: ${fmtKst(mine.coupon_sent_at)})`}</p>
            <h2 style={labelStyle}>내 글</h2>
            <div style={{ border: '1px solid #E3DDD0', borderRadius: 12, padding: 16, background: '#FAFAF8', fontSize: 14, color: '#23211C', lineHeight: 1.7 }}>
              <p style={{ fontSize: 12, color: '#9A9382', marginBottom: 10 }}>
                {MEMBER_TYPES.find(t => t.id === mine.member_type)?.label} · {fmtKst(mine.created_at)} · {mine.phone}
              </p>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>불편했던 점</p>
              <p style={{ whiteSpace: 'pre-wrap', marginBottom: 14 }}>{mine.pain_point}</p>
              {mine.wish && (<><p style={{ fontWeight: 700, marginBottom: 4 }}>바라는 점</p><p style={{ whiteSpace: 'pre-wrap' }}>{mine.wish}</p></>)}
            </div>
            {mine.admin_reply && (
              <div style={{ marginTop: 14, border: '1px solid #E3DDD0', borderRadius: 12, padding: 16, background: '#EEF2FF' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#4B5CB8', marginBottom: 6 }}>운영자 답변{mine.admin_replied_at && ` · ${fmtKst(mine.admin_replied_at)}`}</p>
                <p style={{ fontSize: 14, color: '#23211C', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{mine.admin_reply}</p>
              </div>
            )}
            {open ? (
              <button onClick={startEdit} style={{ marginTop: 18, padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: '#F4F1E9', color: '#23211C', border: '1px solid #E3DDD0', cursor: 'pointer' }}>
                내 글 수정 (마감 전까지, 삭제는 불가)
              </button>
            ) : (
              <p style={{ marginTop: 14, fontSize: 12, color: '#9A9382' }}>이벤트가 마감되어 수정할 수 없습니다.</p>
            )}
          </Card>
        )}

        {/* 로그인 + 미참여 + 마감 */}
        {user && !mine && !open && <ClosedNotice status={status} />}

        {/* 작성/수정 폼 */}
        {user && ((!mine && open) || editing) && (
          <form onSubmit={handleSubmit} className="bg-white rounded-[18px] border border-[#E3DDD0] p-5 sm:p-8">
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>회원 유형</label>
              {autoType && !editing ? (
                <p style={{ fontSize: 15, color: '#23211C', fontWeight: 600 }}>{MEMBER_TYPES.find(t => t.id === autoType).label} <span style={{ fontSize: 12, color: '#9A9382', fontWeight: 400 }}>(가입 정보에서 자동 입력)</span></p>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {MEMBER_TYPES.map(t => {
                    const active = form.member_type === t.id;
                    return (
                      <button key={t.id} type="button" onClick={() => set('member_type', t.id)} style={{
                        padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: active ? 700 : 400,
                        background: active ? '#23211C' : '#F4F1E9', color: active ? '#fff' : '#76705F',
                        border: `1px solid ${active ? '#23211C' : '#E3DDD0'}`, cursor: 'pointer',
                      }}>{t.label}</button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>불편했던 점 <span style={{ color: '#DC2626' }}>*</span></label>
              <textarea value={form.pain_point} onChange={e => set('pain_point', e.target.value)} rows={5} maxLength={3000} required
                placeholder="요가잡을 이용하면서 불편했던 점을 알려 주세요"
                style={{ ...inputStyle, fontSize: 14, resize: 'vertical', lineHeight: 1.7 }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>바라는 점 (선택)</label>
              <textarea value={form.wish} onChange={e => set('wish', e.target.value)} rows={4} maxLength={3000}
                placeholder="이런 기능이 있으면 좋겠어요"
                style={{ ...inputStyle, fontSize: 14, resize: 'vertical', lineHeight: 1.7 }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>쿠폰 받을 휴대폰 번호 <span style={{ color: '#DC2626' }}>*</span></label>
              <input type="tel" inputMode="numeric" value={form.phone} onChange={e => set('phone', formatPhone(e.target.value))}
                placeholder="010-0000-0000" required style={inputStyle} />
            </div>

            {!editing && (
              <div style={{ marginBottom: 24, border: '1px solid #E3DDD0', borderRadius: 12, padding: 14, background: '#FAFAF8' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#23211C', marginBottom: 8 }}>개인정보 수집·이용 동의 (필수)</p>
                <ul style={{ fontSize: 12, color: '#76705F', lineHeight: 1.8, paddingLeft: 16, listStyle: 'disc', marginBottom: 10 }}>
                  <li>수집 항목: 휴대폰 번호</li>
                  <li>수집·이용 목적: 이벤트 커피 쿠폰 발송</li>
                  <li>보유 기간: 2027년 1월 31일까지 보관 후 파기</li>
                  <li>동의하지 않으면 이벤트 참여가 불가합니다.</li>
                </ul>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#23211C', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.agree} onChange={e => set('agree', e.target.checked)} style={{ width: 16, height: 16 }} />
                  위 내용에 동의합니다. <Link href="/privacy" target="_blank" style={{ color: '#76705F', textDecoration: 'underline', fontSize: 12 }}>개인정보처리방침</Link>
                </label>
              </div>
            )}

            {errorMsg && (
              <p role="alert" style={{ marginBottom: 14, fontSize: 13, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px' }}>{errorMsg}</p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              {editing && (
                <button type="button" onClick={() => { setEditing(false); setErrorMsg(''); }} style={{ padding: '15px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: '#F4F1E9', color: '#23211C', border: '1px solid #E3DDD0', cursor: 'pointer' }}>취소</button>
              )}
              <button type="submit" disabled={submitting} style={{
                flex: 1, padding: '15px 0', borderRadius: 12, fontSize: 15, fontWeight: 700,
                background: submitting ? '#E3DDD0' : '#23211C', color: submitting ? '#9A9382' : '#fff',
                border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
              }}>
                {submitting ? '처리 중...' : editing ? '수정 저장' : '의견 제출하고 쿠폰 받기'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

function ClosedNotice({ status }) {
  const full = status && status.remaining <= 0;
  return (
    <Card>
      <p data-testid="closed" style={{ fontSize: 17, fontWeight: 800, color: '#23211C', marginBottom: 6 }}>이벤트가 마감되었습니다</p>
      <p style={{ fontSize: 13, color: '#76705F', lineHeight: 1.7 }}>
        {full ? '선착순 100명이 모두 참여해 마감되었습니다.' : '이벤트 기간(2026년 12월 15일 23:59까지)이 종료되었습니다.'} 참여해 주신 모든 분께 감사드립니다.
      </p>
    </Card>
  );
}

export default function FeedbackPage() {
  return <FeedbackContent />;
}
