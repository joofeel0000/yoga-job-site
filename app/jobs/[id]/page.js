'use client';

import { supabase } from '@/lib/supabase';
import { createApplicationNotification } from '@/lib/notifications';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

const JOB_IMGS = [
  'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&auto=format&fit=crop&q=80',
];

function jobImg(id) {
  if (!id) return JOB_IMGS[0];
  const code = [...String(id)].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return JOB_IMGS[code % JOB_IMGS.length];
}

function Tag({ label }) {
  return (
    <span style={{ fontSize: 12, color: '#76705F', background: '#F4F1E9', padding: '3px 10px', borderRadius: 8, border: '1px solid #E3DDD0' }}>
      {label}
    </span>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 12, borderBottom: '1px solid #F4F1E9' }}>
      <span style={{ fontSize: 13, color: '#9A9382', width: 72, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#23211C', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function ActionCard({ job, user, hasApplied, isBookmarked, applicantCount, onApply, onBookmark }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E3DDD0', padding: '24px 20px' }}>
      {job.salary && (
        <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #E3DDD0' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9A9382', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>급여</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#23211C' }}>{job.salary}</p>
        </div>
      )}
      <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #E3DDD0' }}>
        <p style={{ fontSize: 12, color: '#9A9382', marginBottom: 4 }}>현재 지원자</p>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#23211C' }}>{applicantCount}명</p>
      </div>
      <button onClick={onApply} disabled={hasApplied} style={{
        width: '100%', padding: '14px 0', borderRadius: 12, fontSize: 15, fontWeight: 700,
        background: hasApplied ? '#E3DDD0' : '#23211C',
        color: hasApplied ? '#9A9382' : '#fff',
        border: 'none', cursor: hasApplied ? 'not-allowed' : 'pointer', marginBottom: 10,
      }}>
        {hasApplied ? '✓ 지원 완료' : '지원하기'}
      </button>
      <button onClick={onBookmark} style={{
        width: '100%', padding: '11px 0', borderRadius: 12, fontSize: 14, fontWeight: 600,
        background: isBookmarked ? '#FDF3E3' : '#F4F1E9',
        color: isBookmarked ? '#C2922F' : '#76705F',
        border: `1px solid ${isBookmarked ? '#C2922F' : '#E3DDD0'}`, cursor: 'pointer',
      }}>
        {isBookmarked ? '♥ 저장됨' : '♡ 저장하기'}
      </button>
    </div>
  );
}

