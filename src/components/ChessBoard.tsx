import React, { useState, useRef } from 'react';
import { ChessEngine, fileRankToSquare } from '../engine/chessLogic';
import type { PieceColor, PieceType, Square, Move, PieceSetId, StrategyIntel } from '../types/chess';
import { PieceIcon } from '../assets/pieceSets';
import { BoardOverlay } from './BoardOverlay';

interface ChessBoardProps {
  engine: ChessEngine;
  flipped: boolean;
  pieceSet: PieceSetId;
  showLegalMoves: boolean;
  showBestMoveArrow: boolean;
  showThreats: boolean;
  showInfluenceHeatmap: boolean;
  strategyIntel: StrategyIntel | null;
  lastMove: Move | null;
  onMakeMove: (move: Move) => boolean;
  customArrows?: Array<{ from: Square; to: Square; color?: string }>;
  disabled?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  engine,
  flipped,
  pieceSet,
  showLegalMoves,
  showBestMoveArrow,
  showThreats,
  showInfluenceHeatmap,
  strategyIntel,
  lastMove,
  onMakeMove,
  customArrows,
  disabled = false,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [promotionPending, setPromotionPending] = useState<{
    from: Square;
    to: Square;
    piece: PieceType;
    color: PieceColor;
  } | null>(null);
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  const legalMoves = selectedSquare
    ? engine.getLegalMoves().filter(m => m.from === selectedSquare)
    : [];
  const inCheck = engine.inCheck();
  const checkedKingSq = inCheck ? engine.getKingSquare(engine.state.turn) : null;

  const handleSquareClick = (square: Square) => {
    if (disabled || promotionPending) return;

    const clickedPiece = engine.getPiece(square);

    // If a square was already selected
    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }

      // Check if clicked square is a valid legal move destination
      const validMove = legalMoves.find(m => m.to === square);
      if (validMove) {
        // Check for pawn promotion
        const isPawnPromo =
          validMove.piece === 'p' &&
          ((validMove.color === 'w' && square[1] === '8') ||
            (validMove.color === 'b' && square[1] === '1'));

        if (isPawnPromo) {
          setPromotionPending({
            from: selectedSquare,
            to: square,
            piece: 'p',
            color: validMove.color,
          });
          return;
        }

        onMakeMove(validMove);
        setSelectedSquare(null);
        return;
      }

      // If clicking another of own pieces, switch selection
      if (clickedPiece && clickedPiece.color === engine.state.turn) {
        setSelectedSquare(square);
        return;
      }

