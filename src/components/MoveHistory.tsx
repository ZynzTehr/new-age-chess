import React, { useRef, useEffect } from 'react';
import type { GameHistoryEntry, PieceType, PieceSetId } from '../types/chess';
import { PieceIcon } from '../assets/pieceSets';
import { Copy, Download, Check } from 'lucide-react';

interface MoveHistoryProps {
  history: GameHistoryEntry[];
  currentMoveIndex: number;
  onJumpToMove: (index: number) => void;
  capturedPieces: { white: PieceType[]; black: PieceType[] };
  materialDiff: number; // positive = White leads, negative = Black leads
  pieceSet: PieceSetId;
  onCopyPgn: () => void;
  onDownloadPgn: () => void;
  pgnCopied: boolean;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  currentMoveIndex,
  onJumpToMove,
  capturedPieces,
  materialDiff,
  pieceSet,
  onCopyPgn,
  onDownloadPgn,
  pgnCopied,
}) => {
  const moveListEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    moveListEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history.length]);

  // Group moves into pairs (White move, Black move)
  const movePairs: Array<{
    moveNumber: number;
    white?: { entry: GameHistoryEntry; index: number };
    black?: { entry: GameHistoryEntry; index: number };
  }> = [];

  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: history[i] ? { entry: history[i], index: i } : undefined,
      black: history[i + 1] ? { entry: history[i + 1], index: i + 1 } : undefined,
    });
  }

  const getQualityBadge = (quality?: string) => {
    switch (quality) {
      case 'brilliant':
        return <span className="quality-tag quality-brilliant" title="Brilliant Move">‼</span>;
      case 'great':
        return <span className="quality-tag quality-great" title="Great Move">!</span>;
      case 'best':
        return <span className="quality-tag quality-best" title="Best Move">★</span>;
      case 'inaccuracy':
        return <span className="quality-tag quality-inaccuracy" title="Inaccuracy">?!</span>;
      case 'mistake':
        return <span className="quality-tag quality-mistake" title="Mistake">?</span>;
      case 'blunder':
        return <span className="quality-tag quality-blunder" title="Blunder">??</span>;
      default:
        return null;
    }
  };

  return (
    <div className="move-history-card">
      {/* 1. Captured Pieces Tray */}
      <div className="captured-tray-container">
        {/* Black Captured Pieces (Captured by White) */}
        <div className="captured-row">
          <div className="captured-pieces-list">
            {capturedPieces.black.map((pt, idx) => (
              <span key={`cap-b-${idx}`} className="captured-mini-piece">
                <PieceIcon type={pt} color="b" set={pieceSet} size={18} />
              </span>
            ))}
          </div>
          {materialDiff > 0 && (
            <span className="material-advantage-tag tag-white">+{materialDiff}</span>
          )}
        </div>

        {/* White Captured Pieces (Captured by Black) */}
        <div className="captured-row">
          <div className="captured-pieces-list">
            {capturedPieces.white.map((pt, idx) => (
              <span key={`cap-w-${idx}`} className="captured-mini-piece">
                <PieceIcon type={pt} color="w" set={pieceSet} size={18} />
              </span>
            ))}
          </div>
          {materialDiff < 0 && (
            <span className="material-advantage-tag tag-black">+{Math.abs(materialDiff)}</span>
          )}
        </div>
      </div>

      {/* 2. Moves Notation List */}
      <div className="moves-scroll-area">
        {movePairs.length === 0 ? (
          <div className="empty-moves-text">Game moves will appear here...</div>
        ) : (
          <div className="moves-table">
            {movePairs.map(pair => (
              <div key={`pair-${pair.moveNumber}`} className="move-table-row">
                <span className="move-num-col">{pair.moveNumber}.</span>

                {/* White Move */}
                <div
                  className={`move-btn-col ${
                    pair.white && currentMoveIndex === pair.white.index ? 'active-move' : ''
                  }`}
                  onClick={() => pair.white && onJumpToMove(pair.white.index)}
                >
                  {pair.white && (
                    <>
                      <span className="san-text">{pair.white.entry.move.san}</span>
                      {getQualityBadge(pair.white.entry.quality)}
                    </>
                  )}
                </div>

                {/* Black Move */}
                <div
                  className={`move-btn-col ${
                    pair.black && currentMoveIndex === pair.black.index ? 'active-move' : ''
                  }`}
                  onClick={() => pair.black && onJumpToMove(pair.black.index)}
                >
                  {pair.black && (
                    <>
                      <span className="san-text">{pair.black.entry.move.san}</span>
                      {getQualityBadge(pair.black.entry.quality)}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={moveListEndRef} />
          </div>
        )}
      </div>

      {/* 3. PGN Export & Copy Actions */}
      <div className="pgn-actions-row">
        <button
          className="pgn-action-btn"
          onClick={onCopyPgn}
          title="Copy PGN Notation to Clipboard"
        >
          {pgnCopied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
          <span>{pgnCopied ? 'Copied!' : 'Copy PGN'}</span>
        </button>

        <button
          className="pgn-action-btn"
          onClick={onDownloadPgn}
          title="Download PGN File"
        >
          <Download size={14} />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};
