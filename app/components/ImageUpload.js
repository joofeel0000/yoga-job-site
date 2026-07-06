'use client';

import { supabase } from '@/lib/supabase';
import { useState, useRef, useCallback } from 'react';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageUpload({ bucket, value, onChange, hint }) {
  const [preview,   setPreview]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');
  const [dragging,  setDragging]  = useState(false);
  const [hovered,   setHovered]   = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    setError('');

    if (!ACCEPTED.includes(file.type)) {
      setError('JPG, PNG, WebP 형식만 지원합니다');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('파일 크기는 5MB 이하여야 합니다');
      return;
    }

    // 로컬 미리보기 즉시 표시
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    setUploading(true);

    const ext  = file.name.split('.').pop().toLowerCase();
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: file.type });

    setUploading(false);

    if (upErr) {
      setPreview(null);
      setError('업로드 실패: ' + upErr.message);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(publicUrl);
  }, [bucket, onChange]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const currentImg = preview || value;
  const borderColor = dragging ? '#23211C' : error ? '#EF4444' : '#E3DDD0';

  return (
    <div>
      {/* 드롭존 */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        style={{
          position: 'relative',
          border: `2px dashed ${borderColor}`,
          borderRadius: 12,
          overflow: 'hidden',
          cursor: uploading ? 'wait' : 'pointer',
          transition: 'border-color 0.15s, background 0.15s',
          background: dragging ? '#F4F1E9' : '#FAFAF8',
          minHeight: currentImg ? 'auto' : 108,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {currentImg ? (
          /* 이미지 + hover 오버레이 */
          <div
            style={{ width: '100%', position: 'relative' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <img
              src={currentImg}
              alt="미리보기"
              style={{ width: '100%', maxHeight: 140, objectFit: 'cover', display: 'block' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            {!uploading && (
              <div style={{
                position: 'absolute', inset: 0,
                background: hovered ? 'rgba(0,0,0,0.42)' : 'rgba(0,0,0,0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}>
                <span style={{
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  opacity: hovered ? 1 : 0, transition: 'opacity 0.15s',
                  padding: '6px 14px', borderRadius: 8,
                  background: 'rgba(0,0,0,0.5)',
                }}>
                  클릭하여 변경
                </span>
              </div>
            )}
          </div>
        ) : (
          /* 빈 드롭존 */
          <div style={{ textAlign: 'center', padding: '24px 20px', pointerEvents: 'none' }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>🖼️</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#23211C', margin: '0 0 4px' }}>
              {dragging ? '여기에 놓으세요' : '클릭하거나 드래그해서 업로드'}
            </p>
            <p style={{ fontSize: 12, color: '#9A9382', margin: 0 }}>
              JPG · PNG · WebP · 최대 5MB
            </p>
          </div>
        )}

        {/* 업로드 중 오버레이 */}
        {uploading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,255,255,0.88)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <div style={{
              width: 22, height: 22,
              border: '3px solid #E3DDD0', borderTopColor: '#23211C',
              borderRadius: '50%', animation: 'iu-spin 0.7s linear infinite',
            }} />
            <p style={{ fontSize: 12, color: '#76705F', fontWeight: 600 }}>업로드 중...</p>
          </div>
        )}
      </div>

      {error  && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 5 }}>{error}</p>}
      {!error && hint && <p style={{ fontSize: 12, color: '#9A9382', marginTop: 5 }}>{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />

      <style>{`@keyframes iu-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
