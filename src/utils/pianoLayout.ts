/**
 * 簡譜鋼琴應用程式 - 鋼琴鍵盤佈局配置
 * 
 * 本文件定義了虛擬鋼琴鍵盤的佈局邏輯，包括琴鍵的位置、大小、
 * 顏色編碼以及簡譜標記等視覺配置，確保在不同螢幕尺寸下的
 * 最佳顯示效果。
 * 
 * @author Claude Code
 * @version 1.0.0
 * @since 2025-08-31
 */

import { Dimensions } from 'react-native';
import type { 
  PianoKeyConfig, 
  KeyboardLayout, 
  NoteName, 
  NoteId, 
  KeyType, 
  PitchRange 
} from '../types';
import { 
  PIANO_FREQUENCIES, 
  getSolfege, 
  parseNoteId 
} from './noteFrequencies';

// ========== 佈局常數定義 ==========

/**
 * 螢幕尺寸資訊
 */
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * 鍵盤佈局比例設定
 */
export const LAYOUT_CONSTANTS = {
  /** 鍵盤佔螢幕寬度的比例 */
  KEYBOARD_WIDTH_RATIO: 0.95,
  
  /** 白鍵高度佔螢幕高度的比例 */
  WHITE_KEY_HEIGHT_RATIO: 0.6,
  
  /** 黑鍵高度相對於白鍵的比例 */
  BLACK_KEY_HEIGHT_RATIO: 0.65,
  
  /** 黑鍵寬度相對於白鍵的比例 */
  BLACK_KEY_WIDTH_RATIO: 0.65,
  
  /** 琴鍵圓角半徑 */
  KEY_BORDER_RADIUS: 8,
  
  /** 琴鍵之間的間隙 */
  KEY_GAP: 2,
} as const;

/**
 * 支援的音域範圍 (C3-C6)
 * 總共37個音符：21個白鍵 + 16個黑鍵
 */
export const SUPPORTED_NOTE_RANGE: NoteId[] = [
  // 第3八度 (低音區)
  'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
  // 第4八度 (中音區)  
  'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
  // 第5八度 (高音區)
  'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
  // 第6八度起始
  'C6'
];

// ========== 顏色編碼配置 ==========

/**
 * 音域顏色編碼方案
 * 根據音高範圍使用不同的色彩主題
 */
export const PITCH_RANGE_COLORS = {
  low: {
    primary: '#FF6B6B',    // 暖紅色
    secondary: '#FF8E8E',  // 淺紅色
    accent: '#FF4757',     // 深紅色
    text: '#FFFFFF',       // 白色文字
  },
  middle: {
    primary: '#4ECDC4',    // 青綠色
    secondary: '#7ED9D3',  // 淺青綠色
    accent: '#26D0CE',     // 深青綠色
    text: '#FFFFFF',       // 白色文字
  },
  high: {
    primary: '#45B7D1',    // 天藍色
    secondary: '#7CC7D9',  // 淺藍色
    accent: '#3498DB',     // 深藍色
    text: '#FFFFFF',       // 白色文字
  }
} as const;

/**
 * 黑白鍵基礎顏色
 */
export const KEY_BASE_COLORS = {
  white: {
    normal: '#FFFFFF',
    pressed: '#E8E8E8',
    border: '#CCCCCC',
  },
  black: {
    normal: '#333333',
    pressed: '#555555',
    border: '#222222',
  }
} as const;

// ========== 佈局計算函數 ==========

/**
 * 判斷音符是否為黑鍵
 * 
 * @param noteName 音符名稱
 * @returns 是否為黑鍵
 */
export function isBlackKey(noteName: NoteName): boolean {
  return noteName.includes('#');
}

/**
 * 判斷音符所屬的音域範圍
 * 
 * @param noteId 音符ID
 * @returns 音域範圍
 */
export function getPitchRange(noteId: NoteId): PitchRange {
  const { octave } = parseNoteId(noteId);
  
  if (octave <= 3) {
    return 'low';
  } else if (octave === 4) {
    return 'middle';
  } else {
    return 'high';
  }
}

/**
 * 獲取音符對應的顏色
 * 
 * @param noteId 音符ID
 * @param keyType 琴鍵類型
 * @param pressed 是否被按下
 * @returns 顏色值
 */
export function getKeyColor(
  noteId: NoteId, 
  keyType: KeyType, 
  pressed: boolean = false
): string {
  if (keyType === 'black') {
    return pressed ? KEY_BASE_COLORS.black.pressed : KEY_BASE_COLORS.black.normal;
  }
  
  // 白鍵根據音域使用不同顏色主題
  const pitchRange = getPitchRange(noteId);
  const colorScheme = PITCH_RANGE_COLORS[pitchRange];
  
  if (pressed) {
    return colorScheme.secondary;
  }
  
  return colorScheme.primary;
}

/**
 * 計算白鍵的總數量
 * 
 * @param noteIds 音符ID數組
 * @returns 白鍵數量
 */
export function getWhiteKeyCount(noteIds: NoteId[]): number {
  return noteIds.filter(noteId => {
    const { noteName } = parseNoteId(noteId);
    return !isBlackKey(noteName);
  }).length;
}

/**
 * 計算鍵盤的尺寸參數
 * 
 * @param containerWidth 容器寬度
 * @param containerHeight 容器高度
 * @returns 鍵盤尺寸配置
 */
