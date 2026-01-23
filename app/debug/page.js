'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [user, setUser] = useState(null);
  const [contactsData, setContactsData] = useState([]);
  const [applicationsData, setApplicationsData] = useState([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      fetchAllData(user.id);
    }
  };

  const fetchAllData = async (userId) => {
    console.log('🔍 현재 로그인 사용자 ID:', userId);

    // contacts 테이블 전체 조회
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId);
    
    console.log('📊 contacts 테이블:', contacts);
    console.log('❌ contacts 에러:', contactsError);
    setContactsData(contacts || []);

    // applications 테이블에서 candidate_id가 있는 것 조회
    const { data: apps, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .not('candidate_id', 'is', null);
    
    console.log('📊 applications 테이블 (candidate_id 있는 것):', apps);
    console.log('❌ applications 에러:', appsError);
    setApplicationsData(apps || []);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">디버깅 페이지</h1>
        
        {user ? (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold">현재 로그인 사용자:</p>
              <p className="text-sm">Email: {user.email}</p>
              <p className="text-sm">ID: {user.id}</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📊 contacts 테이블 ({contactsData.length}개)
              </h2>
              {contactsData.length === 0 ? (
                <p className="text-gray-500">데이터가 없습니다</p>
              ) : (
                <div className="space-y-4">
                  {contactsData.map((contact, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(contact, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📊 applications 테이블 - candidate_id 있는 것 ({applicationsData.length}개)
              </h2>
              {applicationsData.length === 0 ? (
                <p className="text-gray-500">데이터가 없습니다</p>
              ) : (
                <div className="space-y-4">
                  {applicationsData.map((app, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(app, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="font-semibold mb-2">💡 결론:</p>
              {contactsData.length > 0 ? (
                <p className="text-green-700">✅ contacts 테이블에 데이터가 있습니다! 마이페이지 코드에 문제가 있을 수 있어요.</p>
              ) : applicationsData.length > 0 ? (
                <p className="text-orange-700">⚠️ applications 테이블에 데이터가 있습니다! 이력서 연락이 applications에 저장되고 있어요.</p>
              ) : (
                <p className="text-gray-700">❌ 아직 이력서에 연락한 적이 없는 것 같아요.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">로그인이 필요합니다</p>
        )}
      </div>
    </main>
  );
}