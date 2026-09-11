import React from 'react';
import type { GameMode, AIPersonalityId } from '../types/chess';
import { AI_PERSONALITIES } from '../engine/aiEngine';
import {
  Users,
  Bot,
  GraduationCap,
  Trophy,
  Settings as SettingsIcon,
  Zap,
} from 'lucide-react';

interface NavigationHeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  aiPersonalityId: AIPersonalityId;
  onOpenSettings: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentMode,
  onSelectMode,
  aiPersonalityId,
  onOpenSettings,
}) => {
  const currentAI = AI_PERSONALITIES[aiPersonalityId];

  return (
    <header className="app-nav-header glass-card">
      <div className="nav-brand-group">
        <div className="brand-logo-glow">
          <Zap className="brand-bolt" size={22} />
        </div>
        <div className="brand-titles">
          <h1 className="brand-title">NEW AGE CHESS</h1>
          <span className="brand-tagline">Futuristic AI & Strategy Academy</span>
        </div>
      </div>

      {/* Navigation Modes */}
      <nav className="mode-nav-tabs">
        <button
          className={`mode-tab-btn ${currentMode === 'practice' ? 'active' : ''}`}
          onClick={() => onSelectMode('practice')}
        >
          <GraduationCap size={16} />
          <span>Practice & Coach</span>
          <span className="tab-hot-badge">PRO</span>
        </button>

        <button
          className={`mode-tab-btn ${currentMode === 'pvcpu' ? 'active' : ''}`}
          onClick={() => onSelectMode('pvcpu')}
        >
          <Bot size={16} />
          <span>Play vs CPU</span>
        </button>

        <button
          className={`mode-tab-btn ${currentMode === 'pvp' ? 'active' : ''}`}
          onClick={() => onSelectMode('pvp')}
        >
          <Users size={16} />
          <span>Pass & Play (PvP)</span>
        </button>

        <button
          className={`mode-tab-btn ${currentMode === 'puzzles' ? 'active' : ''}`}
          onClick={() => onSelectMode('puzzles')}
        >
          <Trophy size={16} />
          <span>Tactics Drills</span>
        </button>
      </nav>

      {/* Right Controls: AI Badge & Settings */}
      <div className="nav-actions-right">
        {(currentMode === 'pvcpu' || currentMode === 'practice') && (
          <div className="active-ai-badge" onClick={onOpenSettings} title="Click to change AI opponent">
            <span className="ai-badge-avatar">{currentAI.avatar}</span>
            <div className="ai-badge-text">
              <span className="ai-badge-name">{currentAI.name}</span>
              <span className="ai-badge-elo">{currentAI.elo} ELO</span>
            </div>
          </div>
        )}

        <button className="settings-trigger-btn" onClick={onOpenSettings} title="Open Settings">
          <SettingsIcon size={18} />
        </button>
      </div>
    </header>
  );
};
