import { Grid, FallingPiece } from '@/lib/types'
import { getDisplayGrid } from '@/lib/game'
import PuyoCell from './PuyoCell'

interface Props {
  grid: Grid
  piece?: FallingPiece | null
  cellSize?: number
}

export default function GameBoard({ grid, piece = null, cellSize = 36 }: Props) {
  const display = getDisplayGrid(grid, piece)

  return (
    <div
      className="border-2 border-gray-600 bg-gray-950 inline-block"
      style={{ lineHeight: 0 }}
    >
      {display.map((row, rowIdx) => (
        <div key={rowIdx} className="flex">
          {row.map((cell, colIdx) => (
            <PuyoCell key={colIdx} cell={cell} size={cellSize} />
          ))}
        </div>
      ))}
    </div>
  )
}
