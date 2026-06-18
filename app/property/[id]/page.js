'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const typeColor = {
  '임대': 'bg-blue-100 text-blue-700',
  '매매': 'bg-emerald-100 text-emerald-700',
  '양도': 'bg-amber-100 text-amber-700',
};

export default function PropertyDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [property, setProperty] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('property').select('*').eq('id', id).single();
    if (error) { console.error('에러:', error); setLoading(false); return; }
    setProperty(data);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);
    setIsOwner(currentUser?.id === data.user_id);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('이 매물을 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('property').delete().eq('id', id);
    if (error) { alert('삭제 실패: ' + error.message); return; }
    alert('삭제되었습니다.');
    router.push('/property');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-emerald-50/20 flex items-center justify-center">
        <p className="text-stone-400">불러오는 중...</p>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-emerald-50/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 text-lg font-medium mb-4">매물을 찾을 수 없습니다</p>
          <Link href="/property" className="text-green-700 hover:underline text-sm">← 목록으로</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-emerald-50/20">
      <div className="max-w-3xl mx-auto px-8 py-10">

        <div className="flex justify-between items-center mb-8">
          <Link href="/property" className="text-sm text-green-700 hover:text-green-800 font-medium transition-colors">
            ← 매물 목록
          </Link>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              삭제
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8">

          <div className="flex items-center gap-3 mb-4">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${typeColor[property.property_type] || 'bg-stone-100 text-stone-600'}`}>
              {property.property_type}
            </span>
            <span className="text-xs text-stone-400">
              {new Date(property.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-stone-800 mb-6">{property.title}</h1>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {property.location && (
              <div className="bg-stone-50 rounded-2xl p-4">
                <p className="text-xs text-stone-400 mb-1">위치</p>
                <p className="font-semibold text-stone-700">📍 {property.location}</p>
              </div>
            )}
            {property.area && (
              <div className="bg-stone-50 rounded-2xl p-4">
                <p className="text-xs text-stone-400 mb-1">면적</p>
                <p className="font-semibold text-stone-700">📐 {property.area}</p>
              </div>
            )}
            {property.price && (
              <div className="bg-green-50 rounded-2xl p-4 col-span-2">
                <p className="text-xs text-green-600 mb-1">가격</p>
                <p className="font-bold text-green-800 text-lg">💰 {property.price}</p>
              </div>
            )}
          </div>

          {property.description && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-3">상세 설명</h2>
              <div className="text-stone-700 leading-relaxed whitespace-pre-wrap text-sm bg-stone-50 rounded-2xl p-5">
                {property.description}
              </div>
            </div>
          )}

          {property.contact && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-green-700 uppercase tracking-widest mb-2">연락처</h2>
              {user ? (
                <p className="text-stone-700 font-medium">{property.contact}</p>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-stone-400 text-sm">로그인 후 연락처를 확인할 수 있습니다</p>
                  <Link href="/login">
                    <button className="px-4 py-2 bg-green-700 text-white text-sm rounded-full hover:bg-green-800 transition">
                      로그인
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
