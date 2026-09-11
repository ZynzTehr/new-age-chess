import type { Piece, PieceColor, PieceType, Square, Move } from '../types/chess';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export function squareToFileRank(square: Square): { file: number; rank: number } {
  const file = square.charCodeAt(0) - 97; // 'a' -> 0, 'h' -> 7
  const rank = parseInt(square[1], 10) - 1; // '1' -> 0, '8' -> 7
  return { file, rank };
}

export function fileRankToSquare(file: number, rank: number): Square {
  return `${FILES[file]}${RANKS[rank]}`;
}

export function isInsideBoard(file: number, rank: number): boolean {
  return file >= 0 && file < 8 && rank >= 0 && rank < 8;
}

export interface CastlingRights {
  wK: boolean;
  wQ: boolean;
  bK: boolean;
  bQ: boolean;
}

export interface GameState {
  board: (Piece | null)[][]; // 8x8 [rank][file], rank 0 is 1st rank, rank 7 is 8th rank
  turn: PieceColor;
  castling: CastlingRights;
  enPassant: Square | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  history: {
    move: Move;
    state: {
      castling: CastlingRights;
      enPassant: Square | null;
      halfmoveClock: number;
      capturedPiece: Piece | null;
    };
  }[];
  positionHistory: Map<string, number>;
}

export class ChessEngine {
  public state: GameState;

  constructor(fen: string = INITIAL_FEN) {
    this.state = this.loadFen(fen);
  }

  public clone(): ChessEngine {
    const cloned = new ChessEngine();
    cloned.state = {
      board: this.state.board.map(row => row.map(cell => (cell ? { ...cell } : null))),
      turn: this.state.turn,
      castling: { ...this.state.castling },
      enPassant: this.state.enPassant,
      halfmoveClock: this.state.halfmoveClock,
      fullmoveNumber: this.state.fullmoveNumber,
      history: this.state.history.map(h => ({
        move: { ...h.move },
        state: {
          castling: { ...h.state.castling },
          enPassant: h.state.enPassant,
          halfmoveClock: h.state.halfmoveClock,
          capturedPiece: h.state.capturedPiece ? { ...h.state.capturedPiece } : null,
        },
      })),
      positionHistory: new Map(this.state.positionHistory),
    };
    return cloned;
  }

  public getPiece(square: Square): Piece | null {
    const { file, rank } = squareToFileRank(square);
    if (!isInsideBoard(file, rank)) return null;
    return this.state.board[rank][file];
  }

  public setPiece(square: Square, piece: Piece | null): void {
    const { file, rank } = squareToFileRank(square);
    if (isInsideBoard(file, rank)) {
      this.state.board[rank][file] = piece;
    }
  }

