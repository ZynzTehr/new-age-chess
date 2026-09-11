import { ChessEngine } from './chessLogic';
import { findBookMove } from './openings';
import type { AIPersonality, AIPersonalityId, AIDifficulty, Move, PieceColor, PieceType } from '../types/chess';

export const AI_PERSONALITIES: Record<AIPersonalityId, AIPersonality> = {
  grandmaster: {
    id: 'grandmaster',
    name: 'Nexus Prime',
    title: 'Grandmaster AI Engine',
    avatar: '🤖',
    elo: 2450,
    description: 'A relentless, balanced neural grandmaster. Excels in long-term positional mastery, tactical precision, and ruthless endgame conversion.',
    styleDescription: 'Optimal positional play, flawless endgame conversion, deep tactical calculation.',
    aggression: 0.5,
    prophylaxis: 0.85,
    tacticalRisk: 0.3,
    preferredOpenings: ['Ruy Lopez', 'Queen’s Gambit', 'Sicilian Defense: Najdorf', 'Nimzo-Indian Defense'],
  },
  assassin: {
    id: 'assassin',
    name: 'Valkyrie Blade',
    title: 'Tactical Assassin',
    avatar: '⚔️',
    elo: 2200,
    description: 'An ultra-aggressive predator that relentlessly hunts the enemy king with sacrificial attacks and crushing pawn storms.',
    styleDescription: 'Fierce kingside pawn storms, speculative piece sacrifices, relentless tactical pressure.',
    aggression: 0.95,
    prophylaxis: 0.2,
    tacticalRisk: 0.85,
    preferredOpenings: ['Sicilian Defense: Dragon', 'King’s Indian Defense', 'Fried Liver Attack', 'King’s Gambit'],
  },
  fortress: {
    id: 'fortress',
    name: 'Aegis Titan',
    title: 'The Iron Fortress',
    avatar: '🛡️',
    elo: 2150,
    description: 'An impenetrable defensive titan. Builds airtight pawn chains, suffocates enemy counterplay, and wins through pure prophylaxis.',
    styleDescription: 'Airtight pawn structures, suffocating prophylaxis, risk-averse counter-punching.',
    aggression: 0.2,
    prophylaxis: 0.95,
    tacticalRisk: 0.1,
    preferredOpenings: ['London System', 'Caro-Kann Defense', 'French Defense', 'Slav Defense'],
  },
  hypermodern: {
    id: 'hypermodern',
    name: 'Oracle Vega',
    title: 'Hypermodern Sage',
    avatar: '🔮',
    elo: 2100,
    description: 'A mystical master of indirect control. Prefers double fianchetto systems, flank pressure, and striking the center from afar.',
    styleDescription: 'Bishop fianchettos, flank undermining, indirect center control with minor pieces.',
    aggression: 0.45,
    prophylaxis: 0.6,
    tacticalRisk: 0.5,
    preferredOpenings: ['Réti Opening', 'English Opening', 'King’s Indian Attack', 'Nimzo-Indian Defense'],
  },
  gambit: {
    id: 'gambit',
    name: 'Cipher Maverick',
    title: 'Gambit Maverick',
    avatar: '⚡',
    elo: 2000,
    description: 'A daredevil tactician that gambits pawns freely for electric initiative, rapid open diagonals, and chaotic complications.',
    styleDescription: 'High-octane gambits, rapid open files, dynamic piece development over material greed.',
    aggression: 0.85,
    prophylaxis: 0.15,
    tacticalRisk: 0.9,
    preferredOpenings: ['Evans Gambit', 'King’s Gambit', 'Sicilian Defense: Alapin', 'Queen’s Gambit Accepted'],
  },
};

// Piece base values in centipawns
const PIECE_VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (White perspective: rank 0 = 1st rank, rank 7 = 8th rank)
const PST_PAWN_MG = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [0,  0,  0,  0,  0,  0,  0,  0],
];

