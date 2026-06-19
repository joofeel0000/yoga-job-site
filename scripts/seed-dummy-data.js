/**
 * 요가 구인구직 플랫폼 더미 데이터 삽입 스크립트
 *
 * 환경변수 (GitHub Secrets → Actions env):
 *   SUPABASE_URL              : Supabase 프로젝트 URL
 *   SUPABASE_SERVICE_ROLE_KEY : service_role 키 (RLS 우회)
 *   SEED_USER_ID              : 더미 데이터 소유자 user_id (UUID) — 없으면 null
 *   SEED_JOBS_PER_RUN         : 구인 공고 삽입 수 (기본 3)
 *   SEED_CANDIDATES_PER_RUN   : 구직 이력서 삽입 수 (기본 2)
 *   SEED_PROPERTIES_PER_RUN   : 매물 정보 삽입 수 (기본 2)
 *   SEED_POSTS_PER_RUN        : 커뮤니티 게시글 삽입 수 (기본 3)
 *   MAX_TOTAL_SEED_ROWS       : 이 수를 넘으면 삽입 건너뜀 (기본 300)
 */

const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SEED_USER_ID = process.env.SEED_USER_ID || null;

const JOBS_PER_RUN       = parseInt(process.env.SEED_JOBS_PER_RUN       ?? '3', 10);
const CANDIDATES_PER_RUN = parseInt(process.env.SEED_CANDIDATES_PER_RUN ?? '2', 10);
const PROPERTIES_PER_RUN = parseInt(process.env.SEED_PROPERTIES_PER_RUN ?? '2', 10);
const POSTS_PER_RUN      = parseInt(process.env.SEED_POSTS_PER_RUN      ?? '3', 10);
const MAX_TOTAL          = parseInt(process.env.MAX_TOTAL_SEED_ROWS      ?? '300', 10);

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ─────────────────────────────────────────────
// 구인 공고 풀
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

// ─────────────────────────────────────────────
// 구직자 풀
// ─────────────────────────────────────────────

const CANDIDATE_NAMES = [
  '김지수', '이하은', '박서연', '최민지', '정유진', '한소희', '오채원',
  '윤수아', '임나연', '강지혜', '신예은', '류아영', '문소연', '배지현', '홍수빈',
  '권민서', '황채연', '송예린', '안지유', '조하늘',
];

const EXPERIENCE_YEARS = [
  '1년', '2년', '3년', '4년', '5년', '6년', '7년', '8년', '10년 이상', '신입',
];

// 자격증은 introduction 안에 자연스럽게 녹여서 별도 컬럼 불필요
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

