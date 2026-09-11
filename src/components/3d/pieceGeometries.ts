import * as THREE from 'three';
import type { PieceType } from '../../types/chess';

// Cache generated geometries so they are created once and reused for high performance
const geometryCache: Partial<Record<PieceType, THREE.BufferGeometry>> = {};

/**
 * Creates a smooth 3D Pawn using LatheGeometry
 */
export function createPawnGeometry(): THREE.BufferGeometry {
  if (geometryCache.p) return geometryCache.p;

  const points: THREE.Vector2[] = [];
  // Base
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.42, 0));
  points.push(new THREE.Vector2(0.42, 0.08));
  points.push(new THREE.Vector2(0.36, 0.12));
  points.push(new THREE.Vector2(0.38, 0.16));
  points.push(new THREE.Vector2(0.32, 0.22));

  // Tapered Body
  points.push(new THREE.Vector2(0.24, 0.35));
  points.push(new THREE.Vector2(0.18, 0.55));
  points.push(new THREE.Vector2(0.16, 0.70));

  // Collar Ring
  points.push(new THREE.Vector2(0.25, 0.73));
  points.push(new THREE.Vector2(0.25, 0.77));
  points.push(new THREE.Vector2(0.16, 0.80));

  // Head Dome
  for (let i = 0; i <= 12; i++) {
    const angle = (i / 12) * Math.PI;
    const r = 0.22 * Math.sin(angle);
    const y = 0.80 + 0.22 - 0.22 * Math.cos(angle);
    points.push(new THREE.Vector2(Math.max(0, r), y));
  }
  points.push(new THREE.Vector2(0, 1.24));

  const geom = new THREE.LatheGeometry(points, 32);
  geom.computeVertexNormals();
  geometryCache.p = geom;
  return geom;
}

/**
 * Creates a 3D Rook with castle battlements
 */
export function createRookGeometry(): THREE.BufferGeometry {
  if (geometryCache.r) return geometryCache.r;

  const points: THREE.Vector2[] = [];

  // Base
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.48, 0));
  points.push(new THREE.Vector2(0.48, 0.10));
  points.push(new THREE.Vector2(0.42, 0.16));
  points.push(new THREE.Vector2(0.44, 0.22));
  points.push(new THREE.Vector2(0.36, 0.30));

  // Tower Column
  points.push(new THREE.Vector2(0.30, 0.50));
  points.push(new THREE.Vector2(0.28, 0.90));

  // Flared Top
  points.push(new THREE.Vector2(0.42, 1.05));
  points.push(new THREE.Vector2(0.42, 1.35));
  points.push(new THREE.Vector2(0.32, 1.35));
  points.push(new THREE.Vector2(0.32, 1.15));
  points.push(new THREE.Vector2(0, 1.15));

  const lathe = new THREE.LatheGeometry(points, 32);
  lathe.computeVertexNormals();
  geometryCache.r = lathe;
  return lathe;
}

/**
 * Creates a sculpted 3D Knight (Horse)
 */
export function createKnightGeometry(): THREE.BufferGeometry {
  if (geometryCache.n) return geometryCache.n;

  // 2D Horse Head Silhouette for Extrusion
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.30);

  shape.lineTo(0.28, 0.30);
  shape.quadraticCurveTo(0.32, 0.55, 0.26, 0.85); // Back of neck
  shape.lineTo(0.32, 1.20); // Mane peak
  shape.lineTo(0.24, 1.38); // Ear tip
  shape.lineTo(0.14, 1.25); // Forehead
  shape.quadraticCurveTo(0.04, 1.15, -0.22, 1.05); // Snout bridge
  shape.lineTo(-0.26, 0.88); // Nose
  shape.lineTo(-0.16, 0.82); // Mouth
  shape.quadraticCurveTo(-0.06, 0.72, -0.04, 0.55); // Chin & throat
  shape.quadraticCurveTo(-0.02, 0.40, 0, 0.30);

  const extrudeSettings = {
    steps: 2,
    depth: 0.30,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 4,
  };

  const headGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  headGeom.center();
  headGeom.translate(0, 0.85, 0);

  // Merge Base and Head
  headGeom.scale(1, 1, 1);
  const knightGeom = headGeom.clone();
  knightGeom.computeVertexNormals();

  geometryCache.n = knightGeom;
  return knightGeom;
}

/**
 * Creates a 3D Bishop with Mitre and finial
 */