const PST_PAWN_EG = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [10, 10, 10, 10, 10, 10, 10, 10],
  [20, 20, 20, 20, 20, 20, 20, 20],
  [30, 30, 30, 30, 30, 30, 30, 30],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [80, 80, 80, 80, 80, 80, 80, 80],
  [120,120,120,120,120,120,120,120],
  [0,  0,  0,  0,  0,  0,  0,  0],
];

const PST_KNIGHT = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50],
];

const PST_BISHOP = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20],
];

const PST_ROOK = [
  [ 0,  0,  0,  5,  5,  0,  0,  0],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [ 5, 10, 10, 10, 10, 10, 10,  5],
  [ 0,  0,  0,  0,  0,  0,  0,  0],
];

const PST_QUEEN = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20],
];

const PST_KING_MG = [
  [ 20, 30, 10,  0,  0, 10, 30, 20],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
];

const PST_KING_EG = [
  [-50,-30,-30,-30,-30,-30,-30,-50],
  [-30,-10,  0,  0,  0,  0,-10,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  0, 20, 30, 30, 20,  0,-30],
  [-30,  0, 20, 30, 30, 20,  0,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,-10,  0,  0,  0,  0,-10,-30],
  [-50,-30,-30,-30,-30,-30,-30,-50],
];

export class AIEngine {
  private transpositionTable = new Map<string, { depth: number; score: number; flag: 'EXACT' | 'LOWER' | 'UPPER' }>();
  public nodesVisited = 0;

