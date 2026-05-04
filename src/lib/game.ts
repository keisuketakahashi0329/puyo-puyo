import {
  Color, Grid, Rotation, FallingPiece,
  BOARD_WIDTH, BOARD_HEIGHT, COLORS,
} from './types'

export function createEmptyGrid(): Grid {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null))
}

export function generatePair(): [Color, Color] {
  return [
    COLORS[Math.floor(Math.random() * COLORS.length)],
    COLORS[Math.floor(Math.random() * COLORS.length)],
  ]
}

export function spawnPiece(pair: [Color, Color]): FallingPiece {
  return { col: 2, row: 1, rotation: 0, pair }
}

export function getPuyoPositions(piece: FallingPiece): [[number, number], [number, number]] {
  const { col, row, rotation } = piece
  switch (rotation) {
    case 0: return [[row, col], [row - 1, col]]
    case 1: return [[row, col], [row, col + 1]]
    case 2: return [[row, col], [row + 1, col]]
    case 3: return [[row, col], [row, col - 1]]
  }
}

export function canPlace(grid: Grid, row: number, col: number): boolean {
  if (col < 0 || col >= BOARD_WIDTH) return false
  if (row >= BOARD_HEIGHT) return false
  if (row < 0) return true
  return grid[row][col] === null
}

export function canMovePiece(grid: Grid, piece: FallingPiece, dRow: number, dCol: number): boolean {
  const [[r1, c1], [r2, c2]] = getPuyoPositions(piece)
  return canPlace(grid, r1 + dRow, c1 + dCol) && canPlace(grid, r2 + dRow, c2 + dCol)
}

export function rotatePiece(grid: Grid, piece: FallingPiece, dir: 1 | -1): FallingPiece {
  const newRot = ((piece.rotation + dir + 4) % 4) as Rotation
  let newCol = piece.col

  if (newRot === 1 && newCol >= BOARD_WIDTH - 1) newCol = BOARD_WIDTH - 2
  if (newRot === 3 && newCol <= 0) newCol = 1

  const newPiece: FallingPiece = { ...piece, rotation: newRot, col: newCol }
  const [[r1, c1], [r2, c2]] = getPuyoPositions(newPiece)

  if (canPlace(grid, r1, c1) && canPlace(grid, r2, c2)) return newPiece
  return piece
}

export function lockPiece(grid: Grid, piece: FallingPiece): Grid {
  const next = grid.map(r => [...r]) as Grid
  const [[r1, c1], [r2, c2]] = getPuyoPositions(piece)
  const [main, sub] = piece.pair
  if (r1 >= 0 && r1 < BOARD_HEIGHT) next[r1][c1] = main
  if (r2 >= 0 && r2 < BOARD_HEIGHT) next[r2][c2] = sub
  return next
}

export function applyGravity(grid: Grid): Grid {
  const next = grid.map(r => [...r]) as Grid
  for (let col = 0; col < BOARD_WIDTH; col++) {
    const puyos = next
      .map(r => r[col])
      .filter((c): c is Color => c !== null)
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      const offset = BOARD_HEIGHT - puyos.length
      next[row][col] = row < offset ? null : puyos[row - offset]
    }
  }
  return next
}

export function findGroups(grid: Grid): [number, number][][] {
  const visited = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(false))
  const groups: [number, number][][] = []

  for (let row = 0; row < BOARD_HEIGHT; row++) {
    for (let col = 0; col < BOARD_WIDTH; col++) {
      if (!grid[row][col] || visited[row][col]) continue

      const color = grid[row][col] as Color
      const group: [number, number][] = []
      const stack: [number, number][] = [[row, col]]

      while (stack.length > 0) {
        const [r, c] = stack.pop()!
        if (r < 0 || r >= BOARD_HEIGHT || c < 0 || c >= BOARD_WIDTH) continue
        if (visited[r][c] || grid[r][c] !== color) continue
        visited[r][c] = true
        group.push([r, c])
        stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1])
      }

      if (group.length >= 4) groups.push(group)
    }
  }

  return groups
}

export function processChains(grid: Grid): {
  grid: Grid; chains: number; cleared: number; score: number
} {
  let chains = 0
  let cleared = 0
  let score = 0
  // 重力を先に適用してから連鎖判定する
  let current = applyGravity(grid.map(r => [...r]) as Grid)

  while (true) {
    const groups = findGroups(current)
    if (groups.length === 0) break

    const clearedNow = groups.reduce((s, g) => s + g.length, 0)
    cleared += clearedNow
    chains++
    score += clearedNow * 10 * chains + chains * 50

    for (const group of groups)
      for (const [r, c] of group) current[r][c] = null

    current = applyGravity(current)
  }

  return { grid: current, chains, cleared, score }
}

export function isGameOver(grid: Grid): boolean {
  return grid[0].some(cell => cell !== null)
}

export function getDisplayGrid(grid: Grid, piece: FallingPiece | null): Grid {
  const display = grid.map(r => [...r]) as Grid
  if (!piece) return display

  const [[r1, c1], [r2, c2]] = getPuyoPositions(piece)
  const [main, sub] = piece.pair

  if (r1 >= 0 && r1 < BOARD_HEIGHT && c1 >= 0 && c1 < BOARD_WIDTH) display[r1][c1] = main
  if (r2 >= 0 && r2 < BOARD_HEIGHT && c2 >= 0 && c2 < BOARD_WIDTH) display[r2][c2] = sub

  return display
}
