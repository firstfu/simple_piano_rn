/**
 * 簡譜鋼琴應用程式 - 顏色配置主題系統
 * 
 * 本文件定義了整個應用程式的顏色主題系統，包括深色/淺色主題、
 * 音域顏色編碼、UI 元件顏色以及動態顏色計算函數，
 * 確保在不同主題下的視覺一致性和可讀性。
 * 
 * @author Claude Code
 * @version 1.0.0
 * @since 2025-08-31
 */

import { ColorSchemeName } from 'react-native';
import type { PitchRange, KeyType } from '../types';

// ========== 基礎顏色定義 ==========

/**
 * 基礎調色盤
 * 定義應用程式中使用的核心顏色
 */
export const BASE_COLORS = {
  // 主要品牌色彩
  primary: '#007AFF',      // iOS 藍色
  secondary: '#5856D6',    // iOS 紫色
  accent: '#FF9500',       // iOS 橘色
  
  // 中性色彩
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8E8E93',
  lightGray: '#F2F2F7',
  darkGray: '#1C1C1E',
  
  // 功能性色彩
  success: '#34C759',      // 成功綠色
  warning: '#FF9500',      // 警告橘色
  error: '#FF3B30',        // 錯誤紅色
  info: '#007AFF',         // 資訊藍色
  
  // 透明色彩
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
} as const;

// ========== 音域顏色編碼 ==========

/**
 * 音域顏色編碼系統
 * 根據音高範圍使用不同的色彩，幫助用戶視覺化識別音域
 */
export const PITCH_RANGE_COLORS = {
  low: {
    // 低音區 - 暖色調 (紅橘色系)
    primary: '#FF6B6B',      // 珊瑚紅
    secondary: '#FF8E8E',    // 淺珊瑚紅
    tertiary: '#FFB3B3',     // 更淺的珊瑚紅
    accent: '#FF4757',       // 深珊瑚紅
    background: '#FFF0F0',   // 超淺背景色
    text: '#FFFFFF',         // 白色文字
    shadow: '#FF4757',       // 陰影色
  },
  middle: {
    // 中音區 - 中性色調 (青綠色系)
    primary: '#4ECDC4',      // 青綠色
    secondary: '#7ED9D3',    // 淺青綠色
    tertiary: '#A8E6E1',     // 更淺的青綠色
    accent: '#26D0CE',       // 深青綠色
    background: '#F0FFFE',   // 超淺背景色
    text: '#FFFFFF',         // 白色文字
    shadow: '#26D0CE',       // 陰影色
  },
  high: {
    // 高音區 - 冷色調 (藍色系)
    primary: '#45B7D1',      // 天藍色
    secondary: '#7CC7D9',    // 淺天藍色
    tertiary: '#A8D5E0',     // 更淺的天藍色
    accent: '#3498DB',       // 深藍色
    background: '#F0F8FF',   // 超淺背景色
    text: '#FFFFFF',         // 白色文字
    shadow: '#3498DB',       // 陰影色
  }
} as const;

// ========== 主題配色方案 ==========

/**
 * 深色主題配色
 */
