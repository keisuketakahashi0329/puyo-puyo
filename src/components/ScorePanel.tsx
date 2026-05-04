interface Props {
  score: number
  chains: number
  label: string
  thinking?: boolean
}

export default function ScorePanel({ score, chains, label, thinking = false }: Props) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[80px]">
      <span className="text-sm font-bold text-gray-300">{label}</span>
      <div className="text-xs text-gray-400">スコア</div>
      <div className="text-lg font-mono font-bold text-white">{score.toLocaleString()}</div>
      <div className="text-xs text-gray-400">連鎖</div>
      <div className="text-lg font-mono font-bold text-yellow-400">{chains}</div>
      {thinking && (
        <div className="text-xs text-blue-400 animate-pulse mt-1">思考中...</div>
      )}
    </div>
  )
}
