-- Add structured matching columns to job and candidate tables.
-- region_sido  : 시도 (서울, 경기, ...)
-- region_sigungu : 시군구 (강남구, 수원시, ...)
-- region_gu   : 일반구, 해당 없으면 NULL (영통구, 분당구, ...)
-- yoga_styles_arr : 요가 종류 배열
-- experience_num  : 경력 숫자 (0=신입, NULL=무관)
-- Existing free-text columns are intentionally preserved.

ALTER TABLE job
  ADD COLUMN IF NOT EXISTS region_sido      TEXT,
  ADD COLUMN IF NOT EXISTS region_sigungu   TEXT,
  ADD COLUMN IF NOT EXISTS region_gu        TEXT,
  ADD COLUMN IF NOT EXISTS yoga_styles_arr  TEXT[],
  ADD COLUMN IF NOT EXISTS experience_num   INT;

ALTER TABLE candidate
  ADD COLUMN IF NOT EXISTS region_sido      TEXT,
  ADD COLUMN IF NOT EXISTS region_sigungu   TEXT,
  ADD COLUMN IF NOT EXISTS region_gu        TEXT,
  ADD COLUMN IF NOT EXISTS yoga_styles_arr  TEXT[],
  ADD COLUMN IF NOT EXISTS experience_num   INT;
