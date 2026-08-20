/**
 * scoreMatch — job과 candidate의 매칭 점수(0~100)와 이유를 반환
 *
 * 점수 구성:
 *   지역   sido 일치 +30, sigungu까지 일치 +20 (최대 50)
 *   스타일 yoga_styles_arr 교집합 1개당 +20 (최대 40)
 *   경력   job.experience_num null(무관) 또는 candidate >= job → +10
 */
export function scoreMatch(job, candidate) {
  const reasons = [];
  let score = 0;

  // 지역
  if (job.region_sido && candidate.region_sido && job.region_sido === candidate.region_sido) {
    score += 30;
    if (job.region_sigungu && candidate.region_sigungu && job.region_sigungu === candidate.region_sigungu) {
      score += 20;
      reasons.push(`지역 일치 (${job.region_sido} ${job.region_sigungu})`);
    } else {
      reasons.push(`시도 일치 (${job.region_sido})`);
    }
  }

  // 스타일
  const jobStyles = Array.isArray(job.yoga_styles_arr) ? job.yoga_styles_arr : [];
  const candStyles = Array.isArray(candidate.yoga_styles_arr) ? candidate.yoga_styles_arr : [];
  const intersection = jobStyles.filter(s => candStyles.includes(s));
  if (intersection.length > 0) {
    const styleScore = Math.min(intersection.length * 20, 40);
    score += styleScore;
    reasons.push(`스타일 일치 (${intersection.join(', ')})`);
  }

  // 경력
  if (job.experience_num === null) {
    score += 10;
    reasons.push('경력 무관');
  } else if (candidate.experience_num !== null && candidate.experience_num >= job.experience_num) {
    score += 10;
    reasons.push(`경력 충족 (${candidate.experience_num}년 ≥ ${job.experience_num}년)`);
  }

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
