/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Zap, Layers, RefreshCw, Play, ArrowLeft, ArrowRight, ArrowDown, RotateCcw, MessageSquare } from 'lucide-react';
import { useGame } from './hooks/useGame';
import { useInterval } from './hooks/useInterval';
import { TETROMINOS } from './constants';
import { getAICommentary } from './services/gemini';

const Cell = ({ type }: { type: string | number; key?: string }) => {
  const color = type === 0 ? 'rgba(0, 0, 0, 0.03)' : TETROMINOS[type as string]?.color;
  
  return (
    <div className="cell">
      <div 
        className="cell-inner transition-all duration-200" 
        style={{ 
          backgroundColor: type === 0 ? color : color,
          boxShadow: type !== 0 ? `0 4px 10px ${color}44, inset 0 0 5px rgba(255,255,255,0.4)` : 'none',
          border: type !== 0 ? '1px solid rgba(0,0,0,0.05)' : 'none',
          zIndex: type !== 0 ? 10 : 1
        }} 
      />
    </div>
  );
};

const StatBox = ({ label, value, colorClass = "text-slate-900" }: { label: string; value: string | number; colorClass?: string }) => (
  <div>
    <h2 className="stat-label">{label}</h2>
    <div className={`stat-value ${colorClass}`}>{String(value).padStart(3, '0')}</div>
  </div>
);