  public loadFen(fen: string): GameState {
    const parts = fen.trim().split(/\s+/);
    const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

    const rows = (parts[0] || '8/8/8/8/8/8/8/8').split('/');
    for (let r = 0; r < 8; r++) {
      const rankIdx = 7 - r;
      let fileIdx = 0;
      const rowStr = rows[r] || '';
      for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i];
        if (char >= '1' && char <= '8') {
          fileIdx += parseInt(char, 10);
        } else {
          const color: PieceColor = char === char.toUpperCase() ? 'w' : 'b';
          const type = char.toLowerCase() as PieceType;
          if (fileIdx < 8) {
            board[rankIdx][fileIdx] = { color, type };
            fileIdx++;
          }
        }
      }
    }

    const turn: PieceColor = parts[1] === 'b' ? 'b' : 'w';
    const castlingStr = parts[2] || '-';
    const castling: CastlingRights = {
      wK: castlingStr.includes('K'),
      wQ: castlingStr.includes('Q'),
      bK: castlingStr.includes('k'),
      bQ: castlingStr.includes('q'),
    };

    const ep = parts[3] && parts[3] !== '-' ? parts[3] : null;
    const halfmoveClock = parts[4] ? parseInt(parts[4], 10) : 0;
    const fullmoveNumber = parts[5] ? parseInt(parts[5], 10) : 1;

    const state: GameState = {
      board,
      turn,
      castling,
      enPassant: ep,
      halfmoveClock: isNaN(halfmoveClock) ? 0 : halfmoveClock,
      fullmoveNumber: isNaN(fullmoveNumber) ? 1 : fullmoveNumber,
      history: [],
      positionHistory: new Map(),
    };

    const key = this.getPositionKey(state);
    state.positionHistory.set(key, 1);

    this.state = state;
    return state;
  }

  public getFen(): string {
    const rows: string[] = [];
    for (let r = 7; r >= 0; r--) {
      let rowStr = '';
      let emptyCount = 0;
      for (let f = 0; f < 8; f++) {
        const piece = this.state.board[r][f];
        if (!piece) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            rowStr += emptyCount;
            emptyCount = 0;
          }
          const char = piece.type;
          rowStr += piece.color === 'w' ? char.toUpperCase() : char.toLowerCase();
        }
      }
      if (emptyCount > 0) rowStr += emptyCount;
      rows.push(rowStr);
    }

    const castlingParts: string[] = [];
    if (this.state.castling.wK) castlingParts.push('K');
    if (this.state.castling.wQ) castlingParts.push('Q');
    if (this.state.castling.bK) castlingParts.push('k');
    if (this.state.castling.bQ) castlingParts.push('q');
    const castlingStr = castlingParts.length > 0 ? castlingParts.join('') : '-';

    return `${rows.join('/')} ${this.state.turn} ${castlingStr} ${this.state.enPassant || '-'} ${this.state.halfmoveClock} ${this.state.fullmoveNumber}`;
  }

  public getPositionKey(state: GameState = this.state): string {
    const rows: string[] = [];
    for (let r = 7; r >= 0; r--) {
      let rowStr = '';
      let emptyCount = 0;
      for (let f = 0; f < 8; f++) {
        const piece = state.board[r][f];
        if (!piece) emptyCount++;
        else {
          if (emptyCount > 0) {
            rowStr += emptyCount;
            emptyCount = 0;
          }
          rowStr += piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
        }
      }
      if (emptyCount > 0) rowStr += emptyCount;
      rows.push(rowStr);
    }
    const c = `${state.castling.wK ? 'K' : ''}${state.castling.wQ ? 'Q' : ''}${state.castling.bK ? 'k' : ''}${state.castling.bQ ? 'q' : ''}` || '-';
    return `${rows.join('/')} ${state.turn} ${c} ${state.enPassant || '-'}`;
  }

  public isSquareAttacked(square: Square, attackingColor: PieceColor): boolean {
    const { file: targetF, rank: targetR } = squareToFileRank(square);

    // 1. Attacked by pawns
    const pawnRankDelta = attackingColor === 'w' ? -1 : 1;
    const pawnRank = targetR + pawnRankDelta;
    if (pawnRank >= 0 && pawnRank < 8) {
      for (const pawnFile of [targetF - 1, targetF + 1]) {
        if (pawnFile >= 0 && pawnFile < 8) {
          const piece = this.state.board[pawnRank][pawnFile];
          if (piece && piece.color === attackingColor && piece.type === 'p') {
            return true;
          }
        }
      }
    }

    // 2. Attacked by Knights
    const knightOffsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];
    for (const [df, dr] of knightOffsets) {
      const f = targetF + df;
      const r = targetR + dr;
      if (isInsideBoard(f, r)) {
        const piece = this.state.board[r][f];
        if (piece && piece.color === attackingColor && piece.type === 'n') {
          return true;
        }
      }
    }

    // 3. Attacked by King
    for (let df = -1; df <= 1; df++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (df === 0 && dr === 0) continue;
        const f = targetF + df;
        const r = targetR + dr;
        if (isInsideBoard(f, r)) {
          const piece = this.state.board[r][f];
          if (piece && piece.color === attackingColor && piece.type === 'k') {
            return true;
          }
        }
      }
    }

    // 4. Attacked along straight rays (Rook / Queen)
    const straightDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [df, dr] of straightDirs) {
      let f = targetF + df;
      let r = targetR + dr;
      while (isInsideBoard(f, r)) {
        const piece = this.state.board[r][f];
        if (piece) {
          if (piece.color === attackingColor && (piece.type === 'r' || piece.type === 'q')) {
            return true;
          }
          break;
        }
        f += df;
        r += dr;
      }
    }

    // 5. Attacked along diagonal rays (Bishop / Queen)
    const diagDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [df, dr] of diagDirs) {
      let f = targetF + df;
      let r = targetR + dr;
      while (isInsideBoard(f, r)) {
        const piece = this.state.board[r][f];
        if (piece) {
          if (piece.color === attackingColor && (piece.type === 'b' || piece.type === 'q')) {
            return true;
          }
          break;
        }
        f += df;
        r += dr;
      }
    }

    return false;
  }

  public getKingSquare(color: PieceColor): Square | null {
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = this.state.board[r][f];
        if (piece && piece.color === color && piece.type === 'k') {
          return fileRankToSquare(f, r);
        }
      }
    }
    return null;
  }

  public inCheck(color: PieceColor = this.state.turn): boolean {
    const kingSq = this.getKingSquare(color);
    if (!kingSq) return false;
    const opponent: PieceColor = color === 'w' ? 'b' : 'w';
    return this.isSquareAttacked(kingSq, opponent);
  }

  public getPseudoLegalMoves(color: PieceColor = this.state.turn): Move[] {
    const moves: Move[] = [];
    const opponent: PieceColor = color === 'w' ? 'b' : 'w';
    const forward = color === 'w' ? 1 : -1;
    const startPawnRank = color === 'w' ? 1 : 6;
    const promoRank = color === 'w' ? 7 : 0;

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = this.state.board[r][f];
        if (!piece || piece.color !== color) continue;

        const fromSq = fileRankToSquare(f, r);

        // --- PAWNS ---
        if (piece.type === 'p') {
          const nextR = r + forward;
          if (nextR >= 0 && nextR < 8) {
            // 1-step forward
            if (!this.state.board[nextR][f]) {
              const toSq = fileRankToSquare(f, nextR);
              if (nextR === promoRank) {
                for (const promo of ['q', 'r', 'b', 'n'] as PieceType[]) {
                  moves.push({ from: fromSq, to: toSq, piece: 'p', color, promotion: promo });
                }
              } else {
                moves.push({ from: fromSq, to: toSq, piece: 'p', color });
              }

              // 2-step forward
              if (r === startPawnRank) {
                const doubleR = r + forward * 2;
                if (!this.state.board[doubleR][f]) {
                  moves.push({ from: fromSq, to: fileRankToSquare(f, doubleR), piece: 'p', color });
                }
              }
            }

            // Captures (diagonal)
            for (const capF of [f - 1, f + 1]) {
              if (capF >= 0 && capF < 8) {
                const capPiece = this.state.board[nextR][capF];
                const toSq = fileRankToSquare(capF, nextR);
                if (capPiece && capPiece.color === opponent) {
                  if (nextR === promoRank) {
                    for (const promo of ['q', 'r', 'b', 'n'] as PieceType[]) {
                      moves.push({ from: fromSq, to: toSq, piece: 'p', color, captured: capPiece.type, promotion: promo });
                    }
                  } else {
                    moves.push({ from: fromSq, to: toSq, piece: 'p', color, captured: capPiece.type });
                  }
                } else if (this.state.enPassant === toSq) {
                  // En passant capture
                  moves.push({ from: fromSq, to: toSq, piece: 'p', color, captured: 'p', isEnPassant: true });
                }
              }
            }
          }
        }

        // --- KNIGHTS ---
        if (piece.type === 'n') {
          const offsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1],
          ];
          for (const [df, dr] of offsets) {
            const tf = f + df;
            const tr = r + dr;
            if (isInsideBoard(tf, tr)) {
              const dest = this.state.board[tr][tf];
              const toSq = fileRankToSquare(tf, tr);
              if (!dest) {
                moves.push({ from: fromSq, to: toSq, piece: 'n', color });
              } else if (dest.color === opponent) {
                moves.push({ from: fromSq, to: toSq, piece: 'n', color, captured: dest.type });
              }
            }
          }
        }

        // --- BISHOPS & QUEENS (Diagonals) ---
        if (piece.type === 'b' || piece.type === 'q') {
          const diagDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
          for (const [df, dr] of diagDirs) {
            let tf = f + df;
            let tr = r + dr;
            while (isInsideBoard(tf, tr)) {
              const dest = this.state.board[tr][tf];
              const toSq = fileRankToSquare(tf, tr);
              if (!dest) {
                moves.push({ from: fromSq, to: toSq, piece: piece.type, color });
              } else {
                if (dest.color === opponent) {
                  moves.push({ from: fromSq, to: toSq, piece: piece.type, color, captured: dest.type });
                }
                break;
              }
              tf += df;
              tr += dr;
            }
          }
        }

        // --- ROOKS & QUEENS (Straights) ---
        if (piece.type === 'r' || piece.type === 'q') {
          const straightDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
          for (const [df, dr] of straightDirs) {
            let tf = f + df;
            let tr = r + dr;
            while (isInsideBoard(tf, tr)) {
              const dest = this.state.board[tr][tf];
              const toSq = fileRankToSquare(tf, tr);
              if (!dest) {
                moves.push({ from: fromSq, to: toSq, piece: piece.type, color });
              } else {
                if (dest.color === opponent) {
                  moves.push({ from: fromSq, to: toSq, piece: piece.type, color, captured: dest.type });
                }
                break;
              }
              tf += df;
              tr += dr;
            }
          }
        }

        // --- KING ---
        if (piece.type === 'k') {
          for (let df = -1; df <= 1; df++) {
            for (let dr = -1; dr <= 1; dr++) {
              if (df === 0 && dr === 0) continue;
              const tf = f + df;
              const tr = r + dr;
              if (isInsideBoard(tf, tr)) {
                const dest = this.state.board[tr][tf];
                const toSq = fileRankToSquare(tf, tr);
                if (!dest) {
                  moves.push({ from: fromSq, to: toSq, piece: 'k', color });
                } else if (dest.color === opponent) {
                  moves.push({ from: fromSq, to: toSq, piece: 'k', color, captured: dest.type });
                }
              }
            }
          }

          // Castling
          const baseRank = color === 'w' ? 0 : 7;
          if (r === baseRank && f === 4 && !this.inCheck(color)) {
            // Kingside (O-O)
            const canKingside = color === 'w' ? this.state.castling.wK : this.state.castling.bK;
            if (
              canKingside &&
              !this.state.board[baseRank][5] &&
              !this.state.board[baseRank][6] &&
              !this.isSquareAttacked(fileRankToSquare(5, baseRank), opponent) &&
              !this.isSquareAttacked(fileRankToSquare(6, baseRank), opponent)
            ) {
              moves.push({
                from: fromSq,
                to: fileRankToSquare(6, baseRank),
                piece: 'k',
                color,
                isCastling: 'k',
              });
            }

            // Queenside (O-O-O)
            const canQueenside = color === 'w' ? this.state.castling.wQ : this.state.castling.bQ;
            if (
              canQueenside &&
              !this.state.board[baseRank][3] &&
              !this.state.board[baseRank][2] &&
              !this.state.board[baseRank][1] &&
              !this.isSquareAttacked(fileRankToSquare(3, baseRank), opponent) &&
              !this.isSquareAttacked(fileRankToSquare(2, baseRank), opponent)
            ) {
              moves.push({
                from: fromSq,
                to: fileRankToSquare(2, baseRank),
                piece: 'k',
                color,
                isCastling: 'q',
              });
            }
          }
        }
      }
    }

    return moves;
  }

  public getLegalMoves(color: PieceColor = this.state.turn, computeSan = true): Move[] {
    const pseudo = this.getPseudoLegalMoves(color);
    const legal: Move[] = [];

    for (let i = 0; i < pseudo.length; i++) {
      const move = pseudo[i];
      this.makeMove(move);
      if (!this.inCheck(color)) {
        legal.push(move);
      }
      this.undoMove();
    }

    if (computeSan) {
      for (const m of legal) {
        m.san = this.computeSan(m, legal);
      }
    }

    return legal;
  }

  public computeSan(move: Move, allLegalMoves: Move[]): string {
    if (move.isCastling === 'k') return move.isCheckmate ? 'O-O#' : move.isCheck ? 'O-O+' : 'O-O';
    if (move.isCastling === 'q') return move.isCheckmate ? 'O-O-O#' : move.isCheck ? 'O-O-O+' : 'O-O-O';

    let san = '';
    if (move.piece !== 'p') {
      san += move.piece.toUpperCase();

      // Disambiguation
      const ambiguous = allLegalMoves.filter(
        other => other.piece === move.piece && other.to === move.to && other.from !== move.from
      );

      if (ambiguous.length > 0) {
        const fromF = move.from[0];
        const fromR = move.from[1];
        const sameFile = ambiguous.some(a => a.from[0] === fromF);
        const sameRank = ambiguous.some(a => a.from[1] === fromR);

        if (!sameFile) {
          san += fromF;
        } else if (!sameRank) {
          san += fromR;
        } else {
          san += move.from;
        }
      }
    }

    if (move.captured) {
      if (move.piece === 'p') {
        san += move.from[0];
      }
      san += 'x';
    }

    san += move.to;

    if (move.promotion) {
      san += `=${move.promotion.toUpperCase()}`;
    }

    // Check indicator
    const opponent: PieceColor = move.color === 'w' ? 'b' : 'w';
    this.makeMove(move);
    if (this.inCheck(opponent)) {
      const oppMoves = this.getLegalMoves(opponent, false);
      if (oppMoves.length === 0) {
        san += '#';
        move.isCheckmate = true;
      } else {
        san += '+';
        move.isCheck = true;
      }
    }
    this.undoMove();

    return san;
  }

  public makeMove(move: Move): boolean {
    const { from, to, piece, color, promotion, isCastling, isEnPassant } = move;
    const { file: fromF, rank: fromR } = squareToFileRank(from);
    const { file: toF, rank: toR } = squareToFileRank(to);

    const capturedPiece = this.state.board[toR][toF];
    const prevCastling = { ...this.state.castling };
    const prevEnPassant = this.state.enPassant;
    const prevHalfmove = this.state.halfmoveClock;

    // Save history for undo
    this.state.history.push({
      move,
      state: {
        castling: prevCastling,
        enPassant: prevEnPassant,
        halfmoveClock: prevHalfmove,
        capturedPiece: isEnPassant ? { type: 'p', color: color === 'w' ? 'b' : 'w' } : capturedPiece,
      },
    });

    // Move piece
    this.state.board[fromR][fromF] = null;
    this.state.board[toR][toF] = promotion ? { type: promotion, color } : { type: piece, color };

    // En passant handling
    if (isEnPassant) {
      const capRank = color === 'w' ? toR - 1 : toR + 1;
      this.state.board[capRank][toF] = null;
    }

    // Castling rook movement
    if (isCastling === 'k') {
      const baseR = color === 'w' ? 0 : 7;
      this.state.board[baseR][7] = null;
      this.state.board[baseR][5] = { type: 'r', color };
    } else if (isCastling === 'q') {
      const baseR = color === 'w' ? 0 : 7;
      this.state.board[baseR][0] = null;
      this.state.board[baseR][3] = { type: 'r', color };
    }

    // Update En Passant square
    if (piece === 'p' && Math.abs(toR - fromR) === 2) {
      const epRank = (toR + fromR) / 2;
      this.state.enPassant = fileRankToSquare(fromF, epRank);
    } else {
      this.state.enPassant = null;
    }

    // Update Castling Rights
    if (piece === 'k') {
      if (color === 'w') {
        this.state.castling.wK = false;
        this.state.castling.wQ = false;
      } else {
        this.state.castling.bK = false;
        this.state.castling.bQ = false;
      }
    } else if (piece === 'r') {
      if (from === 'a1') this.state.castling.wQ = false;
      if (from === 'h1') this.state.castling.wK = false;
      if (from === 'a8') this.state.castling.bQ = false;
      if (from === 'h8') this.state.castling.bK = false;
    }

    if (to === 'a1') this.state.castling.wQ = false;
    if (to === 'h1') this.state.castling.wK = false;
    if (to === 'a8') this.state.castling.bQ = false;
    if (to === 'h8') this.state.castling.bK = false;

    // Halfmove clock
    if (piece === 'p' || capturedPiece || isEnPassant) {
      this.state.halfmoveClock = 0;
    } else {
      this.state.halfmoveClock++;
    }

    if (color === 'b') {
      this.state.fullmoveNumber++;
    }

    this.state.turn = color === 'w' ? 'b' : 'w';

    const key = this.getPositionKey();
    this.state.positionHistory.set(key, (this.state.positionHistory.get(key) || 0) + 1);

    return true;
  }

  public undoMove(): Move | null {
    const lastEntry = this.state.history.pop();
    if (!lastEntry) return null;

    const key = this.getPositionKey();
    const count = this.state.positionHistory.get(key) || 1;
    if (count <= 1) {
      this.state.positionHistory.delete(key);
    } else {
      this.state.positionHistory.set(key, count - 1);
    }

    const { move, state: prevState } = lastEntry;
    const { from, to, piece, color, isCastling, isEnPassant } = move;
    const { file: fromF, rank: fromR } = squareToFileRank(from);
    const { file: toF, rank: toR } = squareToFileRank(to);

    // Restore moving piece
    this.state.board[fromR][fromF] = { type: piece, color };
    this.state.board[toR][toF] = null;

    // Restore captured piece
    if (prevState.capturedPiece) {
      if (isEnPassant) {
        const capRank = color === 'w' ? toR - 1 : toR + 1;
        this.state.board[capRank][toF] = prevState.capturedPiece;
      } else {
        this.state.board[toR][toF] = prevState.capturedPiece;
      }
    }

    // Restore castling rook
    if (isCastling === 'k') {
      const baseR = color === 'w' ? 0 : 7;
      this.state.board[baseR][5] = null;
      this.state.board[baseR][7] = { type: 'r', color };
    } else if (isCastling === 'q') {
      const baseR = color === 'w' ? 0 : 7;
      this.state.board[baseR][3] = null;
      this.state.board[baseR][0] = { type: 'r', color };
    }

    this.state.castling = prevState.castling;
    this.state.enPassant = prevState.enPassant;
    this.state.halfmoveClock = prevState.halfmoveClock;
    if (color === 'b') {
      this.state.fullmoveNumber--;
    }
    this.state.turn = color;

    return move;
  }

  public isGameOver(): { over: boolean; result?: '1-0' | '0-1' | '1/2-1/2'; reason?: string } {
    const legalMoves = this.getLegalMoves(this.state.turn, false);
    if (legalMoves.length === 0) {
      if (this.inCheck()) {
        const winner = this.state.turn === 'w' ? 'Black' : 'White';
        return {
          over: true,
          result: this.state.turn === 'w' ? '0-1' : '1-0',
          reason: `Checkmate! ${winner} wins.`,
        };
      } else {
        return {
          over: true,
          result: '1/2-1/2',
          reason: 'Stalemate! Game drawn.',
        };
      }
    }

    // 50-move rule
    if (this.state.halfmoveClock >= 100) {
      return { over: true, result: '1/2-1/2', reason: 'Draw by 50-move rule.' };
    }

    // Threefold repetition
    const key = this.getPositionKey();
    if ((this.state.positionHistory.get(key) || 0) >= 3) {
      return { over: true, result: '1/2-1/2', reason: 'Draw by threefold repetition.' };
    }

    // Insufficient material
    if (this.isInsufficientMaterial()) {
      return { over: true, result: '1/2-1/2', reason: 'Draw by insufficient material.' };
    }

    return { over: false };
  }

  public isInsufficientMaterial(): boolean {
    const pieces: { piece: Piece; square: Square }[] = [];
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = this.state.board[r][f];
        if (p) {
          pieces.push({ piece: p, square: fileRankToSquare(f, r) });
        }
      }
    }

    // K vs K
    if (pieces.length === 2) return true;

    // K+B vs K or K+N vs K
    if (pieces.length === 3) {
      const nonKing = pieces.find(p => p.piece.type !== 'k');
      if (nonKing && (nonKing.piece.type === 'b' || nonKing.piece.type === 'n')) {
        return true;
      }
    }

    // K+B vs K+B with bishops on same color square
    if (pieces.length === 4) {
      const bishops = pieces.filter(p => p.piece.type === 'b');
      if (bishops.length === 2 && bishops[0].piece.color !== bishops[1].piece.color) {
        const sq1 = squareToFileRank(bishops[0].square);
        const sq2 = squareToFileRank(bishops[1].square);
        const isSq1Dark = (sq1.file + sq1.rank) % 2 === 0;
        const isSq2Dark = (sq2.file + sq2.rank) % 2 === 0;
        if (isSq1Dark === isSq2Dark) return true;
      }
    }

    return false;
  }

  public getCapturedPieces(): { white: PieceType[]; black: PieceType[] } {
    const initialCounts: Record<PieceColor, Record<PieceType, number>> = {
      w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
      b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    };

    const currentCounts: Record<PieceColor, Record<PieceType, number>> = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    };

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = this.state.board[r][f];
        if (p) {
          currentCounts[p.color][p.type]++;
        }
      }
    }

    const whiteCaptured: PieceType[] = [];
    const blackCaptured: PieceType[] = [];

    const order: PieceType[] = ['q', 'r', 'b', 'n', 'p'];
    for (const type of order) {
      const diffW = Math.max(0, initialCounts.w[type] - currentCounts.w[type]);
      for (let i = 0; i < diffW; i++) whiteCaptured.push(type);

      const diffB = Math.max(0, initialCounts.b[type] - currentCounts.b[type]);
      for (let i = 0; i < diffB; i++) blackCaptured.push(type);
    }

    return { white: whiteCaptured, black: blackCaptured };
  }

  public getMaterialScore(): { white: number; black: number; diff: number } {
    const values: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    let wScore = 0;
    let bScore = 0;

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = this.state.board[r][f];
        if (p) {
          if (p.color === 'w') wScore += values[p.type];
          else bScore += values[p.type];
        }
      }
    }

    return { white: wScore, black: bScore, diff: wScore - bScore };
  }

  public exportPgn(headers: Record<string, string> = {}): string {
    const defaultHeaders: Record<string, string> = {
      Event: 'New Age Chess Arena',
      Site: 'New Age Chess Web App',
      Date: new Date().toISOString().slice(0, 10),
      White: 'Player 1',
      Black: 'Player 2',
      Result: '*',
      ...headers,
    };

    let pgn = '';
    for (const [key, val] of Object.entries(defaultHeaders)) {
      pgn += `[${key} "${val}"]\n`;
    }
    pgn += '\n';

    let moveText = '';
    for (let i = 0; i < this.state.history.length; i++) {
      const entry = this.state.history[i];
      if (i % 2 === 0) {
        moveText += `${Math.floor(i / 2) + 1}. `;
      }
      moveText += `${entry.move.san || `${entry.move.from}-${entry.move.to}`} `;
    }

    const gameOver = this.isGameOver();
    if (gameOver.over && gameOver.result) {
      moveText += gameOver.result;
    }

    return pgn + moveText.trim();
  }
}
