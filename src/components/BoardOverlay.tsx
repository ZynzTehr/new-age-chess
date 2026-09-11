import React from 'react';
import type { Square, StrategyIntel } from '../types/chess';
import { squareToFileRank } from '../engine/chessLogic';

interface BoardOverlayProps {
  flipped: boolean;
  strategyIntel: StrategyIntel | null;
  showBestMoveArrow: boolean;
  showThreats: boolean;
  showInfluenceHeatmap: boolean;
  customArrows?: Array<{ from: Square; to: Square; color?: string }>;
}

export const BoardOverlay: React.FC<BoardOverlayProps> = ({
  flipped,
  strategyIntel,
  showBestMoveArrow,
  showThreats,
  showInfluenceHeatmap,
  customArrows = [],
}) => {
  // Convert square to percentage coordinates (0-100%) on SVG
  const getSquareCoords = (square: Square): { x: number; y: number } => {
    const { file, rank } = squareToFileRank(square);
    const col = flipped ? 7 - file : file;
    const row = flipped ? rank : 7 - rank;
    return {
      x: col * 12.5 + 6.25,
      y: row * 12.5 + 6.25,
    };
  };

  const arrowsToRender: Array<{ from: Square; to: Square; color: string; id: string }> = [];

  // Best Move / Counter Move Arrow
  if (showBestMoveArrow && strategyIntel?.recommendedCounterMoves?.[0]) {
    const bestMove = strategyIntel.recommendedCounterMoves[0].move;
    arrowsToRender.push({
      from: bestMove.from,
      to: bestMove.to,
      color: '#10b981', // Neon Emerald
      id: 'best-move-arrow',
    });
  }

  // 2nd Candidate Move (if available)
  if (showBestMoveArrow && strategyIntel?.recommendedCounterMoves?.[1]) {
    const altMove = strategyIntel.recommendedCounterMoves[1].move;
    arrowsToRender.push({
      from: altMove.from,
      to: altMove.to,
      color: '#06b6d4', // Cyan
      id: 'alt-move-arrow',
    });
  }

  // CPU Threat Arrows
  if (showThreats && strategyIntel?.threatArrows) {
    strategyIntel.threatArrows.forEach((ta, idx) => {
      if (ta.type === 'threat') {
        arrowsToRender.push({
          from: ta.from,
          to: ta.to,
          color: '#f43f5e', // Crimson Threat
          id: `threat-arrow-${idx}`,
        });
      }
    });
  }

  customArrows.forEach((ca, idx) => {
    arrowsToRender.push({
      from: ca.from,
      to: ca.to,
      color: ca.color || '#eab308',
      id: `custom-arrow-${idx}`,
    });
  });

  return (
    <div className="board-overlay-container" style={{ pointerEvents: 'none' }}>
      {/* 1. Square Control Influence Heatmap */}
      {showInfluenceHeatmap && strategyIntel?.controlMap && (
        <div className="heatmap-grid">
          {Array.from({ length: 8 }).map((_, rIdx) => {
            const r = flipped ? rIdx : 7 - rIdx;
            return (
              <div key={`heatmap-row-${r}`} className="heatmap-row">
                {Array.from({ length: 8 }).map((_, fIdx) => {
                  const f = flipped ? 7 - fIdx : fIdx;
                  const val = strategyIntel.controlMap![r][f];
                  let bg = 'transparent';
                  if (val > 0) {
                    const opacity = Math.min(0.35, val * 0.08);
                    bg = `rgba(0, 240, 255, ${opacity})`;
                  } else if (val < 0) {
                    const opacity = Math.min(0.35, Math.abs(val) * 0.08);
                    bg = `rgba(255, 0, 85, ${opacity})`;
                  }
                  return (
                    <div
                      key={`heatmap-cell-${r}-${f}`}
                      className="heatmap-cell"
                      style={{ backgroundColor: bg }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Danger Squares Halos */}
      {showThreats && strategyIntel?.dangerSquares && (
        <div className="danger-radar-container">
          {strategyIntel.dangerSquares.map((ds, idx) => {
            const { x, y } = getSquareCoords(ds.square);
            return (
              <div
                key={`danger-halo-${idx}`}
                className={`danger-halo ${ds.reason}`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* 3. SVG Tactical Arrows */}
      <svg className="board-arrows-svg" viewBox="0 0 100 100">
        <defs>
          {['#10b981', '#06b6d4', '#f43f5e', '#eab308'].map(col => (
            <marker
              key={`arrowhead-${col}`}
              id={`arrowhead-${col.replace('#', '')}`}
              markerWidth="6"
              markerHeight="6"
              refX="4.5"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 6 3, 0 6" fill={col} />
            </marker>
          ))}
        </defs>

        {arrowsToRender.map(arrow => {
          const start = getSquareCoords(arrow.from);
          const end = getSquareCoords(arrow.to);

          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const len = Math.hypot(dx, dy);
          if (len === 0) return null;

          // Slightly shorten end so arrowhead sits right in target center
          const shortenPx = 3.5;
          const targetX = end.x - (dx / len) * shortenPx;
          const targetY = end.y - (dy / len) * shortenPx;

          const colorId = arrow.color.replace('#', '');

          return (
            <g key={arrow.id} className="tactical-arrow-group">
              {/* Outer glow line */}
              <line
                x1={start.x}
                y1={start.y}
                x2={targetX}
                y2={targetY}
                stroke={arrow.color}
                strokeWidth="2.8"
                strokeOpacity="0.4"
                strokeLinecap="round"
                filter={`drop-shadow(0 0 4px ${arrow.color})`}
              />
              {/* Main Arrow Line */}
              <line
                x1={start.x}
                y1={start.y}
                x2={targetX}
                y2={targetY}
                stroke={arrow.color}
                strokeWidth="1.6"
                strokeLinecap="round"
                markerEnd={`url(#arrowhead-${colorId})`}
              />
              {/* Start node circle */}
              <circle cx={start.x} cy={start.y} r="1.6" fill={arrow.color} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
