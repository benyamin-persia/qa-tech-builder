import React, { useState, useEffect, useCallback, useRef } from "react"

// Tetris pieces - Black and white colors
const TETRIS_PIECES = [
  // I-piece
  { shape: [[1, 1, 1, 1]], color: 'bg-black dark:bg-white' },
  // O-piece
  { shape: [[1, 1], [1, 1]], color: 'bg-black dark:bg-white' },
  // T-piece
  { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-black dark:bg-white' },
  // L-piece
  { shape: [[1, 0], [1, 0], [1, 1]], color: 'bg-black dark:bg-white' },
  // S-piece
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-black dark:bg-white' },
  // Z-piece
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-black dark:bg-white' },
  // J-piece
  { shape: [[0, 1], [0, 1], [1, 1]], color: 'bg-black dark:bg-white' },
]

/**
 * Tetris Game Component
 * 
 * A fully playable floating Tetris game with keyboard controls:
 * - Arrow Left: Move piece left
 * - Arrow Right: Move piece right
 * - Arrow Down: Move piece down faster
 * - Space: Rotate piece
 * 
 * Features:
 * - Piece collision detection
 * - Line clearing with animation
 * - Score tracking
 * - Level progression
 * - Auto-reset when grid gets too full
 * - Smooth animations
 */
export default function TetrisGame({ 
  size = 'sm', 
  speed = 'normal',
  onScoreChange,
  className = ''
}) {
  // Size configurations for the floating game
  const sizeConfig = {
    sm: { 
      cellSize: 'w-2.5 h-2.5', 
      gridWidth: 10, 
      gridHeight: 20, 
      padding: 'p-1',
      fontSize: 'text-xs',
      width: 'w-32',
      height: 'h-64'
    },
    md: { 
      cellSize: 'w-3.5 h-3.5', 
      gridWidth: 10, 
      gridHeight: 20, 
      padding: 'p-1',
      fontSize: 'text-sm',
      width: 'w-40',
      height: 'h-80'
    },
    lg: { 
      cellSize: 'w-4 h-4', 
      gridWidth: 10, 
      gridHeight: 20, 
      padding: 'p-1.5',
      fontSize: 'text-base',
      width: 'w-48',
      height: 'h-96'
    }
  }

  // Speed configurations (in milliseconds)
  const speedConfig = {
    slow: 400,
    normal: 150,
    fast: 80
  }

  const config = sizeConfig[size]
  const fallSpeed = speedConfig[speed]
  
  // Game state
  const [grid, setGrid] = useState(() =>
    Array(config.gridHeight).fill(null).map(() => 
      Array(config.gridWidth).fill(null).map(() => ({ filled: false, color: '' }))
    )
  )
  const [fallingPiece, setFallingPiece] = useState(null)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  
  const frameRef = useRef(null)
  const lastUpdateRef = useRef(0)
  const inputQueueRef = useRef([])

  // Rotate a shape 90 degrees clockwise
  const rotateShape = useCallback((shape) => {
    const rows = shape.length
    const cols = shape[0].length
    const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0))

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = shape[i][j]
      }
    }
    return rotated
  }, [])

  // Create a new random piece
  const createNewPiece = useCallback(() => {
    const pieceData = TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)]
    let shape = pieceData.shape

    // Random rotations for initial placement
    const rotations = Math.floor(Math.random() * 4)
    for (let i = 0; i < rotations; i++) {
      shape = rotateShape(shape)
    }

    const maxX = config.gridWidth - shape[0].length
    const x = Math.floor(Math.random() * (maxX + 1))

    return {
      shape,
      color: pieceData.color,
      x,
      y: -shape.length,
      id: Math.random().toString(36).substring(2, 9),
    }
  }, [rotateShape, config.gridWidth])

  // Check if a piece can be placed at a position
  const canPlacePiece = useCallback((piece, newX, newY) => {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const gridX = newX + col
          const gridY = newY + row

          // Check boundaries
          if (gridX < 0 || gridX >= config.gridWidth || gridY >= config.gridHeight) {
            return false
          }

          // Check collision with placed pieces
          if (gridY >= 0 && grid[gridY][gridX].filled) {
            return false
          }
        }
      }
    }
    return true
  }, [grid, config.gridWidth, config.gridHeight])

  // Place a piece on the grid
  const placePiece = useCallback((piece) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })))

      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col]) {
            const gridX = piece.x + col
            const gridY = piece.y + row

            if (gridY >= 0 && gridY < config.gridHeight && gridX >= 0 && gridX < config.gridWidth) {
              newGrid[gridY][gridX] = { filled: true, color: piece.color }
            }
          }
        }
      }

      return newGrid
    })
  }, [config.gridHeight, config.gridWidth])

  // Clear completed lines with animation and score update
  const clearFullLines = useCallback(() => {
    setGrid(prevGrid => {
      const linesToClear = []
      
      // Find full lines
      prevGrid.forEach((row, index) => {
        if (row.every(cell => cell.filled)) {
          linesToClear.push(index)
        }
      })

      if (linesToClear.length > 0) {
        // Calculate score: 100 * lines^2 (exponential scoring)
        const points = 100 * Math.pow(linesToClear.length, 2) * level
        
        // Update score immediately
        setScore(prev => prev + points)
        
        // Update lines and level in one call to avoid race conditions
        setLines(prev => {
          const newLines = prev + linesToClear.length
          setLevel(Math.floor(newLines / 10) + 1)
          return newLines
        })

        // Actually clear lines immediately
        const filteredGrid = prevGrid.filter((_, index) => !linesToClear.includes(index))
        const emptyRows = Array(linesToClear.length).fill(null).map(() => 
          Array(config.gridWidth).fill(null).map(() => ({ filled: false, color: '' }))
        )
        return [...emptyRows, ...filteredGrid]
      }
      return prevGrid
    })
  }, [config.gridWidth, level])

  // Check game over condition - happens when blocks reach the top 25% of the grid
  const checkGameOver = useCallback(() => {
    // Check if any cell in the top quarter of the grid is filled
    const topQuarter = Math.max(4, Math.floor(config.gridHeight * 0.25))
    const topRows = grid.slice(0, topQuarter)
    const hasBlocks = topRows.some(row => row.some(cell => cell.filled))
    
    if (hasBlocks) {
      setIsGameOver(true)
      return true
    }
    
    return false
  }, [grid, config.gridHeight])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if game is paused or over
      if (isPaused || isGameOver || !fallingPiece) return

      // Prevent default for game keys
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
        e.preventDefault()
      }

      // Handle key presses
      switch(e.key) {
        case 'ArrowLeft':
          setFallingPiece(prev => {
            if (!prev) return prev
            const newX = prev.x - 1
            if (canPlacePiece(prev, newX, prev.y)) {
              return { ...prev, x: newX }
            }
            return prev
          })
          break

        case 'ArrowRight':
          setFallingPiece(prev => {
            if (!prev) return prev
            const newX = prev.x + 1
            if (canPlacePiece(prev, newX, prev.y)) {
              return { ...prev, x: newX }
            }
            return prev
          })
          break

        case 'ArrowDown':
          setFallingPiece(prev => {
            if (!prev) return prev
            const newY = prev.y + 1
            if (canPlacePiece(prev, prev.x, newY)) {
              return { ...prev, y: newY }
            }
            return prev
          })
          break

        case 'ArrowUp':
          // Move up (no action, or could be used for something else)
          break

        case ' ':
          // Space: Rotate piece (swapped from hard drop)
          setFallingPiece(prev => {
            if (!prev) return prev
            const rotatedShape = rotateShape(prev.shape)
            const rotatedPiece = { ...prev, shape: rotatedShape }
            if (canPlacePiece(rotatedPiece, prev.x, prev.y)) {
              return rotatedPiece
            }
            return prev
          })
          break

        case 'p':
        case 'P':
          setIsPaused(prev => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canPlacePiece, rotateShape, isPaused, isGameOver, fallingPiece])

  // Game loop using requestAnimationFrame
  useEffect(() => {
    if (isPaused || isGameOver) return

    const gameLoop = (timestamp) => {
      if (timestamp - lastUpdateRef.current >= fallSpeed) {
        lastUpdateRef.current = timestamp

        setFallingPiece(prevPiece => {
          // Spawn new piece if needed
          if (!prevPiece) {
            return createNewPiece()
          }

          // Try to move down
          const newY = prevPiece.y + 1
          if (canPlacePiece(prevPiece, prevPiece.x, newY)) {
            return { ...prevPiece, y: newY }
          }

          // Can't move down, place piece
          placePiece(prevPiece)
          
          // Check game over BEFORE creating next piece
          if (checkGameOver()) {
            return prevPiece
          }

          // Clear full lines and spawn new piece
          clearFullLines()
          return createNewPiece()
        })
      }

      frameRef.current = requestAnimationFrame(gameLoop)
    }

    frameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [canPlacePiece, createNewPiece, placePiece, clearFullLines, checkGameOver, fallSpeed, isPaused, isGameOver])

  // Report score changes to parent
  useEffect(() => {
    if (onScoreChange) {
      onScoreChange({ score, lines, level })
    }
  }, [score, lines, level, onScoreChange])

  // Render the grid
  const renderGrid = () => {
    const displayGrid = grid.map(row => row.map(cell => ({ ...cell })))

    // Add falling piece to display
    if (fallingPiece) {
      for (let row = 0; row < fallingPiece.shape.length; row++) {
        for (let col = 0; col < fallingPiece.shape[row].length; col++) {
          if (fallingPiece.shape[row][col]) {
            const gridX = fallingPiece.x + col
            const gridY = fallingPiece.y + row

            if (gridY >= 0 && gridY < config.gridHeight && gridX >= 0 && gridX < config.gridWidth) {
              displayGrid[gridY][gridX] = { filled: true, color: fallingPiece.color }
            }
          }
        }
      }
    }

    return displayGrid.map((row, rowIndex) => (
      <div key={rowIndex} className="flex">
        {row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`${config.cellSize} border border-gray-300 dark:border-gray-600 transition-all duration-100 ${
              cell.filled 
                ? `${cell.color} scale-100` 
                : 'bg-white dark:bg-black scale-95'
            }`}
          />
        ))}
      </div>
    ))
  }

  // Reset game function
  const resetGame = () => {
    setGrid(Array(config.gridHeight).fill(null).map(() => 
      Array(config.gridWidth).fill(null).map(() => ({ filled: false, color: '' }))
    ))
    setFallingPiece(null)
    setScore(0)
    setLines(0)
    setLevel(1)
    setIsPaused(false)
    setIsGameOver(false)
  }

  return (
    <div className={`${className}`}>
      <div className="border-2 border-gray-800 dark:border-gray-200 bg-white dark:bg-black inline-block">
        {renderGrid()}
      </div>
    </div>
  )
}

