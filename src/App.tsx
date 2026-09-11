import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChessEngine } from './engine/chessLogic';
import { AIEngine, AI_PERSONALITIES } from './engine/aiEngine';
import { StrategyAnalyzer } from './engine/strategyAnalyzer';
import { soundManager } from './audio/soundManager';
import type {
  GameMode,
  GameSettings,
  Move,
  StrategyIntel,
  GameHistoryEntry,
} from './types/chess';
import { ChessBoard } from './components/ChessBoard';

import { CoachPanel } from './components/CoachPanel';
import { EvalBar } from './components/EvalBar';
import { ClockTimer } from './components/ClockTimer';
import { MoveHistory } from './components/MoveHistory';
import { GameControls } from './components/GameControls';
import { NavigationHeader } from './components/NavigationHeader';
import { SettingsModal } from './components/SettingsModal';
import { GameReviewModal } from './components/GameReviewModal';
import { AcademyPuzzles } from './components/AcademyPuzzles';
import confetti from 'canvas-confetti';
import './styles/index.css';
import './styles/App.css';
import './styles/Board.css';

const DEFAULT_SETTINGS: GameSettings = {
  boardTheme: 'cyber-neon',
  pieceSet: 'neo-cyber',
  soundEnabled: true,
  soundVolume: 0.7,
  showLegalMoves: true,
  showThreats: true,
  showInfluenceHeatmap: false,
  showBestMoveArrow: true,
  autoQueen: true,
  timeControl: {
    initialMinutes: 10,
    incrementSeconds: 0,
    isUnlimited: false,
  },
  aiPersonality: 'grandmaster',
  aiDifficulty: 'master',
};


