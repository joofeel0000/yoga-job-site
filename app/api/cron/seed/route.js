import { createClient } from '@supabase/supabase-js';
import { YOGA_STYLES, REGIONS, SIDO_LIST, JOB_EXPERIENCE, CANDIDATE_EXPERIENCE } from '@/lib/constants';

const JOBS_PER_RUN       = parseInt(process.env.SEED_JOBS_PER_RUN       ?? '3', 10);
const CANDIDATES_PER_RUN = parseInt(process.env.SEED_CANDIDATES_PER_RUN ?? '2', 10);
const PROPERTIES_PER_RUN = parseInt(process.env.SEED_PROPERTIES_PER_RUN ?? '2', 10);
const POSTS_PER_RUN      = parseInt(process.env.SEED_POSTS_PER_RUN      ?? '3', 10);
const MAX_TOTAL          = parseInt(process.env.MAX_TOTAL_SEED_ROWS      ?? '1000', 10);
const TABLES_WITH_EXPIRY = ['job', 'candidate'];
const TABLES_OLDEST_TRIM = [
  { table: 'job',             idCol: 'id', perRun: () => JOBS_PER_RUN },
  { table: 'candidate',       idCol: 'id', perRun: () => CANDIDATES_PER_RUN },
  { table: 'property',        idCol: 'id', perRun: () => PROPERTIES_PER_RUN },
  { table: 'community_posts', idCol: 'id', perRun: () => POSTS_PER_RUN },
];
const SEED_USER_ID       = process.env.SEED_USER_ID ?? null;

// ── 텍스트 풀 ──────────────────────────────────────────────────

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
  (style)         => `${style} 클래스 담당 강사 구인`,
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

const CANDIDATE_NAMES = [
  '김지수', '이하은', '박서연', '최민지', '정유진', '한소희', '오채원',
  '윤수아', '임나연', '강지혜', '신예은', '류아영', '문소연', '배지현', '홍수빈',
  '권민서', '황채연', '송예린', '안지유', '조하늘',
];

const CERT_PHRASES = [
  'RYT 200 (Yoga Alliance)',
  'RYT 500 (Yoga Alliance)',
  'RYT 200 취득 후 명상지도사 1급 추가 수료',
  'RYT 500 및 어린이요가 지도사 자격 보유',
  '대한요가협회 자격증 1급',
  '한국요가연합회 지도자 자격증',
  '필라테스 지도자 과정 수료, RYT 200 병행 보유',
  '음요가(Yin Yoga) 전문 수료증',
  '아이엥가 요가 Introductory I 인증',
  '생활체육지도사 2급 (요가 전공)',
];

const CANDIDATE_INTRODUCTIONS = [
  (style, years, cert) =>
    `안녕하세요, ${style} 전문 강사입니다.\n\n보유 자격: ${cert}\n\n${years} 동안 다양한 연령대의 수강생을 지도하며 각 개인의 신체 조건과 목표에 맞는 맞춤 수업을 제공해 왔습니다. 체계적인 커리큘럼 구성과 세밀한 자세 교정이 강점이며, 초보자도 편안하게 시작할 수 있는 분위기를 만들기 위해 항상 노력합니다.\n\n정규 그룹 클래스 외에 개인 레슨과 기업 출강 경험도 보유하고 있습니다. 새로운 센터에서도 책임감 있게 함께 성장하고 싶습니다.`,
  (style, years, cert) =>
    `${style} 강사로 활동한 지 ${years}이 됐습니다.\n\n보유 자격: ${cert}\n\n수련자가 스스로 몸과 호흡을 느끼는 순간을 함께 만들어가는 것이 저의 수업 철학입니다. 단순히 동작을 따라 하는 수업이 아니라 호흡과 내면의 집중을 이끌어내는 수업을 지향합니다.\n\n밝고 따뜻한 성격으로 회원들과의 소통을 중요하게 생각하며, 수업 후 피드백을 꼼꼼히 반영해 지속적으로 발전하는 강사가 되려 노력합니다.`,
  (style, years, cert) =>
    `${style} 지도 경력 ${years}으로 여러 센터에서 근무한 경험이 있습니다.\n\n보유 자격: ${cert}\n\n초보자부터 심화 수련자까지 수준별 수업 설계가 가능하며, 수강생의 부상 예방을 최우선으로 하는 안전한 수업 환경을 만들기 위해 항상 주의를 기울입니다.\n\n요가를 통해 일상의 스트레스에서 벗어나 몸과 마음의 균형을 찾는 경험을 함께 나누고 싶습니다.`,
  (style, years, cert) =>
    `${style}와 명상을 접목한 수업을 전문으로 하는 강사입니다.\n\n보유 자격: ${cert}\n\n${years} 경력 동안 요가가 단순한 운동을 넘어 삶의 질을 높이는 도구가 될 수 있다는 것을 직접 목격해 왔습니다. 특히 현대인의 번아웃과 스트레스 회복에 도움이 되는 프로그램에 관심이 많습니다.`,
];

