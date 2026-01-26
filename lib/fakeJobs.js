export function generateRandomJob() {
  const titles=["저녁 빈야사 요가 강사 구인","주말 필라테스 그룹 레슨 강사 모집","하타요가 초급반 강사 모집","요가테라피 강사 구인","임산부 요가 강사 채용","소규모 요가 클래스 강사 모집"];
  const locations=["서울 강남구","서울 서초구","서울 송파구","부산 해운대구","인천 남동구","대구 수성구"];
  const yogaStyles=["빈야사","하타","아쉬탕가","요가테라피","필라테스","플라잉 요가"];
  const experiences=["무관","1년 이상","2년 이상","3~5년"];
  const salaries=["시급 3~4만원","시급 4~5만원","월급 200~250만원","월급 250~300만원"];

  return {
    title: titles[Math.random()*titles.length|0],
    location: locations[Math.random()*locations.length|0],
    yoga_style: yogaStyles[Math.random()*yogaStyles.length|0],
    experience: experiences[Math.random()*experiences.length|0],
    salary: salaries[Math.random()*salaries.length|0],
    description: "우리 센터는 아늑하고 따뜻한 분위기의 수련 공간을 제공하며, 회원들과 함께 성장할 강사님을 찾습니다."
  };
}