  public evaluateBoard(engine: ChessEngine, personality: AIPersonality = AI_PERSONALITIES.grandmaster): number {
    const board = engine.state.board;
    let whiteMaterial = 0;
    let blackMaterial = 0;
    let whitePositional = 0;
    let blackPositional = 0;

    let totalNonPawnMaterial = 0;

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = board[r][f];
        if (!piece) continue;

        const val = PIECE_VALUES[piece.type];
        if (piece.type !== 'p' && piece.type !== 'k') {
          totalNonPawnMaterial += val;
        }

        const isWhite = piece.color === 'w';
        const rankIdx = isWhite ? r : 7 - r;
        const fileIdx = isWhite ? f : 7 - f;

        let pstVal = 0;
        switch (piece.type) {
          case 'p':
            pstVal = PST_PAWN_MG[rankIdx][fileIdx];
            break;
          case 'n':
            pstVal = PST_KNIGHT[rankIdx][fileIdx];
            break;
          case 'b':
            pstVal = PST_BISHOP[rankIdx][fileIdx];
            break;
          case 'r':
            pstVal = PST_ROOK[rankIdx][fileIdx];
            break;
          case 'q':
            pstVal = PST_QUEEN[rankIdx][fileIdx];
            break;
          case 'k':
            pstVal = PST_KING_MG[rankIdx][fileIdx];
            break;
        }

        if (isWhite) {
          whiteMaterial += val;
          whitePositional += pstVal;
        } else {
          blackMaterial += val;
          blackPositional += pstVal;
        }
      }
    }

    // Tapered endgame interpolation
    const isEndgame = totalNonPawnMaterial < 1500;
    if (isEndgame) {
      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          const piece = board[r][f];
          if (!piece) continue;
          const isWhite = piece.color === 'w';
          const rankIdx = isWhite ? r : 7 - r;
          const fileIdx = isWhite ? f : 7 - f;

          if (piece.type === 'p') {
            const egBonus = PST_PAWN_EG[rankIdx][fileIdx] - PST_PAWN_MG[rankIdx][fileIdx];
            if (isWhite) whitePositional += egBonus;
            else blackPositional += egBonus;
          } else if (piece.type === 'k') {
            const egKing = PST_KING_EG[rankIdx][fileIdx] - PST_KING_MG[rankIdx][fileIdx];
            if (isWhite) whitePositional += egKing;
            else blackPositional += egKing;
          }
        }
      }
    }

    // AI Personality adjustments
    let whiteScore = whiteMaterial + whitePositional;
    let blackScore = blackMaterial + blackPositional;

    // Aggression bonus for attacking near king
    const enemyKingColor: PieceColor = engine.state.turn === 'w' ? 'b' : 'w';
    const kingSq = engine.getKingSquare(enemyKingColor);
    if (kingSq && personality.aggression > 0.6) {
      const aggressionMultiplier = (personality.aggression - 0.5) * 20;
      if (engine.state.turn === 'w') {
        whiteScore += aggressionMultiplier;
      } else {
        blackScore += aggressionMultiplier;
      }
    }

    // Prophylaxis bonus for intact castled shield
    if (personality.prophylaxis > 0.6) {
      const prophBonus = (personality.prophylaxis - 0.5) * 30;
      if (!engine.state.castling.wK && !engine.state.castling.wQ) whiteScore += prophBonus;
      if (!engine.state.castling.bK && !engine.state.castling.bQ) blackScore += prophBonus;
    }

    return whiteScore - blackScore;
  }

  private orderMoves(moves: Move[]): Move[] {
    return moves.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // 1. MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
      if (a.captured) {
        scoreA += PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece];
      }
      if (b.captured) {
        scoreB += PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece];
      }

      // 2. Promotions
      if (a.promotion) scoreA += PIECE_VALUES[a.promotion];
      if (b.promotion) scoreB += PIECE_VALUES[b.promotion];

      // 3. Castling
      if (a.isCastling) scoreA += 30;
      if (b.isCastling) scoreB += 30;

      return scoreB - scoreA;
    });
  }

  private quiescence(
    engine: ChessEngine,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    personality: AIPersonality,
    depth = 0
  ): number {
    this.nodesVisited++;
    const standPat = this.evaluateBoard(engine, personality);

    if (depth >= 3) return standPat;

    // Delta Pruning
    const BIG_DELTA = 950; // Queen value
    if (isMaximizing) {
      if (standPat >= beta) return beta;
      if (standPat + BIG_DELTA < alpha) return alpha;
      if (standPat > alpha) alpha = standPat;
    } else {
      if (standPat <= alpha) return alpha;
      if (standPat - BIG_DELTA > beta) return beta;
      if (standPat < beta) beta = standPat;
    }

    const legalMoves = engine.getLegalMoves(engine.state.turn, false);
    const captureMoves = legalMoves.filter(m => m.captured || m.promotion);
    if (captureMoves.length === 0) return standPat;

    const ordered = this.orderMoves(captureMoves);

    if (isMaximizing) {
      for (const move of ordered) {
        engine.makeMove(move);
        const score = this.quiescence(engine, alpha, beta, false, personality, depth + 1);
        engine.undoMove();

        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
      }
      return alpha;
    } else {
      for (const move of ordered) {
        engine.makeMove(move);
        const score = this.quiescence(engine, alpha, beta, true, personality, depth + 1);
        engine.undoMove();

        if (score <= alpha) return alpha;
        if (score < beta) beta = score;
      }
      return beta;
    }
  }


  public minimax(
    engine: ChessEngine,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    personality: AIPersonality
  ): { score: number; bestMove: Move | null } {
    this.nodesVisited++;

    // Transposition key lookup
    const posKey = `${engine.getPositionKey()}_${depth}_${isMaximizing}`;
    const cached = this.transpositionTable.get(posKey);
    if (cached && cached.depth >= depth) {
      return { score: cached.score, bestMove: null };
    }

    if (depth === 0) {
      const qScore = this.quiescence(engine, alpha, beta, isMaximizing, personality, 0);
      return { score: qScore, bestMove: null };
    }

    const legalMoves = engine.getLegalMoves(engine.state.turn, false);
    if (legalMoves.length === 0) {
      if (engine.inCheck()) {
        return { score: isMaximizing ? -100000 - depth : 100000 + depth, bestMove: null };
      }
      return { score: 0, bestMove: null };
    }

    const orderedMoves = this.orderMoves(legalMoves);
    let bestMove: Move | null = orderedMoves[0];

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of orderedMoves) {
        engine.makeMove(move);
        const { score } = this.minimax(engine, depth - 1, alpha, beta, false, personality);
        engine.undoMove();

        if (score > maxEval) {
          maxEval = score;
          bestMove = move;
        }
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break; // Beta cutoff
      }
      this.transpositionTable.set(posKey, { depth, score: maxEval, flag: 'EXACT' });
      return { score: maxEval, bestMove };
    } else {
      let minEval = Infinity;
      for (const move of orderedMoves) {
        engine.makeMove(move);
        const { score } = this.minimax(engine, depth - 1, alpha, beta, true, personality);
        engine.undoMove();

        if (score < minEval) {
          minEval = score;
          bestMove = move;
        }
        beta = Math.min(beta, score);
        if (beta <= alpha) break; // Alpha cutoff
      }
      this.transpositionTable.set(posKey, { depth, score: minEval, flag: 'EXACT' });
      return { score: minEval, bestMove };
    }
  }

  public getBestMove(
    engine: ChessEngine,
    difficulty: AIDifficulty = 'master',
    personalityId: AIPersonalityId = 'grandmaster'
  ): { move: Move; score: number; depth: number } | null {
    this.nodesVisited = 0;
    this.transpositionTable.clear();

    const personality = AI_PERSONALITIES[personalityId] || AI_PERSONALITIES.grandmaster;
    const isMaximizing = engine.state.turn === 'w';

    // 1. Check Opening Book Database
    const moveHistorySAN = engine.state.history.map(h => h.move.san || '');
    const bookMoveSan = findBookMove(moveHistorySAN, personality.preferredOpenings);
    if (bookMoveSan) {
      const legalMovesWithSan = engine.getLegalMoves(engine.state.turn, true);
      const matchedBookMove = legalMovesWithSan.find(m => m.san === bookMoveSan);
      if (matchedBookMove) {
        return { move: matchedBookMove, score: 0, depth: 1 };
      }
    }

    let depth = 3;
    switch (difficulty) {
      case 'novice':
        depth = 1;
        break;
      case 'intermediate':
        depth = 2;
        break;
      case 'advanced':
        depth = 3;
        break;
      case 'master':
        depth = 4;
        break;
      case 'grandmaster':
        depth = 4;
        break;
    }

    // At novice levels, add human imperfection
    if (difficulty === 'novice') {
      const legalMoves = engine.getLegalMoves(engine.state.turn, true);
      if (legalMoves.length === 0) return null;
      if (Math.random() < 0.35) {
        const randomIndex = Math.floor(Math.random() * legalMoves.length);
        return { move: legalMoves[randomIndex], score: 0, depth: 1 };
      }
    }

    const { score, bestMove } = this.minimax(engine, depth, -Infinity, Infinity, isMaximizing, personality);

    if (!bestMove) {
      const legal = engine.getLegalMoves(engine.state.turn, true);
      if (legal.length === 0) return null;
      return { move: legal[0], score, depth };
    }

    // Compute SAN for best move
    const legalWithSan = engine.getLegalMoves(engine.state.turn, true);
    const matched = legalWithSan.find(m => m.from === bestMove.from && m.to === bestMove.to && m.promotion === bestMove.promotion);

    return { move: matched || bestMove, score, depth };
  }

  public getTopMoves(
    engine: ChessEngine,
    topN = 3,
    depth = 3
  ): Array<{ move: Move; score: number; winChance: number }> {
    const legalMoves = engine.getLegalMoves(engine.state.turn, true);
    if (legalMoves.length === 0) return [];

    const isMaximizing = engine.state.turn === 'w';
    const evaluated: Array<{ move: Move; score: number; winChance: number }> = [];

    for (const move of legalMoves) {
      engine.makeMove(move);
      const { score } = this.minimax(
        engine,
        depth - 1,
        -Infinity,
        Infinity,
        !isMaximizing,
        AI_PERSONALITIES.grandmaster
      );
      engine.undoMove();

      // Sigmoid conversion to winning chance (0 to 100%)
      const evalCentipawns = isMaximizing ? score : -score;
      const winChance = Math.round(50 + 50 * (2 / (1 + Math.exp(-0.004 * evalCentipawns)) - 1));

      evaluated.push({ move, score, winChance: Math.min(99, Math.max(1, winChance)) });
    }

    evaluated.sort((a, b) => (isMaximizing ? b.score - a.score : a.score - b.score));
    return evaluated.slice(0, topN);
  }
}
