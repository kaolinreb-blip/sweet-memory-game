import React from 'react';
import { RotateCcw, Volume2, VolumeX, Image as ImageIcon, Sparkles, Layers } from 'lucide-react';
import { formatTime } from '../utils/gameLogic';
import { GameLevel } from '../types';

interface HeaderProps {
  currentLevel: GameLevel;
  onSelectLevel: (level: GameLevel) => void;
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  timeSeconds: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRestart: () => void;
  onOpenImageManager: () => void;
  headerTextClass?: string;
}

const LEVEL_ITEMS: { level: GameLevel; label: string; sub: string }[] = [
  { level: 1, label: 'LEVEL 1', sub: '3ペア' },
  { level: 2, label: 'LEVEL 2', sub: '6ペア' },
  { level: 3, label: 'LEVEL 3', sub: '8ペア' },
];

export const Header: React.FC<HeaderProps> = ({
  currentLevel,
  onSelectLevel,
  moves,
  matchedPairs,
  totalPairs,
  timeSeconds,
  soundEnabled,
  onToggleSound,
  onRestart,
  onOpenImageManager,
  headerTextClass = 'text-amber-950',
}) => {
  return (
    <header className="w-full mb-1 sm:mb-2.5 shrink-0">
      {/* Top Bar: Title and control actions */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-1 sm:mb-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-xs shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
          </div>
          <div>
            <h1 id="app-title" className={`text-base sm:text-xl font-extrabold tracking-tight leading-none ${headerTextClass}`}>
              Memory Game
            </h1>
            <p className="text-[10px] sm:text-xs text-stone-500 font-medium leading-tight">
              {currentLevel === 1 ? 'LEVEL 1: 2列×3段 (3ペア)' : currentLevel === 2 ? 'LEVEL 2: 3列×4段 (6ペア)' : 'LEVEL 3: 4列×4段 (8ペア)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            aria-label={soundEnabled ? '音声をミュート' : '音声を有効化'}
            title={soundEnabled ? '効果音: ON' : '効果音: OFF'}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center bg-white/80 hover:bg-white text-stone-700 shadow-xs border border-stone-200/80 active:scale-95 transition-all cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
          </button>

          <button
            id="customize-images-btn"
            onClick={onOpenImageManager}
            aria-label="画像設定・デザイン変更"
            title="画像設定・テーマ変更"
            className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg sm:rounded-xl flex items-center gap-1 bg-white/80 hover:bg-white text-stone-700 shadow-xs border border-stone-200/80 active:scale-95 transition-all text-[10px] sm:text-xs font-semibold cursor-pointer"
          >
            <ImageIcon className="w-3 h-3 text-stone-600" />
            <span>画像<span className="hidden xs:inline">・設定</span></span>
          </button>

          <button
            id="restart-header-btn"
            onClick={onRestart}
            aria-label="もう一度遊ぶ"
            title="もう一度遊ぶ"
            className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg sm:rounded-xl flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white shadow-xs active:scale-95 transition-all text-[10px] sm:text-xs font-bold tracking-wide cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>やり直す</span>
          </button>
        </div>
      </div>

      {/* Level Selection Tabs: LEVEL 1 / LEVEL 2 / LEVEL 3 */}
      <div
        id="level-selector-tabs"
        role="tablist"
        aria-label="ゲームレベル選択"
        className="grid grid-cols-3 gap-1 p-0.5 sm:p-1 bg-stone-900/5 backdrop-blur-xs rounded-xl border border-stone-200/60 mb-1 sm:mb-2"
      >
        {LEVEL_ITEMS.map((item) => {
          const isActive = currentLevel === item.level;
          return (
            <button
              key={item.level}
              id={`level-tab-${item.level}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectLevel(item.level)}
              className={`py-1 sm:py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                isActive
                  ? 'bg-amber-600 text-white shadow-xs font-extrabold scale-[1.01]'
                  : 'bg-white/60 hover:bg-white/90 text-stone-600 hover:text-stone-900 font-semibold'
              }`}
            >
              <div className="flex items-center gap-1 text-[11px] sm:text-xs leading-none">
                <Layers className={`w-3 h-3 ${isActive ? 'text-amber-200' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </div>
              <span className={`text-[9px] mt-0.5 leading-none ${isActive ? 'text-amber-100 font-medium' : 'text-stone-400'}`}>
                {item.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* Status HUD (Moves, Pairs, Time) */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 bg-white/85 backdrop-blur-md rounded-xl sm:rounded-2xl py-1 px-2 sm:p-2 shadow-xs border border-stone-200/70">
        <div className="flex flex-col items-center justify-center py-0.5 px-0.5 sm:px-1 border-r border-stone-100">
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-stone-500 uppercase">手数</span>
          <span id="stat-moves" className="text-sm sm:text-base font-bold text-stone-900 tabular-nums leading-tight">
            {moves}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center py-0.5 px-0.5 sm:px-1 border-r border-stone-100">
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-stone-500 uppercase">ペア</span>
          <div className="flex items-baseline gap-0.5 leading-tight">
            <span id="stat-pairs" className="text-sm sm:text-base font-bold text-amber-600 tabular-nums">
              {matchedPairs}
            </span>
            <span className="text-[10px] sm:text-xs text-stone-600 font-semibold">/{totalPairs}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-0.5 px-0.5 sm:px-1">
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-stone-500 uppercase">タイム</span>
          <span id="stat-time" className="text-sm sm:text-base font-bold text-stone-900 tabular-nums leading-tight">
            {formatTime(timeSeconds)}
          </span>
        </div>
      </div>
    </header>
  );
};
