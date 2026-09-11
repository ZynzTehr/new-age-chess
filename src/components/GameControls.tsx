import React, { useState } from 'react';
import {
  RotateCcw,
  RotateCw,
  RefreshCw,
  Lightbulb,
  Flag,
  Handshake,
  FileCode,
  Sparkles,
} from 'lucide-react';

interface GameControlsProps {
  onNewGame: () => void;
  onFlipBoard: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onGetHint: () => void;
  onResign: () => void;
  onOfferDraw: () => void;
  onLoadFen: (fen: string) => boolean;
  disabled?: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onFlipBoard,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onGetHint,
  onResign,
  onOfferDraw,
  onLoadFen,
  disabled = false,
}) => {
  const [showFenModal, setShowFenModal] = useState(false);
  const [fenInput, setFenInput] = useState('');
  const [fenError, setFenError] = useState('');

  const handleFenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fenInput.trim()) return;

    const success = onLoadFen(fenInput.trim());
    if (success) {
      setShowFenModal(false);
      setFenInput('');
      setFenError('');
    } else {
      setFenError('Invalid FEN string. Please verify the piece placement and format.');
    }
  };

  return (
    <div className="game-controls-container">
      {/* Primary Action Buttons */}
      <div className="controls-button-group">
        {/* New Game */}
        <button
          className="control-btn primary-action-btn"
          onClick={onNewGame}
          title="Start a Fresh Game"
        >
          <Sparkles size={15} />
          <span className="btn-label">New Game</span>
        </button>

        {/* Undo */}
        <button
          className="control-btn"
          onClick={onUndo}
          disabled={!canUndo || disabled}
          title="Undo Last Move"
        >
          <RotateCcw size={15} />
          <span className="btn-label">Undo</span>
        </button>

        {/* Redo */}
        <button
          className="control-btn"
          onClick={onRedo}
          disabled={!canRedo || disabled}
          title="Redo Move"
        >
          <RotateCw size={15} />
          <span className="btn-label">Redo</span>
        </button>

        {/* Flip Board */}
        <button
          className="control-btn"
          onClick={onFlipBoard}
          title="Flip Board Perspective"
        >
          <RefreshCw size={15} />
          <span className="btn-label">Flip</span>
        </button>

        {/* Grandmaster Hint */}
        <button
          className="control-btn highlight-hint-btn"
          onClick={onGetHint}
          disabled={disabled}
          title="Get Grandmaster Move Hint"
        >
          <Lightbulb size={15} className="text-amber" />
          <span className="btn-label">Hint</span>
        </button>
      </div>

      {/* Secondary Controls */}
      <div className="secondary-controls-group">
        {/* Draw */}
        <button
          className="secondary-btn"
          onClick={onOfferDraw}
          disabled={disabled}
          title="Offer Draw"
        >
          <Handshake size={14} />
          <span>Draw</span>
        </button>

        {/* Resign */}
        <button
          className="secondary-btn btn-danger"
          onClick={onResign}
          disabled={disabled}
          title="Resign Game"
        >
          <Flag size={14} />
          <span>Resign</span>
        </button>

        {/* FEN Load */}
        <button
          className="secondary-btn"
          onClick={() => setShowFenModal(true)}
          title="Load Custom FEN Position"
        >
          <FileCode size={14} />
          <span>Load FEN</span>
        </button>
      </div>

      {/* FEN Input Modal */}
      {showFenModal && (
        <div className="modal-backdrop" onClick={() => setShowFenModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Load Custom Position (FEN)</h3>
            <p className="modal-desc">
              Paste standard Forsyth-Edwards Notation (FEN) to set up any chess position or study.
            </p>

            <form onSubmit={handleFenSubmit}>
              <input
                type="text"
                className="modal-input"
                placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                value={fenInput}
                onChange={e => {
                  setFenInput(e.target.value);
                  setFenError('');
                }}
                autoFocus
              />

              {fenError && <div className="modal-error-text">{fenError}</div>}

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="modal-btn secondary"
                  onClick={() => setShowFenModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-btn primary">
                  Load Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
