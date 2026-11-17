'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';

const TYPE_LABEL = { center: '센터(원장님)', instructor: '강사' };
const kst = (ts) => ts ? new Date(ts).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour12: false }) : '';

function csvCell(v) {
  const s = v == null ? '' : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export default function FeedbackAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyDraft, setReplyDraft] = useState({});
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    // RLS: 관리자(profiles.role='admin')만 전체 조회됨
    const { data, error: err } = await supabase.from('feedback_posts').select('*').order('seq', { ascending: true });
    if (err) setError(err.message); else { setError(''); setRows(data || []); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const patch = async (id, fields) => {
    setBusyId(id);
    const { error: err } = await supabase.from('feedback_posts').update(fields).eq('id', id);
    setBusyId(null);
    if (err) { alert('저장 실패: ' + err.message); return; }
    load();
  };

  const saveReply = (r) => {
    const text = (replyDraft[r.id] ?? r.admin_reply ?? '').trim();
    patch(r.id, { admin_reply: text || null, admin_replied_at: text ? new Date().toISOString() : null });
  };

  const toggleCoupon = (r) => patch(r.id, { coupon_sent_at: r.coupon_sent_at ? null : new Date().toISOString() });

  const downloadCsv = () => {
    const head = ['선착순번호', '작성일시(KST)', '회원유형', '이메일', '닉네임', '휴대폰', '불편했던점', '바라는점', '답변', '쿠폰발송일(KST)'];
    const lines = [head.map(csvCell).join(',')];
    rows.forEach(r => lines.push([
      r.seq, kst(r.created_at), TYPE_LABEL[r.member_type], r.author_email, r.author_name,
      r.phone, r.pain_point, r.wish, r.admin_reply, kst(r.coupon_sent_at),
    ].map(csvCell).join(',')));
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `feedback-coupon-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const th = 'px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wide whitespace-nowrap';
  const td = 'px-4 py-3 text-sm text-stone-600 align-top';
  const sent = rows.filter(r => r.coupon_sent_at).length;

  if (loading) return <div className="state-center"><p className="text-stone-400 text-sm">로딩 중...</p></div>;
  if (error) return <div className="card-empty"><p className="text-red-500 text-sm">불러오기 실패: {error}</p></div>;

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-stone-100">
        <p className="text-sm text-stone-600">참여 <b>{rows.length}</b> / 100 · 쿠폰 발송 <b>{sent}</b> · 미발송 <b>{rows.length - sent}</b></p>
        <button onClick={downloadCsv} disabled={rows.length === 0} className="btn-pill-sm">CSV 다운로드</button>
      </div>
      {rows.length === 0 ? (
        <div className="card-empty"><p className="text-stone-400 text-sm">아직 참여자가 없습니다</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className={th}>번호</th><th className={th}>작성일시</th><th className={th}>유형</th>
                <th className={th}>회원</th><th className={th}>휴대폰</th><th className={th}>내용</th>
                <th className={th}>답변</th><th className={th}>쿠폰 발송</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-stone-50 transition">
                  <td className={td}>{r.seq}</td>
                  <td className={`${td} whitespace-nowrap`}>{kst(r.created_at)}</td>
                  <td className={`${td} whitespace-nowrap`}>{TYPE_LABEL[r.member_type]}</td>
                  <td className={td}>{r.author_email}<br /><span className="text-stone-400">{r.author_name}</span></td>
                  <td className={`${td} whitespace-nowrap`}>{r.phone}</td>
                  <td className={`${td} min-w-[260px]`}>
                    <p className="font-semibold text-stone-700">불편했던 점</p>
                    <p className="whitespace-pre-wrap mb-2">{r.pain_point}</p>
                    {r.wish && (<><p className="font-semibold text-stone-700">바라는 점</p><p className="whitespace-pre-wrap">{r.wish}</p></>)}
                  </td>
                  <td className={`${td} min-w-[220px]`}>
                    <textarea rows={3} value={replyDraft[r.id] ?? r.admin_reply ?? ''}
                      onChange={e => setReplyDraft(d => ({ ...d, [r.id]: e.target.value }))}
                      className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-sm" placeholder="답변 작성" />
                    <button onClick={() => saveReply(r)} disabled={busyId === r.id} className="btn-pill-sm mt-1">답변 저장</button>
                  </td>
                  <td className={`${td} whitespace-nowrap`}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!r.coupon_sent_at} disabled={busyId === r.id} onChange={() => toggleCoupon(r)} />
                      {r.coupon_sent_at ? kst(r.coupon_sent_at) : '미발송'}
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