// introduction: 자격증 + 경력 + 자기소개를 하나의 자연스러운 텍스트로 통합
const CANDIDATE_INTRODUCTIONS = [
  (style, years, cert) =>
    `안녕하세요, ${style} 전문 강사입니다.\n\n보유 자격: ${cert}\n\n${years} 동안 다양한 연령대의 수강생을 지도하며 각 개인의 신체 조건과 목표에 맞는 맞춤 수업을 제공해 왔습니다. 체계적인 커리큘럼 구성과 세밀한 자세 교정이 강점이며, 초보자도 편안하게 시작할 수 있는 분위기를 만들기 위해 항상 노력합니다.\n\n정규 그룹 클래스 외에 개인 레슨과 기업 출강 경험도 보유하고 있습니다. 새로운 센터에서도 책임감 있게 함께 성장하고 싶습니다.`,
  (style, years, cert) =>
    `${style} 강사로 활동한 지 ${years}이 됐습니다.\n\n보유 자격: ${cert}\n\n수련자가 스스로 몸과 호흡을 느끼는 순간을 함께 만들어가는 것이 저의 수업 철학입니다. 단순히 동작을 따라 하는 수업이 아니라 호흡과 내면의 집중을 이끌어내는 수업을 지향합니다.\n\n밝고 따뜻한 성격으로 회원들과의 소통을 중요하게 생각하며, 수업 후 피드백을 꼼꼼히 반영해 지속적으로 발전하는 강사가 되려 노력합니다.`,
  (style, years, cert) =>
    `${style} 지도 경력 ${years}으로 여러 센터에서 근무한 경험이 있습니다.\n\n보유 자격: ${cert}\n\n초보자부터 심화 수련자까지 수준별 수업 설계가 가능하며, 수강생의 부상 예방을 최우선으로 하는 안전한 수업 환경을 만들기 위해 항상 주의를 기울입니다.\n\n요가를 통해 일상의 스트레스에서 벗어나 몸과 마음의 균형을 찾는 경험을 함께 나누고 싶습니다. 장기적으로 함께할 수 있는 센터를 찾고 있습니다.`,
  (style, years, cert) =>
    `${style}와 명상을 접목한 수업을 전문으로 하는 강사입니다.\n\n보유 자격: ${cert}\n\n${years} 경력 동안 요가가 단순한 운동을 넘어 삶의 질을 높이는 도구가 될 수 있다는 것을 직접 목격해 왔습니다. 특히 현대인의 번아웃과 스트레스 회복에 도움이 되는 프로그램에 관심이 많습니다.\n\n소규모 워크숍과 리트릿 프로그램 기획·진행 경험도 있으며, 수강생 개개인의 성장을 세심하게 살피는 강사가 되고자 합니다.`,
  (style, years, cert) =>
    `처음 요가를 만난 이후 ${years} 동안 ${style}에 전념해 왔습니다.\n\n보유 자격: ${cert}\n\n정규 수업 외에도 지역 커뮤니티 센터 출강, 기업 웰니스 프로그램, 온라인 클래스 운영 등 다양한 환경에서 수업을 진행한 경험이 있습니다.\n\n유연성과 근력 강화를 균형 있게 다루는 수업 스타일을 추구하며, 수강생이 수업 후 몸이 가벼워지는 느낌을 받아갈 수 있도록 최선을 다합니다.`,
];

// ─────────────────────────────────────────────
// 매물 정보 풀
// ─────────────────────────────────────────────

const PROPERTY_TYPES = ['임대', '임대', '임대', '매매', '양도']; // 임대 비율 높게

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

const PROPERTY_RENT_PRICES = [
  '보증금 1,000만원 / 월세 90만원',
  '보증금 2,000만원 / 월세 130만원',
  '보증금 2,000만원 / 월세 160만원',
  '보증금 3,000만원 / 월세 200만원',
  '보증금 3,000만원 / 월세 240만원',
  '보증금 5,000만원 / 월세 280만원',
];

const PROPERTY_SALE_PRICES = [
  '매매가 5억원', '매매가 7억원', '매매가 9억원', '매매가 12억원',
];

const PROPERTY_TRANSFER_PRICES = [
  '권리금 1,500만원', '권리금 2,500만원', '권리금 3,500만원', '권리금 5,000만원',
];

const PROPERTY_TITLE_TEMPLATES = [
  (type, loc) => `${loc} 요가 스튜디오 ${type}`,
  (type, loc) => `${loc} 운영 중인 요가원 ${type}`,
  (type, loc) => `${loc} 인테리어 완료 스튜디오 ${type}`,
  (type, loc) => `${loc} 역세권 요가·필라테스 공간 ${type}`,
  (type, loc) => `${loc} 소규모 프리미엄 요가원 ${type}`,
  (type, loc) => `${loc} 신축 상가 스튜디오 ${type}`,
];

const PROPERTY_RENT_DESCRIPTIONS = [
  (loc, area) =>
    `${loc} 위치, ${area} 규모의 요가 스튜디오 임대 공간입니다. 요가용 탄성 바닥재 시공 완료, 대형 거울 설치 상태로 즉시 입주 가능합니다. 역세권 위치로 유동인구가 풍부하여 회원 모집에 유리합니다. 주차 가능, 엘리베이터 있음.`,
  (loc, area) =>
    `${loc} 중심부 ${area} 공간을 임대합니다. 전 임차인이 요가원으로 사용하여 방음 시공과 바닥재가 이미 완비되어 있습니다. 별도 인테리어 비용 절감 가능. 채광이 우수하고 환기 시설이 잘 갖춰져 있습니다.`,
  (loc, area) =>
    `${loc} 신규 상가 건물 내 ${area} 스튜디오 임대합니다. 2023년 준공 신축 건물로 시설이 깨끗합니다. 주변 아파트 단지 밀집 지역으로 안정적인 수요가 예상됩니다. 문의 시 상세 도면 제공 가능합니다.`,
];

