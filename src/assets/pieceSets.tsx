import React from 'react';
import type { PieceColor, PieceType, PieceSetId } from '../types/chess';

interface PieceIconProps {
  type: PieceType;
  color: PieceColor;
  set?: PieceSetId;
  className?: string;
  size?: number | string;
}

export const PieceIcon: React.FC<PieceIconProps> = ({
  type,
  color,
  set = 'neo-cyber',
  className = '',
  size = '100%',
}) => {
  const isWhite = color === 'w';

  if (set === 'neo-cyber') {
    return <NeoCyberPiece type={type} isWhite={isWhite} className={className} size={size} />;
  }

  if (set === 'minimalist') {
    return <MinimalistPiece type={type} isWhite={isWhite} className={className} size={size} />;
  }

  return <ClassicPiece type={type} isWhite={isWhite} className={className} size={size} />;
};

// ==========================================
// 1. NEO-CYBER PIECE SET (Futuristic & Sleek)
// ==========================================
const NeoCyberPiece: React.FC<{ type: PieceType; isWhite: boolean; className?: string; size?: number | string }> = ({
  type,
  isWhite,
  className,
  size,
}) => {
  const strokeColor = isWhite ? '#00f0ff' : '#ff0055';
  const fillColor = isWhite ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 0, 85, 0.2)';
  const glowColor = isWhite ? 'rgba(0, 240, 255, 0.6)' : 'rgba(255, 0, 85, 0.6)';
  const innerColor = isWhite ? '#e0f7fa' : '#ffebee';

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`piece-svg neo-cyber ${className || ''}`}
      style={{ filter: `drop-shadow(0 0 5px ${glowColor})` }}
    >
      <defs>
        <linearGradient id={`grad-${type}-${isWhite ? 'w' : 'b'}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={innerColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* --- PAWN --- */}
      {type === 'p' && (
        <g stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill={fillColor}>
          {/* Base */}
          <path d="M28 85 L72 85 L66 75 L34 75 Z" />
          {/* Body */}
          <path d="M38 75 C38 55 42 45 42 38 L58 38 C58 45 62 55 62 75 Z" />
          {/* Head Sphere with Neon Ring */}
          <circle cx="50" cy="26" r="14" fill={`url(#grad-${type}-${isWhite ? 'w' : 'b'})`} />
          <path d="M42 26 L58 26" stroke={innerColor} strokeWidth="2" />
          <circle cx="50" cy="26" r="4" fill={strokeColor} />
        </g>
      )}

      {/* --- KNIGHT --- */}
      {type === 'n' && (
        <g stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill={fillColor}>
          <path d="M28 85 L72 85 L66 76 L34 76 Z" />
          {/* Cyber Horse Silhouette */}
          <path
            d="M34 76 C32 60 25 45 35 30 L45 18 L52 24 L56 16 L65 25 C75 35 78 52 66 76 Z"
            fill={`url(#grad-${type}-${isWhite ? 'w' : 'b'})`}
          />
          {/* Mane and Visor */}
          <path d="M30 45 L45 40 L40 55 L55 48" stroke={strokeColor} strokeWidth="2" fill="none" />
          <circle cx="48" cy="30" r="3" fill={strokeColor} />
          {/* Cyber Muzzle */}
          <path d="M28 50 L38 55" stroke={innerColor} strokeWidth="2.5" />
        </g>
      )}

      {/* --- BISHOP --- */}
      {type === 'b' && (
        <g stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill={fillColor}>
          <path d="M26 85 L74 85 L68 76 L32 76 Z" />
          <path d="M36 76 C36 58 40 45 40 38 L60 38 C60 45 64 58 64 76 Z" />
          {/* Mitre Mitre Egg */}
          <path
            d="M50 16 C34 26 34 50 50 54 C66 50 66 26 50 16 Z"
            fill={`url(#grad-${type}-${isWhite ? 'w' : 'b'})`}
          />
          {/* Cyber Slit */}
          <path d="M42 28 L58 42" stroke={strokeColor} strokeWidth="2.5" />
          <circle cx="50" cy="14" r="3" fill={strokeColor} />
        </g>
      )}

      {/* --- ROOK --- */}
      {type === 'r' && (
        <g stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill={fillColor}>
          <path d="M24 85 L76 85 L70 76 L30 76 Z" />
          {/* Tower Body */}
          <path d="M32 76 L36 38 L64 38 L68 76 Z" fill={`url(#grad-${type}-${isWhite ? 'w' : 'b'})`} />
          {/* Battlements */}
          <path d="M28 38 L28 22 L38 22 L38 28 L46 28 L46 22 L54 22 L54 28 L62 28 L62 22 L72 22 L72 38 Z" />
          {/* Energy core */}
          <rect x="44" y="46" width="12" height="18" rx="2" fill={strokeColor} opacity="0.8" />
        </g>
      )}

      {/* --- QUEEN --- */}
      {type === 'q' && (
        <g stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill={fillColor}>
          <path d="M22 86 L78 86 L72 76 L28 76 Z" />
          <path d="M32 76 C32 60 38 48 38 42 L62 42 C62 48 68 60 68 76 Z" />
          {/* Crown Spikes */}
          <path
            d="M26 38 L34 22 L44 32 L50 16 L56 32 L66 22 L74 38 Z"
            fill={`url(#grad-${type}-${isWhite ? 'w' : 'b'})`}
          />
          {/* Crown Jewels */}
          <circle cx="34" cy="20" r="3" fill={strokeColor} />
          <circle cx="50" cy="14" r="3.5" fill={strokeColor} />
          <circle cx="66" cy="20" r="3" fill={strokeColor} />
          <polygon points="50,48 58,58 42,58" fill={strokeColor} opacity="0.9" />
        </g>
      )}

      {/* --- KING --- */}
      {type === 'k' && (
        <g stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill={fillColor}>
          <path d="M22 86 L78 86 L72 76 L28 76 Z" />
          <path d="M30 76 C30 58 36 45 36 38 L64 38 C64 45 70 58 70 76 Z" fill={`url(#grad-${type}-${isWhite ? 'w' : 'b'})`} />
          {/* Majestic Crown */}
          <path d="M28 38 C28 26 72 26 72 38 Z" />
          {/* Cross */}
          <path d="M50 10 L50 26 M42 16 L58 16" stroke={strokeColor} strokeWidth="3" />
          <circle cx="50" cy="52" r="6" fill={strokeColor} />
        </g>
      )}
    </svg>
  );
};

