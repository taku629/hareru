import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY || 'demo',
  baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
})

export async function POST(req: NextRequest) {
  const { context } = await req.json()

  const prompt = context
    ? `あなたは東京の大学生の優しい「晴れ心パートナー」です。
以下は過去1週間のユーザーの記録です：
${context}

これを踏まえて、今日の朝のパーソナライズされた「晴れメッセージ」を150文字以内で生成してください。
- 過去の記録の具体的な内容（良かったこと・モヤモヤ）に触れながら
- 今日頑張れる具体的な「勝ちパターン」を一言添えて
- 温かく、友達みたいなトーンで（敬語なし・タメ口OK）
- 絵文字を2〜3個使って
出力はメッセージ本文のみ。`
    : `あなたは東京の大学生の優しい「晴れ心パートナー」です。
今日初めてアプリを開いた大学生への、朝のウェルカムメッセージを150文字以内で生成してください。
- 東京の大学生らしい親しみやすい言葉で
- 今日一日が晴れやかになるポジティブな言葉
- 絵文字を2〜3個使って
- 友達みたいなトーンで（敬語なし）
出力はメッセージ本文のみ。`

  try {
    const stream = await client.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      max_tokens: 200,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || ''
          if (text) controller.enqueue(encoder.encode(text))
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
    if (!process.env.DEMO_MODE) {
      return new NextResponse('AIとの接続に失敗しました。しばらくしてから再試行してください ☁️', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }
    // Demo fallback (DEMO_MODE=true のときのみ)
    const demos = [
      '昨日もよく頑張ったね！☀️ 今日はまず「小さな一歩」から始めよう。朝ごはん食べて、元気チャージ！今日も最高な一日になるよ ✨🌈',
      'おはよう！☀️ 今日も東京のどこかで、あなたを応援してる人がいるよ。まず深呼吸して、今日やりたいこと一つ決めよ！✨',
      '新しい朝だよ〜！🌅 昨日の疲れはリセット完了。今日の「勝ちパターン」は、好きなことから始めること！✨☀️',
    ]
    const msg = demos[Math.floor(Math.random() * demos.length)]
    return new NextResponse(msg, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
}
