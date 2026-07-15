import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const { name, location, yogaStyles, experienceYears, certifications } = await request.json();

    if (!yogaStyles) {
      return NextResponse.json({ error: "요가 종류는 필수입니다." }, { status: 400 });
    }

    const prompt = `당신은 한국의 요가 강사입니다. 아래 정보를 바탕으로 자기소개를 작성해주세요.

${name ? `이름: ${name}` : ""}
희망 지역: ${location || "전국"}
전문 요가: ${yogaStyles}
경력: ${experienceYears || "신입"}
자격증: ${certifications || "없음"}

다음 내용을 포함해 200~300자 분량으로 작성해주세요:
- 요가 강사로서의 열정과 지도 철학
- 전문 분야 및 강의 스타일
- 경력/자격증 자연스럽게 녹이기
- 함께하고 싶은 근무 환경

규칙:
- 1인칭 시점의 따뜻하고 전문적인 한국어
- 불필요한 이모지나 특수기호 사용 금지
- 자기소개 텍스트만 출력 (제목, 번호 없이)`;

    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 500,
      thinking: { type: "adaptive" },
      messages: [{ role: "user", content: prompt }],
    });

    const generatedText = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    return NextResponse.json({ generatedText });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "AI 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