export function createBishopGeometry(): THREE.BufferGeometry {
  if (geometryCache.b) return geometryCache.b;

  const points: THREE.Vector2[] = [];
  // Base
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.46, 0));
  points.push(new THREE.Vector2(0.46, 0.10));
  points.push(new THREE.Vector2(0.40, 0.16));
  points.push(new THREE.Vector2(0.42, 0.22));
  points.push(new THREE.Vector2(0.34, 0.30));

  // Stem
  points.push(new THREE.Vector2(0.22, 0.55));
  points.push(new THREE.Vector2(0.18, 0.80));

  // Collar
  points.push(new THREE.Vector2(0.30, 0.85));
  points.push(new THREE.Vector2(0.30, 0.90));
  points.push(new THREE.Vector2(0.18, 0.93));

  // Oval Mitre Body
  points.push(new THREE.Vector2(0.28, 1.05));
  points.push(new THREE.Vector2(0.30, 1.25));
  points.push(new THREE.Vector2(0.24, 1.45));
  points.push(new THREE.Vector2(0.12, 1.60));

  // Finial Ball
  points.push(new THREE.Vector2(0.06, 1.65));
  points.push(new THREE.Vector2(0.10, 1.70));
  points.push(new THREE.Vector2(0.08, 1.76));
  points.push(new THREE.Vector2(0, 1.80));

  const geom = new THREE.LatheGeometry(points, 32);
  geom.computeVertexNormals();
  geometryCache.b = geom;
  return geom;
}

/**
 * Creates a 3D Queen with Coronet
 */
export function createQueenGeometry(): THREE.BufferGeometry {
  if (geometryCache.q) return geometryCache.q;

  const points: THREE.Vector2[] = [];
  // Base
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.50, 0));
  points.push(new THREE.Vector2(0.50, 0.12));
  points.push(new THREE.Vector2(0.44, 0.18));
  points.push(new THREE.Vector2(0.46, 0.24));
  points.push(new THREE.Vector2(0.38, 0.32));

  // Waist
  points.push(new THREE.Vector2(0.26, 0.65));
  points.push(new THREE.Vector2(0.22, 1.00));

  // Torus Ring
  points.push(new THREE.Vector2(0.34, 1.05));
  points.push(new THREE.Vector2(0.34, 1.12));
  points.push(new THREE.Vector2(0.24, 1.16));

  // Flared Crown Body
  points.push(new THREE.Vector2(0.38, 1.40));
  points.push(new THREE.Vector2(0.44, 1.65));
  points.push(new THREE.Vector2(0.30, 1.62));
  points.push(new THREE.Vector2(0.12, 1.68));

  // Royal Finial
  points.push(new THREE.Vector2(0.12, 1.78));
  points.push(new THREE.Vector2(0.06, 1.84));
  points.push(new THREE.Vector2(0, 1.88));

  const geom = new THREE.LatheGeometry(points, 32);
  geom.computeVertexNormals();
  geometryCache.q = geom;
  return geom;
}

/**
 * Creates a 3D King with Cross Pattée
 */
export function createKingGeometry(): THREE.BufferGeometry {
  if (geometryCache.k) return geometryCache.k;

  const points: THREE.Vector2[] = [];
  // Base
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.52, 0));
  points.push(new THREE.Vector2(0.52, 0.12));
  points.push(new THREE.Vector2(0.46, 0.20));
  points.push(new THREE.Vector2(0.48, 0.26));
  points.push(new THREE.Vector2(0.40, 0.36));

  // Body
  points.push(new THREE.Vector2(0.28, 0.70));
  points.push(new THREE.Vector2(0.25, 1.10));

  // Collar
  points.push(new THREE.Vector2(0.38, 1.16));
  points.push(new THREE.Vector2(0.38, 1.24));
  points.push(new THREE.Vector2(0.26, 1.28));

  // Imperial Dome
  points.push(new THREE.Vector2(0.38, 1.45));
  points.push(new THREE.Vector2(0.42, 1.65));
  points.push(new THREE.Vector2(0.30, 1.78));
  points.push(new THREE.Vector2(0.10, 1.82));

  // Cross Base Finial
  points.push(new THREE.Vector2(0.12, 1.92));
  points.push(new THREE.Vector2(0.06, 1.98));
  points.push(new THREE.Vector2(0, 2.05));

  const geom = new THREE.LatheGeometry(points, 32);
  geom.computeVertexNormals();
  geometryCache.k = geom;
  return geom;
}

/**
 * Returns the procedural 3D geometry for any chess piece type
 */
export function getPieceGeometry(type: PieceType): THREE.BufferGeometry {
  switch (type) {
    case 'p':
      return createPawnGeometry();
    case 'r':
      return createRookGeometry();
    case 'n':
      return createKnightGeometry();
    case 'b':
      return createBishopGeometry();
    case 'q':
      return createQueenGeometry();
    case 'k':
      return createKingGeometry();
  }
}
