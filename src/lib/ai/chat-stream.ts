import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY || 'demo',
  baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
})

type ChatStreamOptions = {
  prompt: string
  fallback: string | (() => string)
}

export async function streamChat({ prompt, fallback }: ChatStreamOptions) {
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
    const text = typeof fallback === 'function' ? fallback() : fallback
    return new NextResponse(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
}
