'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

const STUDIO_IMGS = [
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80',
];

function studioImg(id) {
  if (!id) return STUDIO_IMGS[0];
  const code = [...String(id)].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return STUDIO_IMGS[code % STUDIO_IMGS.length];
}

const typeColor = {
  '임대': 'bg-[#EAE7DE] text-[#5E5848]',
  '매매': 'bg-[#EAE7DE] text-[#5E5848]',
  '양도': 'bg-[#23211C] text-white',
};

export default function PropertyDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [property, setProperty] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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
      <main className="min-h-screen bg-[#F4F1E9] flex items-center justify-center">
        <p className="text-stone-400">불러오는 중...</p>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-[#F4F1E9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 text-lg font-medium mb-4">매물을 찾을 수 없습니다</p>
          <Link href="/property" className="text-[#23211C] hover:underline text-sm">← 목록으로</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F1E9]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">

        <div className="flex justify-between items-center mb-8">
          <Link href="/property" className="text-sm text-[#23211C] hover:text-black font-medium transition-colors">
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

        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">

          {/* hero image */}
          {(() => {
            const imgs = property.images?.filter(Boolean) || [];
            const heroSrc = selectedImage || imgs[0] || studioImg(property.id);
            return (
              <>
                <div style={{ position: 'relative', height: 280 }}>
                  <Image
                    src={heroSrc}
                    alt={property.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(30,28,24,0.55) 0%, rgba(30,28,24,0) 50%)',
                  }} />
                  <span style={{
                    position: 'absolute', bottom: 16, left: 20,
                    fontSize: 13, fontWeight: 700,
                    background: '#23211C', color: '#fff',
                    padding: '4px 10px', borderRadius: 6,
                  }}>
                    {property.property_type}
                  </span>
                </div>
                {imgs.length > 1 && (
                  <div className="flex gap-2 px-4 py-3 bg-stone-50 border-t border-stone-100 overflow-x-auto">
                    {imgs.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${
                          (selectedImage === img) || (!selectedImage && idx === 0)
                            ? 'border-[#23211C]'
                            : 'border-transparent hover:border-stone-300'
                        }`}
                      >
                        <img src={img} alt={`사진 ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            );
          })()}

          <div className="p-5 sm:p-8">

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-stone-400">
              {new Date(property.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-stone-800 mb-6">{property.title}</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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
              <div className="bg-[#ECE9E1] rounded-2xl p-4 col-span-2">
                <p className="text-xs text-[#5E5848] mb-1">가격</p>
                <p className="font-bold text-[#23211C] text-lg">💰 {property.price}</p>
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
            <div className="bg-[#ECE9E1] border border-[#E3DDD0] rounded-2xl p-5">
              <h2 className="text-sm font-bold text-[#23211C] uppercase tracking-widest mb-2">연락처</h2>
              {user ? (
                <p className="text-stone-700 font-medium">{property.contact}</p>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-stone-400 text-sm">로그인 후 연락처를 확인할 수 있습니다</p>
                  <Link href="/login">
                    <button className="px-4 py-2 bg-[#23211C] text-white text-sm rounded-full hover:bg-black transition">
                      로그인
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
          </div>{/* .p-8 */}
        </div>
      </div>
    </main>
  );
}
