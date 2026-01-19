import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { location, yogaStyle, experience, salary } = await request.json();

    const prompt = `요가 강사 구인 공고를 작성해줘.

지역: ${location}
요가 종류: ${yogaStyle}
경력: ${experience || "무관"}
급여: ${salary || "협의"}

조건을 반영해서 매력적이고 전문적인 공고문을 300자 내외로 작성해줘.`;

    const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // ✅ hf-inference가 지원하는 모델 중 하나를 사용 (접미사 :hf-inference 중요)
        model: "HuggingFaceTB/SmolLM3-3B:hf-inference",
        messages: [
          { role: "system", content: "너는 한국어로 채용 공고를 잘 쓰는 HR 전문가야." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      const txt = await res.text(); // JSON 아닐 수도 있어서 text로 받기
      console.error("HF Router error:", res.status, txt);
      return NextResponse.json(
        { error: `HF Router 오류 (${res.status})`, detail: txt },
        { status: 500 }
      );
    }

    const data = await res.json();
    const generatedText =
      data?.choices?.[0]?.message?.content || "";

    return NextResponse.json({ generatedText });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "서버 내부 오류" }, { status: 500 });
  }
}
