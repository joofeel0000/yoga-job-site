'use client';

import Link from 'next/link';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-base font-bold text-[#23211C] mb-3">{title}</h2>
    <div className="text-sm text-[#4B4840] leading-[1.85] space-y-2">{children}</div>
  </div>
);

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F4F1E9]">
      <div className="max-w-[780px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link href="/" className="text-sm text-[#76705F] hover:text-[#23211C] font-medium mb-6 inline-block transition-colors">
          ← 홈으로
        </Link>

        <div className="bg-white rounded-2xl border border-[#E3DDD0] shadow-sm p-6 sm:p-10">
          <h1 className="text-2xl font-extrabold text-[#23211C] tracking-[-0.02em] mb-1">개인정보처리방침</h1>
          <p className="text-sm text-[#9A9382] mb-8">시행일: 2026년 1월 1일 · 최종 개정: 2026년 7월 1일</p>

          <p className="text-sm text-[#4B4840] leading-[1.85] mb-8">
            온울(주)(이하 "회사")는 요가잡(yogajob.xyz) 서비스 운영과 관련하여 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 및 관련 법령을 준수합니다. 본 방침을 통해 수집하는 개인정보의 항목, 수집 목적, 보유 기간, 처리 방법 등을 안내합니다.
          </p>

          <Section title="제1조 (수집하는 개인정보 항목)">
            <p>회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F4F1E9]">
                    <th className="text-left p-3 border border-[#E3DDD0] font-semibold text-[#23211C]">구분</th>
                    <th className="text-left p-3 border border-[#E3DDD0] font-semibold text-[#23211C]">수집 항목</th>
                    <th className="text-left p-3 border border-[#E3DDD0] font-semibold text-[#23211C]">수집 방법</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-[#E3DDD0]">필수</td>
                    <td className="p-3 border border-[#E3DDD0]">이메일 주소, 비밀번호</td>
                    <td className="p-3 border border-[#E3DDD0]">회원가입 시</td>
                  </tr>
                  <tr className="bg-[#FAFAF8]">
                    <td className="p-3 border border-[#E3DDD0]">선택</td>
                    <td className="p-3 border border-[#E3DDD0]">이름, 프로필 사진</td>
                    <td className="p-3 border border-[#E3DDD0]">프로필 설정 시</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-[#E3DDD0]">자동 수집</td>
                    <td className="p-3 border border-[#E3DDD0]">접속 IP, 서비스 이용 기록, 쿠키</td>
                    <td className="p-3 border border-[#E3DDD0]">서비스 이용 중</td>
                  </tr>
                  <tr className="bg-[#FAFAF8]">
                    <td className="p-3 border border-[#E3DDD0]">게시물</td>
                    <td className="p-3 border border-[#E3DDD0]">이름, 지역, 경력, 요가 스타일 등 이용자가 직접 입력한 정보</td>
                    <td className="p-3 border border-[#E3DDD0]">구인공고·이력서 등록 시</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="제2조 (개인정보 수집 목적)">
            <p>회사는 수집한 개인정보를 다음 목적으로만 이용합니다.</p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>회원 가입·관리 및 본인 확인</li>
              <li>구인구직 서비스 제공 (공고·이력서 등록, 지원·연락 기능)</li>
              <li>서비스 운영·개선 및 신규 기능 개발</li>
              <li>고객 문의 응대 및 민원 처리</li>
              <li>서비스 이용 통계 분석 (비식별화 처리 후 활용)</li>
              <li>광고 서비스 제공 및 통계 산출</li>
              <li>법령상 의무 이행</li>
            </ul>
          </Section>

          <Section title="제3조 (개인정보 보유 및 이용 기간)">
            <p>① 회사는 개인정보 수집·이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.</p>
            <p>② 단, 관련 법령에 따라 일정 기간 보존이 필요한 경우 아래와 같이 보관합니다.</p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>회원 탈퇴 후: 즉시 삭제 (단, 법령상 보존 의무가 있는 정보 제외)</li>
              <li>계약 또는 청약 철회 기록: 5년 (전자상거래법)</li>
              <li>소비자 불만 또는 분쟁 처리 기록: 3년 (전자상거래법)</li>
              <li>접속 로그: 3개월 (통신비밀보호법)</li>
            </ul>
          </Section>

          <Section title="제4조 (개인정보의 제3자 제공)">
            <p>① 회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.</p>
            <p>② 다음의 경우에는 예외적으로 제공할 수 있습니다.</p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
            <p>③ 구인공고·이력서·커뮤니티 게시물에 이용자가 직접 입력한 정보(이름, 지역, 경력 등)는 서비스 내 공개되며, 이용자는 이를 인지하고 게시에 동의한 것으로 간주합니다.</p>
          </Section>

          <Section title="제5조 (개인정보 처리 위탁)">
            <p>회사는 서비스 제공을 위해 아래와 같이 개인정보 처리를 외부에 위탁하고 있습니다.</p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F4F1E9]">
                    <th className="text-left p-3 border border-[#E3DDD0] font-semibold text-[#23211C]">수탁 업체</th>
                    <th className="text-left p-3 border border-[#E3DDD0] font-semibold text-[#23211C]">위탁 업무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-[#E3DDD0]">Supabase Inc.</td>
                    <td className="p-3 border border-[#E3DDD0]">데이터베이스 및 인증 서비스 운영</td>
                  </tr>
                  <tr className="bg-[#FAFAF8]">
                    <td className="p-3 border border-[#E3DDD0]">Vercel Inc.</td>
                    <td className="p-3 border border-[#E3DDD0]">웹 서비스 호스팅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="제6조 (이용자의 권리 및 행사 방법)">
            <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li><span className="font-medium">열람권</span>: 자신의 개인정보 처리 현황 열람</li>
              <li><span className="font-medium">정정·삭제권</span>: 잘못된 개인정보의 정정 또는 삭제 요청</li>
              <li><span className="font-medium">처리 정지권</span>: 개인정보 처리 정지 요청</li>
              <li><span className="font-medium">동의 철회</span>: 회원 탈퇴를 통한 개인정보 수집·이용 동의 철회</li>
            </ul>
            <p>위 권리 행사는 이메일(joofeel00@naver.com)을 통해 요청하시면 지체 없이 처리합니다.</p>
          </Section>

          <Section title="제7조 (쿠키 및 자동 수집 장치)">
            <p>① 회사는 이용자 경험 개선 및 로그인 상태 유지를 위해 쿠키(Cookie)를 사용합니다.</p>
            <p>② 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 일부 서비스 기능이 제한될 수 있습니다.</p>
          </Section>

          <Section title="제8조 (개인정보 보호를 위한 기술적·관리적 조치)">
            <p>회사는 개인정보 보호를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>비밀번호 암호화 저장</li>
              <li>HTTPS를 통한 데이터 전송 암호화</li>
              <li>개인정보 접근 권한 최소화</li>
              <li>보안 취약점 정기 점검</li>
            </ul>
          </Section>

          <Section title="제9조 (개인정보 보호책임자)">
            <p>회사는 개인정보 처리에 관한 업무를 총괄하고 관련 불만 처리 및 피해 구제를 위해 아래와 같이 개인정보 보호책임자를 지정합니다.</p>
            <div className="bg-[#F4F1E9] rounded-xl p-4 mt-2 space-y-1">
              <p><span className="font-semibold">회사명:</span> 온울(주)</p>
              <p><span className="font-semibold">서비스:</span> 요가잡 (yogajob.xyz)</p>
              <p><span className="font-semibold">이메일:</span> joofeel00@naver.com</p>
            </div>
          </Section>

          <Section title="제10조 (권익 침해 구제 방법)">
            <p>개인정보 침해로 인한 피해 구제를 받으시려면 아래 기관에 문의하실 수 있습니다.</p>
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li>개인정보 침해신고센터: privacy.kisa.or.kr / 국번 없이 118</li>
              <li>개인정보 분쟁조정위원회: www.kopico.go.kr / 1833-6972</li>
              <li>대검찰청 사이버범죄수사단: www.spo.go.kr / 02-3480-3573</li>
              <li>경찰청 사이버수사국: ecrm.cyber.go.kr / 국번 없이 182</li>
            </ul>
          </Section>

          <div className="mt-10 pt-6 border-t border-[#F0ECE2] text-sm text-[#9A9382]">
            <p className="font-semibold text-[#76705F] mb-1">온울(주)</p>
            <p>서비스명: 요가잡 (yogajob.xyz)</p>
            <p>이메일: joofeel00@naver.com</p>
          </div>
        </div>
      </div>
    </main>
  );
}