const PROPERTY_SALE_DESCRIPTIONS = [
  (loc, area) =>
    `${loc} ${area} 요가 스튜디오 건물 매매입니다. 1층 단독 건물로 독립적인 운영이 가능합니다. 현재 직접 운영 중이며 회원 약 100명 보유. 매매 시 기존 회원 인수 및 운영 노하우 공유 가능합니다. 융자 없는 깨끗한 물건입니다.`,
  (loc, area) =>
    `${loc} ${area} 상가 요가원 매매합니다. 주변 대단지 아파트와 인접해 있어 회원 수급이 안정적입니다. 주차 여유롭고 1층 접근성 좋음. 실거주 겸 수익형 부동산으로 활용 가능합니다.`,
];

const PROPERTY_TRANSFER_DESCRIPTIONS = [
  (loc, area) =>
    `${loc} ${area} 운영 중인 요가원 양도합니다. 현재 등록 회원 80명 이상, 안정적인 월 수익 구조를 갖추고 있습니다. 인테리어, 기구 일체, 회원 명단 포함하여 양도합니다. 개인 사정으로 인한 양도이며 성실히 인수인계 해드립니다.`,
  (loc, area) =>
    `${loc} ${area} 요가원 권리금 양도합니다. 4년 운영으로 지역 내 인지도가 형성되어 있으며 재등록률이 높습니다. 네이버 플레이스 리뷰 100건 이상 보유. 임대차 계약 잔여 기간 1년 6개월, 건물주 동의 완료.`,
];

const PROPERTY_CONTACTS = [
  '010-1111-2222', '010-2222-3333', '010-3333-4444', '010-4444-5555',
  '010-5555-6666', '010-6666-7777', '010-7777-8888', '010-8888-9999',
  '010-9999-1111', '010-1234-5678',
];

// ─────────────────────────────────────────────
// 커뮤니티 게시글 풀
// ─────────────────────────────────────────────

const AUTHOR_EMAILS = [
  'yoga.teacher01@gmail.com', 'studio.owner.kr@naver.com', 'hatha.lover@gmail.com',
  'vinyasa.pro@naver.com', 'mindful.yoga@gmail.com', 'yogini2024@naver.com',
  'breathe.flow@gmail.com', 'zen.yoga.kr@naver.com', 'sunrise.asana@gmail.com',
  'lotus.instructor@naver.com', 'morning.flow@gmail.com', 'yin.yang.yoga@naver.com',
];

