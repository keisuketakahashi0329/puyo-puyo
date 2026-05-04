export type Color = 'R' | 'G' | 'B' | 'Y' | 'P'
export type Cell = Color | null
export type Grid = Cell[][]
export type Rotation = 0 | 1 | 2 | 3

export const BOARD_WIDTH = 6
export const BOARD_HEIGHT = 13
export const COLORS: Color[] = ['R', 'G', 'B', 'Y', 'P']

export interface FallingPiece {
  col: number
  row: number
  rotation: Rotation
  pair: [Color, Color]
}

export interface GameState {
  grid: Grid
  piece: FallingPiece | null
  nextPair: [Color, Color]
  score: number
  chains: number
  totalCleared: number
  phase: 'playing' | 'game-over'
}
