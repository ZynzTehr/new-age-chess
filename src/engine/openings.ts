export interface Opening {
  eco: string;
  name: string;
  moves: string[]; // SAN array e.g. ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"]
  category: string;
  whitePlan: string;
  blackPlan: string;
  keyConcepts: string[];
}

export const OPENINGS_DATABASE: Opening[] = [
  // --- SICILIAN DEFENSE FAMILY ---
  {
    eco: 'B90',
    name: 'Sicilian Defense: Najdorf Variation',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
    category: 'Sicilian Defense',
    whitePlan: 'White strives for rapid piece development, often castling queenside and launching a furious kingside pawn storm (f4, g4, h4).',
    blackPlan: 'Black prevents knight incursions on b5, prepares queenside expansion with ...b5, and exerts pressure along the semi-open c-file.',
    keyConcepts: ['Queenside minority expansion', 'Controlling the d5 outpost', 'Opposite-side castling races', 'Sharp counter-tactics'],
  },
  {
    eco: 'B70',
    name: 'Sicilian Defense: Dragon Variation',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'],
    category: 'Sicilian Defense',
    whitePlan: 'White establishes the Yugoslav Attack (Be3, f3, Qd2, O-O-O, Bh6, h4-h5) to break open the black kingside.',
    blackPlan: 'Black fianchettos the dark-squared bishop on g7 to laser-beam down the long diagonal toward White’s queenside and b2/c3 squares.',
    keyConcepts: ['Dragon bishop monster', 'Yugoslav pawn storm', 'Rook sacrifice on c3', 'High-tension mating attacks'],
  },
  {
    eco: 'B33',
    name: 'Sicilian Defense: Sveshnikov Variation',
    moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e5'],
    category: 'Sicilian Defense',
    whitePlan: 'White targets the backward d6 pawn and establishes a permanent knight outpost on the critical d5 square.',
    blackPlan: 'Black accepts a backward d-pawn to gain dynamic central piece activity, seizing the f5 square and active bishop play.',
    keyConcepts: ['d5 outpost struggle', 'Backward d-pawn weakness', 'Bishop pair activity', 'Dynamic imbalances'],
  },
  {
    eco: 'B40',
    name: 'Sicilian Defense: Paulsen / Kan Variation',
    moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'a6'],
    category: 'Sicilian Defense',
    whitePlan: 'White gains central space with c4 (Maroczy Bind) or develops classical piece coordination to restrict Black.',
    blackPlan: 'Black plays flexibly, delaying knight development, preparing ...b5 and ...Bb7 for queenside pressure.',
    keyConcepts: ['Hedgehog setups', 'Maroczy bind clamp', 'Flexible pawn skeleton'],
  },
  {
    eco: 'B22',
    name: 'Sicilian Defense: Alapin Variation',
    moves: ['e4', 'c5', 'c3'],
    category: 'Sicilian Defense',
    whitePlan: 'White prepares to build a strong classical pawn center with d4, avoiding open Sicilian tactical minefields.',
    blackPlan: 'Black strikes immediately at White’s center with 2...d5 or 2...Nf6 to dismantle White’s central ambitions.',
    keyConcepts: ['Solid classical center', 'Early d5 pawn break', 'Isolated Queen Pawn (IQP) structures'],
  },
  {
    eco: 'B23',
    name: 'Sicilian Defense: Closed Variation',
    moves: ['e4', 'c5', 'Nc3', 'Nc6', 'g3'],
    category: 'Sicilian Defense',
    whitePlan: 'White adopts a King’s Indian Attack setup with g3, Bg2, d3, and f4 to initiate a slow, positional kingside onslaught.',
    blackPlan: 'Black controls central squares and expands rapidly on the queenside with ...Rb8, ...b5, and ...b4.',
    keyConcepts: ['Opposite wing thrusts', 'f4 pawn advance', 'Queenside clamp vs Kingside checkmate'],
  },

  // --- RUY LOPEZ (SPANISH OPENING) ---
  {
    eco: 'C60',
    name: 'Ruy Lopez (Spanish Opening)',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
    category: 'Open Game',
    whitePlan: 'White pressures the defender of e5 (the knight on c6), preparing c3 and d4 to seize command of the center.',
    blackPlan: 'Black defends the e5 point, questions the bishop with ...a6 and ...b5, and activates pieces for deep strategic counterplay.',
    keyConcepts: ['Central tension', 'c3-d4 expansion', 'Manoeuvring knights via d2-f1-g3', 'Spanish bishop longevity'],
  },
  {
    eco: 'C88',
    name: 'Ruy Lopez: Closed Variation',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O'],
    category: 'Open Game',
    whitePlan: 'White plays h3 to prevent ...Bg4, maneuvers Nbd2-f1-g3, and executes the central break d4.',
    blackPlan: 'Black chooses between Chigorin (...Na5), Breyer (...Nb8-d7), or Zaitsev (...Bb7) systems to reinforce e5 and counter d4.',
    keyConcepts: ['Deep positional manoeuvring', 'King safety', 'Closed pawn structures', 'Long-term piece outposts'],
  },
  {
    eco: 'C65',
    name: 'Ruy Lopez: Berlin Defense',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'],
    category: 'Open Game',
    whitePlan: 'White looks to trade queens early into the famous Berlin endgame to exploit superior pawn structure.',
    blackPlan: 'Black utilizes the bishop pair in the endgame to compensate for doubled c-pawns and an uncastled king.',
    keyConcepts: ['The Berlin Wall endgame', 'Bishop pair compensation', 'Pawn majority on kingside vs queenside'],
  },
  {
    eco: 'C68',
    name: 'Ruy Lopez: Exchange Variation',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6', 'dxc6'],
    category: 'Open Game',
    whitePlan: 'White damages Black’s pawn structure creating a 4 vs 3 kingside majority and aims for a winning king-and-pawn endgame.',
    blackPlan: 'Black leverages the dynamic bishop pair and rapid open-line piece development to equalize before an endgame.',
    keyConcepts: ['Pawn structure asymmetry', 'Bishop pair dynamics', 'Kingside pawn majority conversion'],
  },

  // --- ITALIAN GAME & SCOTCH ---
  {
    eco: 'C50',
    name: 'Italian Game (Giuoco Piano)',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'],
    category: 'Open Game',
    whitePlan: 'White controls the center with c3 and d4, aiming the light-squared bishop directly at the vulnerable f7 square.',
    blackPlan: 'Black mirrors development, reinforces the center with ...d6, and counters White’s central expansion.',
    keyConcepts: ['f7 tactical target', 'c3-d4 classical center', 'Pianissimo calm vs Evans Gambit fire'],
  },
  {
    eco: 'C51',
    name: 'Italian Game: Evans Gambit',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4'],
    category: 'Gambit',
    whitePlan: 'White sacrifices the b4 wing pawn to gain rapid tempi with c3 and d4, opening lines for attacking the black king.',
    blackPlan: 'Black accepts or declines the gambit, returning material at the right moment to complete development and neutralize White’s initiative.',
    keyConcepts: ['Initiative over material', 'Rapid diagonal control (Ba3, Qb3)', 'Central storm against uncastled king'],
  },
  {
    eco: 'C57',
    name: 'Two Knights Defense: Fried Liver Attack',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Nxd5', 'Nxf7'],
    category: 'Tactical Attack',
    whitePlan: 'White sacrifices the knight on f7 to drag Black’s king out into the open center under severe mating threats (Qf3+).',
    blackPlan: 'Black must carefully shelter the king on e6 while bringing all pieces to the center to survive the furious onslaught.',
    keyConcepts: ['King hunt in open board', 'Pinned piece exploitation on d5', 'Devastating attack execution'],
  },
  {
    eco: 'C45',
    name: 'Scotch Game',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4'],
    category: 'Open Game',
    whitePlan: 'White immediately blows open the center on move 3, achieving open lines for bishops and active piece play.',
    blackPlan: 'Black counters with ...Bc5 or ...Nf6, challenging White’s central knight and equalizing development.',
    keyConcepts: ['Open central files', 'Early knight trades', 'Aggressive tactical skirmishes'],
  },

  // --- FRENCH & CARO-KANN DEFENSES ---
  {
    eco: 'C00',
    name: 'French Defense',
    moves: ['e4', 'e6', 'd4', 'd5'],
    category: 'Semi-Open Game',
    whitePlan: 'White gains space with e5 (Advance) or defends with Nc3/Nd2, targeting the weak light squares around Black’s king.',
    blackPlan: 'Black establishes a sturdy pawn chain and relentlessly assaults the base of White’s pawn chain (d4) with ...c5 and ...Qb6.',
    keyConcepts: ['The French "bad" light bishop', 'Assaulting d4 pawn chain base', 'Space advantage vs central undermining'],
  },
  {
    eco: 'C02',
    name: 'French Defense: Advance Variation',
    moves: ['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3', 'Nc6', 'Nf3', 'Qb6'],
    category: 'Semi-Open Game',
    whitePlan: 'White locks the center with e5 and bolsters d4 with c3, setting up a kingside attacking platform.',
    blackPlan: 'Black piles pressure onto d4 with ...Qb6, ...Nge7-f5, and eventually breaks the pawn chain with ...f6.',
    keyConcepts: ['Pawn chain collisions', 'Pressure on d4 base', 'The ...f6 counter-break'],
  },
  {
    eco: 'B12',
    name: 'Caro-Kann Defense',
    moves: ['e4', 'c6', 'd4', 'd5'],
    category: 'Semi-Open Game',
    whitePlan: 'White chooses between the Advance (e5), Classical (Nc3), or Panov-Botvinnik (cxd5/c4) to test Black’s solidity.',
    blackPlan: 'Black prepares ...d5 while keeping the light-squared bishop free outside the pawn chain before playing ...e6.',
    keyConcepts: ['Ultra-solid pawn structure', 'Active light-squared bishop', 'Endgame structural supremacy'],
  },
  {
    eco: 'B18',
    name: 'Caro-Kann: Classical Variation',
    moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5'],
    category: 'Semi-Open Game',
    whitePlan: 'White drives Black’s bishop to g6 with Ng3 and h4-h5, seeking kingside space and tactical outposts.',
    blackPlan: 'Black simplifies the position, solidifies the pawn skeleton, and targets White’s overextended kingside pawns in the endgame.',
    keyConcepts: ['Bishop harassment (Ng3, h4-h5)', 'Structural solidity', 'Effortless endgame transition'],
  },

  // --- QUEEN\'S GAMBIT & 1.d4 SYSTEMS ---
  {
    eco: 'D06',
    name: 'Queen’s Gambit',
    moves: ['d4', 'd5', 'c4'],
    category: 'Closed Game',
    whitePlan: 'White offers the c4 wing pawn to lure Black’s d5 pawn away, intending to establish total central dominance with e4.',
    blackPlan: 'Black either holds the center firmly with ...e6 (Declined) or ...c6 (Slav), or accepts the pawn with ...dxc4 intending a quick ...c5 counter-punch.',
    keyConcepts: ['Center control battle', 'Pawn tension on d5', 'Carlsbad minority attacks'],
  },
  {
    eco: 'D30',
    name: 'Queen’s Gambit Declined (QGD)',
    moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'Nbd7'],
    category: 'Closed Game',
    whitePlan: 'White exerts long-term positional pressure, pinning the f6 knight, and executes the Carlsbad minority attack (b4-b5).',
    blackPlan: 'Black maintains the d5 anchor, frees cramped pieces with the Capablanca freeing maneuver (...dxc4, ...Nd5), and prepares ...c5.',
    keyConcepts: ['The Carlsbad Pawn Skeleton', 'Minority Attack on queenside', 'Capablanca simplifying technique'],
  },
  {
    eco: 'D10',
    name: 'Slav Defense',
    moves: ['d4', 'd5', 'c4', 'c6'],
    category: 'Closed Game',
    whitePlan: 'White applies pressure against d5 and b7 with Qb3, or develops classically with Nc3 and e3.',
    blackPlan: 'Black supports d5 with the c-pawn, keeping the diagonal open for the c8-bishop to develop actively before playing ...e6.',
    keyConcepts: ['Sturdy pawn chain', 'Active light bishop outside chain', 'Queenside counterplay with ...b5'],
  },
  {
    eco: 'D20',
    name: 'Queen’s Gambit Accepted (QGA)',
    moves: ['d4', 'd5', 'c4', 'dxc4'],
    category: 'Closed Game',
    whitePlan: 'White regains the c4 pawn with e4 or e3+Bxc4, establishing broad central space and diagonal threats.',
    blackPlan: 'Black avoids trying to hold the c4 pawn, immediately striking White’s center with ...c5 and ...a6-...b5.',
    keyConcepts: ['Fluid central play', 'Early ...c5 counter-strike', 'Queenside expansion with ...b5'],
  },
  {
    eco: 'D02',
    name: 'London System',
    moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'c5', 'c3', 'Nc6', 'Nd2'],
    category: 'Positional System',
    whitePlan: 'White develops the dark-squared bishop outside the pawn pyramid before playing e3, setting up an impregnable fortress and e5 knight outpost.',
    blackPlan: 'Black attacks White’s center and queenside with ...c5, ...Qb6, and aims to trade off White’s prized f4 bishop.',
    keyConcepts: ['The London Triangle (d4, e3, c3)', 'e5 knight outpost anchor', 'Rock-solid prophylaxis'],
  },

  // --- INDIAN DEFENSES & HYPERMODERN OPENINGS ---
  {
    eco: 'E60',
    name: 'King’s Indian Defense (KID)',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6'],
    category: 'Hypermodern',
    whitePlan: 'White builds a massive classical pawn center (c4, d4, e4) and launches queenside expansion with c5 and b4.',
    blackPlan: 'Black permits White the center, fianchettos the dark bishop, and delivers a ferocious kingside mating storm with ...e5, ...f5, and ...f4-g5-g4.',
    keyConcepts: ['Mar del Plata attack', 'Opposite-wing race to the death', 'Sacrificial kingside pawn avalanches'],
  },
  {
    eco: 'E20',
    name: 'Nimzo-Indian Defense',
    moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'],
    category: 'Hypermodern',
    whitePlan: 'White accepts doubled c-pawns to secure the bishop pair and build a formidable pawn center with f3 and e4 (Rubinstein/Saemisch).',
    blackPlan: 'Black pins and trades the c3 knight to inflict doubled c-pawns on White, blockading the position and targeting c4 with ...b6, ...Ba6, and ...Na5.',
    keyConcepts: ['Doubled pawn blockades', 'Bishop pair vs knight dynamism', 'Targeting the doubled c4 pawn'],
  },
  {
    eco: 'A80',
    name: 'Dutch Defense',
    moves: ['d4', 'f5'],
    category: 'Flank Defense',
    whitePlan: 'White exploits the weakened e8-h5 diagonal and e5 square by fianchettoing on g2 and controlling the center.',
    blackPlan: 'Black immediately claims kingside space and clamps down on e4, setting up Stonewall or Leningrad attacks on White’s king.',
    keyConcepts: ['Stonewall pawn formation', 'f-file king attack', 'Fight for the e4 outpost'],
  },
  {
    eco: 'A04',
    name: 'Réti Opening',
    moves: ['Nf3', 'd5', 'c4'],
    category: 'Hypermodern',
    whitePlan: 'White controls the center from a distance with piece pressure and flank pawns (c4, g3, Bg2), undermining Black’s d5 anchor.',
    blackPlan: 'Black occupies the center with ...d4 or supports with ...c6/...e6, maintaining spatial equality.',
    keyConcepts: ['Hypermodern piece control', 'Double fianchetto setups', 'Indirect center pressure'],
  },
  {
    eco: 'A10',
    name: 'English Opening',
    moves: ['c4'],
    category: 'Flank Opening',
    whitePlan: 'White controls the crucial d5 square from the flank, aiming for flexible Botvinnik setups (g3, Bg2, e4, d3) or queenside expansion.',
    blackPlan: 'Black can transpose to 1.e4 or 1.d4 defenses, or play symmetrically with 1...c5 or reversed Sicilian with 1...e5.',
    keyConcepts: ['d5 square supremacy', 'Flexible transpositions', 'Queenside minority leverage'],
  },
  {
    eco: 'C42',
    name: 'Petrov’s Defense (Russian Game)',
    moves: ['e4', 'e5', 'Nf3', 'Nf6'],
    category: 'Open Game',
    whitePlan: 'White captures on e5 or plays d4 to provoke tactical imbalances and press for opening advantage.',
    blackPlan: 'Black counter-attacks White’s e4 pawn instead of defending e5, seeking symmetrical equality and rock-solid defense.',
    keyConcepts: ['Symmetrical counter-punch', 'Early e-file tension', 'High draw rate at master level'],
  },
  {
    eco: 'C20',
    name: 'King’s Gambit',
    moves: ['e4', 'e5', 'f4'],
    category: 'Romantic Gambit',
    whitePlan: 'White sacrifices the f4 pawn on move 2 to eliminate Black’s e5 pawn, open the f-file for the rook, and dominate the center with d4.',
    blackPlan: 'Black can accept (2...exf4) and defend the pawn with ...g5, or decline (2...Bc5 or 2...d5 Falkbeer Counter-Gambit) for active piece play.',
    keyConcepts: ['Romantic sacrificial attacking', 'Open f-file pressure', 'Severe king safety compromises'],
  },
];

