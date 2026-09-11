import { ChessEngine, squareToFileRank, fileRankToSquare } from './chessLogic';
import { AIEngine } from './aiEngine';
import { detectOpening } from './openings';
import type { Move, PieceColor, PieceType, Square, StrategyIntel, EvaluatedMove, MoveQuality } from '../types/chess';

export class StrategyAnalyzer {
  private aiEngine = new AIEngine();

  public analyzePosition(engine: ChessEngine, moveHistorySAN: string[]): StrategyIntel {
    const opening = detectOpening(moveHistorySAN);
    const movesCount = engine.state.history.length;
    const gamePhase = movesCount < 16 ? 'Opening' : movesCount < 40 ? 'Middlegame' : 'Endgame';

    // 1. Evaluate top candidate moves for the current player
    const topMovesRaw = this.aiEngine.getTopMoves(engine, 3, 2);
    const recommendedCounterMoves: EvaluatedMove[] = topMovesRaw.map((tm, idx) => {
      const explanation = this.generateMoveExplanation(tm.move);
      return {
        move: tm.move,
        evaluation: tm.score,
        winChance: tm.winChance,
        quality: idx === 0 ? 'best' : idx === 1 ? 'great' : 'good',
        explanation,
        tacticalTheme: this.identifyTacticalTheme(tm.move),
      };
    });

    // 2. Identify CPU Threat & Strategic Intent (simulate opponent's best reply if we do nothing or their last move)
    const cpuPlan = this.detectCpuPlan(engine, gamePhase, opening?.name);

    // 3. Threat Arrows for visualization
    const threatArrows: Array<{ from: Square; to: Square; type: 'threat' | 'plan' }> = [];
    if (cpuPlan.targetSquare) {
      // Find attacking piece
      const opponentColor: PieceColor = engine.state.turn === 'w' ? 'b' : 'w';
      const opponentMoves = engine.getPseudoLegalMoves(opponentColor);
      const attackerMove = opponentMoves.find(m => m.to === cpuPlan.targetSquare);
      if (attackerMove) {
        threatArrows.push({ from: attackerMove.from, to: cpuPlan.targetSquare, type: 'threat' });
      }
    }

    if (recommendedCounterMoves.length > 0) {
      threatArrows.push({
        from: recommendedCounterMoves[0].move.from,
        to: recommendedCounterMoves[0].move.to,
        type: 'plan',
      });
    }

    // 4. Square Control Influence Heatmap (8x8)
    const controlMap = this.computeSquareControlMap(engine);

    // 5. Danger Squares Radar (hanging pieces, pinned pieces)
    const dangerSquares = this.detectDangerSquares(engine);

    const playerAdvantage = recommendedCounterMoves.length > 0 ? recommendedCounterMoves[0].evaluation : 0;

    return {
      openingName: opening ? opening.name : 'Custom / Unorthodox System',
      ecoCode: opening ? opening.eco : 'A00',
      gamePhase,
      cpuPlan,
      threatArrows,
      recommendedCounterMoves,
      playerAdvantage,
      controlMap,
      dangerSquares,
    };
  }