// 카테고리별 게시글 템플릿 풀
const COMMUNITY_POOL = {
  자유게시판: [
    {
      title: '드디어 내 스튜디오 오픈했어요! 🎉',
      content: '안녕하세요! 4년간 강사 생활 후 드디어 제 작은 스튜디오를 오픈했습니다.\n\n서울 마포구에 20평짜리 작은 공간인데, 제 이름을 걸고 처음 시작하는 거라 설레기도 하고 무섭기도 해요.\n\n오픈 첫 달 회원 모집 중인데 생각보다 반응이 좋아서 다행입니다. 여러 선배 강사분들 덕분에 이 커뮤니티에서 많은 정보를 얻었어요. 감사합니다!\n\n앞으로도 잘 부탁드려요 😊',
    },
    {
      title: '요가 수업 중 웃겼던 에피소드 공유해요 ㅋㅋ',
      content: '오늘 수업 중에 너무 웃긴 일이 있었어요. 공유하고 싶어서요 ㅋㅋㅋ\n\n수련 중에 갑자기 회원 한 분이 방귀를 뀌셨는데 (비라바드라사나 포즈 중이었어요), 본인이 너무 당황해서 "죄송해요, 요가가 너무 효과가 좋아서..." 라고 하시는 바람에 온 수련실이 웃음바다가 됐어요 ㅋㅋ\n\n항상 진지하기만 한 분이셨는데 그 이후로 수업 분위기가 훨씬 밝아졌어요.\n\n요가 강사들만 아는 이런 순간들 있잖아요. 여러분들 경험도 나눠주세요!',
    },
    {
      title: '요즘 20대 회원들 트렌드가 달라진 것 같아요',
      content: '강사 6년 하면서 느끼는 건데, 요즘 20대 회원들은 이전 세대랑 확실히 다르더라고요.\n\n예전엔 다이어트 목적이 많았는데, 요즘은 "번아웃 때문에", "불안이 심해서", "수면을 개선하고 싶어서" 오는 분들이 훨씬 많아요.\n\n명상과 호흡법에 대한 관심도 굉장히 높고, SNS에서 요가를 미적으로 소비하다가 직접 수련하러 오는 분들도 많아요.\n\n여러분 센터도 비슷한가요? 요즘 회원 트렌드 어떤지 궁금해요.',
    },
    {
      title: '부산에서 서울로 이직 고민 중... 현실적인 조언 부탁드려요',
      content: '현재 부산에서 5년째 강사를 하고 있는데요, 서울로의 이직을 진지하게 고민 중이에요.\n\n부산에서는 나름 자리를 잡아서 수입도 안정적인 편인데, 더 큰 시장에서 도전해보고 싶기도 하고...\n\n서울 강사 생활 현실이 어떤지 경험자분들 이야기가 듣고 싶어요. 월세 부담, 경쟁 강도, 수입 차이 등 솔직하게 말씀해주시면 정말 감사하겠습니다.',
    },
    {
      title: '강사 생활 10년. 가장 보람 있었던 순간들',
      content: '올해로 강사 생활 10년이 됐어요. 회고해보고 싶어서 글 남겨요.\n\n가장 보람 있었던 순간들:\n\n1. 공황장애 있던 회원이 6개월 후 "요가 덕분에 지하철 탈 수 있게 됐어요"라고 했을 때\n2. 70대 어르신이 처음으로 아기 자세를 완성했을 때 우셨던 기억\n3. 임산부 회원이 출산 후 아기를 안고 인사하러 왔을 때\n\n돈이 많지 않아도 이 일을 계속하는 이유가 바로 이런 순간들이에요. 여러분들의 보람 순간도 나눠주세요.',
    },
    {
      title: '요즘 핫한 요가 스타일이 뭔가요? 트렌드 공유해요',
      content: '올해 들어 특정 요가 스타일이 갑자기 문의가 많아졌다거나, 반대로 줄었다거나 하는 변화 느끼시는 분 있나요?\n\n저는 최근 소마틱 요가랑 트라우마 인폼드 요가에 대한 문의가 부쩍 늘었어요. 2~3년 전만 해도 이름도 생소했던 분야인데.\n\n그 외에도 파워요가, 아크로요가, 에어리얼요가 등 다양한 스타일들 중 요즘 뭐가 뜨고 있는지 서로 공유해봐요!',
    },
  ],

  정보공유: [
    {
      title: '요가 강사 4대 보험 가입 가이드 (프리랜서 vs 직원)',
      content: '요가 강사의 4대 보험 가입에 대해 정리해봤어요. 많이들 헷갈려하시는 부분이라서요.\n\n【직원 형태 (사업주가 가입)】\n- 주 15시간 이상 근무 시 4대 보험 의무 가입\n- 사업주와 근로자가 각각 절반씩 부담 (국민연금, 건강보험)\n- 고용보험: 사업주 부담 비율이 높음\n\n【프리랜서 형태】\n- 3.3% 원천징수 후 지급받는 방식\n- 국민연금, 건강보험은 지역가입자로 개인이 전액 납부\n- 고용보험은 예술인 특례로 가입 가능 (월 보수 80만원 이상)\n\n【중요한 팁】\n프리랜서 계약이라도 실질적으로 근로자성이 인정되면 4대 보험 소급 가입을 요구할 수 있습니다. 근무 형태가 애매한 경우 노동부 상담을 받아보세요.',
    },
    {
      title: '강사 프리랜서 세금 절약 방법 총정리',
      content: '요가 강사로서 절세할 수 있는 방법들을 공유해요.\n\n【경비 처리 가능 항목】\n✔ 요가 매트, 블록, 스트랩 등 수업 도구 구입비\n✔ 요가 워크숍, 세미나 참가비 및 교통비\n✔ 자격증 취득 비용\n✔ 수업복, 레깅스 등 유니폼 (수업 전용으로 사용 시)\n✔ 유튜브 구독, 앱 구독료 (수업 관련)\n✔ 홈스튜디오 임대료 일부 (재택근무 비율만큼)\n\n【홈택스 단순경비율】\n소득 규모가 작다면 단순경비율 적용이 유리할 수 있어요. 요가 강사 업종코드 (940306)로 확인하세요.\n\n【연간 수입 구간별 추천 신고 방법】\n- 2,400만원 이하: 단순경비율 신고 가능\n- 2,400만원~7,500만원: 기준경비율 또는 간편장부\n- 7,500만원 이상: 복식부기 의무',
    },
    {
      title: '온라인 요가 클래스 운영 경험 공유 (줌 vs 유튜브 vs 인스타)',
      content: '코로나 이후 온라인 수업을 계속 병행하고 있는데, 플랫폼별 장단점을 공유해볼게요.\n\n【줌(Zoom) 라이브 클래스】\n✅ 장점: 실시간 피드백 가능, 참가자 얼굴 보며 자세 교정\n❌ 단점: 참가자 수 제한 (무료 40분), 유료 구독 필요\n적합한 수업: 소규모 그룹, 개인 레슨\n\n【유튜브 라이브 & VOD】\n✅ 장점: 무제한 참여자, 콘텐츠 자산화 가능\n❌ 단점: 즉각 수익화 어려움, 구독자 확보가 관건\n적합한 수업: 브랜딩 목적, 무료 콘텐츠\n\n【인스타그램 라이브】\n✅ 장점: 팔로워와 즉각 소통, 별도 설치 불필요\n❌ 단점: 화질 한계, 저장 기간 짧음\n적합한 수업: 짧은 모닝 루틴, 15~30분 클래스\n\n저는 현재 줌으로 유료 소그룹 운영 + 유튜브로 무료 콘텐츠 제공하는 투트랙을 쓰고 있어요.',
    },
    {
      title: '요가원 POS·예약 시스템 1년 사용 후기 총정리',
      content: '지난 1년간 다양한 요가원 관리 프로그램을 써본 경험을 공유해요.\n\n【네이버 예약】\n무료로 시작하기에 좋고 네이버 플레이스와 연동이 강점입니다. 복잡한 회원권 관리나 출석 체크는 기능이 부족해요.\n\n【클래스픽】\n요가·필라테스 스튜디오 특화. 회원권 종류 설정이 자유롭고 카카오 알림톡 자동 발송이 편리합니다. 월 3~7만원대.\n\n【짐마스터(Gymmaster)】\n다기능 운동시설 관리 솔루션. 기능이 많아서 처음엔 배우는 데 시간이 걸리지만 익숙해지면 편합니다. 규모 있는 센터에 적합.\n\n【자체 구글 시트】\n비용 절감 최고. 단점은 자동화가 안 된다는 것. 회원 10명 이하 소규모라면 충분합니다.\n\n결론: 회원 30명 미만은 네이버예약 + 구글시트, 30~100명은 클래스픽, 100명 이상은 짐마스터 추천합니다.',
    },
    {
      title: '요가 강사 상해보험 & 배상책임보험 가입 가이드',
      content: '강사로 일하면서 꼭 챙겨야 하는 보험 두 가지를 정리해봤어요.\n\n【강사 본인 상해보험】\n수업 중 강사 본인이 다쳤을 때를 대비하는 보험입니다.\n- 추천 상품: 실손보험 (이미 가입된 경우 확인), 스포츠 종목 추가 특약\n- 주의: 일반 실손보험은 직업성 상해를 면책 처리하는 경우가 있으니 약관 확인 필수\n\n【영업배상책임보험】\n수업 중 회원이 다쳤을 때 배상을 커버하는 보험입니다.\n- 요가·필라테스 스튜디오는 필수 가입 권장\n- 연 보험료: 약 20만~50만원 수준 (보상 한도에 따라 다름)\n- 가입 가능 보험사: 현대해상, DB손해보험, KB손해보험 등\n\n특히 키즈요가, 에어리얼요가처럼 부상 위험이 높은 수업을 하신다면 반드시 가입하시길 권합니다.',
    },
  ],

  질문: [
    {
      title: '아쉬탕가 자격증 없어도 아쉬탕가 수업 할 수 있나요?',
      content: '안녕하세요! 현재 RYT 200 보유 중인 4년차 강사인데요.\n\nRYT 200 교육 과정에서 아쉬탕가 모듈을 일부 배웠고, 개인적으로 아쉬탕가 수련도 2년 정도 해왔어요.\n\n그런데 아쉬탕가 전문 자격증 없이도 요가원에서 아쉬탕가 수업을 담당할 수 있는 건가요? 법적으로 문제가 있는지, 또 현실적으로 요가원에서 어떻게 보는지 궁금해요.\n\n아쉬탕가 수업 경험 있으신 분들 조언 부탁드립니다!',
    },
    {
      title: '회원이 수업 중 다쳤을 때 강사 책임 범위가 어떻게 되나요?',
      content: '어제 수업 중에 회원 한 분이 발목을 삐끗하는 사고가 있었어요. 다행히 가벼운 염좌라 큰 문제는 없었지만, 만약 더 심각한 부상이었다면 강사로서 어떤 책임을 지게 되는지 갑자기 궁금해졌어요.\n\n1. 강사의 법적 책임 범위는 어디까지인가요?\n2. 수업 전 면책 동의서를 받으면 보호가 되나요?\n3. 배상책임보험이 실제로 도움이 되나요?\n\n비슷한 경험 있으신 분, 또는 관련 지식 있으신 분 조언 부탁드립니다.',
    },
    {
      title: '요가원 SNS 계정, 개인 강사 계정과 별도로 운영해야 할까요?',
      content: '이제 막 소규모 스튜디오를 오픈했는데 SNS 운영 방식에 대해 고민이 있어요.\n\n지금은 개인 인스타 계정(@개인강사아이디)만 있는데, 스튜디오 계정을 따로 만들어야 할지 고민이에요.\n\n개인 계정으로 계속 가면:\n- 팔로워를 처음부터 새로 모아야 할 필요 없음\n- 강사 개인의 브랜드와 스튜디오가 혼재됨\n\n별도 계정으로 가면:\n- 스튜디오 이전/폐업 시 유연하게 대응 가능\n- 초기에 팔로워 0에서 시작해야 함\n\n어떻게 운영하시나요? 실제 운영하면서 느낀 점 공유해주세요!',
    },
    {
      title: '수업 음악 저작권 문제 어떻게 해결하고 계신가요?',
      content: '스튜디오에서 수업 중 음악 트는 것도 저작권료를 내야 한다고 들었는데요.\n\n한국음악저작권협회(KOMCA)에 신고하고 사용료를 내야 하는 건지, 유튜브 뮤직이나 스포티파이 같은 스트리밍 서비스로 틀면 괜찮은 건지 잘 모르겠어요.\n\n실제로 다들 어떻게 하고 계신가요? 저작권 걱정 없이 쓸 수 있는 음악 추천도 해주시면 감사하겠습니다!',
    },
    {
      title: '강사 자격증 갱신 주기와 방법이 궁금해요',
      content: 'RYT 200을 2021년에 취득했는데요, 갱신이 필요하다고 들었는데 정확히 어떻게 해야 하는지 모르겠어요.\n\nYoga Alliance 기준으로:\n1. 갱신 주기가 몇 년마다인가요?\n2. 갱신을 위한 CEU(Continuing Education Units)는 어디서 이수할 수 있나요?\n3. 갱신하지 않으면 어떻게 되나요? 자격증이 실제로 취소되나요?\n\n국내 협회 자격증 (대한요가협회 등)은 또 별도로 갱신 절차가 다른가요?\n\n경험자분들 알려주세요!',
    },
  ],
};

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

