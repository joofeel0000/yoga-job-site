'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Admin() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('job')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('에러:', error);
      alert('데이터 불러오기 실패');
    } else {
      setJobs(data);
    }
    setLoading(false);
  };

  const deleteJob = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const { error } = await supabase
      .from('job')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('에러:', error);
      alert('삭제 실패');
    } else {
      alert('삭제되었습니다!');
      fetchJobs(); // 목록 새로고침
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            관리자 페이지
          </h1>
          <Link href="/" className="text-purple-600 hover:underline">
            ← 홈으로
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-500">등록된 공고가 없습니다</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">제목</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">지역</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">요가 종류</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">경력</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">급여</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">등록일</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{job.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{job.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{job.yoga_style}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{job.experience || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{job.salary || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(job.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            총 {jobs.length}개의 공고
          </p>
        </div>
      </div>
    </main>
  );
}