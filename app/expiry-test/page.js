'use client';

import { useState, useEffect } from 'react';
import { closeJob, getStatusBadge } from '@/lib/expiry';
import { supabase } from '@/lib/supabase';

export default function ExpiryTestPage() {
  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 유저:', user);
    setUser(user);
    
    if (user) {
      fetchJobs(user.id);
    }
  };

  const fetchJobs = async (userId) => {
    console.log('🔍 공고 조회 시작. userId:', userId);
    
    const { data, error } = await supabase
      .from('job')
      .select('*')
      .eq('user_id', userId);
    
    console.log('📊 조회 결과:', data);
    console.log('❌ 에러:', error);
    
    setJobs(data || []);
  };

  const testCloseJob = async (jobId) => {
    console.log('🔴 마감 시작. jobId:', jobId);
    
    const { error } = await closeJob(jobId);
    
    console.log('✅ 마감 완료. error:', error);
    
    if (!error) {
      alert('마감 성공!');
      fetchJobs(user.id);
    } else {
      alert('마감 실패: ' + error);
      console.error('마감 에러 상세:', error);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">만료 기능 테스트</h1>
        
        {!user ? (
          <div className="bg-white rounded-xl shadow p-8">
            <p className="text-gray-500">로그인이 필요합니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold">현재 유저: {user.email}</p>
              <p className="text-sm text-gray-600">내 공고 수: {jobs.length}개</p>
            </div>

            {jobs.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8">
                <p className="text-gray-500">등록한 공고가 없습니다</p>
              </div>
            ) : (
              jobs.map((job) => {
                const badge = getStatusBadge(job.status, job.expires_at);
                
                return (
                  <div key={job.id} className="bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold">{job.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                            {badge.icon} {badge.text}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Status: {job.status}</p>
                        <p className="text-sm text-gray-600">Expires: {job.expires_at}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            console.log('🖱️ 버튼 클릭됨. jobId:', job.id);
                            testCloseJob(job.id);
                          }}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                        >
                          마감 테스트
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </main>
  );
}