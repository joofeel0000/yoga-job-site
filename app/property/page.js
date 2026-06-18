'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const PROPERTY_TYPES = ['전체', '임대', '매매', '양도'];

const typeColor = {
  '임대': 'bg-blue-100 text-blue-700',
  '매매': 'bg-emerald-100 text-emerald-700',
  '양도': 'bg-amber-100 text-amber-700',
};

export default function PropertyPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('전체');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('property')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) console.error('에러:', error);
    else setProperties(data || []);
    setLoading(false);
  };

  const filtered = properties.filter((p) => {
    const matchSearch =
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === '전체' || p.property_type === filterType;
    return matchSearch && matchType;
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-emerald-50/20">
      <div className="max-w-6xl mx-auto px-8 py-10">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 tracking-tight">요가 매물 정보</h1>
            <p className="text-stone-400 text-sm mt-1">요가 스튜디오 임대·매매·양도 정보를 확인하세요</p>
          </div>
          <div className="flex gap-3">
            <Link href="/post-property">
              <button className="px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-full hover:bg-green-800 transition">
                + 매물 등록
              </button>
            </Link>
            <Link href="/" className="text-sm text-green-700 hover:text-green-800 font-medium transition-colors self-center">
              ← 홈으로
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">검색</label>
              <input
                type="text"
                placeholder="제목, 지역으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">유형</label>
              <div className="flex gap-2 flex-wrap">
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                      filterType === t
                        ? 'bg-green-700 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-stone-400">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-stone-100">
            <span className="text-5xl mb-4">🏠</span>
            <p className="text-stone-500 font-medium">등록된 매물이 없습니다</p>
            <p className="text-stone-400 text-sm mt-1">첫 번째 매물을 등록해보세요</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <Link key={p.id} href={`/property/${p.id}`}>
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 hover:shadow-md hover:border-green-200 transition cursor-pointer h-full">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${typeColor[p.property_type] || 'bg-stone-100 text-stone-600'}`}>
                      {p.property_type}
                    </span>
                    <span className="text-xs text-stone-400">
                      {new Date(p.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <h3 className="font-bold text-stone-800 text-base mb-2 line-clamp-2">{p.title}</h3>
                  <div className="space-y-1 text-sm text-stone-500">
                    {p.location && <div>📍 {p.location}</div>}
                    {p.area && <div>📐 {p.area}</div>}
                    {p.price && <div className="text-green-700 font-semibold">💰 {p.price}</div>}
                  </div>
                  {p.description && (
                    <p className="text-xs text-stone-400 mt-3 line-clamp-2">{p.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
