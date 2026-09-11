import React, { useState } from 'react';
import { ACADEMY_PUZZLES } from '../engine/puzzles';
import type { Puzzle, Move, PieceSetId } from '../types/chess';
import { ChessEngine } from '../engine/chessLogic';
import { ChessBoard } from './ChessBoard';
import { soundManager } from '../audio/soundManager';
import { Trophy, Lightbulb, CheckCircle2, XCircle, ArrowRight, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AcademyPuzzlesProps {
  onBackToMain: () => void;
  pieceSet: PieceSetId;
}

export const AcademyPuzzles: React.FC<AcademyPuzzlesProps> = ({
  onBackToMain,
  pieceSet,
}) => {

  const [selectedPuzzleIdx, setSelectedPuzzleIdx] = useState(0);
  const currentPuzzle: Puzzle = ACADEMY_PUZZLES[selectedPuzzleIdx];

  const [puzzleEngine, setPuzzleEngine] = useState<ChessEngine>(() => new ChessEngine(currentPuzzle.fen));
  const [currentStep, setCurrentStep] = useState(0);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [status, setStatus] = useState<'solving' | 'correct' | 'wrong'>('solving');
  const [solvedCount, setSolvedCount] = useState(0);
  const [lastMove, setLastMove] = useState<Move | null>(null);

  const loadPuzzle = (idx: number) => {
    setSelectedPuzzleIdx(idx);
    const pz = ACADEMY_PUZZLES[idx];
    setPuzzleEngine(new ChessEngine(pz.fen));
    setCurrentStep(0);
    setHintsRevealed(0);
    setStatus('solving');
    setLastMove(null);
  };

  const handlePuzzleMove = (move: Move): boolean => {
    if (status === 'correct') return false;

    const moveStr = `${move.from}${move.to}`;
    const expectedMoveStr = currentPuzzle.solutionMoves[currentStep];

    // Check if move matches solution
    if (moveStr === expectedMoveStr) {
      puzzleEngine.makeMove(move);
      setLastMove(move);
      soundManager.playMove();

      const nextStep = currentStep + 1;

      // Check if puzzle completed
      if (nextStep >= currentPuzzle.solutionMoves.length) {
        setStatus('correct');
        setSolvedCount(prev => prev + 1);
        soundManager.playVictory();
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } else {
        // Play automatic CPU response step
        setCurrentStep(nextStep);
        const cpuMoveStr = currentPuzzle.solutionMoves[nextStep];
        const cpuFrom = cpuMoveStr.slice(0, 2);
        const cpuTo = cpuMoveStr.slice(2, 4);

        setTimeout(() => {
          const legalReplies = puzzleEngine.getLegalMoves();
          const autoReply = legalReplies.find(m => m.from === cpuFrom && m.to === cpuTo);
          if (autoReply) {
            puzzleEngine.makeMove(autoReply);
            setLastMove(autoReply);
            soundManager.playMove();
            setCurrentStep(nextStep + 1);
          }
        }, 500);
      }
      return true;
    } else {
      // Wrong move
      setStatus('wrong');
      soundManager.playCheck();
      setTimeout(() => {
        setStatus('solving');
      }, 1500);
      return false;
    }
  };

  const handleNextPuzzle = () => {
    const nextIdx = (selectedPuzzleIdx + 1) % ACADEMY_PUZZLES.length;
    loadPuzzle(nextIdx);
  };

  const handleShowHint = () => {
    if (hintsRevealed < currentPuzzle.hints.length) {
      setHintsRevealed(prev => prev + 1);
      soundManager.playHint();
    }
  };

  return (
    <div className="academy-puzzles-layout">
      {/* Sidebar: Puzzle Selection & Info */}
      <div className="academy-sidebar glass-card">
        <div className="academy-sidebar-header">
          <div className="academy-title-row">
            <Trophy className="text-amber" size={22} />
            <h2>Tactics Academy</h2>
          </div>
          <div className="score-streak-badge">
            <Flame size={14} className="text-amber" />
            <span>Solved: {solvedCount}/{ACADEMY_PUZZLES.length}</span>
          </div>
        </div>

        {/* Puzzle Selector List */}
        <div className="puzzle-list-scroll">
          {ACADEMY_PUZZLES.map((pz, idx) => {
            const isCurrent = idx === selectedPuzzleIdx;
            return (
              <div
                key={pz.id}
                className={`puzzle-select-item ${isCurrent ? 'active' : ''}`}
                onClick={() => loadPuzzle(idx)}
              >
                <div className="pz-item-top">
                  <span className="pz-item-num">#{idx + 1}</span>
                  <span className="pz-item-title">{pz.title}</span>
                </div>
                <div className="pz-item-meta">
                  <span className="pz-theme-tag">{pz.theme}</span>
                  <span className={`pz-diff-tag diff-${pz.difficulty.toLowerCase()}`}>
                    {pz.difficulty}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button className="back-to-game-btn" onClick={onBackToMain}>
          Back to Live Arena
        </button>
      </div>

      {/* Main Board & Puzzle Guidance Area */}
      <div className="academy-board-area">
        <div className="puzzle-status-header">
          <div className="puzzle-details">
            <span className="puzzle-turn-indicator">
              {currentPuzzle.playerColor === 'w' ? '⚪ White to move' : '⚫ Black to move'}
            </span>
            <h3 className="puzzle-main-title">{currentPuzzle.title}</h3>
            <p className="puzzle-desc">{currentPuzzle.description}</p>
          </div>

          <div className="puzzle-actions-right">
            <button
              className="puzzle-hint-btn"
              onClick={handleShowHint}
              disabled={hintsRevealed >= currentPuzzle.hints.length || status === 'correct'}
            >
              <Lightbulb size={16} className="text-amber" />
              <span>Hint ({currentPuzzle.hints.length - hintsRevealed} left)</span>
            </button>
          </div>
        </div>

        {/* Hints Box */}
        {hintsRevealed > 0 && (
          <div className="puzzle-hints-box">
            {currentPuzzle.hints.slice(0, hintsRevealed).map((h, idx) => (
              <div key={`hint-${idx}`} className="hint-line">
                <Lightbulb size={14} className="text-amber" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        )}

        {/* Status Alerts */}
        {status === 'wrong' && (
          <div className="puzzle-alert alert-wrong">
            <XCircle size={18} />
            <span>Not the best move. Try again or request a hint!</span>
          </div>
        )}

        {status === 'correct' && (
          <div className="puzzle-alert alert-correct">
            <CheckCircle2 size={20} className="text-emerald" />
            <div className="correct-text-block">
              <span className="correct-title">Brilliant! Puzzle Solved!</span>
              <p className="correct-explanation">{currentPuzzle.explanation}</p>
            </div>
            <button className="next-puzzle-btn" onClick={handleNextPuzzle}>
              <span>Next Drill</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Board Renderer */}
        <div className="academy-board-container">
          <ChessBoard
            engine={puzzleEngine}
            flipped={currentPuzzle.playerColor === 'b'}
            pieceSet={pieceSet}
            showLegalMoves={true}
            showBestMoveArrow={false}
            showThreats={false}
            showInfluenceHeatmap={false}
            strategyIntel={null}
            lastMove={lastMove}
            onMakeMove={handlePuzzleMove}
          />
        </div>
      </div>
    </div>
  );
};