const PROPERTY_TYPES = ['임대', '임대', '임대', '매매', '양도'];

const PROPERTY_LOCATIONS = [
  '서울 강남구 역삼동', '서울 마포구 합정동', '서울 송파구 방이동', '서울 서초구 방배동',
  '서울 용산구 이태원동', '서울 강서구 화곡동', '서울 노원구 상계동',
  '경기 성남시 분당구', '경기 수원시 영통구', '경기 고양시 일산동구',
  '부산 해운대구 우동', '부산 수영구 광안동', '인천 연수구 송도동',
  '대구 수성구 범어동', '전북 전주시 완산구',
];

const PROPERTY_AREAS = [
  '33㎡ (약 10평)', '49㎡ (약 15평)', '66㎡ (약 20평)', '82㎡ (약 25평)',
  '99㎡ (약 30평)', '116㎡ (약 35평)', '132㎡ (약 40평)', '165㎡ (약 50평)',
];

const PROPERTY_PRICES = {
  임대: ['보증금 1,000만원 / 월세 90만원', '보증금 2,000만원 / 월세 130만원', '보증금 2,000만원 / 월세 160만원', '보증금 3,000만원 / 월세 200만원', '보증금 5,000만원 / 월세 280만원'],
  매매: ['매매가 5억원', '매매가 7억원', '매매가 9억원', '매매가 12억원'],
  양도: ['권리금 1,500만원', '권리금 2,500만원', '권리금 3,500만원', '권리금 5,000만원'],
};

const PROPERTY_TITLE_TEMPLATES = [
  (type, loc) => `${loc} 요가 스튜디오 ${type}`,
  (type, loc) => `${loc} 운영 중인 요가원 ${type}`,
  (type, loc) => `${loc} 인테리어 완료 스튜디오 ${type}`,
  (type, loc) => `${loc} 역세권 요가·필라테스 공간 ${type}`,
  (type, loc) => `${loc} 소규모 프리미엄 요가원 ${type}`,
];

const PROPERTY_DESCRIPTIONS = {
  임대: [
    (loc, area) => `${loc} 위치, ${area} 규모의 요가 스튜디오 임대 공간입니다. 요가용 탄성 바닥재 시공 완료, 대형 거울 설치 상태로 즉시 입주 가능합니다. 역세권 위치로 유동인구가 풍부하여 회원 모집에 유리합니다. 주차 가능, 엘리베이터 있음.`,
    (loc, area) => `${loc} 중심부 ${area} 공간을 임대합니다. 전 임차인이 요가원으로 사용하여 방음 시공과 바닥재가 이미 완비되어 있습니다. 채광이 우수하고 환기 시설이 잘 갖춰져 있습니다.`,
  ],
  매매: [
    (loc, area) => `${loc} ${area} 요가 스튜디오 건물 매매입니다. 현재 직접 운영 중이며 회원 약 100명 보유. 매매 시 기존 회원 인수 및 운영 노하우 공유 가능합니다.`,
  ],
  양도: [
    (loc, area) => `${loc} ${area} 운영 중인 요가원 양도합니다. 현재 등록 회원 80명 이상, 안정적인 월 수익 구조를 갖추고 있습니다. 인테리어, 기구 일체, 회원 명단 포함하여 양도합니다.`,
  ],
};