function randomViews(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
  const yoga_styles = pickN(YOGA_STYLES, styleCount).join(', '); // 종류명만
  const primaryStyle = yoga_styles.split(',')[0].trim();
  const years = pick(EXPERIENCE_YEARS);
  const cert = pick(CERT_PHRASES);
  return {
    id: randomUUID(),
    name: pick(CANDIDATE_NAMES),
    location: pick(LOCATIONS),
    yoga_styles,                                                        // 예: "하타요가, 빈야사"
    experience_years: years,                                            // 예: "3년"
    introduction: pick(CANDIDATE_INTRODUCTIONS)(primaryStyle, years, cert), // 자격증+경력+자기소개 통합
    user_id: SEED_USER_ID,
    status: 'active',
    expires_at: expiresAt(30),
  };
}

function makeProperty() {
  const type = pick(PROPERTY_TYPES);
  const loc = pick(PROPERTY_LOCATIONS);
  const area = pick(PROPERTY_AREAS);

  let price;
  let description;
  if (type === '임대') {
    price = pick(PROPERTY_RENT_PRICES);
    description = pick(PROPERTY_RENT_DESCRIPTIONS)(loc, area);
  } else if (type === '매매') {
    price = pick(PROPERTY_SALE_PRICES);
    description = pick(PROPERTY_SALE_DESCRIPTIONS)(loc, area);
  } else {
    price = pick(PROPERTY_TRANSFER_PRICES);
    description = pick(PROPERTY_TRANSFER_DESCRIPTIONS)(loc, area);
  }

  return {
    title: pick(PROPERTY_TITLE_TEMPLATES)(type, loc),
    property_type: type,
    location: loc,
    area,
    price,
    description,
    contact: pick(PROPERTY_CONTACTS),
    user_id: SEED_USER_ID,
    status: 'active',
  };
}

