import { Color } from '@/lib/types'
import PuyoCell from './PuyoCell'

interface Props {
  pair: [Color, Color]
  label?: string
}

export default function NextPuyo({ pair, label = 'NEXT' }: Props) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-bold text-gray-400 tracking-widest">{label}</span>
      <div className="border border-gray-600 bg-gray-900 p-1 flex flex-col gap-0.5">
        <PuyoCell cell={pair[1]} size={28} />
        <PuyoCell cell={pair[0]} size={28} />
      </div>
    </div>
  )
}
