import { CardDefinition, PlayingCard, GameLevel } from '../types';

/**
 * Returns only card definitions that have a valid image registered.
 */
export function getRegisteredCards(definitions: CardDefinition[]): CardDefinition[] {
  return definitions.filter((def) => def.image && def.image.trim().length > 0);
}

/**
 * Creates playing cards for a specific level from card definitions.
 * - LEVEL 1: 3 pairs (6 cards), randomly chosen from registered images
 * - LEVEL 2: 6 pairs (12 cards), uses 6 registered images
 * - LEVEL 3: 8 pairs (16 cards), uses 8 registered images
 */
export function initializeDeckForLevel(
  definitions: CardDefinition[],
  level: GameLevel
): PlayingCard[] {
  const registered = getRegisteredCards(definitions);

  let selectedDefs: CardDefinition[] = [];

  if (level === 1) {
    // Randomly pick 3 distinct card definitions from registered images
    const shuffledRegistered = [...registered].sort(() => Math.random() - 0.5);
    selectedDefs = shuffledRegistered.slice(0, 3);
  } else if (level === 2) {
    // Use 6 card definitions
    const shuffledRegistered = [...registered].sort(() => Math.random() - 0.5);
    selectedDefs = shuffledRegistered.slice(0, 6);
  } else {
    // LEVEL 3: Use 8 card definitions
    const shuffledRegistered = [...registered].sort(() => Math.random() - 0.5);
    selectedDefs = shuffledRegistered.slice(0, 8);
  }

  const cards: PlayingCard[] = [];

  selectedDefs.forEach((def) => {
    // Card 1 of pair
    cards.push({
      instanceId: `${def.id}-1-${Math.random().toString(36).substring(2, 7)}`,
      cardDefId: def.id,
      name: def.name,
      image: def.image,
      isFlipped: false,
      isMatched: false,
    });
    // Card 2 of pair
    cards.push({
      instanceId: `${def.id}-2-${Math.random().toString(36).substring(2, 7)}`,
      cardDefId: def.id,
      name: def.name,
      image: def.image,
      isFlipped: false,
      isMatched: false,
    });
  });

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

/**
 * Legacy wrapper: creates 12 cards from definitions
 */
export function initializeDeck(definitions: CardDefinition[]): PlayingCard[] {
  return initializeDeckForLevel(definitions, 2);
}

/**
 * Formats seconds into MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
