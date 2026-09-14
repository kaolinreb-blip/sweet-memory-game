import React, { useRef } from 'react';
import { X, Upload, RotateCcw, Palette, Image as ImageIcon, Sliders, CheckCircle2, Trash2 } from 'lucide-react';
import { CardDefinition, ThemeId, CardBackStyle, ImageFitMode } from '../types';
import { THEMES } from '../gameConfig';

interface ImageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardDefinition[];
  onUpdateCardImage: (index: number, newImage: string, name?: string) => void;
  onClearCardImage?: (index: number) => void;
  onBatchUpdateCards: (newImages: { image: string; name: string }[]) => void;
  onResetToDefault: () => void;
  currentTheme: ThemeId;
  onChangeTheme: (themeId: ThemeId) => void;
  cardBackStyle: CardBackStyle;
  onChangeCardBackStyle: (style: CardBackStyle) => void;
  imageFit: ImageFitMode;
  onChangeImageFit: (mode: ImageFitMode) => void;
}

export const ImageManagerModal: React.FC<ImageManagerModalProps> = ({
  isOpen,
  onClose,
  cards,
  onUpdateCardImage,
  onClearCardImage,
  onBatchUpdateCards,
  onResetToDefault,
  currentTheme,
  onChangeTheme,
  cardBackStyle,
  onChangeCardBackStyle,
  imageFit,
  onChangeImageFit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const activeReplacingSlot = useRef<number | null>(null);

  if (!isOpen) return null;

  // Handle replacing a single card slot
  const handleSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeReplacingSlot.current !== null) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (result && activeReplacingSlot.current !== null) {
          const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
          onUpdateCardImage(activeReplacingSlot.current, result, fileNameWithoutExt);
        }
      };
      reader.readAsDataURL(file);
    }
    // reset input value so re-selecting same file triggers change
    e.target.value = '';
  };

  // Handle batch uploading multiple images (up to 8 images)
  const handleBatchFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 8) as File[];
    if (files.length === 0) return;

    const newCardsData: { image: string; name: string }[] = [];
    let readCount = 0;

    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (result) {
          const fileName = file.name.replace(/\.[^/.]+$/, '');
          newCardsData.push({ image: result, name: fileName });
        }
        readCount++;
        if (readCount === files.length) {
          onBatchUpdateCards(newCardsData);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const triggerSingleUpload = (slotIndex: number) => {
    activeReplacingSlot.current = slotIndex;
    singleFileInputRef.current?.click();
  };

  const registeredCount = cards.filter((c) => c.image && c.image.trim().length > 0).length;

  return (
    <div
      id="image-manager-overlay"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
    >
      {/* Hidden file inputs */}
      <input
        ref={singleFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSingleFileChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleBatchFileChange}
      />

      <div
        id="image-manager-modal"
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] overflow-hidden animate-slide-up"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 leading-none">
                カード画像とデザイン設定
              </h2>
              <p className="text-[11px] text-stone-600 mt-0.5">
                最大8種類の画像を登録・差し替えできます (LEVEL 3では8種類必要)
              </p>
            </div>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Section 1: Active Cards (Up to 8 cards) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                  登録画像一覧 ({registeredCount}/8枚)
                </span>
                {registeredCount < 8 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                    LEVEL 3用にあと{8 - registeredCount}枚
                  </span>
                )}
                {registeredCount === 8 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                    全8枚登録済み
                  </span>
                )}
              </div>
              <button
                id="reset-default-cards-btn"
                onClick={onResetToDefault}
                className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                初期画像に戻す
              </button>
            </div>

            {/* Level requirements explanation */}
            <div className="text-[10px] text-stone-500 bg-stone-50 rounded-lg p-2 mb-2.5 border border-stone-200/60 leading-relaxed">
              • <strong>LEVEL 1</strong>: 登録画像からランダムに3枚（3ペア）使用<br />
              • <strong>LEVEL 2</strong>: 基本の6枚（6ペア）すべてを使用<br />
              • <strong>LEVEL 3</strong>: 8枚（8ペア）すべてを使用（カード7・8の登録が必要）
            </div>

            {/* 8 Cards Grid Preview (4 cols on sm, 4 cols on mobile) */}
            <div className="grid grid-cols-4 gap-2">
              {cards.map((card, idx) => {
                const hasImage = Boolean(card.image && card.image.trim().length > 0);
                const isExtraSlot = idx >= 6;

                if (!hasImage) {
                  return (
                    <div
                      key={card.id}
                      onClick={() => triggerSingleUpload(idx)}
                      className="group relative rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 aspect-[3/4] flex flex-col items-center justify-center p-1.5 text-center cursor-pointer transition-all active:scale-98"
                      title={`カード ${idx + 1} の画像を登録`}
                    >
                      <div className="w-7 h-7 rounded-full bg-amber-100 group-hover:bg-amber-200 text-amber-700 flex items-center justify-center mb-1 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold text-amber-900 leading-tight">
                        カード {idx + 1}
                      </span>
                      <span className="text-[9px] text-amber-700 mt-0.5">
                        {isExtraSlot ? 'LEVEL 3用' : '画像未登録'}
                      </span>
                      <span className="text-[8px] text-stone-500 mt-0.5 bg-white/80 px-1 py-0.5 rounded-sm">
                        タップで登録
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={card.id}
                    onClick={() => triggerSingleUpload(idx)}
                    className="group relative rounded-xl border border-stone-200 overflow-hidden bg-stone-50 aspect-[3/4] flex flex-col cursor-pointer hover:border-amber-400 hover:shadow-xs transition-all"
                    title={`カード ${idx + 1}: ${card.name} (タップで変更)`}
                  >
                    <div className="flex-1 p-0.5 flex items-center justify-center overflow-hidden relative">
                      {isExtraSlot && onClearCardImage && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClearCardImage(idx);
                          }}
                          className="absolute top-1 right-1 z-20 w-5 h-5 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="画像を削除"
                          aria-label={`カード ${idx + 1} の画像を削除`}
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                      <img
                        src={card.image}
                        alt={card.name}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full rounded-md ${
                          imageFit === 'contain' ? 'object-contain' : 'object-cover'
                        }`}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                        <Upload className="w-3.5 h-3.5 mb-0.5" />
                        <span className="text-[9px] font-bold">変更</span>
                      </div>
                    </div>
                    <div className="py-0.5 px-1 bg-white border-t border-stone-100 text-center">
                      <div className="text-[8px] text-stone-400 font-medium leading-none">
                        No.{idx + 1}
                      </div>
                      <p className="text-[9px] font-semibold text-stone-700 truncate leading-tight">
                        {card.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Batch Upload Button */}
            <div className="mt-2.5">
              <button
                id="batch-upload-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 text-amber-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-amber-600" />
                <span>お好みの画像をまとめてアップロード (最大8枚)</span>
              </button>
            </div>
          </div>

          {/* Section 2: Image Aspect Ratio / Fit Setting */}
          <div className="pt-2 border-t border-stone-100">
            <label className="block text-xs font-bold text-stone-800 mb-2">
              画像の表示方法 (縦横比の保持)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeImageFit('contain')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all cursor-pointer ${
                  imageFit === 'contain'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 shadow-xs'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="text-left">
                  <div className="font-bold">綺麗に枠内に収める</div>
                  <div className="text-[10px] text-stone-600">歪みなし・全体表示</div>
                </div>
                {imageFit === 'contain' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
              </button>

              <button
                type="button"
                onClick={() => onChangeImageFit('cover')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all cursor-pointer ${
                  imageFit === 'cover'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 shadow-xs'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="text-left">
                  <div className="font-bold">カード全面に広げる</div>
                  <div className="text-[10px] text-stone-600">歪みなし・トリミング</div>
                </div>
                {imageFit === 'cover' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
              </button>
            </div>
          </div>

          {/* Section 3: Theme Selector */}
          <div className="pt-2 border-t border-stone-100">
            <label className="block text-xs font-bold text-stone-800 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-stone-600" />
              背景・カラーテーマ
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
                const themeItem = THEMES[themeKey];
                const isSelected = currentTheme === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => onChangeTheme(themeKey)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-400/40 bg-amber-50/40 text-stone-900 font-bold'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0"
                        style={{ backgroundColor: themeItem.accentColor }}
                      />
                      <span>{themeItem.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Card Back Style */}
          <div className="pt-2 border-t border-stone-100">
            <label className="block text-xs font-bold text-stone-800 mb-2">
              カード裏面のデザイン
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'stars', label: '星・魔法' },
                { id: 'diamond', label: 'ダイヤ' },
                { id: 'geometric', label: '幾何学' },
                { id: 'minimal', label: 'シンプル' },
              ].map((pattern) => {
                const isSelected = cardBackStyle === pattern.id;
                return (
                  <button
                    key={pattern.id}
                    type="button"
                    onClick={() => onChangeCardBackStyle(pattern.id as CardBackStyle)}
                    className={`py-2 px-1 text-center rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    {pattern.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end shrink-0">
          <button
            id="close-settings-done-btn"
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            完了してゲームに戻る
          </button>
        </div>
      </div>
    </div>
  );
};