export function calculateKeyboardDimensions(
  containerWidth?: number, 
  containerHeight?: number
) {
  const whiteKeyCount = getWhiteKeyCount(SUPPORTED_NOTE_RANGE);
  
  // 使用傳入的尺寸或預設螢幕尺寸
  const availableWidth = containerWidth || SCREEN_WIDTH;
  const availableHeight = containerHeight || SCREEN_HEIGHT;
  
  const keyboardWidth = availableWidth * LAYOUT_CONSTANTS.KEYBOARD_WIDTH_RATIO;
  
  // 計算白鍵尺寸 - 確保有足夠的空間
  const whiteKeyWidth = Math.max(30, (keyboardWidth - (whiteKeyCount - 1) * LAYOUT_CONSTANTS.KEY_GAP) / whiteKeyCount);
  const whiteKeyHeight = Math.max(120, availableHeight * LAYOUT_CONSTANTS.WHITE_KEY_HEIGHT_RATIO);
  
  // 計算黑鍵尺寸
  const blackKeyWidth = whiteKeyWidth * LAYOUT_CONSTANTS.BLACK_KEY_WIDTH_RATIO;
  const blackKeyHeight = whiteKeyHeight * LAYOUT_CONSTANTS.BLACK_KEY_HEIGHT_RATIO;
  
  return {
    keyboardWidth,
    whiteKeyWidth,
    whiteKeyHeight,
    blackKeyWidth,
    blackKeyHeight,
    whiteKeyCount,
  };
}

/**
 * 計算黑鍵相對於白鍵的水平偏移量
 * 
 * @param noteName 黑鍵音符名稱
 * @param whiteKeyWidth 白鍵寬度
 * @param blackKeyWidth 黑鍵寬度
 * @returns 水平偏移量
 */
export function calculateBlackKeyOffset(
  noteName: NoteName, 
  whiteKeyWidth: number, 
  blackKeyWidth: number
): number {
  const keyGap = LAYOUT_CONSTANTS.KEY_GAP;
  const baseOffset = whiteKeyWidth + keyGap - blackKeyWidth / 2;
  
  // 根據不同的黑鍵位置調整偏移量
  switch (noteName) {
    case 'C#':
    case 'F#':
      return baseOffset;
    case 'D#':
    case 'G#':
    case 'A#':
      return baseOffset;
    default:
      return baseOffset;
  }
}

// ========== 鍵盤配置生成 ==========

/**
 * 生成完整的鋼琴鍵盤配置
 * 
 * @param containerWidth 容器寬度
 * @param containerHeight 容器高度
 * @returns 鍵盤佈局配置
 */
export function generateKeyboardLayout(
  containerWidth?: number,
  containerHeight?: number
): KeyboardLayout {
  const dimensions = calculateKeyboardDimensions(containerWidth, containerHeight);
  const keys: PianoKeyConfig[] = [];
  
  let whiteKeyIndex = 0;
  
  // 遍歷所有支援的音符，生成琴鍵配置
  SUPPORTED_NOTE_RANGE.forEach((noteId, index) => {
    const { noteName } = parseNoteId(noteId);
    const keyType: KeyType = isBlackKey(noteName) ? 'black' : 'white';
    const pitchRange = getPitchRange(noteId);
    const frequency = PIANO_FREQUENCIES[noteId];
    const solfege = getSolfege(noteName.replace('#', '') as NoteName);
    
    if (keyType === 'white') {
      whiteKeyIndex++;
    }
    
    const keyConfig: PianoKeyConfig = {
      noteId,
      noteName,
      solfege,
      keyType,
      pitchRange,
      frequency,
      color: getKeyColor(noteId, keyType),
      index,
    };
    
    keys.push(keyConfig);
  });
  
  return {
    keys,
    totalWidth: dimensions.keyboardWidth,
    whiteKeyWidth: dimensions.whiteKeyWidth,
    whiteKeyHeight: dimensions.whiteKeyHeight,
    blackKeyWidth: dimensions.blackKeyWidth,
    blackKeyHeight: dimensions.blackKeyHeight,
  };
}

// ========== 鍵盤查詢工具 ==========

/**
 * 根據音符ID查找琴鍵配置
 * 
 * @param noteId 音符ID
 * @param layout 鍵盤佈局配置
 * @returns 琴鍵配置或undefined
 */
export function findKeyByNoteId(noteId: NoteId, layout: KeyboardLayout): PianoKeyConfig | undefined {
  return layout.keys.find(key => key.noteId === noteId);
}

/**
 * 根據索引查找琴鍵配置
 * 
 * @param index 琴鍵索引
 * @param layout 鍵盤佈局配置
 * @returns 琴鍵配置或undefined
 */
export function findKeyByIndex(index: number, layout: KeyboardLayout): PianoKeyConfig | undefined {
  return layout.keys.find(key => key.index === index);
}

/**
 * 獲取所有白鍵配置
 * 
 * @param layout 鍵盤佈局配置
 * @returns 白鍵配置數組
 */
export function getWhiteKeys(layout: KeyboardLayout): PianoKeyConfig[] {
  return layout.keys.filter(key => key.keyType === 'white');
}

/**
 * 獲取所有黑鍵配置
 * 
 * @param layout 鍵盤佈局配置
 * @returns 黑鍵配置數組
 */
export function getBlackKeys(layout: KeyboardLayout): PianoKeyConfig[] {
  return layout.keys.filter(key => key.keyType === 'black');
}

/**
 * 根據音域範圍過濾琴鍵
 * 
 * @param layout 鍵盤佈局配置
 * @param pitchRange 音域範圍
 * @returns 指定音域的琴鍵配置數組
 */
export function getKeysByPitchRange(layout: KeyboardLayout, pitchRange: PitchRange): PianoKeyConfig[] {
  return layout.keys.filter(key => key.pitchRange === pitchRange);
}