import { Cell } from '@/lib/types'

const COLOR_CLASSES: Record<string, string> = {
  R: 'bg-red-500 border-red-700 shadow-red-300',
  G: 'bg-green-500 border-green-700 shadow-green-300',
  B: 'bg-blue-500 border-blue-700 shadow-blue-300',
  Y: 'bg-yellow-400 border-yellow-600 shadow-yellow-200',
  P: 'bg-purple-500 border-purple-700 shadow-purple-300',
}

interface Props {
  cell: Cell
  size?: number
}

export default function PuyoCell({ cell, size = 36 }: Props) {
  if (!cell) {
    return (
      <div
        className="border border-gray-700/30 bg-gray-900/20"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={`${COLOR_CLASSES[cell]} border-2 rounded-full shadow-inner select-none`}
      style={{ width: size, height: size }}
    />
  )
}