export default function JobDetail() {
  const params = useParams();
  const id = params.id;
  const [job, setJob] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicantCount, setApplicantCount] = useState(0);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');

  useEffect(() => {
    checkUser();
    fetchJob();
  }, [id]);

  const checkUser = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u);
    if (u && id) {
      checkBookmark(u.id);
      checkApplication(u.id);
    }
    fetchApplicantCount();
  };

  const checkBookmark = async (userId) => {
    const { data } = await supabase.from('bookmarks').select('*').eq('user_id', userId).eq('job_id', id).maybeSingle();
    setIsBookmarked(!!data);
  };

  const fetchJob = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('job').select('*').eq('id', id).single();
    if (error) console.error('에러:', error);
    else setJob(data);
    setLoading(false);
  };

  const checkApplication = async (userId) => {
    const { data } = await supabase.from('applications').select('*').eq('user_id', userId).eq('job_id', id).maybeSingle();
    setHasApplied(!!data);
  };

  const fetchApplicantCount = async () => {
    const { count } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('job_id', id);
    setApplicantCount(count || 0);
  };

  const handleApply = () => {
    if (!user) { alert('로그인이 필요합니다'); return; }
    if (hasApplied) { alert('이미 지원하셨습니다'); return; }
    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    const { data: applicationData, error } = await supabase.from('applications')
      .insert([{ user_id: user.id, job_id: id, candidate_id: null, message: applyMessage }])
      .select().single();
    if (!error) {
      if (job.user_id && applicationData)
        await createApplicationNotification(job.user_id, job.title, applicationData.id);
      alert('지원이 완료되었습니다!');
      setHasApplied(true);
      setShowApplyModal(false);
      setApplyMessage('');
      fetchApplicantCount();
    } else {
      alert('지원 실패: ' + error.message);
    }
  };

  const toggleBookmark = async () => {
    if (!user) { alert('로그인이 필요합니다'); return; }
    if (isBookmarked) {
      const { error } = await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('job_id', id);
      if (!error) setIsBookmarked(false);
    } else {
      const { error } = await supabase.from('bookmarks').insert([{ user_id: user.id, job_id: id, candidate_id: null }]);
      if (!error) setIsBookmarked(true);
    }
  };

  if (loading || !job) {
    return (
      <main style={{ minHeight: '100vh', background: '#F4F1E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9A9382', fontSize: 14 }}>{loading ? '불러오는 중...' : '공고를 찾을 수 없습니다'}</p>
      </main>
    );
  }

  const descLines = (job.description || '').split('\n').filter(l => l.trim());

  const actionProps = { job, user, hasApplied, isBookmarked, applicantCount, onApply: handleApply, onBookmark: toggleBookmark };

  return (
    <main style={{ minHeight: '100vh', background: '#F4F1E9' }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">

        <Link href="/jobs" className="inline-flex items-center gap-[6px] text-[13px] font-semibold text-[#23211C] mb-5 no-underline bg-white border border-[#E3DDD0] rounded-[10px] px-4 py-2">
          ← 공고 목록
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-[18px] border border-[#E3DDD0] p-5 sm:p-7 mb-5 flex flex-col sm:flex-row gap-4 sm:gap-5 sm:items-start">
          <div className="w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-[14px] overflow-hidden shrink-0 relative">
            <Image src={jobImg(job.id)} alt={job.title} fill sizes="72px" style={{ objectFit: 'cover' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#9A9382] mb-1">요가스튜디오</p>
            <h1 className="text-[20px] sm:text-[22px] font-bold text-[#23211C] mb-3 leading-snug">{job.title}</h1>
            <div className="flex gap-[6px] flex-wrap">
              {job.location && <Tag label={job.location} />}
              {job.yoga_style && <Tag label={job.yoga_style} />}
              {job.experience && <Tag label={job.experience} />}
            </div>
          </div>
          <div className="sm:text-right shrink-0">
            {job.salary && (
              <p className="text-[17px] sm:text-[18px] font-bold text-[#23211C] mb-1">{job.salary}</p>
            )}
            <p className="text-xs text-[#9A9382]">
              {new Date(job.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Body: 1-col on mobile, 2-col on lg+ */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* Left: content */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {job.description && (
              <section style={{ background: '#fff', borderRadius: 16, border: '1px solid #E3DDD0', padding: '24px 20px' }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#23211C', marginBottom: 16 }}>상세 설명</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {descLines.length > 0 ? descLines.map((line, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 3, height: 16, borderRadius: 2, background: '#C2922F', flexShrink: 0, marginTop: 3 }} />
                      <p style={{ fontSize: 14, color: '#4A4740', lineHeight: 1.7 }}>{line}</p>
                    </div>
                  )) : (
                    <p style={{ fontSize: 14, color: '#76705F', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{job.description}</p>
                  )}
                </div>
              </section>
            )}

            <section style={{ background: '#fff', borderRadius: 16, border: '1px solid #E3DDD0', padding: '24px 20px' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#23211C', marginBottom: 16 }}>근무 조건</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <InfoRow label="근무지역" value={job.location} />
                <InfoRow label="요가종류" value={job.yoga_style} />
                <InfoRow label="필요경력" value={job.experience} />
                <InfoRow label="급여" value={job.salary} />
              </div>
            </section>

            {/* 모바일 전용 액션 카드 */}
            <div className="lg:hidden">
              <ActionCard {...actionProps} />
            </div>
          </div>

          {/* 데스크탑 전용 sticky 사이드바 */}
          <div className="hidden lg:block w-[264px] shrink-0 sticky top-[88px]">
            <ActionCard {...actionProps} />
          </div>
        </div>
      </div>

      {showApplyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#23211C', marginBottom: 6 }}>지원하기</h3>
            <p style={{ fontSize: 13, color: '#76705F', marginBottom: 20 }}>간단한 메시지를 남겨주세요</p>
            <textarea value={applyMessage} onChange={e => setApplyMessage(e.target.value)}
              placeholder="자기소개나 지원 동기를 작성해주세요" rows={4}
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #E3DDD0', borderRadius: 10, fontSize: 14, color: '#23211C', background: '#F4F1E9', resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowApplyModal(false); setApplyMessage(''); }}
                style={{ flex: 1, padding: '12px 0', borderRadius: 10, fontSize: 14, fontWeight: 600, background: '#F4F1E9', color: '#76705F', border: 'none', cursor: 'pointer' }}>
                취소
              </button>
              <button onClick={submitApplication}
                style={{ flex: 1, padding: '12px 0', borderRadius: 10, fontSize: 14, fontWeight: 700, background: '#23211C', color: '#fff', border: 'none', cursor: 'pointer' }}>
                제출
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
