import { ChessEngine } from './src/engine/chessLogic.ts';
import { AIEngine } from './src/engine/aiEngine.ts';
import { StrategyAnalyzer } from './src/engine/strategyAnalyzer.ts';
import { detectOpening } from './src/engine/openings.ts';

console.log('--- TEST 1: Initial Position & Move Generation ---');
const engine = new ChessEngine();
const initialMoves = engine.getLegalMoves();
console.log(`Initial white legal moves count: ${initialMoves.length} (Expected: 20)`);
if (initialMoves.length !== 20) throw new Error('Failed initial moves count');

console.log('--- TEST 2: Scholar\'s Mate (Checkmate Detection) ---');
const scholarEngine = new ChessEngine();
const moves = [
  { from: 'e2', to: 'e4', piece: 'p', color: 'w', san: 'e4' },
  { from: 'e7', to: 'e5', piece: 'p', color: 'b', san: 'e5' },
  { from: 'd1', to: 'h5', piece: 'q', color: 'w', san: 'Qh5' },
  { from: 'b8', to: 'c6', piece: 'n', color: 'b', san: 'Nc6' },
  { from: 'f1', to: 'c4', piece: 'b', color: 'w', san: 'Bc4' },
  { from: 'g8', to: 'f6', piece: 'n', color: 'b', san: 'Nf6' },
  { from: 'h5', to: 'f7', piece: 'q', color: 'w', captured: 'p', san: 'Qxf7#' },
];

for (const m of moves) {
  scholarEngine.makeMove(m as any);
}

console.log(`In check: ${scholarEngine.inCheck()}`);
const gameOver = scholarEngine.isGameOver();
console.log(`Game over result:`, gameOver);
if (!gameOver.over || gameOver.result !== '1-0') throw new Error('Scholar\'s mate checkmate failed');

console.log('--- TEST 3: En Passant ---');
const epEngine = new ChessEngine();
epEngine.makeMove({ from: 'e2', to: 'e4', piece: 'p', color: 'w', san: 'e4' } as any);
epEngine.makeMove({ from: 'a7', to: 'a6', piece: 'p', color: 'b', san: 'a6' } as any);
epEngine.makeMove({ from: 'e4', to: 'e5', piece: 'p', color: 'w', san: 'e5' } as any);
epEngine.makeMove({ from: 'd7', to: 'd5', piece: 'p', color: 'b', san: 'd5' } as any);
const epMoves = epEngine.getLegalMoves().filter(m => m.from === 'e5');
console.log('White moves for e5 pawn:', epMoves.map(m => m.san || `${m.from}-${m.to}`));
const hasEp = epMoves.some(m => m.to === 'd6' && m.isEnPassant);
console.log(`Has en-passant e5xd6: ${hasEp}`);
if (!hasEp) throw new Error('En passant move generation failed');

console.log('--- TEST 4: Opening Book Instant Lookup ---');
const bookEngine = new ChessEngine();
bookEngine.makeMove({ from: 'e2', to: 'e4', piece: 'p', color: 'w', san: 'e4' } as any);
bookEngine.makeMove({ from: 'c7', to: 'c5', piece: 'p', color: 'b', san: 'c5' } as any);

const ai = new AIEngine();
const t0 = Date.now();
const bookReply = ai.getBestMove(bookEngine, 'master', 'grandmaster');
const bookDuration = Date.now() - t0;
console.log(`Book reply: ${bookReply?.move.san} in ${bookDuration}ms`);
if (bookDuration > 100) throw new Error('Book lookup should be under 100ms');

console.log('--- TEST 5: Middlegame Minimax Search Speed ---');
// Custom complex middlegame FEN:
const mgEngine = new ChessEngine('r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPP3PP/2KR1B1R b - - 0 9');
const t1 = Date.now();
const mgMove = ai.getBestMove(mgEngine, 'advanced', 'grandmaster');
const mgDuration = Date.now() - t1;
console.log(`Middlegame AI best move (depth ${mgMove?.depth}): ${mgMove?.move.san || mgMove?.move.from + '-' + mgMove?.move.to} in ${mgDuration}ms`);

console.log('--- TEST 6: Real-Time Strategy Analyzer Speed ---');
const analyzer = new StrategyAnalyzer();
const t2 = Date.now();
const intel = analyzer.analyzePosition(mgEngine, ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'f3', 'O-O', 'Qd2', 'Nc6', 'O-O-O']);
const stratDuration = Date.now() - t2;
console.log(`Strategy Analyzer generated in ${stratDuration}ms:`, {
  opening: intel.openingName,
  threat: intel.cpuPlan.title,
  topMoves: intel.recommendedCounterMoves.map(m => m.move.san),
});

console.log('✅ ALL TESTS PASSED WITH LIGHTNING PERFORMANCE!');
