'use client'

import { useGameLoop } from '@/hooks/useGameLoop'
import GameBoard from './GameBoard'
import NextPuyo from './NextPuyo'

export default function GameScreen() {
  const { state, restart } = useGameLoop()
  const { grid, piece, nextPair, score, chains, phase } = state

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-2xl font-bold text-white tracking-widest">ぷよぷよ</h1>

      <div className="flex gap-6 items-start">
        {/* 盤面 */}
        <GameBoard grid={grid} piece={piece} />

        {/* サイドパネル */}
        <div className="flex flex-col gap-5 pt-1">
          <NextPuyo pair={nextPair} />

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

      {/* ゲームオーバー */}
      {phase === 'game-over' && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-10">
          <div className="bg-gray-900 border border-gray-600 rounded-2xl p-10 flex flex-col items-center gap-5">
            <div className="text-3xl font-black text-white">ゲームオーバー</div>
            <div className="text-gray-400">
              スコア: <span className="text-white font-bold">{score.toLocaleString()}</span>
              　連鎖: <span className="text-yellow-400 font-bold">{chains}</span>
            </div>
            <button
              onClick={restart}
              className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
            >
              もう一度
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