  private detectCpuPlan(
    engine: ChessEngine,
    gamePhase: 'Opening' | 'Middlegame' | 'Endgame',
    openingName?: string
  ): StrategyIntel['cpuPlan'] {
    const currentColor = engine.state.turn;
    const opponentColor: PieceColor = currentColor === 'w' ? 'b' : 'w';
    const kingSq = engine.getKingSquare(currentColor);

    // Check if opponent is delivering direct checks or immediate checkmate threats
    if (kingSq && engine.isSquareAttacked(kingSq, opponentColor)) {
      return {
        title: 'Direct Check on King',
        summary: 'The CPU has placed your King in check. You must resolve the threat immediately by moving your King, capturing the attacker, or interposing a piece.',
        category: 'tactic',
        threatLevel: 'critical',
        targetSquare: kingSq,
        tacticalMotif: 'Check Resolution',
      };
    }

    // Check for hanging player pieces
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = engine.state.board[r][f];
        if (piece && piece.color === currentColor && piece.type !== 'k') {
          const sq = fileRankToSquare(f, r);
          const isAttacked = engine.isSquareAttacked(sq, opponentColor);
          const isDefended = engine.isSquareAttacked(sq, currentColor);

          if (isAttacked && !isDefended && piece.type !== 'p') {
            return {
              title: `Undefended ${this.pieceName(piece.type)} on ${sq}`,
              summary: `The CPU is threatening to capture your undefended ${this.pieceName(piece.type)} on ${sq}. Guard or retreat it immediately.`,
              category: 'tactic',
              threatLevel: 'high',
              targetSquare: sq,
              targetPiece: piece.type,
              tacticalMotif: 'Hanging Piece Defense',
            };
          }
        }
      }
    }

    // Check for back-rank weakness
    const pawnShieldRank = currentColor === 'w' ? 1 : 6;
    if (kingSq && (kingSq === 'g1' || kingSq === 'h1' || kingSq === 'g8' || kingSq === 'h8')) {
      const { file: kf } = squareToFileRank(kingSq);
      const shieldPawns = [kf - 1, kf, kf + 1].filter(f => {
        if (f < 0 || f >= 8) return false;
        const p = engine.state.board[pawnShieldRank][f];
        return p && p.color === currentColor && p.type === 'p';
      });

      if (shieldPawns.length === 3) {
        // Trapped king on back rank
        return {
          title: 'Back-Rank Vulnerability',
          summary: 'Your castled King is confined by its own pawn shield. Watch out for back-rank rook and queen infiltrations. Consider creating an escape square (Luft) with h3 or h6.',
          category: 'positional',
          threatLevel: 'medium',
          tacticalMotif: 'Back-Rank Luft',
        };
      }
    }

    // Opening Specific Guidance
    if (gamePhase === 'Opening') {
      return {
        title: openingName ? `Developing in the ${openingName}` : 'Central Piece Harmonization',
        summary: `The CPU is focusing on rapid piece development, contesting the center squares (e4, d4, e5, d5), and securing its king via castling.`,
        category: 'positional',
        threatLevel: 'low',
        tacticalMotif: 'Opening Principles',
      };
    }

    // Endgame Guidance
    if (gamePhase === 'Endgame') {
      return {
        title: 'Passed Pawn Promotion & King Activation',
        summary: 'In the endgame, the CPU is mobilizing its King into the center and pushing passed pawns toward the promotion rank.',
        category: 'endgame',
        threatLevel: 'medium',
        tacticalMotif: 'Endgame Technique',
      };
    }

    // Default Middlegame Strategy
    return {
      title: 'Middlegame Positional Maneuvering',
      summary: 'The CPU is seeking to create piece outposts, contest open files with rooks, and probe for structural weaknesses in your pawn camp.',
      category: 'positional',
      threatLevel: 'medium',
      tacticalMotif: 'Space & Outpost Control',
    };
  }

  private generateMoveExplanation(move: Move): string {
    const { to, piece, captured, isCheck, isCastling, isCheckmate } = move;

    if (isCheckmate) {
      return `Delivers decisive checkmate! The opposing king has no escape or legal reply.`;
    }
    if (isCastling) {
      return `Castles ${isCastling === 'k' ? 'kingside (O-O)' : 'queenside (O-O-O)'}, securing the King safely behind a pawn shield and activating the Rook to an active central file.`;
    }
    if (captured) {
      return `Captures the ${this.pieceName(captured)} on ${to}, winning material and altering the tactical balance of the position.`;
    }
    if (isCheck) {
      return `Plays ${piece.toUpperCase()} to ${to}, delivering check to the enemy king and forcing an immediate tactical reaction.`;
    }

    // Positional explanations based on piece & destination
    if (piece === 'p') {
      if (to === 'e4' || to === 'd4' || to === 'e5' || to === 'd5') {
        return `Advances the central pawn to ${to}, claiming vital space in the board's core and opening diagonals for piece development.`;
      }
      if (to === 'c4' || to === 'c5' || to === 'f4' || to === 'f5') {
        return `Strikes at the opponent's pawn structure from the flank, creating dynamic tension and opening line avenues.`;
      }
      return `Advances pawn to ${to}, strengthening pawn chains and restricting enemy piece mobility.`;
    }

    if (piece === 'n') {
      if (to === 'f3' || to === 'c3' || to === 'f6' || to === 'c6') {
        return `Develops the Knight toward the center on ${to}, controlling key central squares (d4/e4/d5/e5).`;
      }
      if (to === 'd5' || to === 'e5' || to === 'd4' || to === 'e4') {
        return `Anchors an aggressive Knight on the central outpost ${to}, radiating immense tactical pressure into enemy territory.`;
      }
      return `Maneuvers the Knight to ${to}, repositioning toward more active forward squares.`;
    }

    if (piece === 'b') {
      if (to === 'g2' || to === 'b2' || to === 'g7' || to === 'b7') {
        return `Fianchettos the Bishop onto the long diagonal at ${to}, exerting powerful cross-board pressure against the enemy flank.`;
      }
      if (to === 'g5' || to === 'g4' || to === 'b5' || to === 'b4') {
        return `Pins or challenges the enemy knight on the active diagonal, restricting opponent tactical maneuvers.`;
      }
      return `Develops Bishop to ${to}, commanding active diagonal sightlines.`;
    }

    if (piece === 'r') {
      if (to[1] === '7' || to[1] === '2') {
        return `Infiltrates the Rook onto the critical 7th rank at ${to}, attacking pawns along their base and trapping the opposing king.`;
      }
      return `Positions Rook on ${to}, seizing control of an open or semi-open file for major piece activity.`;
    }

    if (piece === 'q') {
      return `Centralizes the Queen on ${to}, projecting immense multi-directional threats across ranks, files, and diagonals.`;
    }

    if (piece === 'k') {
      return `Moves King to ${to}, stepping out of potential pins or activating toward the center in the endgame.`;
    }

    return `Moves ${this.pieceName(piece)} to ${to} to improve piece coordination and tactical harmony.`;
  }

  private identifyTacticalTheme(move: Move): string {
    if (move.isCheckmate) return 'Checkmate Attack';
    if (move.isCastling) return 'King Safety & Castling';
    if (move.captured) return 'Tactical Capture';
    if (move.isCheck) return 'Forcing Check';
    if (move.piece === 'p' && (move.to[1] === '7' || move.to[1] === '2')) return 'Passed Pawn Push';
    if (move.piece === 'n' && ['d4', 'e4', 'd5', 'e5', 'c5', 'f5'].includes(move.to)) return 'Knight Outpost';
    if (move.piece === 'b' && ['g2', 'b2', 'g7', 'b7'].includes(move.to)) return 'Fianchetto Control';
    if (move.piece === 'r' && (move.to[1] === '7' || move.to[1] === '2')) return 'Rook on 7th Rank';
    return 'Positional Harmony';
  }

  public computeSquareControlMap(engine: ChessEngine): number[][] {
    const map: number[][] = Array(8).fill(0).map(() => Array(8).fill(0));

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = fileRankToSquare(f, r);
        let score = 0;

        if (engine.isSquareAttacked(sq, 'w')) score += 1;
        if (engine.isSquareAttacked(sq, 'b')) score -= 1;

        map[r][f] = score;
      }
    }

    return map;
  }

  public detectDangerSquares(engine: ChessEngine): StrategyIntel['dangerSquares'] {
    const danger: StrategyIntel['dangerSquares'] = [];
    const turn = engine.state.turn;
    const opponent: PieceColor = turn === 'w' ? 'b' : 'w';

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = engine.state.board[r][f];
        if (piece && piece.color === turn && piece.type !== 'k') {
          const sq = fileRankToSquare(f, r);
          const isAttacked = engine.isSquareAttacked(sq, opponent);
          const isDefended = engine.isSquareAttacked(sq, turn);

          if (isAttacked && !isDefended) {
            danger.push({ square: sq, reason: 'hanging' });
          } else if (isAttacked && isDefended) {
            danger.push({ square: sq, reason: 'attacked' });
          }
        }
      }
    }

    return danger;
  }

  public classifyMoveQuality(playedEval: number, bestEval: number, wasSacrifice = false): MoveQuality {
    const diff = Math.abs(bestEval - playedEval);

    if (wasSacrifice && diff < 20) return 'brilliant';
    if (diff <= 15) return 'best';
    if (diff <= 40) return 'great';
    if (diff <= 90) return 'good';
    if (diff <= 180) return 'inaccuracy';
    if (diff <= 350) return 'mistake';
    return 'blunder';
  }

  private pieceName(type: PieceType): string {
    const names: Record<PieceType, string> = {
      p: 'Pawn',
      n: 'Knight',
      b: 'Bishop',
      r: 'Rook',
      q: 'Queen',
      k: 'King',
    };
    return names[type];
  }
}
