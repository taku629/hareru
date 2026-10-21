import { NextRequest } from 'next/server'
import { streamChat } from '@/lib/ai/chat-stream'

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

  const fallback = `今日もちゃんと良いことがあったね ✨ ${items[0] ? `「${items[0]}」` : 'それ'}ができたこと、本当にすごいよ！小さく見えても、毎日積み重ねてるあなたはちゃんと成長してる 🌱 この調子だと明日もきっといい一日になるよ。今日もお疲れさまでした 🌙☀️`

  return streamChat({ prompt, fallback })
}
