-- candidate 테이블 컬럼 보정
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 컬럼이 없으면 추가, 있으면 스킵
ALTER TABLE candidate ADD COLUMN IF NOT EXISTS photo_url       TEXT;
ALTER TABLE candidate ADD COLUMN IF NOT EXISTS certifications  TEXT;
ALTER TABLE candidate ADD COLUMN IF NOT EXISTS introduction    TEXT;
ALTER TABLE candidate ADD COLUMN IF NOT EXISTS is_dummy        BOOLEAN DEFAULT false;

-- NOT NULL 제약이 걸려 있다면 해제
ALTER TABLE candidate ALTER COLUMN photo_url      DROP NOT NULL;
ALTER TABLE candidate ALTER COLUMN certifications DROP NOT NULL;
