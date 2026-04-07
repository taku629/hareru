import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY || 'demo',
  baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
})

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  const prompt = `あなたは東京の大学生の優しい「晴れ心パートナー」です。
認知行動療法（CBT）の「リフレーミング」技法を使って、以下のモヤモヤを受け止めて、ポジティブに捉え直してください。

モヤモヤ：「${text}」

返答のルール：
1. まず「うん、そうか〜、それはつらいね」的に共感する（1文）
2. 別の視点を優しく提示する（1〜2文）
3. 「今日できる小さな一歩」を具体的に提案する（1文）
4. 最後に一言、背中を押す言葉で締める
5. 全体で200文字以内
6. 友達みたいなトーンで（タメ口OK）
7. 絵文字を適度に使う（2〜4個）
8. 説教や正論は絶対に言わない

出力はリフレームメッセージ本文のみ。`

  try {
    const stream = await client.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      max_tokens: 300,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const t = chunk.choices[0]?.delta?.content || ''
          if (t) controller.enqueue(encoder.encode(t))
        }
        controller.close()
      },
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch {
    // Demo fallback
    const fallbacks = [
      `そっか〜、それは本当につらいね 😔 でもそれだけ真剣に向き合ってる証拠だよ。まずは5分だけ、好きな音楽かけてみよ？小さな気分転換が意外と効くんだよね ✨ 今日のあなた、ちゃんとえらいよ！`,
      `うわあ、それはしんどいね 💙 でも考えてみると、こんなに感じてるってことは、あなたがそれだけ大事にしてるからだよ。今日一個だけ「これやった！」って言えること作ってみよ？絶対できるから 🌟`,
      `ほんとだね、モヤモヤするよね 😌 別の見方すると、その気持ちがあるってことは成長しようとしてるサインかも。まず水飲んで、深呼吸してみて。あなたのペースで全然いいんだよ ☀️✨`,
    ]
    const msg = fallbacks[Math.floor(Math.random() * fallbacks.length)]
    return new NextResponse(msg, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
}
