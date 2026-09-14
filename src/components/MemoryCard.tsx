import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { PlayingCard, CardBackStyle, ImageFitMode, ThemeConfig, GameLevel } from '../types';

interface MemoryCardProps {
  card: PlayingCard;
  index: number;
  onClick: () => void;
  disabled: boolean;
  cardBackStyle: CardBackStyle;
  imageFit: ImageFitMode;
  theme: ThemeConfig;
  level?: GameLevel;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  card,
  index,
  onClick,
  disabled,
  cardBackStyle,
  imageFit,
  theme,
  level = 2,
}) => {
  const isRevealed = card.isFlipped || card.isMatched;

  // Responsive styling based on level density
  const isDense = level === 3;
  const isSpacious = level === 1;

  const cardRadius = isDense ? 'rounded-lg sm:rounded-xl' : isSpacious ? 'rounded-xl sm:rounded-2xl' : 'rounded-lg sm:rounded-2xl';
  const innerRadius = isDense ? 'rounded-md sm:rounded-lg' : 'rounded-md sm:rounded-xl';

  return (
    <button
      id={`memory-card-${index}`}
      type="button"
      onClick={onClick}
      disabled={disabled || isRevealed}
      aria-label={`カード ${index + 1}: ${isRevealed ? card.name : '裏向き'}`}
      className={`relative h-full aspect-[3/4] max-w-full sm:h-auto sm:w-full sm:aspect-[3/4] select-none touch-manipulation focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${cardRadius} transition-transform duration-150 ${
        !isRevealed && !disabled ? 'cursor-pointer active:scale-95 hover:scale-[1.02]' : ''
      }`}
      style={{ perspective: '1000px' }}
    >
      <div
        className="w-full h-full relative transition-transform duration-500 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* BACK OF CARD (Visible when NOT flipped) */}
        <div
          className={`absolute inset-0 w-full h-full ${cardRadius} shadow-xs sm:shadow-sm border ${
            isDense ? 'p-0.5 sm:p-1.5' : 'p-1 sm:p-2'
          } flex flex-col items-center justify-center overflow-hidden transition-all ${
            theme.cardBackBgClass
          } ${theme.cardBackAccentClass}`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Inner frame */}
          <div className={`w-full h-full ${innerRadius} border border-current/25 flex flex-col items-center justify-center ${
            isDense ? 'p-0.5 sm:p-1' : 'p-1 sm:p-2'
          } relative`}>
            {/* Subtle background patterning based on cardBackStyle */}
            {cardBackStyle === 'stars' && (
              <>
                <Sparkles className={`${isDense ? 'w-3.5 h-3.5 sm:w-6 sm:h-6' : isSpacious ? 'w-6 h-6 sm:w-9 sm:h-9' : 'w-4 h-4 sm:w-7 sm:h-7'} opacity-80 animate-pulse`} />
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current opacity-40 absolute top-1 left-1 sm:top-2 sm:left-2" />
                <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-current opacity-30 absolute top-1 right-1 sm:top-2.5 sm:right-2.5" />
                <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-current opacity-30 absolute bottom-1 left-1 sm:bottom-2.5 sm:left-2.5" />
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current opacity-40 absolute bottom-1 right-1 sm:bottom-2 sm:right-2" />
              </>
            )}

            {cardBackStyle === 'diamond' && (
              <div className={`${isDense ? 'w-3 h-3 sm:w-6 sm:h-6' : 'w-4 h-4 sm:w-8 sm:h-8'} border-2 border-current/60 rotate-45 flex items-center justify-center`}>
                <div className="w-1 h-1 sm:w-2 sm:h-2 bg-current/40 rotate-45" />
              </div>
            )}

            {cardBackStyle === 'geometric' && (
              <div className="flex flex-col items-center gap-0.5 sm:gap-1 opacity-70">
                <div className={`${isDense ? 'w-2.5 sm:w-4' : 'w-3.5 sm:w-5'} h-0.5 bg-current rounded-full`} />
                <div className={`${isDense ? 'w-4 sm:w-6' : 'w-5 sm:w-7'} h-0.5 bg-current rounded-full`} />
                <div className={`${isDense ? 'w-2.5 sm:w-4' : 'w-3.5 sm:w-5'} h-0.5 bg-current rounded-full`} />
              </div>
            )}

            {cardBackStyle === 'minimal' && (
              <div className={`${isDense ? 'w-2.5 h-2.5 sm:w-3.5 sm:h-3.5' : 'w-3 h-3 sm:w-4 sm:h-4'} rounded-full border border-current/50 opacity-60`} />
            )}
          </div>
        </div>

        {/* FRONT OF CARD (Visible when FLIPPED or MATCHED) */}
        <div
          className={`absolute inset-0 w-full h-full ${cardRadius} bg-white shadow-xs sm:shadow-md border overflow-hidden transition-all flex flex-col ${
            card.isMatched
              ? 'border-amber-400 ring-2 ring-amber-300/80 shadow-amber-100'
              : 'border-stone-200 shadow-stone-200/50'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Main Image Frame - Natural proportions strictly maintained */}
          <div className="relative flex-1 w-full h-full bg-stone-50/80 flex items-center justify-center p-0.5 sm:p-1.5 overflow-hidden min-h-0">
            <img
              src={card.image}
              alt={card.name}
              referrerPolicy="no-referrer"
              className={`w-full h-full transition-all duration-300 select-none pointer-events-none ${innerRadius} ${
                imageFit === 'contain'
                  ? 'object-contain drop-shadow-xs'
                  : 'object-cover'
              }`}
              loading="eager"
            />

            {/* Match success badge */}
            {card.isMatched && (
              <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-amber-500 text-white rounded-full p-0.5 sm:p-1 shadow-sm flex items-center justify-center z-10 animate-scale-in">
                <Check className={`${isDense ? 'w-2 h-2 sm:w-3 sm:h-3' : 'w-2.5 h-2.5 sm:w-3.5 sm:h-3.5'} stroke-[3]`} />
              </div>
            )}
          </div>

          {/* Clean footer label */}
          <div className="w-full py-0.5 px-0.5 sm:py-1 sm:px-1 bg-white/95 border-t border-stone-100 text-center shrink-0">
            <p className={`${
              isDense ? 'text-[8px] sm:text-[10px]' : isSpacious ? 'text-[10px] sm:text-xs' : 'text-[9px] sm:text-xs'
            } font-semibold text-stone-700 truncate px-0.5 leading-tight`}>
              {card.name}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
};
