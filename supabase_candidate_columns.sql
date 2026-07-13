-- candidate 테이블 컬럼 보정 + pkey 시퀀스 리셋
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. 컬럼이 없으면 추가, 있으면 스킵
ALTER TABLE candidate ADD COLUMN IF NOT EXISTS photo_url       TEXT;
ALTER TABLE candidate ADD COLUMN IF NOT EXISTS certifications  TEXT;
ALTER TABLE candidate ADD COLUMN IF NOT EXISTS introduction    TEXT;
ALTER TABLE candidate ADD COLUMN IF NOT EXISTS is_dummy        BOOLEAN DEFAULT false;

-- 2. NOT NULL 제약이 걸려 있다면 해제
ALTER TABLE candidate ALTER COLUMN photo_url      DROP NOT NULL;
ALTER TABLE candidate ALTER COLUMN certifications DROP NOT NULL;

-- 3. id 컬럼 기본값이 UUID 자동 생성인지 확인 및 보정
--    (Supabase 기본: gen_random_uuid())
ALTER TABLE candidate ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 4. SERIAL/BIGSERIAL 시퀀스 사용 시 — 현재 MAX(id)로 시퀀스 리셋
--    (id가 UUID 타입이면 이 구문은 무시됩니다)
DO $$
DECLARE
  seq_name text;
BEGIN
  SELECT pg_get_serial_sequence('candidate', 'id') INTO seq_name;
  IF seq_name IS NOT NULL THEN
    EXECUTE format(
      'SELECT setval(%L, (SELECT COALESCE(MAX(id), 0) FROM candidate) + 1, false)',
      seq_name
    );
    RAISE NOTICE 'candidate id 시퀀스 리셋 완료: %', seq_name;
  ELSE
    RAISE NOTICE 'candidate.id는 시퀀스 없음 (UUID 타입). 리셋 불필요.';
  END IF;
END $$;
