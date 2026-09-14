import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Sparkles, ImagePlus, AlertCircle } from 'lucide-react';
import { CardDefinition, PlayingCard, ThemeId, CardBackStyle, ImageFitMode, GameLevel } from './types';
import { DEFAULT_CARDS, THEMES, FLIP_WAIT_MS, LEVEL_CONFIGS } from './gameConfig';
import { initializeDeckForLevel, getRegisteredCards } from './utils/gameLogic';
import { sounds } from './utils/audio';
import { Header } from './components/Header';
import { MemoryCard } from './components/MemoryCard';
import { VictoryModal } from './components/VictoryModal';
import { ImageManagerModal } from './components/ImageManagerModal';

export default function App() {
  // Configurable card definitions (defaults to 8 slots: 6 default sweets + 2 empty for Level 3)
  const [cardDefs, setCardDefs] = useState<CardDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('memory_game_custom_cards');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // If previous version saved 6 cards, expand with the 2 extra slots from DEFAULT_CARDS
          if (parsed.length === 6) {
            return [...parsed, ...DEFAULT_CARDS.slice(6)];
          }
          if (parsed.length === 8) {
            return parsed;
          }
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_CARDS;
  });

  // Current Level State (1: 3 pairs / 6 cards, 2: 6 pairs / 12 cards, 3: 8 pairs / 16 cards)
  const [currentLevel, setCurrentLevel] = useState<GameLevel>(() => {
    try {
      const saved = localStorage.getItem('memory_game_current_level');
      if (saved && (saved === '1' || saved === '2' || saved === '3')) {
        return parseInt(saved, 10) as GameLevel;
      }
    } catch {
      // Default
    }
    return 1;
  });

  // Level 3 registration notice banner
  const [levelNotice, setLevelNotice] = useState<string | null>(null);

  // Settings & Theme
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem('memory_game_theme') as ThemeId) || 'sweet';
  });
  const [cardBackStyle, setCardBackStyle] = useState<CardBackStyle>(() => {
    return (localStorage.getItem('memory_game_card_back') as CardBackStyle) || 'stars';
  });
  const [imageFit, setImageFit] = useState<ImageFitMode>(() => {
    return (localStorage.getItem('memory_game_image_fit') as ImageFitMode) || 'contain';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals
  const [isImageManagerOpen, setIsImageManagerOpen] = useState<boolean>(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState<boolean>(false);

  // Game state
  const [cards, setCards] = useState<PlayingCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [moves, setMoves] = useState<number>(0);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [timeSeconds, setTimeSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Best moves per level
  const [bestMovesByLevel, setBestMovesByLevel] = useState<Record<GameLevel, number | null>>(() => {
    const getBest = (lvl: GameLevel) => {
      const val = localStorage.getItem(`memory_game_best_moves_lvl_${lvl}`);
      return val ? parseInt(val, 10) : null;
    };
    return {
      1: getBest(1),
      2: getBest(2),
      3: getBest(3),
    };
  });

  const timerRef = useRef<number | null>(null);

  const registeredCards = getRegisteredCards(cardDefs);
  const hasLevel3Images = registeredCards.length >= 8;
  const currentConfig = LEVEL_CONFIGS[currentLevel];
  const targetPairs = currentConfig.pairs;

  // Start / restart game for a specific level
  const startNewGame = useCallback((targetLevel: GameLevel = currentLevel, defsToUse: CardDefinition[] = cardDefs) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const available = getRegisteredCards(defsToUse);
    // If requesting Level 3 but don't have 8 images, warn user and switch back to Level 2
    if (targetLevel === 3 && available.length < 8) {
      setLevelNotice('LEVEL 3をプレイするには追加で2枚の画像登録が必要です');
      setIsImageManagerOpen(true);
      targetLevel = 2;
    } else {
      setLevelNotice(null);
    }

    setCurrentLevel(targetLevel);
    localStorage.setItem('memory_game_current_level', targetLevel.toString());

    setCards(initializeDeckForLevel(defsToUse, targetLevel));
    setFlippedIndices([]);
    setIsChecking(false);
    setMoves(0);
    setMatchedPairs(0);
    setTimeSeconds(0);
    setIsTimerRunning(false);
    setIsVictoryModalOpen(false);
  }, [currentLevel, cardDefs]);

  // Initial deal
  useEffect(() => {
    startNewGame(currentLevel, cardDefs);
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerRunning]);

  // Handle level change via tabs
  const handleSelectLevel = (newLevel: GameLevel) => {
    if (newLevel === 3 && !hasLevel3Images) {
      setLevelNotice('LEVEL 3には8種類の画像が必要です。カード7・8の画像を登録してください。');
      setIsImageManagerOpen(true);
      return;
    }
    startNewGame(newLevel, cardDefs);
  };

  // Next level progression
  const handleNextLevel = () => {
    if (currentLevel === 1) {
      handleSelectLevel(2);
    } else if (currentLevel === 2) {
      if (hasLevel3Images) {
        handleSelectLevel(3);
      } else {
        setIsVictoryModalOpen(false);
        setIsImageManagerOpen(true);
      }
    }
  };

  // Handle card click
  const handleCardClick = (clickedIndex: number) => {
    if (isChecking) return;
    const clickedCard = cards[clickedIndex];
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;
    if (flippedIndices.includes(clickedIndex)) return;

    // Start timer on first flip
    if (!isTimerRunning && matchedPairs < targetPairs) {
      setIsTimerRunning(true);
    }

    sounds.playFlip();

    // Flip card immediately
    const nextCards = [...cards];
    nextCards[clickedIndex] = { ...clickedCard, isFlipped: true };
    setCards(nextCards);

    // If first card flipped in this turn
    if (flippedIndices.length === 0) {
      setFlippedIndices([clickedIndex]);
      return;
    }

    // If second card flipped in this turn
    if (flippedIndices.length === 1) {
      const firstIndex = flippedIndices[0];
      const firstCard = cards[firstIndex];
      const newMoves = moves + 1;
      setMoves(newMoves);
      setFlippedIndices([firstIndex, clickedIndex]);

      // Check for match
      if (firstCard.cardDefId === clickedCard.cardDefId) {
        // MATCH!
        sounds.playMatch();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, idx) =>
              idx === firstIndex || idx === clickedIndex
                ? { ...c, isMatched: true, isFlipped: true }
                : c
            )
          );
          setFlippedIndices([]);

          const nextMatched = matchedPairs + 1;
          setMatchedPairs(nextMatched);

          // All pairs matched: LEVEL CLEAR!
          if (nextMatched === targetPairs) {
            setIsTimerRunning(false);
            sounds.playVictory();

            // Check and update best moves for this level
            const currentBest = bestMovesByLevel[currentLevel];
            if (currentBest === null || newMoves < currentBest) {
              setBestMovesByLevel((prev) => ({ ...prev, [currentLevel]: newMoves }));
              localStorage.setItem(`memory_game_best_moves_lvl_${currentLevel}`, newMoves.toString());
            }

            // Show congratulatory victory modal
            setTimeout(() => {
              setIsVictoryModalOpen(true);
            }, 500);
          }
        }, 300);
      } else {
        // MISMATCH: wait short duration then flip back
        setIsChecking(true);
        setTimeout(() => {
          sounds.playMismatch();
          setCards((prev) =>
            prev.map((c, idx) =>
              idx === firstIndex || idx === clickedIndex
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedIndices([]);
          setIsChecking(false);
        }, FLIP_WAIT_MS);
      }
    }
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
  };

  // Image management
  const handleUpdateCardImage = (slotIndex: number, newImage: string, name?: string) => {
    const updated = [...cardDefs];
    updated[slotIndex] = {
      ...updated[slotIndex],
      image: newImage,
      name: name || updated[slotIndex].name,
    };
    setCardDefs(updated);
    localStorage.setItem('memory_game_custom_cards', JSON.stringify(updated));
    startNewGame(currentLevel, updated);
  };

  const handleClearCardImage = (slotIndex: number) => {
    const updated = [...cardDefs];
    updated[slotIndex] = {
      ...updated[slotIndex],
      image: '',
    };
    setCardDefs(updated);
    localStorage.setItem('memory_game_custom_cards', JSON.stringify(updated));
    // If currently on Level 3 and we cleared a card, drop back to Level 2
    if (currentLevel === 3) {
      startNewGame(2, updated);
    } else {
      startNewGame(currentLevel, updated);
    }
  };

  const handleBatchUpdateCards = (newItems: { image: string; name: string }[]) => {
    const updated = [...cardDefs];
    newItems.forEach((item, i) => {
      if (i < 8) {
        updated[i] = {
          ...updated[i],
          image: item.image,
          name: item.name || updated[i].name,
        };
      }
    });
    setCardDefs(updated);
    localStorage.setItem('memory_game_custom_cards', JSON.stringify(updated));
    startNewGame(currentLevel, updated);
  };

  const handleResetToDefault = () => {
    setCardDefs(DEFAULT_CARDS);
    localStorage.removeItem('memory_game_custom_cards');
    const targetLvl = currentLevel === 3 ? 2 : currentLevel;
    startNewGame(targetLvl, DEFAULT_CARDS);
  };

  const handleChangeTheme = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('memory_game_theme', themeId);
  };

  const handleChangeCardBackStyle = (style: CardBackStyle) => {
    setCardBackStyle(style);
    localStorage.setItem('memory_game_card_back', style);
  };

  const handleChangeImageFit = (mode: ImageFitMode) => {
    setImageFit(mode);
    localStorage.setItem('memory_game_image_fit', mode);
  };

  const themeConfig = THEMES[currentTheme] || THEMES.sweet;

  // Dynamic grid classes matching the specified layout:
  // LEVEL 1: 2 cols x 3 rows (6 cards)
  // LEVEL 2: 3 cols x 4 rows (12 cards)
  // LEVEL 3: 4 cols x 4 rows (16 cards)
  const gridClasses =
    currentLevel === 1
      ? 'grid-cols-2 grid-rows-3 max-w-[280px] sm:max-w-xs mx-auto gap-2 sm:gap-3.5'
      : currentLevel === 2
      ? 'grid-cols-3 grid-rows-4 max-w-sm sm:max-w-md mx-auto gap-1.5 sm:gap-3'
      : 'grid-cols-4 grid-rows-4 max-w-md sm:max-w-lg mx-auto gap-1 sm:gap-2';

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${themeConfig.bgClass}`}>
      <main className="max-w-md mx-auto w-full h-dvh max-h-dvh sm:h-auto sm:max-h-none sm:min-h-screen px-2.5 py-1 sm:px-4 sm:py-4 flex flex-col justify-between overflow-hidden sm:overflow-visible">
        {/* Header with Title, Level Selector Tabs, HUD stats, and shortcuts */}
        <Header
          currentLevel={currentLevel}
          onSelectLevel={handleSelectLevel}
          hasLevel3Images={hasLevel3Images}
          moves={moves}
          matchedPairs={matchedPairs}
          totalPairs={targetPairs}
          timeSeconds={timeSeconds}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onRestart={() => startNewGame(currentLevel, cardDefs)}
          onOpenImageManager={() => setIsImageManagerOpen(true)}
          headerTextClass={themeConfig.headerTextClass}
        />

        {/* Level Guidance Banner if notice is present */}
        {levelNotice && (
          <div className="w-full bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-2.5 py-1.5 text-[11px] flex items-center justify-between gap-2 shadow-xs shrink-0 my-0.5">
            <span className="flex items-center gap-1.5 font-medium leading-tight">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              {levelNotice}
            </span>
            <button
              onClick={() => {
                setLevelNotice(null);
                setIsImageManagerOpen(true);
              }}
              className="text-amber-800 font-bold underline shrink-0 cursor-pointer text-[10px]"
            >
              画像設定
            </button>
          </div>
        )}

        {/* Dynamic Card Board with Level-adapted grid */}
        <section
          id="card-grid"
          aria-label={`LEVEL ${currentLevel} 神経衰弱カード盤面 (${targetPairs * 2}枚)`}
          className={`grid ${gridClasses} w-full flex-1 sm:flex-initial min-h-0 place-items-center my-1 sm:my-auto`}
        >
          {cards.map((card, index) => (
            <MemoryCard
              key={card.instanceId}
              card={card}
              index={index}
              onClick={() => handleCardClick(index)}
              disabled={isChecking}
              cardBackStyle={cardBackStyle}
              imageFit={imageFit}
              theme={themeConfig}
              level={currentLevel}
            />
          ))}
        </section>

        {/* Bottom controls & status */}
        <footer className="w-full mt-1 sm:mt-2.5 pt-0.5 sm:pt-1.5 flex flex-col items-center gap-1 shrink-0">
          {/* Primary "もう一度遊ぶ" (Play Again) button */}
          <div className="flex items-center gap-2 w-full">
            <button
              id="restart-main-btn"
              type="button"
              onClick={() => startNewGame(currentLevel, cardDefs)}
              className="flex-1 py-1.5 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl bg-white/90 hover:bg-white text-stone-800 font-bold text-xs sm:text-sm shadow-xs border border-stone-200/80 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>LEVEL {currentLevel} をやり直す</span>
            </button>

            {currentLevel < 3 && (
              <button
                id="header-advance-level-btn"
                type="button"
                onClick={handleNextLevel}
                className="py-1.5 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1 cursor-pointer"
                title={`LEVEL ${currentLevel + 1} へ挑戦`}
              >
                <span>LEVEL {currentLevel + 1} へ</span>
              </button>
            )}
          </div>

          {/* Quick status message */}
          <div className="flex items-center justify-between w-full text-[10px] sm:text-[11px] text-stone-600 px-1 font-medium">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {matchedPairs === targetPairs
                ? `LEVEL ${currentLevel} クリア！`
                : `残りペア: ${targetPairs - matchedPairs} / ${targetPairs} 組`}
            </span>
            <div className="flex items-center gap-2">
              {!hasLevel3Images && (
                <button
                  onClick={() => setIsImageManagerOpen(true)}
                  className="text-amber-700 hover:text-amber-800 flex items-center gap-0.5 text-[10px] cursor-pointer"
                >
                  <ImagePlus className="w-3 h-3" />
                  <span>LEVEL 3用画像登録</span>
                </button>
              )}
              <button
                onClick={() => setIsImageManagerOpen(true)}
                className="text-stone-500 hover:text-stone-800 underline underline-offset-2 cursor-pointer"
              >
                画像・設定
              </button>
            </div>
          </div>
        </footer>

        {/* Victory Modal with celebratory message, star rating, & level advance */}
        <VictoryModal
          isOpen={isVictoryModalOpen}
          level={currentLevel}
          moves={moves}
          timeSeconds={timeSeconds}
          bestMoves={bestMovesByLevel[currentLevel]}
          hasLevel3Images={hasLevel3Images}
          onNextLevel={handleNextLevel}
          onReplayLevel={() => startNewGame(currentLevel, cardDefs)}
          onResetToLevel1={() => handleSelectLevel(1)}
          onOpenImageManager={() => {
            setIsVictoryModalOpen(false);
            setIsImageManagerOpen(true);
          }}
        />

        {/* Image & Theme Customizer Modal */}
        <ImageManagerModal
          isOpen={isImageManagerOpen}
          onClose={() => setIsImageManagerOpen(false)}
          cards={cardDefs}
          onUpdateCardImage={handleUpdateCardImage}
          onClearCardImage={handleClearCardImage}
          onBatchUpdateCards={handleBatchUpdateCards}
          onResetToDefault={handleResetToDefault}
          currentTheme={currentTheme}
          onChangeTheme={handleChangeTheme}
          cardBackStyle={cardBackStyle}
          onChangeCardBackStyle={handleChangeCardBackStyle}
          imageFit={imageFit}
          onChangeImageFit={handleChangeImageFit}
        />
      </main>
    </div>
  );
}
