import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const { location, yogaStyle, experience, salary } = await request.json();

    if (!location || !yogaStyle) {
      return NextResponse.json({ error: "지역과 요가 종류는 필수입니다." }, { status: 400 });
    }

    const prompt = `당신은 한국의 요가원 운영자입니다. 아래 조건에 맞는 구인 공고 상세 설명을 작성해주세요.

센터 위치: ${location}
요가 종류: ${yogaStyle}
필요 경력: ${experience || "무관"}
급여 조건: ${salary || "협의"}

다음 내용을 포함해 300~400자 분량으로 작성해주세요:
- 센터/클래스 소개 및 분위기
- 구체적인 업무 내용
- 지원 자격 및 우대 사항
- 센터만의 특장점

규칙:
- 친근하고 전문적인 한국어 톤
- 불필요한 이모지나 특수기호 사용 금지
- 설명 텍스트만 출력 (제목, 번호 없이)`;

    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 600,
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
