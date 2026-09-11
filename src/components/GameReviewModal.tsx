import React from 'react';
import type { GameHistoryEntry } from '../types/chess';
import { Trophy, RefreshCw, X } from 'lucide-react';

interface GameReviewModalProps {
  result: string;
  reason: string;
  history: GameHistoryEntry[];
  onNewGame: () => void;
  onClose: () => void;
}

export const GameReviewModal: React.FC<GameReviewModalProps> = ({
  result,
  reason,
  history,
  onNewGame,
  onClose,
}) => {
  // Compute move statistics for White and Black
  const stats = {
    w: { brilliant: 0, great: 0, best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, total: 0 },
    b: { brilliant: 0, great: 0, best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, total: 0 },
  };

  history.forEach((entry, idx) => {
    const color = idx % 2 === 0 ? 'w' : 'b';
    stats[color].total++;
    const q = entry.quality || 'good';
    if (q in stats[color]) {
      stats[color][q as keyof typeof stats['w']]++;
    }
  });

  // Accuracy approximation
  const calcAccuracy = (s: typeof stats['w']) => {
    if (s.total === 0) return 95;
    const goodMoves = s.brilliant + s.great + s.best + s.good;
    const penalized = s.inaccuracy * 0.7 + s.mistake * 0.4 + s.blunder * 0.1;
    const score = ((goodMoves + penalized) / s.total) * 100;
    return Math.min(99.5, Math.max(40, Math.round(score * 10) / 10));
  };

  const whiteAccuracy = calcAccuracy(stats.w);
  const blackAccuracy = calcAccuracy(stats.b);

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card game-review-modal-box">
        {/* Header */}
        <div className="modal-header-row">
          <div className="modal-header-title">
            <Trophy size={22} className="text-amber" />
            <h3>Game Complete & Tactical Review</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Result Banner */}
        <div className="game-result-banner">
          <div className="result-score-large">{result}</div>
          <p className="result-reason-text">{reason}</p>
        </div>

        {/* Accuracy Comparison */}
        <div className="accuracy-comparison-grid">
          <div className="accuracy-card white-player">
            <div className="player-indicator-row">
              <span className="player-pip pip-white" />
              <span className="player-name">White</span>
            </div>
            <div className="accuracy-val">{whiteAccuracy}%</div>
            <span className="accuracy-label">Move Accuracy</span>
          </div>

          <div className="accuracy-card black-player">
            <div className="player-indicator-row">
              <span className="player-pip pip-black" />
              <span className="player-name">Black</span>
            </div>
            <div className="accuracy-val">{blackAccuracy}%</div>
            <span className="accuracy-label">Move Accuracy</span>
          </div>
        </div>

        {/* Move Quality Breakdown Table */}
        <div className="quality-breakdown-section">
          <h4>Move Classification Breakdown</h4>
          <div className="breakdown-grid">
            <div className="breakdown-row">
              <span className="quality-col-label text-cyan">Brilliant (‼)</span>
              <span className="count-white">{stats.w.brilliant}</span>
              <span className="count-black">{stats.b.brilliant}</span>
            </div>
            <div className="breakdown-row">
              <span className="quality-col-label text-emerald">Great & Best (★)</span>
              <span className="count-white">{stats.w.best + stats.w.great}</span>
              <span className="count-black">{stats.b.best + stats.b.great}</span>
            </div>
            <div className="breakdown-row">
              <span className="quality-col-label text-muted">Good</span>
              <span className="count-white">{stats.w.good}</span>
              <span className="count-black">{stats.b.good}</span>
            </div>
            <div className="breakdown-row">
              <span className="quality-col-label text-amber">Inaccuracies (?!)</span>
              <span className="count-white">{stats.w.inaccuracy}</span>
              <span className="count-black">{stats.b.inaccuracy}</span>
            </div>
            <div className="breakdown-row">
              <span className="quality-col-label text-orange">Mistakes (?)</span>
              <span className="count-white">{stats.w.mistake}</span>
              <span className="count-black">{stats.b.mistake}</span>
            </div>
            <div className="breakdown-row">
              <span className="quality-col-label text-crimson">Blunders (??)</span>
              <span className="count-white">{stats.w.blunder}</span>
              <span className="count-black">{stats.b.blunder}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions-row">
          <button className="modal-btn secondary" onClick={onClose}>
            Review Board Moves
          </button>
          <button className="modal-btn primary" onClick={() => { onNewGame(); onClose(); }}>
            <RefreshCw size={16} />
            <span>Play Rematch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
