'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SimpleTest() {
  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('✅ 유저:', user);
    setUser(user);
    
    if (user) {
      // 첫 번째 공고 가져오기
      const { data } = await supabase
        .from('job')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .single();
      
      console.log('✅ 공고:', data);
      setJob(data);
    }
  };

  const testClose = async () => {
    console.log('🔴 마감 시작');
    
    // UPDATE 실행
    const { error } = await supabase
      .from('job')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString()
      })
      .eq('id', job.id);
    
    console.log('✅ UPDATE 결과 - error:', error);
    
    if (!error) {
      // 3초 대기 후 DB에서 직접 조회
      console.log('⏳ 3초 대기 중...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('🔍 DB에서 직접 조회');
      const { data: checkData } = await supabase
        .from('job')
        .select('id, status, closed_at')
        .eq('id', job.id)
        .single();
      
      console.log('📊 DB 조회 결과:', checkData);
      
      if (checkData?.status === 'closed') {
        alert('마감 성공! DB 확인됨. 페이지를 새로고침합니다.');
        window.location.reload();
      } else {
        alert('마감 실패! DB에서 여전히 active입니다. RLS 정책 문제!');
        console.error('❌ UPDATE는 성공했지만 DB에 반영 안 됨');
      }
    } else {
      alert('실패: ' + error.message);
      console.error('❌ UPDATE 에러:', error);
    }
  };

  if (!user) {
    return <div className="p-8">로그인 필요</div>;
  }

  if (!job) {
    return <div className="p-8">공고 없음</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">간단 테스트</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <h2 className="font-bold text-lg mb-2">{job.title}</h2>
        <p className="text-sm mb-2">Status: <strong>{job.status}</strong></p>
        <p className="text-sm">ID: {job.id}</p>
      </div>

      <button
        onClick={testClose}
        className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-bold"
      >
        마감 테스트
      </button>
      
      <div className="mt-4 p-4 bg-blue-50 rounded">
        <p className="text-sm font-semibold">콘솔 확인:</p>
        <p className="text-xs">F12 → Console 탭 열고 버튼 클릭</p>
      </div>
    </div>
  );
}