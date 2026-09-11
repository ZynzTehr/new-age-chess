import React from 'react';
import type { StrategyIntel, Move, EvaluatedMove } from '../types/chess';
import { Shield, Sparkles, Crosshair, Eye, Activity, Swords, BookOpen } from 'lucide-react';

interface CoachPanelProps {
  strategyIntel: StrategyIntel | null;
  showBestMoveArrow: boolean;
  showThreats: boolean;
  showInfluenceHeatmap: boolean;
  onToggleBestMoveArrow: () => void;
  onToggleThreats: () => void;
  onToggleInfluenceHeatmap: () => void;
  onPlayRecommendedMove: (move: Move) => void;
  turn: 'w' | 'b';
}

export const CoachPanel: React.FC<CoachPanelProps> = ({
  strategyIntel,
  showBestMoveArrow,
  showThreats,
  showInfluenceHeatmap,
  onToggleBestMoveArrow,
  onToggleThreats,
  onToggleInfluenceHeatmap,
  onPlayRecommendedMove,
}) => {
  if (!strategyIntel) {
    return (
      <div className="coach-panel-card empty-state">
        <div className="coach-header">
          <Sparkles className="icon-glow" size={20} />
          <h3>Master Academy Coach</h3>
        </div>
        <p className="coach-empty-text">Make a move on the board to initialize real-time strategic analysis and counter-tactics.</p>
      </div>
    );
  }

  const { openingName, ecoCode, gamePhase, cpuPlan, recommendedCounterMoves } = strategyIntel;

  const threatBadgeClass = {
    low: 'threat-low',
    medium: 'threat-medium',
    high: 'threat-high',
    critical: 'threat-critical',
  }[cpuPlan.threatLevel || 'medium'];

  return (
    <div className="coach-panel-card">
      {/* 1. Header & Opening Recognition */}
      <div className="coach-header">
        <div className="coach-header-left">
          <div className="coach-avatar-pulse">
            <Sparkles size={18} className="text-emerald" />
          </div>
          <div>
            <h3 className="coach-title">Master Practice Coach</h3>
            <span className="coach-subtitle">Live Tactical & Strategic Mentor</span>
          </div>
        </div>
        <div className="game-phase-badge">
          <BookOpen size={13} />
          <span>{gamePhase}</span>
        </div>
      </div>

      {/* Opening Banner */}
      <div className="opening-intel-banner">
        <span className="eco-tag">{ecoCode}</span>
        <span className="opening-name-text">{openingName}</span>
      </div>

      {/* 2. CPU Strategy Intel (What the CPU is doing) */}
      <div className="coach-section cpu-intel-section">
        <div className="section-title-row">
          <div className="section-title-left">
            <Crosshair size={16} className="text-crimson" />
            <h4>CPU Strategy & Threat Intel</h4>
          </div>
          <span className={`threat-badge ${threatBadgeClass}`}>
            {cpuPlan.threatLevel.toUpperCase()} THREAT
          </span>
        </div>

        <div className="cpu-intel-card">
          <div className="cpu-plan-header">
            <span className="cpu-plan-title">{cpuPlan.title}</span>
            {cpuPlan.tacticalMotif && (
              <span className="tactical-motif-tag">{cpuPlan.tacticalMotif}</span>
            )}
          </div>
          <p className="cpu-plan-summary">{cpuPlan.summary}</p>
        </div>
      </div>

      {/* 3. Master Counter-Tactics & Recommended Moves */}
      <div className="coach-section counter-tactics-section">
        <div className="section-title-row">
          <div className="section-title-left">
            <Shield size={16} className="text-emerald" />
            <h4>Master Counter-Tactics</h4>
          </div>
          <span className="subtext-hint">Top Engine Lines</span>
        </div>

        <div className="recommended-moves-list">
          {recommendedCounterMoves.map((recMove: EvaluatedMove, idx: number) => {
            const isBest = idx === 0;
            return (
              <div
                key={`rec-move-${idx}`}
                className={`rec-move-card ${isBest ? 'best-line' : 'alt-line'}`}
              >
                <div className="rec-move-header">
                  <div className="rec-move-badge">
                    <span className="rank-num">#{idx + 1}</span>
                    <span className="move-san">{recMove.move.san || `${recMove.move.from}-${recMove.move.to}`}</span>
                    {recMove.tacticalTheme && (
                      <span className="rec-theme-badge">{recMove.tacticalTheme}</span>
                    )}
                  </div>

                  <div className="win-chance-meter">
                    <span className="win-percent">{recMove.winChance}% Win</span>
                    <button
                      className="play-move-btn"
                      onClick={() => onPlayRecommendedMove(recMove.move)}
                      title="Play this master move on the board"
                    >
                      Play Move
                    </button>
                  </div>
                </div>

                <div className="rec-move-explanation">
                  <p className="explanation-text">{recMove.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Tactical Visualization Toggles */}
      <div className="coach-section visual-tools-section">
        <div className="section-title-row">
          <div className="section-title-left">
            <Eye size={16} className="text-cyan" />
            <h4>Tactical Overlays</h4>
          </div>
        </div>

        <div className="visual-toggles-grid">
          <button
            className={`tool-toggle-btn ${showBestMoveArrow ? 'active' : ''}`}
            onClick={onToggleBestMoveArrow}
          >
            <Activity size={14} />
            <span>Best Move Arrow</span>
          </button>

          <button
            className={`tool-toggle-btn ${showThreats ? 'active' : ''}`}
            onClick={onToggleThreats}
          >
            <Swords size={14} />
            <span>Threat Radar</span>
          </button>

          <button
            className={`tool-toggle-btn ${showInfluenceHeatmap ? 'active' : ''}`}
            onClick={onToggleInfluenceHeatmap}
          >
            <Crosshair size={14} />
            <span>Control Heatmap</span>
          </button>
        </div>
      </div>
    </div>
  );
};
