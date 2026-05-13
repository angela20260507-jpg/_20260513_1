import { useState, useCallback, useEffect } from 'react';
import { COLS, ROWS, TETROMINOS, Tetromino, randomTetromino } from '../constants';

export type Grid = (string | number)[][];

export const createGrid = () =>
  Array.from(Array(ROWS), () => Array(COLS).fill(0));

export const useGame = () => {
  const [grid, setGrid] = useState<Grid>(createGrid());
  const [activePiece, setActivePiece] = useState<Tetromino & { pos: { x: number; y: number } } | null>(null);
  const [nextPiece, setNextPiece] = useState<Tetromino>(randomTetromino());
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [dropTime, setDropTime] = useState<number | null>(null);

  const resetGame = useCallback(() => {
    setGrid(createGrid());
    const firstPiece = randomTetromino();
    setActivePiece({ ...firstPiece, pos: { x: Math.floor(COLS / 2) - 2, y: 0 } });
    setNextPiece(randomTetromino());
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setLines(0);
    setDropTime(800);
  }, []);

  const checkCollision = (piece: Tetromino, pos: { x: number; y: number }, newGrid: Grid = grid) => {
    for (let y = 0; y < piece.shape.length; y += 1) {
      for (let x = 0; x < piece.shape[y].length; x += 1) {
        if (piece.shape[y][x] !== 0) {
          if (
            !newGrid[y + pos.y] ||
            newGrid[y + pos.y][x + pos.x] === undefined ||
            newGrid[y + pos.y][x + pos.x] !== 0
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotate = (matrix: (string | number)[][]) => {
    const rotated = matrix.map((_, index) => matrix.map((col) => col[index]));
    return rotated.map((row) => row.reverse());
  };

  const movePlayer = (dir: number) => {
    if (!activePiece || gameOver) return;
    const newPos = { ...activePiece.pos, x: activePiece.pos.x + dir };
    if (!checkCollision(activePiece, newPos)) {
      setActivePiece({ ...activePiece, pos: newPos });
    }
  };

  const rotatePlayer = () => {
    if (!activePiece || gameOver) return;
    const clonedPiece = JSON.parse(JSON.stringify(activePiece));
    clonedPiece.shape = rotate(clonedPiece.shape);

    const pos = clonedPiece.pos.x;
    let offset = 1;
    while (checkCollision(clonedPiece, clonedPiece.pos)) {
      clonedPiece.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPiece.shape[0].length) {
        clonedPiece.pos.x = pos;
        return;
      }
    }
    setActivePiece(clonedPiece);
  };

  const drop = () => {
    if (!activePiece || gameOver) return;

    // Increase speed every 10 lines
    if (lines >= level * 10) {
      setLevel((prev) => prev + 1);
      setDropTime((prev) => (prev ? prev * 0.9 : 800));
    }

    if (!checkCollision(activePiece, { x: activePiece.pos.x, y: activePiece.pos.y + 1 })) {
      setActivePiece({ ...activePiece, pos: { ...activePiece.pos, y: activePiece.pos.y + 1 } });
    } else {
      // Game Over check
      if (activePiece.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
        return;
      }
      handlePlacement();
    }
  };

  const handlePlacement = () => {
    if (!activePiece) return;
    const newGrid = [...grid];
    activePiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newGrid[y + activePiece.pos.y][x + activePiece.pos.x] = value;
        }
      });
    });

    // Clear lines
    let clearedLines = 0;
    const finalGrid = newGrid.reduce((acc, row) => {
      if (row.every((cell) => cell !== 0)) {
        clearedLines++;
        acc.unshift(new Array(COLS).fill(0));
        return acc;
      }
      acc.push(row);
      return acc;
    }, [] as Grid);

    if (clearedLines > 0) {
      setLines((prev) => prev + clearedLines);
      setScore((prev) => prev + [40, 100, 300, 1200][clearedLines - 1]! * level);
    }

    setGrid(finalGrid);
    setActivePiece({ ...nextPiece, pos: { x: Math.floor(COLS / 2) - 2, y: 0 } });
    setNextPiece(randomTetromino());
  };

  return {
    grid,
    activePiece,
    nextPiece,
    gameOver,
    score,
    level,
    lines,
    dropTime,
    resetGame,
    movePlayer,
    rotatePlayer,
    drop,
    setDropTime,
  };
};
