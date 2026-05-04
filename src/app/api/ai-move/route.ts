import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import { Grid, Color } from '@/lib/types'

const anthropic = new Anthropic()

function gridToString(grid: Grid): string {
  return grid.map(row => row.map(cell => cell ?? '.').join('')).join('\n')
}

export async function POST(req: NextRequest) {
  const { board, pair }: { board: Grid; pair: [Color, Color] } = await req.json()

  const boardStr = gridToString(board)

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      messages: [
        {
          role: 'user',
          content: `あなたはぷよぷよのAIプレイヤーです。
盤面（6列×13行、上が先頭行、.は空）と次のぷよペアを受け取り、最適な配置を決定してください。

盤面:
${boardStr}

次のぷよ: メイン=${pair[0]} / サブ=${pair[1]}

回転の意味:
0 = 縦（メインが下、サブが上）
1 = 横（メインが左、サブが右）
2 = 縦（メインが上、サブが下）
3 = 横（メインが右、サブが左）

同色4つ以上が上下左右に連結すると消えます。連鎖を狙ってください。
JSON形式のみで回答してください（他のテキスト不要）:
{"col": <0-5>, "rotation": <0-3>}`,
        },
      ],
    })

    const text = message.content.find(b => b.type === 'text')?.text ?? ''
    const match = text.match(/\{[^}]+\}/)
    if (!match) throw new Error('no json')

    const move = JSON.parse(match[0])
    const col = Math.max(0, Math.min(5, Number(move.col) || 0))
    const rotation = [0, 1, 2, 3].includes(Number(move.rotation))
      ? (Number(move.rotation) as 0 | 1 | 2 | 3)
      : 0

    return Response.json({ col, rotation })
  } catch {
    return Response.json({
      col: Math.floor(Math.random() * 6),
      rotation: Math.floor(Math.random() * 4),
    })
  }
}
