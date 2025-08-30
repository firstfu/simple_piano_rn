/**
 * 簡譜鋼琴應用程式 - 白鍵專用元件
 * 
 * 本文件實作了白鍵的專門化視覺呈現，包括音域顏色編碼、
 * 簡譜標記的優化顯示以及白鍵特有的互動效果。
 * 基於基礎 PianoKey 元件進行特化實作。
 * 
 * @author Claude Code
 * @version 1.0.0
 * @since 2025-08-31
 */

import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

import type { PianoKeyConfig, NoteId } from '../../types';
import { getPitchRangeDynamicColor, PITCH_RANGE_COLORS } from '../../utils/colorScheme';
import PianoKey from './PianoKey';

// ========== 元件 Props 介面 ==========

export interface WhiteKeyProps {
  /** 白鍵配置資訊 */
  keyConfig: PianoKeyConfig;
  
  /** 琴鍵尺寸 */
  width: number;
  height: number;
  
  /** 是否被按下 */
  isPressed: boolean;
  
  /** 是否顯示簡譜標記 */
  showSolfege?: boolean;
  
  /** 是否顯示音符名稱 */
  showNoteName?: boolean;
  
  /** 是否啟用音域顏色編碼 */
  useColorCoding?: boolean;
  
  /** 是否啟用觸覺回饋 */
  hapticFeedback?: boolean;
  
  /** 按鍵按下回調 */
  onPressIn?: (noteId: NoteId, event: GestureResponderEvent) => void;
  
  /** 按鍵釋放回調 */
  onPressOut?: (noteId: NoteId, event: GestureResponderEvent) => void;
}

// ========== 白鍵專用樣式配置 ==========

/**
 * 白鍵樣式主題配置
 */