export const App: React.FC = () => {
  // 1. Settings state (with localStorage persistence)
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('new-age-chess-settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [currentMode, setCurrentMode] = useState<GameMode>('practice');
  const [engine, setEngine] = useState<ChessEngine>(() => new ChessEngine());
  const [flipped, setFlipped] = useState(false);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [isCpuThinking, setIsCpuThinking] = useState(false);

  // Clocks
  const [whiteTime, setWhiteTime] = useState(settings.timeControl.initialMinutes * 60);
  const [blackTime, setBlackTime] = useState(settings.timeControl.initialMinutes * 60);

  // History & Analysis
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [previewMoveIndex, setPreviewMoveIndex] = useState<number | null>(null);
  const [strategyIntel, setStrategyIntel] = useState<StrategyIntel | null>(null);
  const [evaluation, setEvaluation] = useState<number>(0);

  // Modals & UI Toggles
  const [showSettings, setShowSettings] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [pgnCopied, setPgnCopied] = useState(false);
  const [gameOver, setGameOver] = useState<{ over: boolean; result?: string; reason?: string }>({ over: false });

  const aiEngineRef = useRef(new AIEngine());
  const strategyAnalyzerRef = useRef(new StrategyAnalyzer());
  const executeMoveRef = useRef<(move: Move) => boolean>(() => false);
  const whiteTimeRef = useRef(whiteTime);
  whiteTimeRef.current = whiteTime;
  const blackTimeRef = useRef(blackTime);
  blackTimeRef.current = blackTime;

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem('new-age-chess-settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
    soundManager.setEnabled(settings.soundEnabled);
    soundManager.setVolume(settings.soundVolume);
  }, [settings]);

  // Update theme class on document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.boardTheme);
  }, [settings.boardTheme]);

  // Real-time strategic analysis updater
  const updateAnalysis = useCallback((eng: ChessEngine) => {
    const moveHistorySAN = eng.state.history.map(h => h.move.san || '');
    const intel = strategyAnalyzerRef.current.analyzePosition(eng, moveHistorySAN);
    setStrategyIntel(intel);
    setEvaluation(intel.playerAdvantage);
  }, []);

  // Initialize analysis on mount
  useEffect(() => {
    updateAnalysis(engine);
  }, [engine, updateAnalysis]);

  // Clock countdown timer interval
  useEffect(() => {
    if (gameOver.over || settings.timeControl.isUnlimited) return;

    const interval = setInterval(() => {
      if (engine.state.turn === 'w') {
        setWhiteTime(prev => {
          if (prev <= 1) {
            setGameOver({ over: true, result: '0-1', reason: 'Black wins on time!' });
            return 0;
          }
          if (prev === 10) soundManager.playClockTick();
          return prev - 1;
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 1) {
            setGameOver({ over: true, result: '1-0', reason: 'White wins on time!' });
            return 0;
          }
          if (prev === 10) soundManager.playClockTick();
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [engine.state.turn, gameOver.over, settings.timeControl.isUnlimited]);

  // Apply move execution
  const executeMove = useCallback((move: Move): boolean => {
    if (gameOver.over) return false;

    // Reset preview mode if active
    setPreviewMoveIndex(null);

    // Compute SAN if missing
    if (!move.san) {
      const legalMoves = engine.getLegalMoves(engine.state.turn, true);
      const matched = legalMoves.find(
        m => m.from === move.from && m.to === move.to && m.promotion === move.promotion
      );
      if (matched?.san) {
        move.san = matched.san;
      }
    }

    const fenBefore = engine.getFen();
    const prevEval = evaluation;

    const success = engine.makeMove(move);
    if (!success) return false;

    // Trigger state update with cloned engine
    setEngine(engine.clone());

    // Audio SFX
    if (move.isCheckmate) {
      soundManager.playVictory();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } else if (move.isCheck) {
      soundManager.playCheck();
    } else if (move.isCastling) {
      soundManager.playCastle();
    } else if (move.promotion) {
      soundManager.playPromotion();
    } else if (move.captured) {
      soundManager.playCapture();
    } else {
      soundManager.playMove();
    }

    // Add time increment
    if (!settings.timeControl.isUnlimited && settings.timeControl.incrementSeconds > 0) {
      if (move.color === 'w') {
        setWhiteTime(t => t + settings.timeControl.incrementSeconds);
      } else {
        setBlackTime(t => t + settings.timeControl.incrementSeconds);
      }
    }

    setLastMove(move);

    // Analyze position after move
    const moveHistorySAN = engine.state.history.map(h => h.move.san || '');
    const intel = strategyAnalyzerRef.current.analyzePosition(engine, moveHistorySAN);
    setStrategyIntel(intel);
    setEvaluation(intel.playerAdvantage);

    // Classify move quality
    const quality = strategyAnalyzerRef.current.classifyMoveQuality(
      intel.playerAdvantage,
      prevEval,
      !!move.captured
    );

    // Save history entry
    const newEntry: GameHistoryEntry = {
      move,
      fenBefore,
      fenAfter: engine.getFen(),
      evalBefore: prevEval,
      evalAfter: intel.playerAdvantage,
      quality,
      whiteTimeRemaining: whiteTimeRef.current,
      blackTimeRemaining: blackTimeRef.current,
    };

    setHistory(prev => [...prev, newEntry]);
    setCurrentMoveIndex(engine.state.history.length - 1);

    // Check game over
    const go = engine.isGameOver();
    if (go.over) {
      setGameOver(go);
      setShowReview(true);
      if (go.result === '1-0' || go.result === '0-1') {
        soundManager.playVictory();
      }
    }

    return true;
  }, [engine, evaluation, gameOver.over, settings.timeControl]);

  executeMoveRef.current = executeMove;

  // CPU AI move trigger
  useEffect(() => {
    const isCpuTurn =
      !gameOver.over &&
      (currentMode === 'pvcpu' || currentMode === 'practice') &&
      engine.state.turn === 'b';

    if (!isCpuTurn) {
      setIsCpuThinking(false);
      return;
    }

    setIsCpuThinking(true);
    let cancelled = false;

    const delay = 500;
    const timer = setTimeout(() => {
      if (cancelled) return;
      try {
        const aiResult = aiEngineRef.current.getBestMove(
          engine,
          settings.aiDifficulty,
          settings.aiPersonality
        );

        if (aiResult?.move && !cancelled) {
          executeMoveRef.current(aiResult.move);
        }
      } catch (err) {
        console.error('CPU calculation error:', err);
      } finally {
        if (!cancelled) {
          setIsCpuThinking(false);
        }
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [engine, currentMode, gameOver.over, settings.aiDifficulty, settings.aiPersonality]);

  // Reset / New Game
  const handleNewGame = () => {
    const newEng = new ChessEngine();
    setEngine(newEng);
    setLastMove(null);
    setHistory([]);
    setCurrentMoveIndex(-1);
    setGameOver({ over: false });
    setWhiteTime(settings.timeControl.initialMinutes * 60);
    setBlackTime(settings.timeControl.initialMinutes * 60);
    setIsCpuThinking(false);
    updateAnalysis(newEng);
  };

  const handleUndo = () => {
    if (history.length === 0 || isCpuThinking) return;

    // In PvCPU / Practice, undo 2 plies (both player and CPU move)
    const pliesToUndo = currentMode === 'pvcpu' || currentMode === 'practice' ? 2 : 1;
    for (let i = 0; i < pliesToUndo; i++) {
      engine.undoMove();
    }

    const newHistory = history.slice(0, Math.max(0, history.length - pliesToUndo));
    setHistory(newHistory);
    setCurrentMoveIndex(newHistory.length - 1);
    setLastMove(newHistory.length > 0 ? newHistory[newHistory.length - 1].move : null);
    setGameOver({ over: false });
    updateAnalysis(engine);
    soundManager.playMove();
  };

  const handleGetHint = () => {
    if (!strategyIntel?.recommendedCounterMoves?.[0]) return;
    soundManager.playHint();
    setSettings(prev => ({ ...prev, showBestMoveArrow: true }));
  };

  const handleLoadFen = (fen: string): boolean => {
    try {
      const newEng = new ChessEngine(fen);
      setEngine(newEng);
      setLastMove(null);
      setHistory([]);
      setCurrentMoveIndex(-1);
      setGameOver(newEng.isGameOver());
      updateAnalysis(newEng);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopyPgn = () => {
    const pgn = engine.exportPgn({
      Mode: currentMode,
      White: 'Player 1',
      Black: currentMode === 'pvp' ? 'Player 2' : AI_PERSONALITIES[settings.aiPersonality].name,
    });
    navigator.clipboard.writeText(pgn);
    setPgnCopied(true);
    setTimeout(() => setPgnCopied(false), 2000);
  };

  const handleDownloadPgn = () => {
    const pgn = engine.exportPgn({
      Mode: currentMode,
      White: 'Player 1',
      Black: currentMode === 'pvp' ? 'Player 2' : AI_PERSONALITIES[settings.aiPersonality].name,
    });
    const blob = new Blob([pgn], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `new-age-chess-${new Date().toISOString().slice(0, 10)}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleJumpToMove = (idx: number) => {
    if (idx < 0 || idx >= history.length || idx === history.length - 1) {
      setPreviewMoveIndex(null);
      setCurrentMoveIndex(history.length - 1);
    } else {
      setPreviewMoveIndex(idx);
      setCurrentMoveIndex(idx);
    }
  };

  const activeDisplayEngine =
    previewMoveIndex !== null && previewMoveIndex >= 0 && previewMoveIndex < history.length
      ? new ChessEngine(history[previewMoveIndex].fenAfter)
      : engine;

  const capturedPieces = engine.getCapturedPieces();
  const materialScore = engine.getMaterialScore();

  return (
    <div className={`app-root theme-${settings.boardTheme}`}>
      {/* Dynamic Background Glow FX */}
      <div className="bg-glow-orb orb-1" />
      <div className="bg-glow-orb orb-2" />

      {/* Top Navigation */}
      <NavigationHeader
        currentMode={currentMode}
        onSelectMode={mode => {
          setCurrentMode(mode);
          if (mode !== 'puzzles') handleNewGame();
        }}
        aiPersonalityId={settings.aiPersonality}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Main Arena Layout */}
      {currentMode === 'puzzles' ? (
        <AcademyPuzzles
          onBackToMain={() => setCurrentMode('practice')}
          pieceSet={settings.pieceSet}
        />
      ) : (
        <main className="chess-arena-layout">
          {/* Left Column: Clocks & Move History */}
          <aside className="arena-side-column side-left">
            <ClockTimer
              whiteTime={whiteTime}
              blackTime={blackTime}
              activeTurn={engine.state.turn}
              isUnlimited={settings.timeControl.isUnlimited}
              flipped={flipped}
            />

            <MoveHistory
              history={history}
              currentMoveIndex={currentMoveIndex}
              onJumpToMove={handleJumpToMove}
              capturedPieces={capturedPieces}
              materialDiff={materialScore.diff}
              pieceSet={settings.pieceSet}
              onCopyPgn={handleCopyPgn}
              onDownloadPgn={handleDownloadPgn}
              pgnCopied={pgnCopied}
            />
          </aside>

          {/* Center Column: Eval Bar + Chess Board + Quick Controls */}
          <section className="arena-center-column">
            <div className="board-with-eval-container">
              <EvalBar score={evaluation} flipped={flipped} />

              <div className="board-viewport-card glass-card">
                {/* Clean Integrated Status Header Bar */}
                <div className="board-status-header-bar">
                  {previewMoveIndex !== null ? (
                    <div className="preview-history-banner">
                      <span>Previewing Move #{Math.floor(previewMoveIndex / 2) + 1}</span>
                      <button
                        className="return-live-btn"
                        onClick={() => {
                          setPreviewMoveIndex(null);
                          setCurrentMoveIndex(history.length - 1);
                        }}
                      >
                        Return to Live
                      </button>
                    </div>
                  ) : isCpuThinking ? (
                    <div className="cpu-thinking-hud">
                      <span className="cpu-thinking-dot" />
                      <span>{AI_PERSONALITIES[settings.aiPersonality].name} is calculating...</span>
                    </div>
                  ) : (
                    <div className="board-turn-badge">
                      <span className={`turn-indicator-dot ${engine.state.turn === 'w' ? 'white' : 'black'}`} />
                      <span>{engine.state.turn === 'w' ? "White's Turn" : "Black's Turn"}</span>
                    </div>
                  )}
                </div>

                <ChessBoard
                  engine={activeDisplayEngine}
                  flipped={flipped}
                  pieceSet={settings.pieceSet}
                  showLegalMoves={settings.showLegalMoves && previewMoveIndex === null}
                  showBestMoveArrow={settings.showBestMoveArrow && previewMoveIndex === null}
                  showThreats={settings.showThreats && previewMoveIndex === null}
                  showInfluenceHeatmap={settings.showInfluenceHeatmap}
                  strategyIntel={previewMoveIndex === null ? strategyIntel : null}
                  lastMove={
                    previewMoveIndex !== null && previewMoveIndex >= 0
                      ? history[previewMoveIndex].move
                      : lastMove
                  }
                  onMakeMove={executeMove}
                  disabled={isCpuThinking || previewMoveIndex !== null}
                />
              </div>
            </div>




            <GameControls
              onNewGame={handleNewGame}
              onFlipBoard={() => setFlipped(!flipped)}
              onUndo={handleUndo}
              onRedo={() => {}}
              canUndo={history.length > 0}
              canRedo={false}
              onGetHint={handleGetHint}
              onResign={() => {

                setGameOver({
                  over: true,
                  result: engine.state.turn === 'w' ? '0-1' : '1-0',
                  reason: `${engine.state.turn === 'w' ? 'White' : 'Black'} resigned.`,
                });
                setShowReview(true);
              }}
              onOfferDraw={() => {
                setGameOver({
                  over: true,
                  result: '1/2-1/2',
                  reason: 'Game drawn by mutual agreement.',
                });
                setShowReview(true);
              }}
              onLoadFen={handleLoadFen}
              disabled={isCpuThinking}
            />
          </section>

          {/* Right Column: Coach & Practice Intel Panel */}
          <aside className="arena-side-column side-right">
            <CoachPanel
              strategyIntel={strategyIntel}
              showBestMoveArrow={settings.showBestMoveArrow}
              showThreats={settings.showThreats}
              showInfluenceHeatmap={settings.showInfluenceHeatmap}
              onToggleBestMoveArrow={() =>
                setSettings(s => ({ ...s, showBestMoveArrow: !s.showBestMoveArrow }))
              }
              onToggleThreats={() =>
                setSettings(s => ({ ...s, showThreats: !s.showThreats }))
              }
              onToggleInfluenceHeatmap={() =>
                setSettings(s => ({ ...s, showInfluenceHeatmap: !s.showInfluenceHeatmap }))
              }
              onPlayRecommendedMove={m => executeMove(m)}
              turn={engine.state.turn}
            />
          </aside>
        </main>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={updates => setSettings(prev => ({ ...prev, ...updates }))}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Post-Game Review Modal */}
      {showReview && gameOver.over && (
        <GameReviewModal
          result={gameOver.result || '*'}
          reason={gameOver.reason || 'Game completed.'}
          history={history}
          onNewGame={handleNewGame}
          onClose={() => setShowReview(false)}
        />
      )}
    </div>
  );
};

export default App;