// ==========================================
// 2. MINIMALIST MODERN PIECE SET
// ==========================================
const MinimalistPiece: React.FC<{ type: PieceType; isWhite: boolean; className?: string; size?: number | string }> = ({
  type,
  isWhite,
  className,
  size,
}) => {
  const fill = isWhite ? '#ffffff' : '#1e293b';
  const stroke = isWhite ? '#94a3b8' : '#0f172a';
  const accent = isWhite ? '#38bdf8' : '#818cf8';

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`piece-svg minimalist ${className || ''}`}>
      <g fill={fill} stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {type === 'p' && (
          <>
            <rect x="30" y="80" width="40" height="8" rx="4" />
            <path d="M42 80 L44 50 L56 50 L58 80 Z" />
            <circle cx="50" cy="36" r="16" />
            <circle cx="50" cy="36" r="5" fill={accent} stroke="none" />
          </>
        )}
        {type === 'n' && (
          <>
            <rect x="28" y="80" width="44" height="8" rx="4" />
            <path d="M34 80 C32 60 25 45 38 32 L46 20 L58 28 L64 20 L70 30 C76 46 72 65 64 80 Z" />
            <circle cx="52" cy="36" r="4" fill={accent} stroke="none" />
          </>
        )}
        {type === 'b' && (
          <>
            <rect x="28" y="80" width="44" height="8" rx="4" />
            <path d="M36 80 C36 60 40 45 42 38 L58 38 C60 45 64 60 64 80 Z" />
            <ellipse cx="50" cy="34" rx="16" ry="20" />
            <line x1="42" y1="28" x2="58" y2="40" stroke={accent} strokeWidth="3" />
            <circle cx="50" cy="12" r="3" fill={accent} stroke="none" />
          </>
        )}
        {type === 'r' && (
          <>
            <rect x="24" y="80" width="52" height="8" rx="4" />
            <rect x="34" y="38" width="32" height="42" />
            <path d="M28 38 L28 22 L38 22 L38 28 L46 28 L46 22 L54 22 L54 28 L62 28 L62 22 L72 22 L72 38 Z" />
            <line x1="50" y1="48" x2="50" y2="68" stroke={accent} strokeWidth="3" />
          </>
        )}
        {type === 'q' && (
          <>
            <rect x="22" y="82" width="56" height="8" rx="4" />
            <path d="M32 82 C34 60 38 48 40 42 L60 42 C62 48 66 60 68 82 Z" />
            <path d="M26 40 L34 22 L44 32 L50 18 L56 32 L66 22 L74 40 Z" />
            <circle cx="50" cy="16" r="3" fill={accent} stroke="none" />
          </>
        )}
        {type === 'k' && (
          <>
            <rect x="22" y="82" width="56" height="8" rx="4" />
            <path d="M30 82 C32 60 36 45 38 40 L62 40 C64 45 68 60 70 82 Z" />
            <ellipse cx="50" cy="40" rx="20" ry="12" />
            <path d="M50 14 L50 28 M43 20 L57 20" stroke={accent} strokeWidth="4" />
          </>
        )}
      </g>
    </svg>
  );
};