const WHITE_KEY_THEME = {
  /** 圓角半徑 */
  borderRadius: 8,
  
  /** 邊框寬度 */
  borderWidth: 1.5,
  
  /** 陰影配置 */
  shadow: {
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  /** 按壓時的陰影配置 */
  pressedShadow: {
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
} as const;

// ========== 白鍵元件 ==========

/**
 * 白鍵專用元件
 * 提供白鍵特有的視覺效果和互動體驗
 */
const WhiteKey: React.FC<WhiteKeyProps> = memo(({
  keyConfig,
  width,
  height,
  isPressed,
  showSolfege = true,
  showNoteName = false,
  useColorCoding = true,
  hapticFeedback = true,
  onPressIn,
  onPressOut,
}) => {
  // ========== Hooks ==========
  
  const colorScheme = useColorScheme();
  
  // 動畫值
  const pressAnimation = useSharedValue(0);
  const glowAnimation = useSharedValue(0);
  
  // ========== 計算屬性 ==========
  
  /**
   * 計算白鍵顏色方案
   */
  const whiteKeyColors = useMemo(() => {
    if (useColorCoding) {
      const pitchColors = PITCH_RANGE_COLORS[keyConfig.pitchRange];
      return {
        normal: pitchColors.primary,
        pressed: pitchColors.secondary,
        accent: pitchColors.accent,
        background: pitchColors.background,
        text: pitchColors.text,
        border: pitchColors.accent,
        shadow: pitchColors.shadow,
      };
    }
    
    // 預設白鍵顏色
    return {
      normal: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : '#FFFFFF',
      pressed: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#F0F0F0',
      accent: colorScheme === 'dark' ? '#FFFFFF' : '#E0E0E0',
      background: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#FAFAFA',
      text: colorScheme === 'dark' ? '#000000' : '#333333',
      border: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#CCCCCC',
      shadow: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)',
    };
  }, [keyConfig.pitchRange, useColorCoding, colorScheme]);

  // ========== 動畫樣式 ==========
  
  /**
   * 白鍵容器動畫樣式
   */
  const animatedContainerStyle = useAnimatedStyle(() => {
    const scale = interpolateColor(
      pressAnimation.value,
      [0, 1],
      [1, 0.97]
    );
    
    return {
      transform: [{ scale: typeof scale === 'string' ? 1 : scale }],
      elevation: isPressed ? WHITE_KEY_THEME.pressedShadow.elevation : WHITE_KEY_THEME.shadow.elevation,
    };
  });

  /**
   * 白鍵背景動畫樣式
   */
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      pressAnimation.value,
      [0, 1],
      [whiteKeyColors.normal, whiteKeyColors.pressed]
    );
    
    return {
      backgroundColor,
    };
  });

  /**
   * 發光效果動畫樣式
   */
  const animatedGlowStyle = useAnimatedStyle(() => {
    const opacity = glowAnimation.value;
    
    return {
      opacity,
      shadowColor: whiteKeyColors.accent,
      shadowOpacity: opacity * 0.5,
      shadowRadius: opacity * 8,
    };
  });

  // ========== 事件處理 ==========
  
  /**
   * 處理按鍵按下事件（增強版）
   */
  const handlePressIn = (event: GestureResponderEvent) => {
    // 啟動按壓動畫
    pressAnimation.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
    
    // 啟動發光效果
    if (useColorCoding) {
      glowAnimation.value = withTiming(1, { duration: 200 });
    }
    
    // 執行外部回調
    onPressIn?.(keyConfig.noteId, event);
  };

  /**
   * 處理按鍵釋放事件（增強版）
   */
  const handlePressOut = (event: GestureResponderEvent) => {
    // 恢復動畫
    pressAnimation.value = withSpring(0, {
      damping: 12,
      stiffness: 200,
    });
    
    // 停止發光效果
    glowAnimation.value = withTiming(0, { duration: 300 });
    
    // 執行外部回調
    onPressOut?.(keyConfig.noteId, event);
  };

  // ========== 樣式計算 ==========
  
  /**
   * 白鍵專用樣式
   */
  const whiteKeyStyle = useMemo(() => [
    styles.whiteKeyContainer,
    {
      width,
      height,
      borderColor: whiteKeyColors.border,
      shadowColor: whiteKeyColors.shadow,
    },
    WHITE_KEY_THEME.shadow,
  ], [width, height, whiteKeyColors]);

  /**
   * 簡譜標記文字樣式
   */
  const solfegeTextStyle = useMemo(() => [
    styles.solfegeText,
    {
      color: whiteKeyColors.text,
      fontSize: Math.min(width * 0.2, 16), // 根據鍵寬動態調整字體大小
    }
  ], [whiteKeyColors.text, width]);

  /**
   * 音符名稱文字樣式
   */
  const noteNameTextStyle = useMemo(() => [
    styles.noteNameText,
    {
      color: whiteKeyColors.text,
      fontSize: Math.min(width * 0.15, 12),
    }
  ], [whiteKeyColors.text, width]);

  // ========== 渲染內容 ==========

  /**
   * 渲染音域指示器（小圓點）
   */
  const renderPitchIndicator = () => {
    if (!useColorCoding) return null;
    
    return (
      <View 
        style={[
          styles.pitchIndicator, 
          { backgroundColor: whiteKeyColors.accent }
        ]} 
      />
    );
  };

  /**
   * 渲染白鍵內容
   */
  const renderWhiteKeyContent = () => (
    <View style={styles.keyContent}>
      {/* 音域指示器 */}
      {renderPitchIndicator()}
      
      {/* 文字標籤區域 */}
      <View style={styles.labelContainer}>
        {/* 簡譜標記 */}
        {showSolfege && (
          <Text style={solfegeTextStyle} numberOfLines={1}>
            {keyConfig.solfege}
          </Text>
        )}
        
        {/* 音符名稱 */}
        {showNoteName && (
          <Text style={noteNameTextStyle} numberOfLines={1}>
            {keyConfig.noteName}
          </Text>
        )}
      </View>
    </View>
  );

  // ========== 主要渲染 ==========

  return (
    <Animated.View style={[whiteKeyStyle, animatedContainerStyle, animatedGlowStyle]}>
      <PianoKey
        keyConfig={keyConfig}
        width={width}
        height={height}
        isPressed={isPressed}
        showSolfege={showSolfege}
        showNoteName={showNoteName}
        useColorCoding={useColorCoding}
        hapticFeedback={hapticFeedback}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedBackgroundStyle}
      />
      
      {/* 額外的白鍵裝飾 */}
      <Animated.View style={[styles.whiteKeyOverlay, animatedBackgroundStyle]}>
        {renderWhiteKeyContent()}
      </Animated.View>
    </Animated.View>
  );
});

// ========== 樣式定義 ==========

const styles = StyleSheet.create({
  whiteKeyContainer: {
    borderRadius: WHITE_KEY_THEME.borderRadius,
    borderWidth: WHITE_KEY_THEME.borderWidth,
    overflow: 'hidden',
  },
  
  whiteKeyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: WHITE_KEY_THEME.borderRadius,
    justifyContent: 'flex-end',
    alignItems: 'center',
    pointerEvents: 'none', // 不攔截觸控事件
  },
  
  keyContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  
  pitchIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  
  labelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  
  solfegeText: {
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  noteNameText: {
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.8,
  },
});

// ========== 顯示名稱 ==========

WhiteKey.displayName = 'WhiteKey';

// ========== 導出元件 ==========

export default WhiteKey;