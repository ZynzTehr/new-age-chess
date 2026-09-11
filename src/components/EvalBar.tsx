import React from 'react';

interface EvalBarProps {
  score: number; // centipawns (+ for white, - for black)
  flipped?: boolean;
}

export const EvalBar: React.FC<EvalBarProps> = ({ score, flipped = false }) => {
  // Convert centipawns to percentage for White (0% = Black winning, 100% = White winning)
  // Clamp between -1000 and +1000 centipawns
  const clamped = Math.max(-1000, Math.min(1000, score));
  // Sigmoid formula: 50 + 50 * (2 / (1 + exp(-0.004 * score)) - 1)
  const whitePercent = 50 + 50 * (2 / (1 + Math.exp(-0.004 * clamped)) - 1);
  const whiteHeight = Math.max(5, Math.min(95, whitePercent));
  const blackHeight = 100 - whiteHeight;

  const scoreFormatted = (score / 100).toFixed(1);
  const scoreDisplay = score > 0 ? `+${scoreFormatted}` : score === 0 ? '0.0' : scoreFormatted;

  return (
    <div className="eval-bar-wrapper" title={`Engine Evaluation: ${scoreDisplay}`}>
      <div className="eval-bar-container">
        {/* Black Bar (Top by default) */}
        <div
          className="eval-bar-black"
          style={{ height: `${flipped ? whiteHeight : blackHeight}%` }}
        >
          {!flipped && score < -40 && (
            <span className="eval-text eval-text-black">{scoreDisplay}</span>
          )}
          {flipped && score > 40 && (
            <span className="eval-text eval-text-white">{scoreDisplay}</span>
          )}
        </div>

        {/* White Bar (Bottom by default) */}
        <div
          className="eval-bar-white"
          style={{ height: `${flipped ? blackHeight : whiteHeight}%` }}
        >
          {!flipped && score >= -40 && (
            <span className="eval-text eval-text-white">{scoreDisplay}</span>
          )}
          {flipped && score <= 40 && (
            <span className="eval-text eval-text-black">{scoreDisplay}</span>
          )}
        </div>
      </div>
    </div>
  );
};
