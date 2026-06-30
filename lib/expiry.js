import { supabase } from '@/lib/supabase';

// 공고 마감
export async function closeJob(jobId) {
  const { error } = await supabase
    .from('job')
    .update({
      status: 'closed',
      closed_at: new Date().toISOString()
    })
    .eq('id', jobId);

  return { error };
}

// 공고 다시 열기
export async function reopenJob(jobId) {
  const { error } = await supabase
    .from('job')
    .update({
      status: 'active',
      closed_at: null,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
    .eq('id', jobId);

  return { error };
}

// 공고 만료일 연장
export async function extendJobExpiry(jobId, days = 30) {
  // 현재 만료일 조회
  const { data: jobData } = await supabase
    .from('job')
    .select('expires_at')
    .eq('id', jobId);

  if (!jobData || jobData.length === 0) {
    return { error: 'Job not found' };
  }

  const job = jobData[0];
  const currentExpiry = new Date(job.expires_at);
  const now = new Date();
  
  // 현재 만료일이 미래면 그 날짜 기준, 과거면 오늘 기준
  const baseDate = currentExpiry > now ? currentExpiry : now;
  const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from('job')
    .update({
      expires_at: newExpiry.toISOString()
    })
    .eq('id', jobId);

  return { error };
}

// 이력서 마감
export async function closeResume(resumeId) {
  const { error } = await supabase
    .from('candidate')
    .update({
      status: 'closed',
      closed_at: new Date().toISOString()
    })
    .eq('id', resumeId);

  return { error };
}

// 이력서 다시 열기
export async function reopenResume(resumeId) {
  const { error } = await supabase
    .from('candidate')
    .update({
      status: 'active',
      closed_at: null,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
    .eq('id', resumeId);

  return { error };
}

// 이력서 만료일 연장
export async function extendResumeExpiry(resumeId, days = 30) {
  // 현재 만료일 조회
  const { data: resumeData } = await supabase
    .from('candidate')
    .select('expires_at')
    .eq('id', resumeId);

  if (!resumeData || resumeData.length === 0) {
    return { error: 'Resume not found' };
  }

  const resume = resumeData[0];
  const currentExpiry = new Date(resume.expires_at);
  const now = new Date();
  
  // 현재 만료일이 미래면 그 날짜 기준, 과거면 오늘 기준
  const baseDate = currentExpiry > now ? currentExpiry : now;
  const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from('candidate')
    .update({
      expires_at: newExpiry.toISOString()
    })
    .eq('id', resumeId);

  return { error };
}

// 만료일까지 남은 일수 계산
export function getDaysUntilExpiry(expiresAt) {
  if (!expiresAt) return null;
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// 상태 배지 정보
export function getStatusBadge(status, expiresAt) {
  if (status === 'closed') {
    return {
      text: '마감됨',
      color: 'bg-red-100 text-red-700',
      icon: '🔴'
    };
  }

  const daysLeft = getDaysUntilExpiry(expiresAt);
  
  if (daysLeft === null || daysLeft < 0) {
    return {
      text: '만료됨',
      color: 'bg-gray-100 text-gray-700',
      icon: '⚫'
    };
  }

  if (daysLeft <= 3) {
    return {
      text: `마감 임박 (${daysLeft}일)`,
      color: 'bg-yellow-100 text-yellow-700',
      icon: '🟡'
    };
  }

  return {
    text: `활성 (${daysLeft}일 남음)`,
    color: 'bg-[#E4ECE3] text-[#3A5341]',
    icon: '🟢'
  };
}