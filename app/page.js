import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-6xl mx-auto">
        <header className="text-center py-12">
          <h1 className="text-5xl font-bold text-purple-900 mb-4">
            🧘‍♀️ 요가 구인구직 플랫폼
          </h1>
          <p className="text-xl text-gray-600">
            AI가 도와주는 스마트한 매칭 서비스
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-4xl mb-4">💼</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              강사를 찾으시나요?
            </h2>
            <p className="text-gray-600 mb-6">
              AI가 최적의 요가 강사를 찾아드립니다
            </p>
            <Link href="/post-job">
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                구인 공고 등록하기
              </button>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-4xl mb-4">🙋‍♀️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              일자리를 찾으시나요?
            </h2>
            <p className="text-gray-600 mb-6">
              나에게 딱 맞는 요가 센터를 찾아보세요
            </p>
            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
              이력서 등록하기
            </button>
          </div>
        </div>

        <section className="mt-16">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-3xl font-bold text-gray-800">
      최근 공고
    </h2>
    <Link href="/jobs" className="text-purple-600 hover:underline font-semibold">
      전체 보기 →
    </Link>
  </div>
  <div className="bg-white rounded-xl shadow p-12 text-center">
    <p className="text-gray-600 mb-6">
      등록된 요가 강사 구인 공고를 확인하세요
    </p>
    <Link href="/jobs">
      <button className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition">
        공고 목록 보기
      </button>
    </Link>
  </div>
</section>
      </div>
    </main>
  );
}