function makeCommunityPost() {
  const categories = ['자유게시판', '자유게시판', '정보공유', '정보공유', '질문']; // 비율 조정
  const category = pick(categories);
  const pool = COMMUNITY_POOL[category];
  const template = pick(pool);

  return {
    title: template.title,
    content: template.content,
    category,
    user_id: SEED_USER_ID,
    author_email: pick(AUTHOR_EMAILS),
    views: randomViews(10, 400),
  };
}

// ─────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────

async function main() {
  console.log(`🌿 더미 데이터 삽입 시작 (${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })})`);

  // 현재 총 더미 행 수 확인
  const makeCountQuery = (table) => SEED_USER_ID
    ? supabase.from(table).select('*', { count: 'exact', head: true }).eq('user_id', SEED_USER_ID)
    : supabase.from(table).select('*', { count: 'exact', head: true });

  const [
    { count: jobCount },
    { count: candidateCount },
    { count: propertyCount },
    { count: postCount },
  ] = await Promise.all([
    makeCountQuery('job'),
    makeCountQuery('candidate'),
    makeCountQuery('property'),
    makeCountQuery('community_posts'),
  ]);

  const total = (jobCount ?? 0) + (candidateCount ?? 0) + (propertyCount ?? 0) + (postCount ?? 0);

  console.log(
    `📊 현재 더미 데이터: ` +
    `구인 ${jobCount}개 / 구직 ${candidateCount}개 / 매물 ${propertyCount}개 / 게시글 ${postCount}개` +
    ` (합계 ${total}/${MAX_TOTAL})`
  );

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

  // 매물 정보 삽입
  const properties = Array.from({ length: PROPERTIES_PER_RUN }, makeProperty);
  const { data: insertedProperties, error: propErr } = await supabase.from('property').insert(properties).select('id, title, property_type');
  if (propErr) {
    console.error('❌ 매물 정보 삽입 실패:', propErr.message);
    process.exitCode = 1;
  } else {
    console.log(`✅ 매물 정보 ${insertedProperties.length}개 삽입 완료:`);
    insertedProperties.forEach(p => console.log(`   • [${p.property_type}] ${p.title} (${p.id})`));
  }

  // 커뮤니티 게시글 삽입
  const posts = Array.from({ length: POSTS_PER_RUN }, makeCommunityPost);
  const { data: insertedPosts, error: postErr } = await supabase.from('community_posts').insert(posts).select('id, title, category');
  if (postErr) {
    console.error('❌ 커뮤니티 게시글 삽입 실패:', postErr.message);
    process.exitCode = 1;
  } else {
    console.log(`✅ 커뮤니티 게시글 ${insertedPosts.length}개 삽입 완료:`);
    insertedPosts.forEach(p => console.log(`   • [${p.category}] ${p.title} (${p.id})`));
  }

  console.log('🏁 완료');
}

main().catch(err => {
  console.error('❌ 스크립트 오류:', err);
  process.exit(1);
});
