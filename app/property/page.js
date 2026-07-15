'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import BannerZone from '@/app/components/BannerZone';

const PAGE_SIZE = 12;

const PROPERTY_TYPES = ['전체', '임대', '매매', '양도'];

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80';

const STUDIO_IMGS = [
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1487611459768-bd414656ea10?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1561049501-e1f96bdd98fd?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&auto=format&fit=crop&q=80',
];

function PropertyThumb({ src, alt }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 400px"
      className="object-cover"
      onError={() => setImgSrc(FALLBACK_IMG)}
    />
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('…');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-1 mt-8 mb-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-[9px] border border-[#E3DDD0] bg-white text-[#76705F] text-base font-bold disabled:opacity-30 hover:bg-[#F4F1E9] transition"
      >‹</button>
      {getPages().map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-[#9A9382] text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-[9px] text-sm font-semibold border transition ${
              p === currentPage
                ? 'bg-[#23211C] text-white border-[#23211C]'
                : 'bg-white text-[#76705F] border-[#E3DDD0] hover:bg-[#F4F1E9]'
            }`}
          >{p}</button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-[9px] border border-[#E3DDD0] bg-white text-[#76705F] text-base font-bold disabled:opacity-30 hover:bg-[#F4F1E9] transition"
      >›</button>
    </div>
  );
}

function PropertyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('전체');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const skipReset = useRef(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (skipReset.current) { skipReset.current = false; return; }
    setCurrentPage(1);
    const params = new URLSearchParams(window.location.search);
    params.delete('page');
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchTerm, filterType]);

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

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const params = new URLSearchParams(window.location.search);
    params.set('page', page);
    router.push(`?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#F4F1E9]">
      <div className="content-wrap">

        <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-[#23211C] mb-1">요가 매물 정보</h1>
            <p className="text-sm text-[#9A9382]">요가 스튜디오 임대·매매·양도 정보를 확인하세요</p>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/post-property">
              <button className="px-5 py-2.5 bg-[#23211C] text-white text-sm font-semibold rounded-full hover:bg-black transition">
                + 매물 등록
              </button>
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
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#23211C] focus:border-transparent transition text-sm"
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
                        ? 'bg-[#23211C] text-white'
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

        <BannerZone position="property_top" />

        {loading ? (
          <div className="flex justify-center py-20 text-stone-400">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-stone-100">
            <span className="text-5xl mb-4">🏠</span>
            <p className="text-stone-500 font-medium">등록된 매물이 없습니다</p>
            <p className="text-stone-400 text-sm mt-1">첫 번째 매물을 등록해보세요</p>
          </div>
        ) : (
          <>
            <p className="text-[13px] text-[#9A9382] mb-4">
              총 <strong className="text-[#23211C]">{filtered.length}</strong>개 매물
              {totalPages > 1 && <span className="ml-1">· {currentPage} / {totalPages} 페이지</span>}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pagedItems.map((p, i) => (
                <Link key={p.id} href={`/property/${p.id}`}>
                  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-md hover:border-stone-300 transition cursor-pointer h-full">
                    <div className="relative h-40">
                      <PropertyThumb src={p.images?.[0] || STUDIO_IMGS[((currentPage - 1) * PAGE_SIZE + i) % STUDIO_IMGS.length]} alt={p.title} />
                      <span className="absolute top-[10px] left-[10px] text-[11px] font-bold bg-[#23211C] text-white px-2 py-[3px] rounded-[5px]">
                        {p.property_type}
                      </span>
                      {p.is_dummy && (
                        <span className="absolute top-[10px] right-[10px] text-[11px] text-[#A09B8E] bg-white/90 border border-[#DEDAD2] px-[7px] py-[2px] rounded-[5px]">샘플</span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-stone-800 text-base line-clamp-1 flex-1 mr-2">{p.title}</h3>
                        <span className="text-xs text-stone-400 shrink-0">
                          {new Date(p.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-stone-500">
                        {p.location && <div>📍 {p.location}</div>}
                        {p.area && <div>📐 {p.area}</div>}
                        {p.price && <div className="text-stone-800 font-semibold">💰 {p.price}</div>}
                      </div>
                      {p.description && (
                        <p className="text-xs text-stone-400 mt-2 line-clamp-2">{p.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}

        <BannerZone position="property_strip" />
      </div>
    </main>
  );
}

export default function PropertyPage() {
  return (
    <Suspense fallback={null}>
      <PropertyContent />
    </Suspense>
  );
}
