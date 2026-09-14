import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Sparkles, Star, Award, Clock, ArrowRight, ImagePlus } from 'lucide-react';
import { formatTime } from '../utils/gameLogic';
import { GameLevel } from '../types';

interface VictoryModalProps {
  isOpen: boolean;
  level: GameLevel;
  moves: number;
  timeSeconds: number;
  bestMoves: number | null;
  hasLevel3Images: boolean;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onResetToLevel1: () => void;
  onOpenImageManager: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  level,
  moves,
  timeSeconds,
  bestMoves,
  hasLevel3Images,
  onNextLevel,
  onReplayLevel,
  onResetToLevel1,
  onOpenImageManager,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire festive colorful confetti bursts
      const duration = level === 3 ? 3.5 * 1000 : 2.2 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: level === 3 ? 5 : 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6'],
        });
        confetti({
          particleCount: level === 3 ? 5 : 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen, level]);

  if (!isOpen) return null;

  // Rating threshold scales by level
  const minThreshold = level === 1 ? 5 : level === 2 ? 9 : 12;
  const midThreshold = level === 1 ? 8 : level === 2 ? 15 : 20;
  const stars = moves <= minThreshold ? 3 : moves <= midThreshold ? 2 : 1;
  const isNewBest = bestMoves === null || moves <= bestMoves;

  const isFinalLevel = level === 3;

  return (
    <div
      id="victory-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        id="victory-card"
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-stone-100 p-6 flex flex-col items-center text-center relative overflow-hidden animate-scale-in"
      >
        {/* Decorative ambient background */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-rose-200/50 rounded-full blur-2xl pointer-events-none" />

        {/* Trophy / Clear icon */}
        <div className={`w-16 h-16 rounded-2xl ${
          isFinalLevel
            ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-300'
            : 'bg-gradient-to-tr from-amber-500 to-amber-300'
        } text-white flex items-center justify-center shadow-lg shadow-amber-500/25 mb-3 relative`}>
          <Trophy className="w-8 h-8 drop-shadow-sm" />
          <Sparkles className="w-5 h-5 text-amber-200 absolute -top-1.5 -right-1.5 animate-bounce" />
        </div>

        {/* Congratulatory titles */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold mb-2">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>{isFinalLevel ? 'ALL STAGES CLEAR!' : `LEVEL ${level} CLEAR！`}</span>
        </div>

        <h2 id="congrats-title" className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mb-1">
          {isFinalLevel ? '全レベル制覇！おめでとう！' : `LEVEL ${level} クリア！`}
        </h2>
        <p className="text-xs text-stone-500 font-medium mb-3.5">
          {level === 1 && '3ペア（6枚）をすべて見つけました！'}
          {level === 2 && '6ペア（12枚）をすべて見つけました！'}
          {level === 3 && '最高難度8ペア（16枚）を見事に完全制覇！'}
        </p>

        {/* Star Rating */}
        <div className="flex items-center gap-1.5 mb-3.5">
          {[1, 2, 3].map((starIndex) => (
            <Star
              key={starIndex}
              className={`w-6 h-6 transition-all ${
                starIndex <= stars
                  ? 'text-amber-400 fill-amber-400 drop-shadow-sm scale-110'
                  : 'text-stone-200 fill-stone-100'
              }`}
            />
          ))}
        </div>

        {/* Results summary box */}
        <div className="w-full bg-stone-50 rounded-2xl p-3 border border-stone-200/70 mb-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              最終手数
            </span>
            <div className="flex items-center gap-1.5">
              <span id="final-moves-count" className="text-base font-bold text-stone-900 tabular-nums">
                {moves} 手
              </span>
              {isNewBest && (
                <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">
                  BEST!
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-stone-200/60">
            <span className="text-stone-500 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              所要時間
            </span>
            <span id="final-time" className="text-sm font-bold text-stone-900 tabular-nums">
              {formatTime(timeSeconds)}
            </span>
          </div>

          {bestMoves !== null && !isNewBest && (
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-stone-200/60 text-stone-400">
              <span className="font-medium">自己ベスト</span>
              <span className="font-semibold text-stone-600">{bestMoves} 手</span>
            </div>
          )}
        </div>

        {/* Level 2 to Level 3 guidance if images not registered */}
        {level === 2 && !hasLevel3Images && (
          <div className="w-full bg-amber-50/90 border border-amber-200/80 rounded-xl p-2.5 mb-3 text-left">
            <p className="text-[11px] font-bold text-amber-900 flex items-center gap-1 mb-0.5">
              <ImagePlus className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              LEVEL 3の準備が必要です
            </p>
            <p className="text-[10px] text-amber-800 leading-snug">
              LEVEL 3（8ペア・16枚）を遊ぶには追加で2枚の画像登録が必要です。画像設定から登録してください。
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-2">
          {/* Main Action Button */}
          {level === 1 && (
            <button
              id="next-level-btn"
              type="button"
              onClick={onNextLevel}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>LEVEL 2 へ進む (6ペア)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {level === 2 && hasLevel3Images && (
            <button
              id="next-level-btn"
              type="button"
              onClick={onNextLevel}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>LEVEL 3 へ進む (8ペア)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {level === 2 && !hasLevel3Images && (
            <button
              id="add-images-for-level3-btn"
              type="button"
              onClick={onOpenImageManager}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 active:scale-98 text-white font-bold text-sm shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ImagePlus className="w-4 h-4" />
              <span>画像を追加して LEVEL 3 へ</span>
            </button>
          )}

          {isFinalLevel && (
            <button
              id="reset-to-level1-btn"
              type="button"
              onClick={onResetToLevel1}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>LEVEL 1 から再挑戦</span>
            </button>
          )}

          {/* Secondary Replay Button */}
          <button
            id="replay-level-btn"
            type="button"
            onClick={onReplayLevel}
            className="w-full py-2 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-98 text-stone-700 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>{isFinalLevel ? 'LEVEL 3 をもう一度遊ぶ' : `LEVEL ${level} をもう一度遊ぶ`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
