# New Age Chess

A next-generation chess platform and AI tactical academy built with React 19, TypeScript, and Vite. New Age Chess combines competitive engine gameplay with a cyber-styled aesthetic, personality-driven neural AI opponents, real-time strategic coaching, and tactical visualization overlays.

---

## Overview

New Age Chess transforms standard digital chess into an interactive command center. Beyond move execution, the platform provides real-time position analysis, opponent threat decoding, square control heatmaps, and opening recognition powered by an integrated evaluation engine.

---

## Core Features

### 1. Neural AI Personalities
Compete against five distinct AI archetypes, each featuring custom evaluation weights, opening preferences, aggression metrics, and tactical risk profiles:

- **Nexus Prime (Grandmaster - 2450 ELO)**: Balanced, positional master excelling in prophylaxis and endgame conversion.
- **Valkyrie Blade (Tactical Assassin - 2200 ELO)**: Ultra-aggressive attacker favoring kingside pawn storms and speculative sacrifices.
- **Aegis Titan (The Iron Fortress - 2150 ELO)**: Prophylactic specialist focused on airtight pawn chains and counterplay suppression.
- **Oracle Vega (Hypermodern Sage - 2100 ELO)**: Indirect piece coordinator relying on fianchettoed bishops and flank pressure.
- **Cipher Maverick (Gambit Maverick - 2000 ELO)**: High-tempo tactician trading material for rapid open lines and initiative.

### 2. Live Tactical and Strategic Coach
The Practice Coach provides instant feedback on every ply:
- **Opening Recognition**: Automatic ECO code classification and opening system identification.
- **CPU Threat Decoding**: Live assessments of the opponent's tactical intentions and threat severity (Low, Medium, High, Critical).
- **Engine Counter-Tactics**: Top candidate response lines with positional harmony and win-probability evaluations.
- **One-Click Execution**: Play recommended engine lines directly from the coach interface.

### 3. Tactical Visualizer Overlays
Toggle visual vectors directly rendered onto the chessboard grid:
- **Best Move Vectors**: Directional vector paths highlighting optimal attacking lines.
- **Threat Radar**: Glowing status rings distinguishing under-defended and hanging pieces.
- **Influence Heatmap**: Dynamic 64-square color field displaying territorial control and square contestation.

### 4. Arena Architecture and Design
- **Responsive 3-Column Arena**: Fluid layout scaling across desktop displays with container query sizing to prevent component collision.
- **Cybernetic Themes**: Four visual presets with custom color palettes and board contrasts:
  - Cyber Neon (Default cyan and magenta)
  - Midnight Gold (Deep slate and amber accents)
  - Hologram Blue (Deep cobalt and sky blue)
  - Minimalist Slate (Monochrome tournament contrast)
- **Time Controls**: Blitz, Rapid, Bullet, and Unlimited configurations with Fischer increment support.
- **Move History and Portable Game Notation**: Full SAN move logs with move quality classification (Brilliant, Great, Best, Inaccuracy, Mistake, Blunder) plus PGN export and FEN import capabilities.
- **Positional Evaluation Bar**: Real-time centipawn advantage tracker with animated height transitions.
- **Synthesized Audio**: Dynamic sound design for moves, captures, checks, promotions, castling, and low-time countdown warnings.

---

## Game Modes

- **Practice and Coach**: Play against the AI with full tactical assistance, candidate moves, and threat analysis active.
- **Play vs CPU**: Tournament-style rated match against any AI personality without tactical assistance.
- **Pass and Play (PvP)**: Local two-player mode with board flip capabilities and timer synchronization.
- **Tactics Drills**: Curated academy puzzle challenges focusing on tactical patterns and motifs.

---

## Technical Stack

- **Framework**: React 19 (Hooks, Suspense, Custom Contexts)
- **Language**: TypeScript (Strict Mode)
- **Bundler**: Vite 8 with Hot Module Replacement (HMR)
- **Styling**: Modern Vanilla CSS (CSS Grid, Container Queries, Custom Properties, Glassmorphism)
- **3D Graphics Support**: Three.js
- **Icons**: Lucide React
- **Linter**: Oxlint

---

## Project Structure

```text
new-age-chess/
├── public/                # Static assets
├── src/
│   ├── assets/            # Piece icon sets and vector graphics
│   ├── audio/             # Sound management and synthesized audio triggers
│   ├── components/        # React UI components
│   │   ├── 3d/            # Optional 3D board canvas and shaders
│   │   ├── ChessBoard.tsx # 2D responsive board with drag-and-drop
│   │   ├── BoardOverlay.tsx # SVG tactical arrows, threat radar, and heatmaps
│   │   ├── CoachPanel.tsx # Live practice coach and strategy intel panel
│   │   ├── MoveHistory.tsx# Move table, captured trays, and PGN export
│   │   ├── ClockTimer.tsx # Dual chess clock with active turn glow
│   │   ├── EvalBar.tsx    # Vertical centipawn balance indicator
│   │   └── GameControls.tsx # Board actions, load FEN, draw, resign
│   ├── engine/            # Custom chess engine and AI logic
│   │   ├── chessLogic.ts  # Rules, move generation, check/mate validation
│   │   ├── aiEngine.ts    # Minimax evaluation, alpha-beta pruning, PSTs
│   │   ├── strategyAnalyzer.ts # Threat classification and tactical motifs
│   │   └── openings.ts    # ECO opening book database
│   ├── styles/            # Design system, theme tokens, and component CSS
│   ├── types/             # TypeScript definitions and data interfaces
│   ├── App.tsx            # Main application coordinator
│   └── main.tsx           # Application entry point
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript compiler configuration
└── vite.config.ts         # Vite configuration
```

---

## Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm 9.0 or higher

### Installation
1. Clone the repository or navigate to the project directory:
   ```bash
   cd new-age-chess
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the local development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` (or the URL displayed in the terminal) in your browser.

---

## Available Scripts

- `npm run dev`: Starts the local development server with instant HMR.
- `npm run build`: Compiles TypeScript and builds production bundles into `dist/`.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs Oxlint for code quality and static analysis.

---

## License

MIT License. Open for development, customization, and deployment.
