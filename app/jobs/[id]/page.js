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
      <main style={{ minHeight: '100vh', background: '#F4F1E9', paddingTop: 68, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9A9382', fontSize: 14 }}>{loading ? '불러오는 중...' : '공고를 찾을 수 없습니다'}</p>
      </main>
    );
  }

  const descLines = (job.description || '').split('\n').filter(l => l.trim());

  return (
    <main style={{ minHeight: '100vh', background: '#F4F1E9' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        <Link href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#23211C', marginBottom: 24, textDecoration: 'none', background: '#fff', border: '1px solid #E3DDD0', borderRadius: 10, padding: '8px 16px' }}>
          ← 공고 목록
        </Link>

        {/* Header Card */}
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E3DDD0', padding: '28px 32px', marginBottom: 20, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
            <Image src={jobImg(job.id)} alt={job.title} fill sizes="72px" style={{ objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, color: '#9A9382', marginBottom: 6 }}>요가스튜디오</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#23211C', marginBottom: 12, lineHeight: 1.3 }}>{job.title}</h1>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {job.location && <Tag label={job.location} />}
              {job.yoga_style && <Tag label={job.yoga_style} />}
              {job.experience && <Tag label={job.experience} />}
            </div>
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            {job.salary && (
              <p style={{ fontSize: 18, fontWeight: 700, color: '#23211C', marginBottom: 8 }}>{job.salary}</p>
            )}
            <p style={{ fontSize: 12, color: '#9A9382' }}>
              {new Date(job.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* 2-col body */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* Left: content */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {job.description && (
              <section style={{ background: '#fff', borderRadius: 16, border: '1px solid #E3DDD0', padding: '24px 28px' }}>
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

            <section style={{ background: '#fff', borderRadius: 16, border: '1px solid #E3DDD0', padding: '24px 28px' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#23211C', marginBottom: 16 }}>근무 조건</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <InfoRow label="근무지역" value={job.location} />
                <InfoRow label="요가종류" value={job.yoga_style} />
                <InfoRow label="필요경력" value={job.experience} />
                <InfoRow label="급여" value={job.salary} />
              </div>
            </section>
          </div>

          {/* Right: sticky sidebar */}
          <div style={{ width: 264, flexShrink: 0, position: 'sticky', top: 88 }}>
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
              <button onClick={handleApply} disabled={hasApplied} style={{
                width: '100%', padding: '14px 0', borderRadius: 12, fontSize: 15, fontWeight: 700,
                background: hasApplied ? '#E3DDD0' : '#23211C',
                color: hasApplied ? '#9A9382' : '#fff',
                border: 'none', cursor: hasApplied ? 'not-allowed' : 'pointer', marginBottom: 10,
              }}>
                {hasApplied ? '✓ 지원 완료' : '지원하기'}
              </button>
              <button onClick={toggleBookmark} style={{
                width: '100%', padding: '11px 0', borderRadius: 12, fontSize: 14, fontWeight: 600,
                background: isBookmarked ? '#FDF3E3' : '#F4F1E9',
                color: isBookmarked ? '#C2922F' : '#76705F',
                border: `1px solid ${isBookmarked ? '#C2922F' : '#E3DDD0'}`, cursor: 'pointer',
              }}>
                {isBookmarked ? '♥ 저장됨' : '♡ 저장하기'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
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
