import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ChessEngine, squareToFileRank, fileRankToSquare } from '../../engine/chessLogic';
import type { Square, Move, PieceType, PieceColor, BoardThemeId, StrategyIntel } from '../../types/chess';
import { getPieceGeometry } from './pieceGeometries';
import { THEME_PALETTES, createPieceMaterial } from './materials';
import { PieceIcon } from '../../assets/pieceSets';
import { Eye, RotateCw } from 'lucide-react';

interface ChessBoard3DProps {
  engine: ChessEngine;
  flipped: boolean;
  theme: BoardThemeId;
  showLegalMoves: boolean;
  showBestMoveArrow: boolean;
  showThreats: boolean;
  showInfluenceHeatmap: boolean;
  strategyIntel: StrategyIntel | null;
  lastMove: Move | null;
  onMakeMove: (move: Move) => boolean;
  disabled?: boolean;
}

const SQUARE_SIZE = 1.0;
const BOARD_OFFSET = 3.5 * SQUARE_SIZE;

export const ChessBoard3D: React.FC<ChessBoard3DProps> = ({
  engine,
  flipped,
  theme,
  showLegalMoves,
  showBestMoveArrow,
  showThreats,
  strategyIntel,
  lastMove,
  onMakeMove,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<Square | null>(null);
  const [cameraPreset, setCameraPreset] = useState<'angle' | 'front' | 'top'>('angle');
  const [promotionPending, setPromotionPending] = useState<{
    from: Square;
    to: Square;
    piece: PieceType;
    color: PieceColor;
  } | null>(null);

  // Three.js instances ref
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    piecesGroup: THREE.Group;
    tilesGroup: THREE.Group;
    overlayGroup: THREE.Group;
    ambientLight: THREE.AmbientLight;
    dirLight: THREE.DirectionalLight;
    pointLight: THREE.PointLight;
    animatingPiece?: {
      mesh: THREE.Mesh;
      fromPos: THREE.Vector3;
      toPos: THREE.Vector3;
      progress: number;
    };
  } | null>(null);

  const legalMoves = selectedSquare
    ? engine.getLegalMoves().filter(m => m.from === selectedSquare)
    : [];

  const inCheck = engine.inCheck();
  const checkedKingSq = inCheck ? engine.getKingSquare(engine.state.turn) : null;

  // World coordinate mapper
  const squareToWorld = useCallback(
    (sq: Square): { x: number; z: number } => {
      const { file, rank } = squareToFileRank(sq);
      const visualFile = flipped ? 7 - file : file;
      const visualRank = flipped ? rank : 7 - rank;
      const x = visualFile * SQUARE_SIZE - BOARD_OFFSET;
      const z = visualRank * SQUARE_SIZE - BOARD_OFFSET;
      return { x, z };
    },
    [flipped]
  );

  const worldToSquare = useCallback(
    (x: number, z: number): Square | null => {
      const col = Math.round((x + BOARD_OFFSET) / SQUARE_SIZE);
      const row = Math.round((z + BOARD_OFFSET) / SQUARE_SIZE);
      if (col < 0 || col > 7 || row < 0 || row > 7) return null;

      const file = flipped ? 7 - col : col;
      const rank = flipped ? row : 7 - row;
      return fileRankToSquare(file, rank);
    },
    [flipped]
  );

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 500;
    const height = containerRef.current.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 7.5, 8.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(5, 12, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x00f0ff, 2.0, 15);
    pointLight.position.set(0, 3, 0);
    scene.add(pointLight);

    // Groups
    const tilesGroup = new THREE.Group();
    const piecesGroup = new THREE.Group();
    const overlayGroup = new THREE.Group();
    scene.add(tilesGroup);
    scene.add(piecesGroup);
    scene.add(overlayGroup);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      piecesGroup,
      tilesGroup,
      overlayGroup,
      ambientLight,
      dirLight,
      pointLight,
    };

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth camera position lerping if moving
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Camera based on preset angle
  useEffect(() => {
    if (!sceneRef.current) return;
    const { camera } = sceneRef.current;

    switch (cameraPreset) {
      case 'angle':
        camera.position.set(0, 6.8, 7.8);
        camera.lookAt(0, -0.3, 0);
        break;
      case 'front':
        camera.position.set(0, 4.2, 8.8);
        camera.lookAt(0, 0, 0);
        break;
      case 'top':
        camera.position.set(0, 10.5, 0.1);
        camera.lookAt(0, 0, 0);
        break;
    }
  }, [cameraPreset]);

  // Re-build 3D Board Tiles
  useEffect(() => {
    if (!sceneRef.current) return;
    const { tilesGroup } = sceneRef.current;
    const palette = THEME_PALETTES[theme] || THEME_PALETTES['cyber-neon'];

    // Clear old tiles
    while (tilesGroup.children.length > 0) {
      const obj = tilesGroup.children[0];
      tilesGroup.remove(obj);
    }

    // Board Frame Base Chassis
    const frameGeom = new THREE.BoxGeometry(9.0, 0.4, 9.0);
    const frameMat = new THREE.MeshStandardMaterial({
      color: palette.boardFrame,
      roughness: 0.3,
      metalness: 0.8,
    });
    const frameMesh = new THREE.Mesh(frameGeom, frameMat);
    frameMesh.position.y = -0.22;
    frameMesh.receiveShadow = true;
    tilesGroup.add(frameMesh);

    // Glowing Neon Border Ring
    const borderGeom = new THREE.BoxGeometry(8.2, 0.05, 8.2);
    const borderMat = new THREE.MeshBasicMaterial({ color: palette.gridLine });
    const borderMesh = new THREE.Mesh(borderGeom, borderMat);
    borderMesh.position.y = -0.01;
    tilesGroup.add(borderMesh);

    // 64 Tiles
    const tileGeom = new THREE.BoxGeometry(0.96, 0.2, 0.96);

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const isDark = (f + r) % 2 === 0;
        const sq = fileRankToSquare(f, r);
        const { x, z } = squareToWorld(sq);

        const isLastMoveSq = lastMove && (lastMove.from === sq || lastMove.to === sq);
        const isSelectedSq = selectedSquare === sq;
        const isHoveredSq = hoveredSquare === sq;
        const isCheckKingSq = checkedKingSq === sq;

        let tileColor = isDark ? palette.darkSquare : palette.lightSquare;
        if (isSelectedSq) tileColor = palette.selectedEmissive;
        else if (isCheckKingSq) tileColor = palette.checkRingColor;
        else if (isLastMoveSq) tileColor = new THREE.Color(0x785500);

        const tileMat = new THREE.MeshStandardMaterial({
          color: tileColor,
          roughness: 0.25,
          metalness: 0.4,
          emissive: isSelectedSq
            ? palette.selectedEmissive
            : isHoveredSq
            ? palette.hoverEmissive
            : isCheckKingSq
            ? palette.checkRingColor
            : new THREE.Color(0x000000),
          emissiveIntensity: isSelectedSq ? 0.6 : isHoveredSq ? 0.3 : isCheckKingSq ? 0.8 : 0,
        });

        const tileMesh = new THREE.Mesh(tileGeom, tileMat);
        tileMesh.position.set(x, -0.05, z);
        tileMesh.receiveShadow = true;
        tileMesh.userData = { square: sq };
        tilesGroup.add(tileMesh);
      }
    }
  }, [theme, flipped, selectedSquare, hoveredSquare, lastMove, checkedKingSq, squareToWorld]);

  // Re-build 3D Pieces
  useEffect(() => {
    if (!sceneRef.current) return;
    const { piecesGroup } = sceneRef.current;

    while (piecesGroup.children.length > 0) {
      const obj = piecesGroup.children[0];
      piecesGroup.remove(obj);
    }

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = engine.state.board[r][f];
        if (!piece) continue;

        const sq = fileRankToSquare(f, r);
        const { x, z } = squareToWorld(sq);
        const isSelected = selectedSquare === sq;
        const isHovered = hoveredSquare === sq;

        const geom = getPieceGeometry(piece.type);
        const mat = createPieceMaterial(piece.color, theme, isSelected, isHovered);

        const pieceMesh = new THREE.Mesh(geom, mat);
        // Elevate selected/hovered pieces in 3D
        const yElevation = isSelected ? 0.4 : isHovered ? 0.15 : 0;
        pieceMesh.position.set(x, yElevation, z);
        pieceMesh.castShadow = true;
        pieceMesh.receiveShadow = true;
        pieceMesh.userData = { square: sq, piece };

        // Rotate black pieces to face white, and knight orientation
        if (piece.type === 'n') {
          pieceMesh.rotation.y = piece.color === 'w' ? (flipped ? Math.PI / 2 : -Math.PI / 2) : (flipped ? -Math.PI / 2 : Math.PI / 2);
        } else {
          pieceMesh.rotation.y = piece.color === 'b' ? Math.PI : 0;
        }

        piecesGroup.add(pieceMesh);
      }
    }
  }, [engine, theme, flipped, selectedSquare, hoveredSquare, squareToWorld]);

  // Re-build 3D Destination Markers & Floating Tactical Overlays
  useEffect(() => {
    if (!sceneRef.current) return;
    const { overlayGroup } = sceneRef.current;
    const palette = THEME_PALETTES[theme] || THEME_PALETTES['cyber-neon'];

    while (overlayGroup.children.length > 0) {
      const obj = overlayGroup.children[0];
      overlayGroup.remove(obj);
    }

    // 1. Legal Move Target Markers
    if (showLegalMoves && selectedSquare && legalMoves.length > 0) {
      for (const m of legalMoves) {
        const { x, z } = squareToWorld(m.to);
        const isCapture = !!m.captured;

        if (isCapture) {
          // 3D Neon Capture Ring
          const ringGeom = new THREE.RingGeometry(0.32, 0.44, 32);
          const ringMat = new THREE.MeshBasicMaterial({
            color: palette.threatArrowColor,
            side: THREE.DoubleSide,
          });
          const ringMesh = new THREE.Mesh(ringGeom, ringMat);
          ringMesh.rotation.x = -Math.PI / 2;
          ringMesh.position.set(x, 0.08, z);
          overlayGroup.add(ringMesh);
        } else {
          // 3D Neon Move Disc
          const discGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 24);
          const discMat = new THREE.MeshBasicMaterial({ color: palette.legalMoveColor });
          const discMesh = new THREE.Mesh(discGeom, discMat);
          discMesh.position.set(x, 0.06, z);
          overlayGroup.add(discMesh);
        }
      }
    }

    // 2. Floating 3D Tactical Arrows
    if (strategyIntel?.threatArrows && strategyIntel.threatArrows.length > 0) {
      for (const arrow of strategyIntel.threatArrows) {
        if (arrow.type === 'threat' && !showThreats) continue;
        if (arrow.type === 'plan' && !showBestMoveArrow) continue;

        const start = squareToWorld(arrow.from);
        const end = squareToWorld(arrow.to);

        const vStart = new THREE.Vector3(start.x, 0.4, start.z);
        const vEnd = new THREE.Vector3(end.x, 0.4, end.z);
        const vMid = new THREE.Vector3(
          (start.x + end.x) / 2,
          0.9 + Math.min(1.2, vStart.distanceTo(vEnd) * 0.2),
          (start.z + end.z) / 2
        );

        const curve = new THREE.QuadraticBezierCurve3(vStart, vMid, vEnd);
        const tubeGeom = new THREE.TubeGeometry(curve, 20, 0.06, 8, false);
        const arrowColor = arrow.type === 'threat' ? palette.threatArrowColor : palette.bestMoveArrowColor;
        const arrowMat = new THREE.MeshStandardMaterial({
          color: arrowColor,
          emissive: arrowColor,
          emissiveIntensity: 0.9,
          roughness: 0.2,
        });

        const tubeMesh = new THREE.Mesh(tubeGeom, arrowMat);
        overlayGroup.add(tubeMesh);

        // Arrowhead cone
        const coneGeom = new THREE.ConeGeometry(0.16, 0.35, 16);
        const coneMesh = new THREE.Mesh(coneGeom, arrowMat);
        coneMesh.position.copy(vEnd);
        const dir = new THREE.Vector3().subVectors(vEnd, vMid).normalize();
        coneMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        overlayGroup.add(coneMesh);
      }
    }
  }, [theme, flipped, selectedSquare, legalMoves, showLegalMoves, showBestMoveArrow, showThreats, strategyIntel, squareToWorld]);

  // Raycasting Click & Hover Handlers
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || promotionPending || !sceneRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), sceneRef.current.camera);

    const { piecesGroup, tilesGroup } = sceneRef.current;
    const intersects = raycaster.intersectObjects([...piecesGroup.children, ...tilesGroup.children], false);

    if (intersects.length === 0) {
      setSelectedSquare(null);
      return;
    }

    // Find clicked square
    let clickedSquare: Square | null = null;
    for (const hit of intersects) {
      if (hit.object.userData?.square) {
        clickedSquare = hit.object.userData.square as Square;
        break;
      }
    }

    if (!clickedSquare) {
      const hitPoint = intersects[0].point;
      clickedSquare = worldToSquare(hitPoint.x, hitPoint.z);
    }

    if (!clickedSquare) return;

    const clickedPiece = engine.getPiece(clickedSquare);

    // If square was already selected
    if (selectedSquare) {
      if (selectedSquare === clickedSquare) {
        setSelectedSquare(null);
        return;
      }

      const validMove = legalMoves.find(m => m.to === clickedSquare);
      if (validMove) {
        // Promotion check
        const isPromo =
          validMove.piece === 'p' &&
          ((validMove.color === 'w' && clickedSquare[1] === '8') ||
            (validMove.color === 'b' && clickedSquare[1] === '1'));

        if (isPromo) {
          setPromotionPending({
            from: selectedSquare,
            to: clickedSquare,
            piece: 'p',
            color: validMove.color,
          });
          return;
        }

        onMakeMove(validMove);
        setSelectedSquare(null);
        return;
      }

      if (clickedPiece && clickedPiece.color === engine.state.turn) {
        setSelectedSquare(clickedSquare);
        return;
      }

      setSelectedSquare(null);
      return;
    }

    // New piece selection
    if (clickedPiece && clickedPiece.color === engine.state.turn) {
      setSelectedSquare(clickedSquare);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!sceneRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), sceneRef.current.camera);

    const intersects = raycaster.intersectObjects(sceneRef.current.tilesGroup.children, false);
    if (intersects.length > 0 && intersects[0].object.userData?.square) {
      setHoveredSquare(intersects[0].object.userData.square as Square);
    } else {
      setHoveredSquare(null);
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

  return (
    <div className="chess-board-3d-wrapper">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="chess-canvas-3d-container"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      />

      {/* 3D Camera Controls Floating Bar */}
      <div className="camera-3d-controls-hud">
        <button
          className={`cam-preset-btn ${cameraPreset === 'angle' ? 'active' : ''}`}
          onClick={() => setCameraPreset('angle')}
          title="3D Cinematic Angle"
        >
          <Eye size={13} />
          <span>Cinematic</span>
        </button>

        <button
          className={`cam-preset-btn ${cameraPreset === 'front' ? 'active' : ''}`}
          onClick={() => setCameraPreset('front')}
          title="Player Front View"
        >
          <RotateCw size={13} />
          <span>Player View</span>
        </button>

        <button
          className={`cam-preset-btn ${cameraPreset === 'top' ? 'active' : ''}`}
          onClick={() => setCameraPreset('top')}
          title="Top-Down Overhead"
        >
          <span>Overhead</span>
        </button>
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
                  <PieceIcon type={pt} color={promotionPending.color} set="neo-cyber" size={48} />
                  <span className="promo-name">
                    {pt === 'q' ? 'Queen' : pt === 'r' ? 'Rook' : pt === 'b' ? 'Bishop' : 'Knight'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
