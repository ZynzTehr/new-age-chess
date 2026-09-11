import * as THREE from 'three';
import type { BoardThemeId, PieceColor } from '../../types/chess';

export interface ThemeMaterialPalette {
  lightSquare: THREE.Color;
  darkSquare: THREE.Color;
  boardFrame: THREE.Color;
  gridLine: THREE.Color;
  whitePiece: {
    color: THREE.Color;
    emissive: THREE.Color;
    roughness: number;
    metalness: number;
    clearcoat: number;
  };
  blackPiece: {
    color: THREE.Color;
    emissive: THREE.Color;
    roughness: number;
    metalness: number;
    clearcoat: number;
  };
  selectedEmissive: THREE.Color;
  hoverEmissive: THREE.Color;
  legalMoveColor: THREE.Color;
  threatArrowColor: THREE.Color;
  bestMoveArrowColor: THREE.Color;
  checkRingColor: THREE.Color;
}

export const THEME_PALETTES: Record<BoardThemeId, ThemeMaterialPalette> = {
  'cyber-neon': {
    lightSquare: new THREE.Color(0x1a233a),
    darkSquare: new THREE.Color(0x0a0f1d),
    boardFrame: new THREE.Color(0x070a14),
    gridLine: new THREE.Color(0x00f0ff),
    whitePiece: {
      color: new THREE.Color(0xe2e8f0),
      emissive: new THREE.Color(0x003344),
      roughness: 0.15,
      metalness: 0.25,
      clearcoat: 0.8,
    },
    blackPiece: {
      color: new THREE.Color(0x181824),
      emissive: new THREE.Color(0x330018),
      roughness: 0.2,
      metalness: 0.85,
      clearcoat: 0.6,
    },
    selectedEmissive: new THREE.Color(0x00f0ff),
    hoverEmissive: new THREE.Color(0x00a3ff),
    legalMoveColor: new THREE.Color(0x00f0ff),
    threatArrowColor: new THREE.Color(0xff0055),
    bestMoveArrowColor: new THREE.Color(0x10b981),
    checkRingColor: new THREE.Color(0xef4444),
  },
  'midnight-gold': {
    lightSquare: new THREE.Color(0x27272a),
    darkSquare: new THREE.Color(0x121215),
    boardFrame: new THREE.Color(0x09090b),
    gridLine: new THREE.Color(0xeab308),
    whitePiece: {
      color: new THREE.Color(0xfef08a),
      emissive: new THREE.Color(0x332800),
      roughness: 0.2,
      metalness: 0.7,
      clearcoat: 0.9,
    },
    blackPiece: {
      color: new THREE.Color(0x1c1917),
      emissive: new THREE.Color(0x201505),
      roughness: 0.3,
      metalness: 0.8,
      clearcoat: 0.5,
    },
    selectedEmissive: new THREE.Color(0xfacc15),
    hoverEmissive: new THREE.Color(0xeab308),
    legalMoveColor: new THREE.Color(0xeab308),
    threatArrowColor: new THREE.Color(0xf97316),
    bestMoveArrowColor: new THREE.Color(0x10b981),
    checkRingColor: new THREE.Color(0xef4444),
  },
  'hologram-blue': {
    lightSquare: new THREE.Color(0x0f2942),
    darkSquare: new THREE.Color(0x051329),
    boardFrame: new THREE.Color(0x020817),
    gridLine: new THREE.Color(0x38bdf8),
    whitePiece: {
      color: new THREE.Color(0xbae6fd),
      emissive: new THREE.Color(0x002244),
      roughness: 0.1,
      metalness: 0.3,
      clearcoat: 1.0,
    },
    blackPiece: {
      color: new THREE.Color(0x0f172a),
      emissive: new THREE.Color(0x001133),
      roughness: 0.2,
      metalness: 0.9,
      clearcoat: 0.8,
    },
    selectedEmissive: new THREE.Color(0x38bdf8),
    hoverEmissive: new THREE.Color(0x0284c7),
    legalMoveColor: new THREE.Color(0x38bdf8),
    threatArrowColor: new THREE.Color(0xf43f5e),
    bestMoveArrowColor: new THREE.Color(0x34d399),
    checkRingColor: new THREE.Color(0xef4444),
  },
  'minimal-slate': {
    lightSquare: new THREE.Color(0x334155),
    darkSquare: new THREE.Color(0x1e293b),
    boardFrame: new THREE.Color(0x0f172a),
    gridLine: new THREE.Color(0x94a3b8),
    whitePiece: {
      color: new THREE.Color(0xf8fafc),
      emissive: new THREE.Color(0x1e293b),
      roughness: 0.25,
      metalness: 0.1,
      clearcoat: 0.5,
    },
    blackPiece: {
      color: new THREE.Color(0x0f172a),
      emissive: new THREE.Color(0x020617),
      roughness: 0.3,
      metalness: 0.5,
      clearcoat: 0.4,
    },
    selectedEmissive: new THREE.Color(0x94a3b8),
    hoverEmissive: new THREE.Color(0xcbd5e1),
    legalMoveColor: new THREE.Color(0x94a3b8),
    threatArrowColor: new THREE.Color(0xf87171),
    bestMoveArrowColor: new THREE.Color(0x4ade80),
    checkRingColor: new THREE.Color(0xef4444),
  },
};


/**
 * Creates 3D Physical Material for Chess Pieces
 */
export function createPieceMaterial(
  color: PieceColor,
  theme: BoardThemeId = 'cyber-neon',
  isSelected = false,
  isHovered = false
): THREE.MeshPhysicalMaterial {
  const palette = THEME_PALETTES[theme] || THEME_PALETTES['cyber-neon'];
  const pConfig = color === 'w' ? palette.whitePiece : palette.blackPiece;

  const mat = new THREE.MeshPhysicalMaterial({
    color: pConfig.color,
    roughness: pConfig.roughness,
    metalness: pConfig.metalness,
    clearcoat: pConfig.clearcoat,
    clearcoatRoughness: 0.1,
    reflectivity: 0.9,
    emissive: isSelected
      ? palette.selectedEmissive
      : isHovered
      ? palette.hoverEmissive
      : pConfig.emissive,
    emissiveIntensity: isSelected ? 0.8 : isHovered ? 0.4 : 0.15,
  });

  return mat;
}
