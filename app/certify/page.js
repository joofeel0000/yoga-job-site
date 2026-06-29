'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CERT_TYPES = ['요가지도사 1급', '요가지도사 2급', '요가지도사 3급', '필라테스 지도사', '스포츠 지도사', '생활체육 지도사'];

function StepBadge({ number, label, active, done }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', fontSize: 13, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: done ? '#23211C' : active ? '#23211C' : '#E3DDD0',
        color: done ? '#fff' : active ? '#fff' : '#9A9382',
        flexShrink: 0,
      }}>
        {done ? '✓' : number}
      </div>
      <span style={{ fontSize: 14, fontWeight: active ? 700 : 400, color: active ? '#23211C' : '#9A9382' }}>{label}</span>
    </div>
  );
}

export default function CertifyPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    certType: '',
    issuer: '',
    issueDate: '',
    file: null,
  });

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) {
      sessionStorage.setItem('loginRequired', 'true');
      router.push('/login?redirect=certify');
      return;
    }
    setUser(u);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.certType) { alert('자격 종류를 선택해주세요'); return; }
    if (!formData.issuer || !formData.issueDate) { alert('발급 정보를 입력해주세요'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setSubmitting(false);
    alert('인증 신청이 완료되었습니다! 검토 후 승인해드리겠습니다.');
    router.push('/mypage');
  };

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#F4F1E9', paddingTop: 68, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9A9382', fontSize: 14 }}>로딩 중...</p>
      </main>
    );
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', border: '1px solid #E3DDD0', borderRadius: 10,
    fontSize: 14, color: '#23211C', background: '#F4F1E9', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <main style={{ minHeight: '100vh', background: '#F4F1E9' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#23211C', marginBottom: 4 }}>강사 자격 인증</h1>
            <p style={{ fontSize: 14, color: '#9A9382' }}>자격증을 등록하고 인증 배지를 받으세요</p>
          </div>
          <Link href="/mypage" style={{ fontSize: 13, color: '#76705F', textDecoration: 'none' }}>← 마이페이지</Link>
        </div>

        {/* Step indicators */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E3DDD0', padding: '20px 24px', marginBottom: 20, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <StepBadge number={1} label="자격 종류 선택" active={step === 1} done={step > 1} />
          <div style={{ width: 24, height: 1, background: '#E3DDD0', alignSelf: 'center' }} />
          <StepBadge number={2} label="발급 정보 입력" active={step === 2} done={step > 2} />
          <div style={{ width: 24, height: 1, background: '#E3DDD0', alignSelf: 'center' }} />
          <StepBadge number={3} label="파일 업로드" active={step === 3} done={false} />
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E3DDD0', padding: '28px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#23211C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>1</div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#23211C' }}>자격 종류를 선택하세요</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CERT_TYPES.map(cert => {
                const selected = formData.certType === cert;
                return (
                  <button key={cert} type="button" onClick={() => setFormData({ ...formData, certType: cert })} style={{
                    padding: '14px 18px', borderRadius: 12, textAlign: 'left', fontSize: 14, fontWeight: selected ? 700 : 400,
                    background: selected ? '#23211C' : '#F4F1E9',
                    color: selected ? '#fff' : '#23211C',
                    border: `1px solid ${selected ? '#23211C' : '#E3DDD0'}`,
                    cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <span style={{ fontSize: 16 }}>🎖️</span>
                    {cert}
                    {selected && <span style={{ marginLeft: 'auto', fontSize: 16 }}>✓</span>}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => { if (!formData.certType) { alert('자격 종류를 선택해주세요'); return; } setStep(2); }}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 12, fontSize: 15, fontWeight: 700,
                background: formData.certType ? '#23211C' : '#E3DDD0',
                color: formData.certType ? '#fff' : '#9A9382',
                border: 'none', cursor: formData.certType ? 'pointer' : 'not-allowed', marginTop: 24,
              }}
            >
              다음
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E3DDD0', padding: '28px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#23211C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>2</div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#23211C' }}>발급 정보를 입력하세요</h2>
            </div>

            <div style={{ marginBottom: 16, padding: '12px 16px', background: '#F4F1E9', borderRadius: 10, fontSize: 13, color: '#76705F' }}>
              선택한 자격: <strong style={{ color: '#23211C' }}>{formData.certType}</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#76705F', display: 'block', marginBottom: 7 }}>발급기관명</label>
                <input
                  type="text"
                  placeholder="예: 대한요가회"
                  value={formData.issuer}
                  onChange={e => setFormData({ ...formData, issuer: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#76705F', display: 'block', marginBottom: 7 }}>취득일</label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{
                flex: 1, padding: '13px 0', borderRadius: 12, fontSize: 14, fontWeight: 600,
                background: '#F4F1E9', color: '#76705F', border: '1px solid #E3DDD0', cursor: 'pointer',
              }}>이전</button>
              <button onClick={() => { if (!formData.issuer || !formData.issueDate) { alert('발급 정보를 입력해주세요'); return; } setStep(3); }} style={{
                flex: 2, padding: '13px 0', borderRadius: 12, fontSize: 14, fontWeight: 700,
                background: '#23211C', color: '#fff', border: 'none', cursor: 'pointer',
              }}>다음</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E3DDD0', padding: '28px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#23211C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>3</div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#23211C' }}>자격증 파일을 업로드하세요</h2>
            </div>

            <div style={{ marginBottom: 20, padding: '12px 16px', background: '#F4F1E9', borderRadius: 10, fontSize: 13, color: '#76705F' }}>
              {formData.certType} · {formData.issuer} · {formData.issueDate}
            </div>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${formData.file ? '#23211C' : '#E3DDD0'}`,
                borderRadius: 14, padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
                background: formData.file ? '#F4F1E9' : '#FAFAF8', marginBottom: 24,
                transition: 'all 0.15s',
              }}
            >
              {formData.file ? (
                <>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#23211C' }}>{formData.file.name}</p>
                  <p style={{ fontSize: 12, color: '#76705F', marginTop: 4 }}>클릭하여 파일 변경</p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#23211C', marginBottom: 4 }}>파일을 클릭하여 업로드</p>
                  <p style={{ fontSize: 12, color: '#9A9382' }}>JPG, PNG, PDF 파일 지원 · 최대 10MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })}
              style={{ display: 'none' }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(2)} style={{
                flex: 1, padding: '13px 0', borderRadius: 12, fontSize: 14, fontWeight: 600,
                background: '#F4F1E9', color: '#76705F', border: '1px solid #E3DDD0', cursor: 'pointer',
              }}>이전</button>
              <button onClick={handleSubmit} disabled={submitting} style={{
                flex: 2, padding: '13px 0', borderRadius: 12, fontSize: 14, fontWeight: 700,
                background: submitting ? '#E3DDD0' : '#23211C',
                color: submitting ? '#9A9382' : '#fff',
                border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
              }}>
                {submitting ? '신청 중...' : '인증 신청하기'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