const PROPERTY_CONTACTS = [
  '010-1111-2222', '010-2222-3333', '010-3333-4444', '010-4444-5555',
  '010-5555-6666', '010-6666-7777', '010-7777-8888', '010-8888-9999',
];

const JOB_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=1200&auto=format&fit=crop&q=90',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&auto=format&fit=crop&q=90',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=1200&auto=format&fit=crop&q=90',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=90',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&auto=format&fit=crop&q=90',
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&auto=format&fit=crop&q=90',
];

const CANDIDATE_PHOTO_URLS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=90',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=90',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&auto=format&fit=crop&q=90',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=90',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=90',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=90',
];

const AUTHOR_EMAILS = [
  'yoga.teacher01@gmail.com', 'studio.owner.kr@naver.com', 'hatha.lover@gmail.com',
  'vinyasa.pro@naver.com', 'mindful.yoga@gmail.com', 'yogini2024@naver.com',
  'breathe.flow@gmail.com', 'zen.yoga.kr@naver.com', 'sunrise.asana@gmail.com',
  'lotus.instructor@naver.com',
];

const COMMUNITY_POOL = {
  자유게시판: [
    { title: '드디어 내 스튜디오 오픈했어요!', content: '4년간 강사 생활 후 드디어 제 작은 스튜디오를 오픈했습니다. 서울 마포구에 20평짜리 작은 공간인데, 제 이름을 걸고 처음 시작하는 거라 설레기도 하고 무섭기도 해요. 오픈 첫 달 회원 모집 중인데 생각보다 반응이 좋아서 다행입니다.' },
    { title: '요즘 20대 회원들 트렌드가 달라진 것 같아요', content: '강사 6년 하면서 느끼는 건데, 요즘 20대 회원들은 이전 세대랑 확실히 다르더라고요. 예전엔 다이어트 목적이 많았는데, 요즘은 번아웃이나 불안, 수면 개선 목적으로 오는 분들이 훨씬 많아요.' },
    { title: '강사 생활 10년. 가장 보람 있었던 순간들', content: '올해로 강사 생활 10년이 됐어요. 공황장애 있던 회원이 6개월 후 요가 덕분에 지하철 탈 수 있게 됐다고 했을 때, 70대 어르신이 처음으로 아기 자세를 완성했을 때 우셨던 기억이 납니다.' },
  ],
  정보공유: [
    { title: '요가 강사 4대 보험 가입 가이드 (프리랜서 vs 직원)', content: '주 15시간 이상 근무 시 4대 보험 의무 가입. 프리랜서 형태라면 3.3% 원천징수 후 지급받으며, 국민연금·건강보험은 지역가입자로 개인이 전액 납부합니다. 근무 형태가 애매한 경우 노동부 상담을 받아보세요.' },
    { title: '강사 프리랜서 세금 절약 방법 총정리', content: '요가 매트·블록 등 수업 도구 구입비, 워크숍·세미나 참가비, 자격증 취득 비용 모두 경비 처리 가능합니다. 연 수입 2,400만원 이하라면 단순경비율 신고가 유리할 수 있어요.' },
    { title: '요가원 POS·예약 시스템 1년 사용 후기', content: '회원 30명 미만은 네이버예약 + 구글시트, 30~100명은 클래스픽, 100명 이상은 짐마스터를 추천합니다.' },
  ],
  질문: [
    { title: '아쉬탕가 자격증 없어도 아쉬탕가 수업 할 수 있나요?', content: 'RYT 200 보유 중인 4년차 강사인데요. 개인적으로 아쉬탕가 수련도 2년 정도 해왔어요. 전문 자격증 없이도 요가원에서 아쉬탕가 수업을 담당할 수 있는 건지 궁금합니다.' },
    { title: '수업 음악 저작권 문제 어떻게 해결하고 계신가요?', content: '스튜디오에서 수업 중 음악 트는 것도 저작권료를 내야 한다고 들었는데요. 실제로 다들 어떻게 하고 계신가요? 저작권 걱정 없이 쓸 수 있는 음악 추천도 해주시면 감사하겠습니다.' },
    { title: '강사 자격증 갱신 주기와 방법이 궁금해요', content: 'RYT 200을 2021년에 취득했는데요. Yoga Alliance 기준으로 갱신 주기와 CEU 이수 방법이 궁금합니다.' },
  ],
};

