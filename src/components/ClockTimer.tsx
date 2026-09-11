import React from 'react';
import type { PieceColor } from '../types/chess';
import { Clock } from 'lucide-react';

interface ClockTimerProps {
  whiteTime: number; // in seconds
  blackTime: number; // in seconds
  activeTurn: PieceColor;
  isUnlimited: boolean;
  flipped: boolean;
  onSelectTimeControl?: (minutes: number, increment: number, isUnlimited: boolean) => void;
}

export const ClockTimer: React.FC<ClockTimerProps> = ({
  whiteTime,
  blackTime,
  activeTurn,
  isUnlimited,
  flipped,
}) => {
  const formatTime = (seconds: number): string => {
    if (isUnlimited) return '∞';
    const totalSecs = Math.max(0, seconds);
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);

    if (totalSecs < 10) {
      const tenths = Math.floor((totalSecs - Math.floor(totalSecs)) * 10);
      return `${secs}.${tenths}s`;
    }

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const topColor: PieceColor = flipped ? 'w' : 'b';
  const bottomColor: PieceColor = flipped ? 'b' : 'w';

  const topTime = topColor === 'w' ? whiteTime : blackTime;
  const bottomTime = bottomColor === 'w' ? whiteTime : blackTime;

  const isTopActive = activeTurn === topColor;
  const isBottomActive = activeTurn === bottomColor;

  const isTopLow = topTime < 20 && !isUnlimited;
  const isBottomLow = bottomTime < 20 && !isUnlimited;

  return (
    <div className="clocks-container">
      {/* Top Player Clock */}
      <div
        className={`clock-card clock-top ${isTopActive ? 'clock-active' : ''} ${
          isTopLow ? 'clock-low-time' : ''
        }`}
      >
        <div className="clock-player-label">
          <span className={`player-pip ${topColor === 'w' ? 'pip-white' : 'pip-black'}`} />
          <span>{topColor === 'w' ? 'White' : 'Black'}</span>
        </div>
        <div className="clock-time-display">
          <Clock size={16} className="clock-icon" />
          <span className="time-digits">{formatTime(topTime)}</span>
        </div>
      </div>

      {/* Bottom Player Clock */}
      <div
        className={`clock-card clock-bottom ${isBottomActive ? 'clock-active' : ''} ${
          isBottomLow ? 'clock-low-time' : ''
        }`}
      >
        <div className="clock-player-label">
          <span className={`player-pip ${bottomColor === 'w' ? 'pip-white' : 'pip-black'}`} />
          <span>{bottomColor === 'w' ? 'White' : 'Black'}</span>
        </div>
        <div className="clock-time-display">
          <Clock size={16} className="clock-icon" />
          <span className="time-digits">{formatTime(bottomTime)}</span>
        </div>
      </div>
    </div>
  );
};
