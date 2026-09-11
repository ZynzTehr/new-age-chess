export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type Square = string; // e.g. 'e4', 'a1'

export interface Move {
  from: Square;
  to: Square;
  promotion?: PieceType;
  piece: PieceType;
  color: PieceColor;
  captured?: PieceType;
  san?: string;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isCastling?: 'k' | 'q';
  isEnPassant?: boolean;
  score?: number;
  explanation?: string;
}

export type GameMode = 'pvp' | 'pvcpu' | 'practice' | 'puzzles' | 'analysis';

export type AIPersonalityId = 'grandmaster' | 'assassin' | 'fortress' | 'hypermodern' | 'gambit';

export interface AIPersonality {
  id: AIPersonalityId;
  name: string;
  title: string;
  avatar: string;
  elo: number;
  description: string;
  styleDescription: string;
  aggression: number; // 0.0 to 1.0
  prophylaxis: number; // 0.0 to 1.0
  tacticalRisk: number; // 0.0 to 1.0
  preferredOpenings: string[];
}

export type AIDifficulty = 'novice' | 'intermediate' | 'advanced' | 'master' | 'grandmaster';

export type MoveQuality = 'brilliant' | 'great' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'book';

export interface EvaluatedMove {
  move: Move;
  evaluation: number; // centipawns or mate in N (+ for white, - for black)
  winChance: number; // 0 to 100%
  quality: MoveQuality;
  explanation: string;
  tacticalTheme?: string;
}

export interface StrategyIntel {
  openingName: string;
  ecoCode: string;
  gamePhase: 'Opening' | 'Middlegame' | 'Endgame';
  cpuPlan: {
    title: string;
    summary: string;
    targetSquare?: Square;
    targetPiece?: PieceType;
    category: 'attack' | 'positional' | 'tactic' | 'defense' | 'endgame';
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    tacticalMotif?: string;
  };
  threatArrows: Array<{ from: Square; to: Square; type: 'threat' | 'plan' }>;
  recommendedCounterMoves: EvaluatedMove[];
  playerAdvantage: number; // centipawns (+ for white, - for black)
  controlMap?: number[][]; // 8x8 matrix of square control score (-10 to +10)
  dangerSquares?: { square: Square; reason: 'pinned' | 'hanging' | 'forked' | 'attacked' }[];
}

export type BoardThemeId = 'cyber-neon' | 'midnight-gold' | 'hologram-blue' | 'minimal-slate';
export type PieceSetId = 'neo-cyber' | 'minimalist' | 'classic';

export interface GameSettings {
  boardTheme: BoardThemeId;
  pieceSet: PieceSetId;
  soundEnabled: boolean;
  soundVolume: number;
  showLegalMoves: boolean;
  showThreats: boolean;
  showInfluenceHeatmap: boolean;
  showBestMoveArrow: boolean;
  autoQueen: boolean;

  timeControl: {
    initialMinutes: number;
    incrementSeconds: number;
    isUnlimited: boolean;
  };
  aiPersonality: AIPersonalityId;
  aiDifficulty: AIDifficulty;
}

export interface Puzzle {
  id: string;
  title: string;
  theme: string;
  description: string;
  fen: string;
  playerColor: PieceColor;
  solutionMoves: string[]; // e.g. ["e2e4", "d7d5"]
  hints: string[];
  explanation: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Master';
}

export interface GameHistoryEntry {
  move: Move;
  fenBefore: string;
  fenAfter: string;
  evalBefore?: number;
  evalAfter?: number;
  quality?: MoveQuality;
  explanation?: string;
  whiteTimeRemaining: number;
  blackTimeRemaining: number;
}
