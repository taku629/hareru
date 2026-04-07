import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY || 'demo',
  baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
})

export async function POST(req: NextRequest) {
  const { items } = await req.json() as { items: string[] }

  const listText = items.filter(Boolean).map((item, i) => `${i + 1}. ${item}`).join('\n')

  const prompt = `あなたは東京の大学生の優しい「晴れ心パートナー」です。
今日の「良かったこと」3つをもとに、温かい成長ストーリーとして振り返りを書いてください。

良かったこと：
${listText}

書き方のルール：
1. この3つを「今日一日の小さな勝利の物語」としてまとめる（3〜4文）
2. 具体的な内容を引用しながら
3. 「この調子だと明日も〜」という前向きな締めをつける
4. 全体200文字以内
5. 友達みたいな温かいトーンで
6. 絵文字を3〜5個使う
7. 最後に「明日も晴れそう！」をアレンジした一言

出力はストーリー本文のみ。`

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
    const fallback = `今日もちゃんと良いことがあったね ✨ ${items[0] ? `「${items[0]}」` : 'それ'}ができたこと、本当にすごいよ！小さく見えても、毎日積み重ねてるあなたはちゃんと成長してる 🌱 この調子だと明日もきっといい一日になるよ。今日もお疲れさまでした 🌙☀️`
    return new NextResponse(fallback, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
}
