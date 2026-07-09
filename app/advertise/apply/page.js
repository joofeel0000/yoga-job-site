'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ImageUpload from '@/app/components/ImageUpload';

const APPLY_PACKAGES = [
  { value: 'pkg_yoga_target', label: '요가원 타겟', icon: '🧘', includes: '메인 스폰서 카드 1개 + 구인구직 사이드바 1개', price: 200000, originalPrice: 250000, discount: 20 },
  { value: 'pkg_instructor_target', label: '강사 타겟', icon: '🌟', includes: '강사찾기 사이드바 1개 + 커뮤니티 와이드 1개', price: 240000, originalPrice: 300000, discount: 20 },
  { value: 'pkg_jobs_cross', label: '구인구직 교차', icon: '🔄', includes: '구인구직 사이드바 1개 + 강사찾기 사이드바 1개', price: 160000, originalPrice: 200000, discount: 20 },
  { value: 'pkg_brand', label: '브랜드 노출', icon: '📢', includes: '메인 와이드 1개 + 매물정보 와이드 1개', price: 400000, originalPrice: 500000, discount: 20 },
  { value: 'pkg_full', label: '풀 브랜딩', icon: '🚀', includes: '메인 슬라이드 1개 + 구인구직 사이드바 1개 + 강사찾기 사이드바 1개', price: 550000, originalPrice: 700000, discount: 21 },
];