export default function App() {
  const {
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
  } = useGame();

  const [aiVoice, setAiVoice] = useState("SYSTEM READY. WAITING FOR PILOT...");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchAICommentary = async (event: string) => {
    setIsAiLoading(true);
    const comment = await getAICommentary(event, score, level);
    setAiVoice(comment);
    setIsAiLoading(false);
  };

  useEffect(() => {
    if (gameOver) {
      fetchAICommentary("lost the game");
    }
  }, [gameOver]);

  useEffect(() => {
    if (lines > 0 && lines % 4 === 0) {
      fetchAICommentary("cleared 4 lines! A TETRIS!");
    } else if (lines > 0) {
      fetchAICommentary("cleared some lines");
    }
  }, [lines]);

  useEffect(() => {
    if (level > 1) {
      fetchAICommentary("reached a new level");
    }
  }, [level]);

  useInterval(() => {
    drop();
  }, dropTime);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;

    switch (e.key) {
      case 'ArrowLeft':
        movePlayer(-1);
        break;
      case 'ArrowRight':
        movePlayer(1);
        break;
      case 'ArrowDown':
        setDropTime(50);
        break;
      case 'ArrowUp':
        rotatePlayer();
        break;
      case ' ':
        // Hard drop or something? For now just rotate
        rotatePlayer();
        break;
    }
  }, [gameOver, movePlayer, rotatePlayer, setDropTime]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setDropTime(800 * Math.pow(0.9, level - 1));
    }
  }, [level, setDropTime]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Combine grid and active piece for rendering
  const displayGrid = grid.map(row => [...row]);
  if (activePiece) {
    activePiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const gridY = y + activePiece.pos.y;
          const gridX = x + activePiece.pos.x;
          if (gridY >= 0 && gridY < 20 && gridX >= 0 && gridX < 10) {
            displayGrid[gridY][gridX] = value;
          }
        }
      });
    });
  }

  return (
    <div className="min-h-screen bg-emerald-50 text-slate-900 p-8 flex items-center justify-center font-mono overflow-hidden">
      <div className="max-w-6xl w-full h-full grid grid-cols-12 gap-8 items-stretch">
        
        {/* Left Sidebar: Stats */}
        <div className="col-span-3 flex flex-col justify-between py-10 order-2 md:order-1">
          <div className="space-y-12">
            <StatBox label="Current Score" value={score.toLocaleString().padStart(7, '0')} />
            <StatBox label="Lines Cleared" value={lines.toString().padStart(3, '0')} />
            <StatBox label="Level" value={level.toString().padStart(2, '0')} colorClass="text-blue-600" />
          </div>

          <div className="neon-container p-6 border-l-4 border-l-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={14} className="text-blue-500" />
              <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40">AI Intel</h3>
            </div>
            <p className={`text-xs font-mono italic leading-relaxed ${isAiLoading ? 'opacity-30' : 'opacity-100'} transition-opacity text-slate-600`}>
              {aiVoice}
            </p>
          </div>
          
          <div className="neon-container p-6">
            <h3 className="text-[10px] uppercase tracking-[0.3em] mb-4 opacity-40">Controls</h3>
            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <div className="flex items-center gap-2"><span className="control-key">←</span> MOVE</div>
              <div className="flex items-center gap-2"><span className="control-key">↑</span> ROTATE</div>
              <div className="flex items-center gap-2"><span className="control-key">↓</span> DROP</div>
              <div className="flex items-center gap-2"><span className="control-key">R</span> RESET</div>
            </div>
          </div>
        </div>

        {/* Center: The Board */}
        <div className="col-span-6 flex flex-col items-center justify-center relative order-1 md:order-2">
          {/* Background Ambient Glow */}
          <div className="absolute -inset-20 bg-blue-500/5 rounded-full blur-[120px]"></div>
          
          <div className="relative z-10 border-4 border-slate-200 bg-white/60 backdrop-blur-sm p-1 shadow-2xl shadow-slate-200/50">
            <div className="tetris-grid relative w-[320px] h-[640px]">
              {/* Decorative Scanlines/Grid */}
              <div className="absolute inset-0 pointer-events-none z-20 opacity-5" 
                   style={{ 
                     backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.01), rgba(0, 0, 0, 0.02))',
                     backgroundSize: '100% 4px, 6px 100%' 
                   }} />
              
              {displayGrid.map((row, y) => 
                row.map((cell, x) => (
                  <Cell key={`${y}-${x}`} type={cell} />
                ))
              )}
              
              <AnimatePresence>
                {gameOver && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center z-50 text-center p-6 border border-slate-200 shadow-xl"
                  >
                    <h2 className="text-4xl font-bold mb-2 text-red-500 tracking-tighter uppercase">Critical Error</h2>
                    <p className="text-slate-500 mb-8 font-mono text-xs tracking-[0.2em] uppercase">Buffer Overflow: {score.toLocaleString()}</p>
                    <button 
                      onClick={resetGame}
                      className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-md font-bold hover:bg-slate-800 active:scale-95 transition-all uppercase text-[10px] tracking-[0.2em]"
                    >
                      <RefreshCw size={14} /> Resume Operation
                    </button>
                  </motion.div>
                )}
                
                {!dropTime && !gameOver && (
                   <motion.div 
                    className="absolute inset-0 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-center p-6"
                   >
                     <div className="mb-12">
                      <h2 className="text-6xl font-black italic tracking-tighter text-slate-900 mb-1">NEON</h2>
                      <h2 className="text-6xl font-black italic tracking-tighter text-blue-600">TETRA</h2>
                     </div>
                     <button 
                      onClick={resetGame}
                      className="flex items-center gap-2 bg-blue-600 text-white px-10 py-5 rounded-sm font-bold shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.3em] text-sm"
                    >
                      <Play size={18} fill="currentColor" /> Boot System
                    </button>
                   </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Next & High Scores */}
        <div className="col-span-3 flex flex-col justify-between py-10 order-3">
          <div className="space-y-8">
            <div className="neon-container p-6 flex flex-col items-center">
              <h2 className="text-[10px] uppercase tracking-[0.2em] mb-6 opacity-60 text-center">Next Frame</h2>
              <div className="flex items-center justify-center h-20">
                <div className="grid grid-cols-4 gap-1">
                  {nextPiece.shape.map((row) => (
                    row.map((cell, idx) => (
                      cell !== 0 ? (
                        <div 
                          key={`${cell}-${idx}`} 
                          className="w-5 h-5 rounded-sm"
                          style={{ 
                            backgroundColor: nextPiece.color,
                            boxShadow: `0 4px 10px ${nextPiece.color}33`,
                            border: '1px solid rgba(0,0,0,0.05)'
                          }}
                        />
                      ) : <div key={`empty-${idx}`} className="w-5 h-5 bg-slate-100 rounded-sm" />
                    ))
                  ))}
                </div>
              </div>
            </div>

            <div className="neon-container p-6">
              <h2 className="text-[10px] uppercase tracking-[0.2em] mb-4 opacity-60">High Scores</h2>
              <ul className="space-y-3">
                <li className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
                  <span className="text-amber-500 font-bold">1. MASTER_T</span>
                  <span>850,200</span>
                </li>
                <li className="flex justify-between items-center text-xs border-b border-slate-100 pb-2 opacity-80 text-slate-600">
                  <span>2. BLOCK_HEAD</span>
                  <span>722,150</span>
                </li>
                <li className="flex justify-between items-center text-xs opacity-60 text-slate-400">
                  <span>3. NEON_RAIN</span>
                  <span>580,000</span>
                </li>
              </ul>
            </div>
          </div>
          
          <button 
            onClick={resetGame}
            className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-400 px-6 py-4 rounded-xl font-mono text-[10px] uppercase tracking-widest transition-colors"
          >
            <RotateCcw size={12} /> Sync Reboot
          </button>
        </div>


      </div>
    </div>
  );
}
