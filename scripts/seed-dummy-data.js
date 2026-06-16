/**
 * 요가 구인구직 플랫폼 더미 데이터 삽입 스크립트
 *
 * 환경변수 (GitHub Secrets → Actions env):
 *   SUPABASE_URL             : Supabase 프로젝트 URL
 *   SUPABASE_SERVICE_ROLE_KEY: service_role 키 (RLS 우회)
 *   SEED_USER_ID             : 더미 데이터 소유자 user_id (UUID) — 없으면 null
 *   SEED_JOBS_PER_RUN        : 구인 공고 삽입 수 (기본 3)
 *   SEED_CANDIDATES_PER_RUN  : 구직 이력서 삽입 수 (기본 2)
 *   MAX_TOTAL_SEED_ROWS      : 이 수를 넘으면 삽입 건너뜀 (기본 200)
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SEED_USER_ID = process.env.SEED_USER_ID || null;

const JOBS_PER_RUN = parseInt(process.env.SEED_JOBS_PER_RUN ?? '3', 10);
const CANDIDATES_PER_RUN = parseInt(process.env.SEED_CANDIDATES_PER_RUN ?? '2', 10);
const MAX_TOTAL = parseInt(process.env.MAX_TOTAL_SEED_ROWS ?? '200', 10);

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ─────────────────────────────────────────────
// 더미 데이터 풀
// ─────────────────────────────────────────────

const LOCATIONS = [
  '서울 강남구', '서울 마포구', '서울 송파구', '서울 용산구', '서울 은평구',
  '부산 해운대구', '부산 수영구', '인천 연수구', '대구 수성구', '대전 유성구',
  '광주 서구', '수원시 영통구', '성남시 분당구', '고양시 일산동구', '울산 남구',
];

const YOGA_STYLES = ['하타요가', '빈야사', '아쉬탕가', '파워요가', '음요가', '핫요가'];

const EXPERIENCES = ['신입 가능', '1년 이상', '3년 이상', '5년 이상', '무관'];

const SALARIES = [
  '월 200만원', '월 250만원', '월 300만원', '월 350만원', '월 400만원',
  '시간당 3만원', '시간당 4만원', '시간당 5만원', '협의 가능',
];

const CENTER_NAMES = [
  '힐링요가센터', '그린요가스튜디오', '하모니요가', '바디밸런스요가', '플로우요가',
  '선요가아카데미', '코어요가스튜디오', '나마스테센터', '로터스요가', '젠요가클럽',
  '트리요가스튜디오', '선샤인요가', '호흡요가센터', '무브먼트요가', '에너지요가',
];

const JOB_TITLE_TEMPLATES = [
  (style, center) => `${center} ${style} 전문 강사 모집`,
  (style, center) => `[${center}] ${style} 강사 채용 공고`,
  (style) => `${style} 클래스 담당 강사 구인`,
  (style, center) => `${center} ${style} 파트타임 강사 모집`,
  (style, center) => `${center} 소수정예 ${style} 강사 채용`,
];

const JOB_DESCRIPTIONS = [
  (style, loc) =>
    `${loc}에 위치한 요가 센터에서 ${style} 전문 강사를 모집합니다. 쾌적한 환경과 안정적인 수업 구성, 성장 가능한 업무 환경을 제공합니다. 열정 있는 분들의 많은 지원 바랍니다.`,
  (style) =>
    `소규모 정예 클래스로 운영되는 ${style} 센터입니다. 강사의 개성과 커리큘럼 자율성을 존중하며 학생 피드백 중심으로 수업을 운영합니다. 경험보다 열정 있는 분 환영합니다.`,
  (style, loc) =>
    `${loc} 신규 오픈 스튜디오에서 함께할 ${style} 강사를 찾습니다. 유연한 시간대 조율 가능하며 강습 장비 일체 지원합니다. 인스타그램 마케팅 가능자 우대합니다.`,
  (style) =>
    `${style} 수업 경험 보유자를 우대하지만 신입도 지원 가능합니다. 정기 워크숍 지원, 자격증 비용 일부 지원 등 강사 성장 프로그램을 운영 중입니다.`,
  (style, loc) =>
    `${loc} 기반의 요가 스튜디오에서 ${style} 강사를 채용합니다. 주 3~5일 수업 가능한 분, 소통 능력이 뛰어난 분을 선호합니다. 수습 기간 2주 운영 후 정식 계약합니다.`,
];

// ─── 구직자 풀 ───────────────────────────────

const CANDIDATE_NAMES = [
  '김지수', '이하은', '박서연', '최민지', '정유진', '한소희', '오채원',
  '윤수아', '임나연', '강지혜', '신예은', '류아영', '문소연', '배지현', '홍수빈',
  '권민서', '황채연', '송예린', '안지유', '조하늘',
];

const EXPERIENCE_YEARS = [
  '1년', '2년', '3년', '4년', '5년', '6년', '7년', '8년', '10년 이상', '신입',
];

const CERTIFICATIONS = [
  'RYT 200', 'RYT 500', '대한요가협회 자격증', '한국요가연합회 자격증',
  '필라테스 지도자 과정 수료', 'RYT 200 + 명상지도사', 'RYT 500 + 어린이요가',
  '음요가 전문 수료증', '아이엔가 요가 인증',
];

const CANDIDATE_INTRODUCTIONS = [
  (style, years) =>
    `${years} 경력의 ${style} 전문 강사입니다. 다양한 연령대의 수강생을 지도한 경험이 있으며 체계적인 커리큘럼 구성을 강점으로 삼고 있습니다.`,
  (style) =>
    `${style}에 진심인 강사입니다. 수련자가 자신의 몸과 호흡을 느끼는 순간을 함께 만들어가고 싶습니다. 소통과 피드백을 중요하게 생각합니다.`,
  (style, years) =>
    `${style} 지도 ${years} 경력으로 다수의 센터에서 근무했습니다. 정기 클래스 외에 개인 레슨, 기업 출강 경험도 보유하고 있습니다.`,
  (style) =>
    `${style}와 명상을 접목한 수업을 지향합니다. 수강생의 신체 조건과 목표에 맞춘 맞춤형 지도를 제공하며 안전한 수련 환경을 최우선으로 합니다.`,
];

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function expiresAt(days = 30) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// ─────────────────────────────────────────────
// 생성 함수
// ─────────────────────────────────────────────

function makeJob() {
  const style = pick(YOGA_STYLES);
  const loc = pick(LOCATIONS);
  const center = pick(CENTER_NAMES);
  return {
    title: pick(JOB_TITLE_TEMPLATES)(style, center),
    location: loc,
    yoga_style: style,
    experience: pick(EXPERIENCES),
    salary: pick(SALARIES),
    description: pick(JOB_DESCRIPTIONS)(style, loc),
    user_id: SEED_USER_ID,
    status: 'active',
    expires_at: expiresAt(30),
  };
}

function makeCandidate() {
  const styleCount = Math.random() < 0.4 ? 2 : 1;
  const styles = pickN(YOGA_STYLES, styleCount).join(', ');
  const primaryStyle = styles.split(',')[0].trim();
  const years = pick(EXPERIENCE_YEARS);
  return {
    name: pick(CANDIDATE_NAMES),
    location: pick(LOCATIONS),
    yoga_styles: styles,
    experience_years: years,
    certifications: pick(CERTIFICATIONS),
    introduction: pick(CANDIDATE_INTRODUCTIONS)(primaryStyle, years),
    user_id: SEED_USER_ID,
    status: 'active',
    expires_at: expiresAt(30),
  };
}

// ─────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────

async function main() {
  console.log(`🌿 더미 데이터 삽입 시작 (${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })})`);

  // 현재 총 더미 행 수 확인
  const jobCountQuery = SEED_USER_ID
    ? supabase.from('job').select('*', { count: 'exact', head: true }).eq('user_id', SEED_USER_ID)
    : supabase.from('job').select('*', { count: 'exact', head: true });

  const candCountQuery = SEED_USER_ID
    ? supabase.from('candidate').select('*', { count: 'exact', head: true }).eq('user_id', SEED_USER_ID)
    : supabase.from('candidate').select('*', { count: 'exact', head: true });

  const [{ count: jobCount }, { count: candidateCount }] = await Promise.all([
    jobCountQuery,
    candCountQuery,
  ]);

  const total = (jobCount ?? 0) + (candidateCount ?? 0);
  console.log(`📊 현재 더미 데이터: 구인 ${jobCount}개, 구직 ${candidateCount}개 (합계 ${total}/${MAX_TOTAL})`);

  if (total >= MAX_TOTAL) {
    console.log(`⚠️  최대 행 수(${MAX_TOTAL})에 도달했습니다. 삽입을 건너뜁니다.`);
    console.log('   MAX_TOTAL_SEED_ROWS 환경변수를 늘리거나 오래된 더미 데이터를 삭제하세요.');
    return;
  }

  // 구인 공고 삽입
  const jobs = Array.from({ length: JOBS_PER_RUN }, makeJob);
  const { data: insertedJobs, error: jobErr } = await supabase.from('job').insert(jobs).select('id, title');
  if (jobErr) {
    console.error('❌ 구인 공고 삽입 실패:', jobErr.message);
    process.exitCode = 1;
  } else {
    console.log(`✅ 구인 공고 ${insertedJobs.length}개 삽입 완료:`);
    insertedJobs.forEach(j => console.log(`   • ${j.title} (${j.id})`));
  }

  // 구직 이력서 삽입
  const candidates = Array.from({ length: CANDIDATES_PER_RUN }, makeCandidate);
  const { data: insertedCandidates, error: candErr } = await supabase.from('candidate').insert(candidates).select('id, name, yoga_styles');
  if (candErr) {
    console.error('❌ 구직 이력서 삽입 실패:', candErr.message);
    process.exitCode = 1;
  } else {
    console.log(`✅ 구직 이력서 ${insertedCandidates.length}개 삽입 완료:`);
    insertedCandidates.forEach(c => console.log(`   • ${c.name} (${c.yoga_styles}) — ${c.id}`));
  }

  console.log('🏁 완료');
}

main().catch(err => {
  console.error('❌ 스크립트 오류:', err);
  process.exit(1);
});
