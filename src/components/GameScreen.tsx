'use client'

import { useState } from 'react'
import { useGameLoop } from '@/hooks/useGameLoop'
import GameBoard from './GameBoard'
import NextPuyo from './NextPuyo'

const DIFFICULTIES = [
  { label: 'かんたん', ms: 1000, color: 'text-green-400', border: 'border-green-600', bg: 'hover:bg-green-900/40' },
  { label: 'ふつう',   ms: 600,  color: 'text-yellow-400', border: 'border-yellow-600', bg: 'hover:bg-yellow-900/40' },
  { label: 'むずかしい', ms: 280, color: 'text-orange-400', border: 'border-orange-600', bg: 'hover:bg-orange-900/40' },
  { label: 'おに',    ms: 120,  color: 'text-red-400',    border: 'border-red-700',    bg: 'hover:bg-red-900/40' },
] as const

type Difficulty = typeof DIFFICULTIES[number]

function DifficultySelect({ onSelect }: { onSelect: (d: Difficulty) => void }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-black text-white tracking-widest">ぷよぷよ</h1>
      <p className="text-gray-400 text-sm">難易度を選んでください</p>
      <div className="flex flex-col gap-3 w-52">
        {DIFFICULTIES.map(d => (
          <button
            key={d.label}
            onClick={() => onSelect(d)}
            className={`border ${d.border} ${d.bg} ${d.color} font-bold text-lg py-3 rounded-xl transition-colors`}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Game({ difficulty, onBack }: { difficulty: Difficulty; onBack: () => void }) {
  const { state, restart } = useGameLoop(difficulty.ms)
  const { grid, piece, nextPair, score, chains, phase } = state

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-2xl font-bold text-white tracking-widest">ぷよぷよ</h1>

      <div className="flex gap-6 items-start">
        <GameBoard grid={grid} piece={piece} />

        <div className="flex flex-col gap-5 pt-1">
          <NextPuyo pair={nextPair} />

          <div className="flex flex-col gap-1">
            <div className="text-xs text-gray-500">難易度</div>
            <div className={`text-sm font-bold ${difficulty.color}`}>{difficulty.label}</div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="text-xs text-gray-500">スコア</div>
            <div className="text-2xl font-mono font-bold text-white">{score.toLocaleString()}</div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="text-xs text-gray-500">最大連鎖</div>
            <div className="text-2xl font-mono font-bold text-yellow-400">{chains}</div>
          </div>

          <div className="flex flex-col gap-1 text-xs text-gray-600 leading-6">
            <div>← → 移動</div>
            <div>↑ Z X 回転</div>
            <div>↓ 落下</div>
            <div>Space 即落とし</div>
          </div>
        </div>
      </div>

      {phase === 'game-over' && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-10">
          <div className="bg-gray-900 border border-gray-600 rounded-2xl p-10 flex flex-col items-center gap-5">
            <div className="text-3xl font-black text-white">ゲームオーバー</div>
            <div className="text-gray-400">
              スコア: <span className="text-white font-bold">{score.toLocaleString()}</span>
              　連鎖: <span className="text-yellow-400 font-bold">{chains}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={restart}
                className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
              >
                もう一度
              </button>
              <button
                onClick={onBack}
                className="px-6 py-3 border border-gray-600 text-gray-300 font-bold rounded-full hover:bg-gray-800 transition-colors"
              >
                難易度選択
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GameScreen() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)

  if (!difficulty) return <DifficultySelect onSelect={setDifficulty} />
  return <Game difficulty={difficulty} onBack={() => setDifficulty(null)} />
}