// ==========================================
// 3. CLASSIC LUXURY STAUNTON SET
// ==========================================
const ClassicPiece: React.FC<{ type: PieceType; isWhite: boolean; className?: string; size?: number | string }> = ({
  type,
  isWhite,
  className,
  size,
}) => {
  const fill = isWhite ? '#f8fafc' : '#0f172a';
  const stroke = isWhite ? '#64748b' : '#334155';
  const highlight = isWhite ? '#ffffff' : '#1e293b';

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`piece-svg classic ${className || ''}`}>
      <g fill={fill} stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {type === 'p' && (
          <>
            <ellipse cx="50" cy="85" rx="25" ry="6" />
            <path d="M35 82 C38 60 42 45 42 38 L58 38 C58 45 62 60 65 82 Z" fill={highlight} />
            <circle cx="50" cy="26" r="14" />
          </>
        )}
        {type === 'n' && (
          <>
            <ellipse cx="50" cy="85" rx="26" ry="6" />
            <path d="M32 82 C30 65 24 50 36 34 L45 22 C52 24 56 16 64 24 C72 32 75 52 66 82 Z" fill={highlight} />
            <circle cx="48" cy="34" r="3" fill={stroke} stroke="none" />
            <path d="M35 55 Q42 58 50 52" fill="none" stroke={stroke} strokeWidth="2" />
          </>
        )}
        {type === 'b' && (
          <>
            <ellipse cx="50" cy="85" rx="26" ry="6" />
            <path d="M34 82 C36 60 40 45 42 38 L58 38 C60 45 64 60 66 82 Z" fill={highlight} />
            <path d="M50 18 C36 28 36 50 50 54 C64 50 64 28 50 18 Z" />
            <circle cx="50" cy="14" r="3" />
            <path d="M44 26 L56 38" stroke={stroke} strokeWidth="2" />
          </>
        )}
        {type === 'r' && (
          <>
            <ellipse cx="50" cy="85" rx="28" ry="6" />
            <path d="M32 82 L36 38 L64 38 L68 82 Z" fill={highlight} />
            <path d="M28 38 L28 22 L38 22 L38 28 L46 28 L46 22 L54 22 L54 28 L62 28 L62 22 L72 22 L72 38 Z" />
          </>
        )}
        {type === 'q' && (
          <>
            <ellipse cx="50" cy="86" rx="30" ry="6" />
            <path d="M30 83 C32 60 38 48 40 42 L60 42 C62 48 68 60 70 83 Z" fill={highlight} />
            <path d="M26 40 L34 22 L44 32 L50 16 L56 32 L66 22 L74 40 Z" />
            <circle cx="34" cy="20" r="2.5" />
            <circle cx="50" cy="14" r="3" />
            <circle cx="66" cy="20" r="2.5" />
          </>
        )}
        {type === 'k' && (
          <>
            <ellipse cx="50" cy="86" rx="30" ry="6" />
            <path d="M28 83 C30 58 36 45 38 38 L62 38 C64 45 70 58 72 83 Z" fill={highlight} />
            <path d="M28 38 C28 24 72 24 72 38 Z" />
            <path d="M50 10 L50 24 M43 15 L57 15" stroke={stroke} strokeWidth="3" />
          </>
        )}
      </g>
    </svg>
  );
};