// ── 유틸 ────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function pickRegion() {
  const sido = pick(SIDO_LIST);
  const sigunguList = Object.keys(REGIONS[sido]);
  if (sigunguList.length === 0) return { sido, sigungu: null, gu: null };
  const sigungu = pick(sigunguList);
  const guList = REGIONS[sido][sigungu];
  const gu = guList.length > 0 ? pick(guList) : null;
  return { sido, sigungu, gu };
}

function expiresAt(days = 30) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function randomViews(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── 생성 함수 ────────────────────────────────────────────────────

function makeJob() {
  const { sido, sigungu, gu } = pickRegion();
  const location = [sido, sigungu, gu].filter(Boolean).join(' ');
  const styleCount = Math.floor(Math.random() * 3) + 1;
  const yoga_styles_arr = pickN(YOGA_STYLES, styleCount);
  const style = yoga_styles_arr[0];
  const expEntry = pick(JOB_EXPERIENCE);
  const center = pick(CENTER_NAMES);
  return {
    title: pick(JOB_TITLE_TEMPLATES)(style, center),
    location,
    region_sido: sido,
    region_sigungu: sigungu,
    region_gu: gu,
    yoga_style: style,
    yoga_styles_arr,
    experience: expEntry.label,
    experience_num: expEntry.num,
    salary: pick(SALARIES),
    description: pick(JOB_DESCRIPTIONS)(style, location),
    image_url: pick(JOB_IMAGE_URLS),
    user_id: SEED_USER_ID,
    status: 'active',
    expires_at: expiresAt(30),
    is_dummy: true,
  };
}

function makeCandidate() {
  const { sido, sigungu, gu } = pickRegion();
  const location = [sido, sigungu, gu].filter(Boolean).join(' ');
  const styleCount = Math.floor(Math.random() * 3) + 1;
  const yoga_styles_arr = pickN(YOGA_STYLES, styleCount);
  const primaryStyle = yoga_styles_arr[0];
  const expEntry = pick(CANDIDATE_EXPERIENCE);
  const cert = pick(CERT_PHRASES);
  return {
    name: pick(CANDIDATE_NAMES),
    location,
    region_sido: sido,
    region_sigungu: sigungu,
    region_gu: gu,
    yoga_styles: yoga_styles_arr.join(', '),
    yoga_styles_arr,
    experience_years: expEntry.label,
    experience_num: expEntry.num,
    introduction: pick(CANDIDATE_INTRODUCTIONS)(primaryStyle, expEntry.label, cert),
    photo_url: pick(CANDIDATE_PHOTO_URLS),
    user_id: SEED_USER_ID,
    status: 'active',
    expires_at: expiresAt(30),
    is_dummy: true,
  };
}

function makeProperty() {
  const type = pick(PROPERTY_TYPES);
  const loc = pick(PROPERTY_LOCATIONS);
  const area = pick(PROPERTY_AREAS);
  return {
    title: pick(PROPERTY_TITLE_TEMPLATES)(type, loc),
    property_type: type,
    location: loc,
    area,
    price: pick(PROPERTY_PRICES[type]),
    description: pick(PROPERTY_DESCRIPTIONS[type])(loc, area),
    contact: pick(PROPERTY_CONTACTS),
    user_id: SEED_USER_ID,
    status: 'active',
  };
}

function makeCommunityPost() {
  const categories = ['자유게시판', '자유게시판', '정보공유', '정보공유', '질문'];
  const category = pick(categories);
  const template = pick(COMMUNITY_POOL[category]);
  return {
    title: template.title,
    content: template.content,
    category,
    user_id: SEED_USER_ID,
    author_email: pick(AUTHOR_EMAILS),
    views: randomViews(10, 400),
  };
}

// ── 라우트 핸들러 ────────────────────────────────────────────────

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  // 1단계: 만료된 더미 삭제 (expires_at 있는 테이블만)
  const now = new Date().toISOString();
  await Promise.all(
    TABLES_WITH_EXPIRY.map(t =>
      supabase.from(t).delete().eq('is_dummy', true).lt('expires_at', now)
    )
  );

  // 2단계: 현재 총량 계산
  const makeCountQuery = (table) => {
    const q = supabase.from(table).select('*', { count: 'exact', head: true }).eq('is_dummy', true);
    return SEED_USER_ID ? q.eq('user_id', SEED_USER_ID) : q;
  };

  const counts = await Promise.all([
    makeCountQuery('job'),
    makeCountQuery('candidate'),
    makeCountQuery('property'),
    makeCountQuery('community_posts'),
  ]);
  let [jobCount, candidateCount, propertyCount, postCount] = counts.map(r => r.count ?? 0);

  // 3단계: 이번 run에서 추가될 수 = 한도 초과분만큼 오래된 더미 삭제
  const toInsert = JOBS_PER_RUN + CANDIDATES_PER_RUN + PROPERTIES_PER_RUN + POSTS_PER_RUN;
  let total = jobCount + candidateCount + propertyCount + postCount;
  const deleted = {};

  if (total + toInsert > MAX_TOTAL) {
    const excess = total + toInsert - MAX_TOTAL;
    let remaining = excess;

    for (const { table, idCol } of TABLES_OLDEST_TRIM) {
      if (remaining <= 0) break;
      // is_dummy=true 인 오래된 레코드 ID만 가져와서 삭제
      const { data } = await supabase
        .from(table)
        .select(idCol)
        .eq('is_dummy', true)
        .order('created_at', { ascending: true })
        .limit(remaining);

      if (data && data.length > 0) {
        const ids = data.map(r => r[idCol]);
        await supabase.from(table).delete().eq('is_dummy', true).in(idCol, ids);
        deleted[table] = ids.length;
        remaining -= ids.length;
      }
    }

    // 재집계
    const recounts = await Promise.all([
      makeCountQuery('job'),
      makeCountQuery('candidate'),
      makeCountQuery('property'),
      makeCountQuery('community_posts'),
    ]);
    [jobCount, candidateCount, propertyCount, postCount] = recounts.map(r => r.count ?? 0);
    total = jobCount + candidateCount + propertyCount + postCount;
  }

  const summary = { jobCount, candidateCount, propertyCount, postCount, total, max: MAX_TOTAL };
  if (Object.keys(deleted).length > 0) summary.deleted = deleted;

  const results = {};

  const { data: jobs, error: jobErr } = await supabase
    .from('job').insert(Array.from({ length: JOBS_PER_RUN }, makeJob)).select('id, title');
  results.jobs = jobErr ? { error: jobErr.message } : jobs.map(j => j.title);

  const { data: candidates, error: candErr } = await supabase
    .from('candidate').insert(Array.from({ length: CANDIDATES_PER_RUN }, makeCandidate)).select('id, name');
  results.candidates = candErr ? { error: candErr.message } : candidates.map(c => c.name);

  const { data: properties, error: propErr } = await supabase
    .from('property').insert(Array.from({ length: PROPERTIES_PER_RUN }, makeProperty)).select('id, title');
  results.properties = propErr ? { error: propErr.message } : properties.map(p => p.title);

  const { data: posts, error: postErr } = await supabase
    .from('community_posts').insert(Array.from({ length: POSTS_PER_RUN }, makeCommunityPost)).select('id, title');
  results.posts = postErr ? { error: postErr.message } : posts.map(p => p.title);

  return Response.json({ ok: true, inserted: results, before: summary });
}
