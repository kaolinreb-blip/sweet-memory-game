export type GameLevel = 1 | 2 | 3;

export interface CardDefinition {
  id: string;
  name: string;
  image: string;
  alt: string;
}

export interface PlayingCard {
  instanceId: string; // unique per card instance
  cardDefId: string;  // references CardDefinition.id
  name: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export type ThemeId = 'sweet' | 'minimal' | 'midnight' | 'pastel';
export type CardBackStyle = 'stars' | 'diamond' | 'geometric' | 'minimal';
export type ImageFitMode = 'contain' | 'cover';

export interface LevelConfig {
  level: GameLevel;
  pairsCount: number;
  totalCards: number;
  columns: number;
  rows: number;
  label: string;
  description: string;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  bgClass: string;
  headerTextClass: string;
  cardBackBgClass: string;
  cardBackAccentClass: string;
  accentColor: string;
}
