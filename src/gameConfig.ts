import { CardDefinition, ThemeConfig, ThemeId, CardBackStyle, LevelConfig, GameLevel } from './types';

// Default images: 6 magical sweets collection + 2 expandable slots for Level 3
export const DEFAULT_CARDS: CardDefinition[] = [
  {
    id: 'sweet-shortcake',
    name: 'ショートケーキ',
    image: './images/card_1_shortcake.jpg',
    alt: 'いちごのショートケーキ',
  },
  {
    id: 'sweet-cupcake',
    name: 'ショコラカップケーキ',
    image: './images/card_2_cupcake.jpg',
    alt: '濃厚チョコレートカップケーキ',
  },
  {
    id: 'sweet-macarons',
    name: 'パステルマカロン',
    image: './images/card_3_macarons.jpg',
    alt: '3色のパステルマカロン',
  },
  {
    id: 'sweet-tart',
    name: 'フルーツタルト',
    image: './images/card_4_fruittart.jpg',
    alt: '色鮮やかなフルーツタルト',
  },
  {
    id: 'sweet-parfait',
    name: '星空パフェ',
    image: './images/card_5_parfait.jpg',
    alt: '三日月の星空グラスパフェ',
  },
  {
    id: 'sweet-catcookie',
    name: '猫アイシングクッキー',
    image: './images/card_6_catcookie.jpg',
    alt: 'リボンをつけた猫のアイシングクッキー',
  },
  {
    id: 'custom-slot-7',
    name: 'カード 7 (追加)',
    image: '',
    alt: '追加カード7',
  },
  {
    id: 'custom-slot-8',
    name: 'カード 8 (追加)',
    image: '',
    alt: '追加カード8',
  },
];

// Level configurations for Level 1, 2, 3
export const LEVEL_CONFIGS: Record<GameLevel, LevelConfig> = {
  1: {
    level: 1,
    pairsCount: 3,
    totalCards: 6,
    columns: 2,
    rows: 3,
    label: 'LEVEL 1',
    description: '3ペア（6枚） 2列×3段',
  },
  2: {
    level: 2,
    pairsCount: 6,
    totalCards: 12,
    columns: 3,
    rows: 4,
    label: 'LEVEL 2',
    description: '6ペア（12枚） 3列×4段',
  },
  3: {
    level: 3,
    pairsCount: 8,
    totalCards: 16,
    columns: 4,
    rows: 4,
    label: 'LEVEL 3',
    description: '8ペア（16枚） 4列×4段',
  },
};

// Predefined Themes for easy styling changes
export const THEMES: Record<ThemeId, ThemeConfig> = {
  sweet: {
    id: 'sweet',
    name: 'スウィートマジック (標準)',
    bgClass: 'bg-gradient-to-b from-amber-50 via-rose-50 to-amber-100 text-stone-800',
    headerTextClass: 'text-amber-900',
    cardBackBgClass: 'bg-gradient-to-br from-amber-800 via-stone-800 to-amber-950',
    cardBackAccentClass: 'text-amber-300 border-amber-400/40',
    accentColor: '#d97706',
  },
  minimal: {
    id: 'minimal',
    name: 'クリーンミニマル',
    bgClass: 'bg-slate-100 text-slate-800',
    headerTextClass: 'text-slate-900',
    cardBackBgClass: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900',
    cardBackAccentClass: 'text-slate-200 border-slate-500/40',
    accentColor: '#475569',
  },
  midnight: {
    id: 'midnight',
    name: 'ミッドナイト星空',
    bgClass: 'bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-slate-100',
    headerTextClass: 'text-indigo-200',
    cardBackBgClass: 'bg-gradient-to-br from-indigo-900 via-purple-950 to-slate-900',
    cardBackAccentClass: 'text-indigo-300 border-indigo-400/50',
    accentColor: '#818cf8',
  },
  pastel: {
    id: 'pastel',
    name: 'パステルマカロン',
    bgClass: 'bg-gradient-to-b from-pink-50 via-purple-50 to-sky-50 text-neutral-800',
    headerTextClass: 'text-pink-900',
    cardBackBgClass: 'bg-gradient-to-br from-pink-600 via-rose-600 to-purple-700',
    cardBackAccentClass: 'text-pink-100 border-pink-300/40',
    accentColor: '#db2777',
  },
};

export const FLIP_WAIT_MS = 900; // Delay before flipping back mismatched cards