export const DARK_THEME = {
  // 背景色彩
  background: {
    primary: '#000000',      // 純黑背景
    secondary: '#1C1C1E',    // 深灰背景
    tertiary: '#2C2C2E',     // 較淺的深灰背景
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
  
  // 表面色彩
  surface: {
    primary: '#1C1C1E',      // 主要表面色
    secondary: '#2C2C2E',    // 次要表面色
    tertiary: '#3A3A3C',     // 第三表面色
    elevated: '#3A3A3C',     // 提升的表面色
  },
  
  // 文字色彩
  text: {
    primary: '#FFFFFF',      // 主要文字色
    secondary: '#EBEBF5',    // 次要文字色
    tertiary: '#EBEBF5',     // 第三文字色
    disabled: '#3A3A3C',     // 禁用文字色
  },
  
  // 邊框和分隔線
  border: {
    primary: '#3A3A3C',      // 主要邊框色
    secondary: '#48484A',    // 次要邊框色
    subtle: '#2C2C2E',       // 細微邊框色
  },
  
  // 功能性色彩
  functional: {
    success: '#30D158',      // 成功色
    warning: '#FF9F0A',      // 警告色
    error: '#FF453A',        // 錯誤色
    info: '#64D2FF',         // 資訊色
  }
} as const;

/**
 * 淺色主題配色
 */
export const LIGHT_THEME = {
  // 背景色彩
  background: {
    primary: '#FFFFFF',      // 純白背景
    secondary: '#F2F2F7',    // 淺灰背景
    tertiary: '#E5E5EA',     // 較深的淺灰背景
    overlay: 'rgba(0, 0, 0, 0.3)',
  },
  
  // 表面色彩
  surface: {
    primary: '#FFFFFF',      // 主要表面色
    secondary: '#F2F2F7',    // 次要表面色
    tertiary: '#E5E5EA',     // 第三表面色
    elevated: '#FFFFFF',     // 提升的表面色
  },
  
  // 文字色彩
  text: {
    primary: '#000000',      // 主要文字色
    secondary: '#3A3A3C',    // 次要文字色
    tertiary: '#48484A',     // 第三文字色
    disabled: '#C7C7CC',     // 禁用文字色
  },
  
  // 邊框和分隔線
  border: {
    primary: '#C6C6C8',      // 主要邊框色
    secondary: '#E5E5EA',    // 次要邊框色
    subtle: '#F2F2F7',       // 細微邊框色
  },
  
  // 功能性色彩
  functional: {
    success: '#34C759',      // 成功色
    warning: '#FF9500',      // 警告色
    error: '#FF3B30',        // 錯誤色
    info: '#007AFF',         // 資訊色
  }
} as const;

// ========== 琴鍵專用顏色 ==========

/**
 * 白鍵顏色配置
 */
export const WHITE_KEY_COLORS = {
  dark: {
    normal: 'rgba(255, 255, 255, 0.95)',
    pressed: 'rgba(255, 255, 255, 0.8)',
    border: 'rgba(255, 255, 255, 0.3)',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
  light: {
    normal: '#FFFFFF',
    pressed: '#F0F0F0',
    border: '#E0E0E0',
    shadow: 'rgba(0, 0, 0, 0.1)',
  }
} as const;

/**
 * 黑鍵顏色配置
 */
export const BLACK_KEY_COLORS = {
  dark: {
    normal: '#2C2C2E',
    pressed: '#48484A',
    border: '#1C1C1E',
    shadow: 'rgba(0, 0, 0, 0.5)',
  },
  light: {
    normal: '#333333',
    pressed: '#555555',
    border: '#222222',
    shadow: 'rgba(0, 0, 0, 0.3)',
  }
} as const;

// ========== 顏色計算函數 ==========

/**
 * 根據主題獲取顏色配置
 * 
 * @param colorScheme 當前顏色方案
 * @returns 主題顏色配置
 */
export function getThemeColors(colorScheme: ColorSchemeName) {
  return colorScheme === 'dark' ? DARK_THEME : LIGHT_THEME;
}

/**
 * 獲取音域對應的顏色
 * 
 * @param pitchRange 音域範圍
 * @returns 音域顏色配置
 */
export function getPitchRangeColor(pitchRange: PitchRange) {
  return PITCH_RANGE_COLORS[pitchRange];
}

/**
 * 獲取琴鍵顏色
 * 
 * @param keyType 琴鍵類型
 * @param colorScheme 當前顏色方案
 * @param pressed 是否被按下
 * @returns 琴鍵顏色
 */
export function getKeyColor(
  keyType: KeyType, 
  colorScheme: ColorSchemeName, 
  pressed: boolean = false
): string {
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  
  if (keyType === 'black') {
    return pressed 
      ? BLACK_KEY_COLORS[theme].pressed 
      : BLACK_KEY_COLORS[theme].normal;
  } else {
    return pressed 
      ? WHITE_KEY_COLORS[theme].pressed 
      : WHITE_KEY_COLORS[theme].normal;
  }
}

/**
 * 獲取琴鍵邊框顏色
 * 
 * @param keyType 琴鍵類型
 * @param colorScheme 當前顏色方案
 * @returns 邊框顏色
 */
export function getKeyBorderColor(keyType: KeyType, colorScheme: ColorSchemeName): string {
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  
  return keyType === 'black' 
    ? BLACK_KEY_COLORS[theme].border 
    : WHITE_KEY_COLORS[theme].border;
}

/**
 * 獲取琴鍵陰影顏色
 * 
 * @param keyType 琴鍵類型
 * @param colorScheme 當前顏色方案
 * @returns 陰影顏色
 */
export function getKeyShadowColor(keyType: KeyType, colorScheme: ColorSchemeName): string {
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  
  return keyType === 'black' 
    ? BLACK_KEY_COLORS[theme].shadow 
    : WHITE_KEY_COLORS[theme].shadow;
}

/**
 * 根據音域獲取動態顏色（用於白鍵的音域編碼）
 * 
 * @param pitchRange 音域範圍
 * @param pressed 是否被按下
 * @param opacity 透明度 (0-1)
 * @returns 動態顏色
 */
export function getPitchRangeDynamicColor(
  pitchRange: PitchRange, 
  pressed: boolean = false,
  opacity: number = 1
): string {
  const colorConfig = PITCH_RANGE_COLORS[pitchRange];
  const baseColor = pressed ? colorConfig.secondary : colorConfig.primary;
  
  if (opacity < 1) {
    // 將十六進位顏色轉換為 rgba 格式
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  return baseColor;
}

/**
 * 產生漸層色彩
 * 
 * @param startColor 起始顏色
 * @param endColor 結束顏色
 * @param steps 漸層步數
 * @returns 漸層顏色數組
 */
export function generateGradientColors(
  startColor: string, 
  endColor: string, 
  steps: number
): string[] {
  // 簡化實作，實際應用中可使用更複雜的顏色插值算法
  const colors: string[] = [];
  
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    // 這裡應該實作顏色插值邏輯
    // 為了簡化，我們交替使用起始和結束顏色
    colors.push(ratio < 0.5 ? startColor : endColor);
  }
  
  return colors;
}

// ========== 預設顏色主題 ==========

/**
 * 應用程式預設顏色主題
 * 包含所有 UI 元件的顏色配置
 */
export const DEFAULT_COLORS = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
  
  // 音域顏色
  pitchRange: PITCH_RANGE_COLORS,
  
  // 琴鍵顏色
  keys: {
    white: WHITE_KEY_COLORS,
    black: BLACK_KEY_COLORS,
  },
  
  // 基礎色彩
  base: BASE_COLORS,
} as const;

/**
 * 顏色主題類型定義
 */
export type ColorTheme = typeof DEFAULT_COLORS;