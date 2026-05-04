'use client'

import { useState, useEffect, useCallback } from 'react'
import { GameState } from '@/lib/types'
import {
  createEmptyGrid, generatePair, spawnPiece,
  canMovePiece, rotatePiece, lockPiece,
  processChains, isGameOver,
} from '@/lib/game'

function createInitialState(): GameState {
  return {
    grid: createEmptyGrid(),
    piece: spawnPiece(generatePair()),
    nextPair: generatePair(),
    score: 0,
    chains: 0,
    totalCleared: 0,
    phase: 'playing',
  }
}

function lockAndContinue(prev: GameState): GameState {
  if (!prev.piece) return prev

  const locked = lockPiece(prev.grid, prev.piece)
  const { grid, chains, cleared, score } = processChains(locked)

  if (isGameOver(grid)) {
    return { ...prev, grid, piece: null, phase: 'game-over' }
  }

  return {
    ...prev,
    grid,
    piece: spawnPiece(prev.nextPair),
    nextPair: generatePair(),
    score: prev.score + score,
    chains: prev.chains + chains,
    totalCleared: prev.totalCleared + cleared,
  }
}

export function useGameLoop() {
  const [state, setState] = useState<GameState>(createInitialState)

  // Gravity: 600ms ごとに1行落下
  useEffect(() => {
    if (state.phase !== 'playing') return

    const id = setInterval(() => {
      setState(prev => {
        if (prev.phase !== 'playing' || !prev.piece) return prev
        if (canMovePiece(prev.grid, prev.piece, 1, 0)) {
          return { ...prev, piece: { ...prev.piece, row: prev.piece.row + 1 } }
        }
        return lockAndContinue(prev)
      })
    }, 600)

    return () => clearInterval(id)
  }, [state.phase])

  // キー操作
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      setState(prev => {
        if (prev.phase !== 'playing' || !prev.piece) return prev
        const { piece, grid } = prev

        switch (e.key) {
          case 'ArrowLeft':
          case 'a':
          case 'A':
            if (canMovePiece(grid, piece, 0, -1))
              return { ...prev, piece: { ...piece, col: piece.col - 1 } }
            break

          case 'ArrowRight':
          case 'd':
          case 'D':
            if (canMovePiece(grid, piece, 0, 1))
              return { ...prev, piece: { ...piece, col: piece.col + 1 } }
            break

          case 'ArrowDown':
          case 's':
          case 'S':
            if (canMovePiece(grid, piece, 1, 0))
              return { ...prev, piece: { ...piece, row: piece.row + 1 } }
            return lockAndContinue(prev)

          case ' ': {
            let r = piece.row
            while (canMovePiece(grid, { ...piece, row: r }, 1, 0)) r++
            return lockAndContinue({ ...prev, piece: { ...piece, row: r } })
          }

          case 'ArrowUp':
          case 'z':
          case 'Z':
            return { ...prev, piece: rotatePiece(grid, piece, -1) }

          case 'x':
          case 'X':
            return { ...prev, piece: rotatePiece(grid, piece, 1) }
        }

        return prev
      })
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const restart = useCallback(() => setState(createInitialState()), [])

  return { state, restart }
}
