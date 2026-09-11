import React from 'react';
import type {
  GameSettings,
  BoardThemeId,
  PieceSetId,
  AIDifficulty,
} from '../types/chess';
import { AI_PERSONALITIES } from '../engine/aiEngine';
import {
  Settings,
  X,
  Palette,
  Volume2,
  Cpu,
  Clock,
  Sparkles,
} from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (updates: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const themes: Array<{ id: BoardThemeId; name: string; previewColor: string }> = [
    { id: 'cyber-neon', name: 'Cyber Neon', previewColor: 'linear-gradient(135deg, #00f0ff, #ff0055)' },
    { id: 'midnight-gold', name: 'Midnight Gold', previewColor: 'linear-gradient(135deg, #eab308, #0f172a)' },
    { id: 'hologram-blue', name: 'Hologram Sci-Fi', previewColor: 'linear-gradient(135deg, #38bdf8, #1e1b4b)' },
    { id: 'minimal-slate', name: 'Minimalist Slate', previewColor: 'linear-gradient(135deg, #94a3b8, #334155)' },
  ];

  const pieceSets: Array<{ id: PieceSetId; name: string; desc: string }> = [
    { id: 'neo-cyber', name: 'Neo-Cyber Vectors', desc: 'Futuristic glowing laser pieces' },
    { id: 'minimalist', name: 'Minimal Bauhaus', desc: 'Clean geometric modern silhouettes' },
    { id: 'classic', name: 'Classic Staunton', desc: 'Refined tournament aesthetic' },
  ];

  const difficulties: Array<{ id: AIDifficulty; name: string; elo: number }> = [
    { id: 'novice', name: 'Novice', elo: 800 },
    { id: 'intermediate', name: 'Intermediate', elo: 1400 },
    { id: 'advanced', name: 'Advanced', elo: 1800 },
    { id: 'master', name: 'Master Engine', elo: 2200 },
    { id: 'grandmaster', name: 'Grandmaster Nexus', elo: 2500 },
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card settings-modal-box">
        {/* Header */}
        <div className="modal-header-row">
          <div className="modal-header-title">
            <Settings size={20} className="text-cyan" />
            <h3>Game & Visual Settings</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="settings-body-scroll">
          {/* 1. Board Aesthetics & Themes */}
          <div className="settings-section">
            <div className="section-label">
              <Palette size={16} />
              <span>Board Theme</span>
            </div>
            <div className="theme-options-grid">
              {themes.map(t => (
                <div
                  key={t.id}
                  className={`theme-option-card ${settings.boardTheme === t.id ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ boardTheme: t.id })}
                >
                  <div className="theme-color-swatch" style={{ background: t.previewColor }} />
                  <span className="theme-name">{t.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Piece Set Style */}
          <div className="settings-section">
            <div className="section-label">
              <Sparkles size={16} />
              <span>Piece Style</span>
            </div>
            <div className="piece-sets-grid">
              {pieceSets.map(ps => (
                <div
                  key={ps.id}
                  className={`piece-set-card ${settings.pieceSet === ps.id ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ pieceSet: ps.id })}
                >
                  <span className="ps-name">{ps.name}</span>
                  <span className="ps-desc">{ps.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. AI Personality & Difficulty */}
          <div className="settings-section">
            <div className="section-label">
              <Cpu size={16} />
              <span>AI Engine Personality</span>
            </div>
            <div className="ai-personalities-grid">
              {Object.values(AI_PERSONALITIES).map(p => (
                <div
                  key={p.id}
                  className={`ai-card ${settings.aiPersonality === p.id ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ aiPersonality: p.id })}
                >
                  <div className="ai-card-top">
                    <span className="ai-avatar">{p.avatar}</span>
                    <div>
                      <h4 className="ai-name">{p.name}</h4>
                      <span className="ai-title">{p.title} (~{p.elo} ELO)</span>
                    </div>
                  </div>
                  <p className="ai-style-desc">{p.styleDescription}</p>
                </div>
              ))}
            </div>

            <div className="difficulty-row">
              <label className="sublabel">Engine Depth & Strength:</label>
              <div className="diff-pills-row">
                {difficulties.map(d => (
                  <button
                    key={d.id}
                    className={`diff-pill-btn ${settings.aiDifficulty === d.id ? 'active' : ''}`}
                    onClick={() => onUpdateSettings({ aiDifficulty: d.id })}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Time Controls */}
          <div className="settings-section">
            <div className="section-label">
              <Clock size={16} />
              <span>Time Control</span>
            </div>
            <div className="time-controls-grid">
              {[
                { label: 'Bullet 1m', mins: 1, inc: 0, unl: false },
                { label: 'Blitz 3m', mins: 3, inc: 0, unl: false },
                { label: 'Blitz 5m', mins: 5, inc: 0, unl: false },
                { label: 'Rapid 10m', mins: 10, inc: 0, unl: false },
                { label: 'Classical 15m+10s', mins: 15, inc: 10, unl: false },
                { label: 'Unlimited', mins: 0, inc: 0, unl: true },
              ].map((tc, idx) => (
                <button
                  key={`tc-${idx}`}
                  className={`tc-option-btn ${
                    settings.timeControl.initialMinutes === tc.mins &&
                    settings.timeControl.isUnlimited === tc.unl
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    onUpdateSettings({
                      timeControl: {
                        initialMinutes: tc.mins,
                        incrementSeconds: tc.inc,
                        isUnlimited: tc.unl,
                      },
                    })
                  }
                >
                  {tc.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Sound & Visual Overlays */}
          <div className="settings-section">
            <div className="section-label">
              <Volume2 size={16} />
              <span>Audio & Feedback</span>
            </div>
            <div className="toggle-setting-row">
              <span>Procedural Sound FX</span>
              <button
                className={`switch-toggle ${settings.soundEnabled ? 'on' : 'off'}`}
                onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              >
                <div className="switch-handle" />
              </button>
            </div>

            <div className="toggle-setting-row">
              <span>Show Legal Move Targets</span>
              <button
                className={`switch-toggle ${settings.showLegalMoves ? 'on' : 'off'}`}
                onClick={() => onUpdateSettings({ showLegalMoves: !settings.showLegalMoves })}
              >
                <div className="switch-handle" />
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-done-btn" onClick={onClose}>
            Apply & Return to Game
          </button>
        </div>
      </div>
    </div>
  );
};