export function detectOpening(moveHistory: string[]): Opening | null {
  if (!moveHistory || moveHistory.length === 0) return null;

  let bestMatch: Opening | null = null;
  let maxMatchedMoves = 0;

  for (const opening of OPENINGS_DATABASE) {
    let matches = 0;
    for (let i = 0; i < opening.moves.length; i++) {
      if (i >= moveHistory.length) break;
      if (moveHistory[i] === opening.moves[i]) {
        matches++;
      } else {
        break;
      }
    }

    if (matches > 0 && matches === Math.min(opening.moves.length, moveHistory.length) && matches > maxMatchedMoves) {
      maxMatchedMoves = matches;
      bestMatch = opening;
    }
  }

  return bestMatch;
}

export function findBookMove(moveHistory: string[], preferredOpenings: string[] = []): string | null {
  const matchingOpenings: Array<{ opening: Opening; nextMove: string }> = [];

  for (const opening of OPENINGS_DATABASE) {
    let isPrefix = true;
    for (let i = 0; i < moveHistory.length; i++) {
      if (i >= opening.moves.length || opening.moves[i] !== moveHistory[i]) {
        isPrefix = false;
        break;
      }
    }

    if (isPrefix && opening.moves.length > moveHistory.length) {
      matchingOpenings.push({
        opening,
        nextMove: opening.moves[moveHistory.length],
      });
    }
  }

  if (matchingOpenings.length === 0) return null;

  // Check if any matching opening aligns with AI preferred openings
  if (preferredOpenings.length > 0) {
    const preferred = matchingOpenings.find(m =>
      preferredOpenings.some(pref => m.opening.name.toLowerCase().includes(pref.toLowerCase()))
    );
    if (preferred) return preferred.nextMove;
  }

  // Pick from candidate book moves
  const candidate = matchingOpenings[Math.floor(Math.random() * matchingOpenings.length)];
  return candidate.nextMove;
}

