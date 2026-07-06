-- 테스트성 더미 데이터 삭제
-- Supabase Dashboard → SQL Editor 에서 실행

DELETE FROM candidate
WHERE name IN ('websre', '밤알바 갤러리', '주필규asd', '213', '주필규');

DELETE FROM job
WHERE title IN ('123', 'wqasasas', 'qweweqewq');