const S = {
  label: { fontSize: 13, fontWeight: 600, color: '#5C5751', marginBottom: 6, display: 'block' },
  input: {
    width: '100%', padding: '11px 14px', fontSize: 14,
    border: '1px solid #E3DDD0', borderRadius: 12, outline: 'none',
    color: '#23211C', background: '#fff', boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  hint: { fontSize: 12, color: '#9A9382', marginTop: 5 },
};

export default function AdvertiseApplyPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    position:  'pkg_yoga_target',
    title:     '',
    image_url: '',
    link_url:  '',
    starts_at: '',
    ends_at:   '',
    notes:     '',
  });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        sessionStorage.setItem('loginRequired', 'true');
        window.location.href = '/login?redirect=advertise/apply';
        return;
      }
      setUser(user);
      setLoading(false);
    })();
  }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim())     { alert('광고주명을 입력해주세요'); return; }
    if (!form.image_url.trim()) { alert('배너 이미지 URL을 입력해주세요'); return; }

    setSubmitting(true);

    const { error } = await supabase.from('banners').insert({
      title:         form.title.trim(),
      image_url:     form.image_url.trim(),
      link_url:      form.link_url.trim() || null,
      position:      form.position,
      starts_at:     form.starts_at || null,
      ends_at:       form.ends_at   || null,
      is_active:     false,
      display_order: 99,
      user_id:       user.id,
      notes:         form.notes.trim() || null,
    });

    setSubmitting(false);
    if (error) {
      alert('신청 중 오류가 발생했습니다: ' + error.message);
    } else {
      setSubmitted(true);
    }
  };

  if (loading) {
    return (
      <main className="page-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🌿</div>
          <p style={{ color: '#9A9382', fontSize: 14 }}>로딩 중...</p>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="page-root">
        <div className="content-wrap">
          <div style={{ textAlign: 'center', padding: '80px 0 120px' }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#23211C', marginBottom: 10 }}>
              신청이 접수됐습니다
            </h2>
            <p style={{ fontSize: 15, color: '#76705F', lineHeight: 1.8, marginBottom: 36 }}>
              검토 후 연락드리겠습니다.<br />
              보통 1~2 영업일 내 검토가 완료됩니다.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/advertise">
                <button style={{
                  padding: '12px 24px', borderRadius: 11,
                  border: '1px solid #E3DDD0', background: '#fff',
                  color: '#23211C', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}>
                  광고 안내 보기
                </button>
              </Link>
              <Link href="/">
                <button style={{
                  padding: '12px 24px', borderRadius: 11,
                  border: 'none', background: '#23211C',
                  color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}>
                  홈으로 →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const selected = APPLY_PACKAGES.find(p => p.value === form.position);

  return (
    <main className="page-root">
      <div className="content-wrap">

        {/* 헤더 */}
        <div className="mb-6">
          <Link href="/advertise" style={{ fontSize: 13, color: '#9A9382', display: 'inline-block', marginBottom: 10, textDecoration: 'none' }}>
            ← 광고 안내로
          </Link>
          <h1 className="text-[26px] font-bold text-[#23211C] mb-1">광고 신청</h1>
          <p className="text-sm text-[#9A9382]">검토 후 1~2 영업일 내에 연락드립니다</p>
        </div>

        {/* 베타 무료 배지 */}
        <div style={{
          background: 'linear-gradient(135deg, #23211C 60%, #3E3B33)',
          borderRadius: 14, padding: '16px 24px', marginBottom: 32,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ fontSize: 22 }}>🎉</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>
              베타 기간 전 슬롯 무료
            </p>
            <p style={{ fontSize: 12, color: '#9A9382', margin: '3px 0 0' }}>
              지금 신청하면 정식 오픈 후 3개월 50% 할인 혜택까지
            </p>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 700, color: '#16A34A',
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            padding: '4px 10px', borderRadius: 8, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            현재 무료
          </span>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: '#fff', border: '1px solid #E3DDD0',
            borderRadius: 18, padding: '32px',
          }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* 패키지 선택 */}
              <div className="col-span-1 sm:col-span-2">
                <label style={S.label}>패키지 선택 *</label>
                <select value={form.position} onChange={set('position')} style={S.input}>
                  {APPLY_PACKAGES.map(p => (
                    <option key={p.value} value={p.value}>
                      {p.icon} {p.label} — {p.includes}
                    </option>
                  ))}
                </select>
                {selected && (
                  <div style={{ marginTop: 10, background: '#F4F1E9', border: '1px solid #E3DDD0', borderRadius: 10, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, color: '#76705F', fontWeight: 600 }}>포함 지면:</span>
                      <span style={{ fontSize: 12, color: '#23211C', fontWeight: 700 }}>{selected.includes}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: '#9A9382', textDecoration: 'line-through' }}>
                        개별 {selected.originalPrice.toLocaleString('ko-KR')}원
                      </span>
                      <span style={{ fontSize: 12, color: '#23211C', fontWeight: 800 }}>
                        → {selected.price.toLocaleString('ko-KR')}원/월
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#C2922F', background: '#FDF3E3', padding: '1px 7px', borderRadius: 6 }}>
                        {selected.discount}% 할인
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A' }}>
                        → 현재 베타 무료
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 광고주명 */}
              <div className="col-span-1 sm:col-span-2">
                <label style={S.label}>광고주명 / 브랜드명 *</label>
                <input
                  type="text"
                  placeholder="예: 강남 요가 스튜디오"
                  value={form.title}
                  onChange={set('title')}
                  style={S.input}
                />
              </div>

              {/* 이미지 업로드 */}
              <div className="col-span-1 sm:col-span-2">
                <label style={S.label}>배너 이미지 *</label>
                <ImageUpload
                  bucket="banners"
                  value={form.image_url}
                  onChange={(url) => setForm(f => ({ ...f, image_url: url }))}
                  hint="JPG · PNG · WebP · 최대 5MB · 가로형 권장"
                />
              </div>

              {/* 링크 URL */}
              <div className="col-span-1 sm:col-span-2">
                <label style={S.label}>클릭 시 이동 URL</label>
                <input
                  type="url"
                  placeholder="https://example.com (선택 사항)"
                  value={form.link_url}
                  onChange={set('link_url')}
                  style={S.input}
                />
              </div>

              {/* 노출 기간 */}
              <div>
                <label style={S.label}>노출 시작일</label>
                <input
                  type="date"
                  value={form.starts_at}
                  onChange={set('starts_at')}
                  style={S.input}
                />
                <p style={S.hint}>비워두면 승인 후 즉시 노출</p>
              </div>
              <div>
                <label style={S.label}>노출 종료일</label>
                <input
                  type="date"
                  value={form.ends_at}
                  onChange={set('ends_at')}
                  style={S.input}
                />
                <p style={S.hint}>비워두면 무기한 노출</p>
              </div>

              {/* 문의 내용 */}
              <div className="col-span-1 sm:col-span-2">
                <label style={S.label}>문의 내용</label>
                <textarea
                  placeholder="광고 목적, 특이사항, 연락처 등 자유롭게 적어주세요"
                  value={form.notes}
                  onChange={set('notes')}
                  rows={4}
                  style={{ ...S.input, resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>

            </div>

            {/* 안내 */}
            <div style={{
              background: '#F4F1E9', borderRadius: 10, padding: '14px 18px', marginTop: 24,
            }}>
              <p style={{ fontSize: 12, color: '#76705F', margin: 0, lineHeight: 1.7 }}>
                📋 신청 후 관리자 검토를 거쳐 광고가 게재됩니다. 이미지 소재 제작 가이드가 필요하시면 문의 내용에 적어주세요.<br />
                베타 기간 내 신청 건은 정식 오픈 이후에도 할인 혜택이 유지됩니다.
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 border-t border-[#F4F1E9] mt-6 pt-6">
              <Link href="/advertise" className="sm:order-first">
                <button type="button" className="w-full sm:w-auto" style={{
                  padding: '13px 24px', borderRadius: 11,
                  border: '1px solid #E3DDD0', background: '#fff',
                  color: '#23211C', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  취소
                </button>
              </Link>
              <button type="submit" disabled={submitting} className="w-full sm:w-auto" style={{
                padding: '13px 28px', borderRadius: 11, border: 'none',
                background: submitting ? '#9A9382' : '#23211C',
                color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.12s',
              }}>
                {submitting ? '처리 중...' : '신청하기 →'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </main>
  );
}