      setSelectedSquare(null);
      return;
    }

    // New selection
    if (clickedPiece && clickedPiece.color === engine.state.turn) {
      setSelectedSquare(square);
    }
  };

  const handlePromotionSelect = (promoType: PieceType) => {
    if (!promotionPending) return;
    const move: Move = {
      from: promotionPending.from,
      to: promotionPending.to,
      piece: 'p',
      color: promotionPending.color,
      promotion: promoType,
    };
    onMakeMove(move);
    setPromotionPending(null);
    setSelectedSquare(null);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, square: Square) => {
    if (disabled || promotionPending) {
      e.preventDefault();
      return;
    }
    const piece = engine.getPiece(square);
    if (!piece || piece.color !== engine.state.turn) {
      e.preventDefault();
      return;
    }

    setDraggedSquare(square);
    setSelectedSquare(square);
    e.dataTransfer.setData('text/plain', square);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    const fromSquare = e.dataTransfer.getData('text/plain') as Square;
    setDraggedSquare(null);

    if (!fromSquare || fromSquare === targetSquare) return;

    const availableMoves = engine.getLegalMoves().filter(m => m.from === fromSquare);
    const validMove = availableMoves.find(m => m.to === targetSquare);

    if (validMove) {
      const isPawnPromo =
        validMove.piece === 'p' &&
        ((validMove.color === 'w' && targetSquare[1] === '8') ||
          (validMove.color === 'b' && targetSquare[1] === '1'));

      if (isPawnPromo) {
        setPromotionPending({
          from: fromSquare,
          to: targetSquare,
          piece: 'p',
          color: validMove.color,
        });
        return;
      }

      onMakeMove(validMove);
      setSelectedSquare(null);
    }
  };

  return (
    <div className="chess-board-wrapper">
      <div className="chess-board-outer-frame">
        {/* 8x8 Board Grid */}
        <div className="chess-board-grid" ref={boardRef}>
          {Array.from({ length: 8 }).map((_, rIdx) => {
            const r = flipped ? rIdx : 7 - rIdx;
            const rankLabel = (r + 1).toString();

            return (
              <div key={`rank-${r}`} className="board-rank-row">
                {Array.from({ length: 8 }).map((_, fIdx) => {
                  const f = flipped ? 7 - fIdx : fIdx;
                  const fileLabel = String.fromCharCode(97 + f);
                  const square = fileRankToSquare(f, r);
                  const piece = engine.getPiece(square);

                  const isDark = (f + r) % 2 === 0;
                  const isSelected = selectedSquare === square;
                  const isLastMoveFrom = lastMove?.from === square;
                  const isLastMoveTo = lastMove?.to === square;
                  const isKingInCheck = checkedKingSq === square;

                  const targetMove = legalMoves.find(m => m.to === square);
                  const isLegalTarget = showLegalMoves && !!targetMove;
                  const isCaptureTarget = isLegalTarget && !!piece;

                  return (
                    <div
                      key={square}
                      className={`board-square ${isDark ? 'square-dark' : 'square-light'} ${
                        isSelected ? 'square-selected' : ''
                      } ${isLastMoveFrom || isLastMoveTo ? 'square-last-move' : ''} ${
                        isKingInCheck ? 'square-check' : ''
                      }`}
                      onClick={() => handleSquareClick(square)}
                      onDragOver={handleDragOver}
                      onDrop={e => handleDrop(e, square)}
                      data-square={square}
                    >
                      {/* Square Coordinate Indicators */}
                      {fIdx === 0 && (
                        <span className="coord-label coord-rank">{rankLabel}</span>
                      )}
                      {rIdx === 7 && (
                        <span className="coord-label coord-file">{fileLabel}</span>
                      )}

                      {/* Piece Renderer */}
                      {piece && (
                        <div
                          className={`piece-container ${
                            piece.color === 'w' ? 'white-piece' : 'black-piece'
                          } ${draggedSquare === square ? 'dragging' : ''}`}
                          draggable={piece.color === engine.state.turn && !disabled}
                          onDragStart={e => handleDragStart(e, square)}
                          onDragEnd={() => setDraggedSquare(null)}
                        >
                          <PieceIcon type={piece.type} color={piece.color} set={pieceSet} />
                        </div>
                      )}

                      {/* Move Hint Indicator */}
                      {isLegalTarget && (
                        <div
                          className={`legal-move-hint ${
                            isCaptureTarget ? 'capture-ring' : 'move-dot'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Tactical Vectors, Danger Radar, Heatmaps Overlay (Placed inside grid for 1:1 pixel alignment) */}
          <BoardOverlay
            flipped={flipped}
            strategyIntel={strategyIntel}
            showBestMoveArrow={showBestMoveArrow}
            showThreats={showThreats}
            showInfluenceHeatmap={showInfluenceHeatmap}
            customArrows={customArrows}
          />
        </div>

        {/* Promotion Dialog Modal */}
        {promotionPending && (
          <div className="promotion-modal-backdrop">
            <div className="promotion-modal">
              <h4 className="promo-title">Promote Pawn</h4>
              <div className="promo-pieces-list">
                {(['q', 'r', 'b', 'n'] as PieceType[]).map(pt => (
                  <button
                    key={pt}
                    className="promo-btn"
                    onClick={() => handlePromotionSelect(pt)}
                  >
                    <PieceIcon
                      type={pt}
                      color={promotionPending.color}
                      set={pieceSet}
                      size={48}
                    />
                    <span className="promo-name">
                      {pt === 'q'
                        ? 'Queen'
                        : pt === 'r'
                        ? 'Rook'
                        : pt === 'b'
                        ? 'Bishop'
                        : 'Knight'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
