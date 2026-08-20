/**
 * scoreMatch — job과 candidate의 매칭 점수(0~100)와 이유를 반환
 *
 * 최종점수 = (스타일점수 + 경력점수 + 20) × 지역배수
 *
 *   지역배수  같은 시도 + 같은 시군구  → ×1.0  (최대 100)
 *             그 외                  → ×0    (매칭 제외, 구는 비교 안 함)
 *   스타일    교집합 1개당 +30, 최대 60
 *   경력      job.experience_num null(무관) → +20
 *             candidate >= job             → +20
 *             미달                         →  0
 */

function getRegionMultiplier(job, candidate) {
  return (
    job.region_sido && candidate.region_sido && job.region_sido === candidate.region_sido &&
    job.region_sigungu && candidate.region_sigungu && job.region_sigungu === candidate.region_sigungu
  ) ? 1.0 : 0;
}

export function scoreMatch(job, candidate) {
  const reasons = [];

  // 지역 배수
  const multiplier = getRegionMultiplier(job, candidate);

  const jSido = job.region_sido;
  const jSigungu = job.region_sigungu;
  const cSido = candidate.region_sido;
  const cSigungu = candidate.region_sigungu;

  if (multiplier === 1.0) {
    reasons.push(`같은 지역 (${jSido} ${jSigungu})`);
  }

  // 스타일
  const jobStyles = Array.isArray(job.yoga_styles_arr) ? job.yoga_styles_arr : [];
  const candStyles = Array.isArray(candidate.yoga_styles_arr) ? candidate.yoga_styles_arr : [];
  const intersection = jobStyles.filter(s => candStyles.includes(s));
  const styleScore = Math.min(intersection.length * 30, 60);
  if (intersection.length > 0) {
    reasons.push(`스타일 일치 (${intersection.join(', ')})`);
  }

  // 경력
  let expScore = 0;
  if (job.experience_num === null) {
    expScore = 20;
    reasons.push('경력 무관');
  } else if (candidate.experience_num !== null && candidate.experience_num >= job.experience_num) {
    expScore = 20;
    reasons.push(`경력 충족 (${candidate.experience_num}년 ≥ ${job.experience_num}년)`);
  }

  const score = Math.round((styleScore + expScore + 20) * multiplier);

  return { score, reasons };
}

/**
 * topMatches — 기준 아이템과 후보 배열을 받아 점수순 상위 N개 반환
 *
 * @param {object}   base       scoreMatch의 첫 번째 인자 (job 또는 candidate)
 * @param {object[]} candidates scoreMatch의 두 번째 인자 배열
 * @param {Function} scoreFn    (base, item) => { score, reasons } — 기본값 scoreMatch
 * @param {number}   n          반환할 최대 개수 (기본 10)
 * @returns {{ item: object, score: number, reasons: string[] }[]}
 */
export function topMatches(base, candidates, scoreFn = scoreMatch, n = 10) {
  return candidates
    .map(item => ({ item, ...scoreFn(base, item) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}
