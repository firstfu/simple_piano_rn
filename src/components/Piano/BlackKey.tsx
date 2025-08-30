/**
 * 簡譜鋼琴應用程式 - 黑鍵專用元件
 * 
 * 本文件實作了黑鍵的專門化視覺呈現，包括更深的陰影效果、
 * 專用的觸控回饋以及黑鍵特有的視覺設計。
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
import { BLACK_KEY_COLORS } from '../../utils/colorScheme';
import PianoKey from './PianoKey';

// ========== 元件 Props 介面 ==========

export interface BlackKeyProps {
  /** 黑鍵配置資訊 */
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
  
  /** 是否啟用觸覺回饋 */
  hapticFeedback?: boolean;
  
  /** 按鍵按下回調 */
  onPressIn?: (noteId: NoteId, event: GestureResponderEvent) => void;
  
  /** 按鍵釋放回調 */
  onPressOut?: (noteId: NoteId, event: GestureResponderEvent) => void;
}

// ========== 黑鍵專用樣式配置 ==========

/**
 * 黑鍵樣式主題配置
 */
const BLACK_KEY_THEME = {
  /** 圓角半徑 */
  borderRadius: 6,
  
  /** 邊框寬度 */
  borderWidth: 1,
  
  /** 陰影配置 */
  shadow: {
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  
  /** 按壓時的陰影配置 */
  pressedShadow: {
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  
  /** 內部陰影效果 */
  innerShadow: {
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
} as const;

// ========== 黑鍵元件 ==========

/**
 * 黑鍵專用元件
 * 提供黑鍵特有的深色主題和立體效果
 */
const BlackKey: React.FC<BlackKeyProps> = memo(({
  keyConfig,
  width,
  height,
  isPressed,
  showSolfege = true,
  showNoteName = false,
  hapticFeedback = true,
  onPressIn,
  onPressOut,
}) => {
  // ========== Hooks ==========
  
  const colorScheme = useColorScheme();
  
  // 動畫值
  const pressAnimation = useSharedValue(0);
  const depthAnimation = useSharedValue(0);
  
  // ========== 計算屬性 ==========
  
  /**
   * 計算黑鍵顏色方案
   */
  const blackKeyColors = useMemo(() => {
    const theme = colorScheme === 'dark' ? 'dark' : 'light';
    return BLACK_KEY_COLORS[theme];
  }, [colorScheme]);

  /**
   * 計算漸層色彩
   */
  const gradientColors = useMemo(() => {
    return {
      start: blackKeyColors.normal,
      middle: isPressed ? '#4A4A4C' : '#3A3A3C',
      end: isPressed ? blackKeyColors.pressed : blackKeyColors.border,
    };
  }, [blackKeyColors, isPressed]);

  // ========== 動畫樣式 ==========
  
  /**
   * 黑鍵容器動畫樣式
   */
  const animatedContainerStyle = useAnimatedStyle(() => {
    const scale = withSpring(isPressed ? 0.95 : 1, {
      damping: 15,
      stiffness: 400,
    });
    
    const elevation = isPressed 
      ? BLACK_KEY_THEME.pressedShadow.elevation 
      : BLACK_KEY_THEME.shadow.elevation;
    
    return {
      transform: [{ scale }],
      elevation,
    };
  });

  /**
   * 黑鍵背景動畫樣式
   */
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      pressAnimation.value,
      [0, 1],
      [blackKeyColors.normal, blackKeyColors.pressed]
    );
    
    return {
      backgroundColor,
    };
  });

  /**
   * 深度效果動畫樣式
   */
  const animatedDepthStyle = useAnimatedStyle(() => {
    const translateY = depthAnimation.value * 2;
    
    return {
      transform: [{ translateY }],
    };
  });

  // ========== 事件處理 ==========
  
  /**
   * 處理按鍵按下事件（增強版）
   */
  const handlePressIn = (event: GestureResponderEvent) => {
    // 啟動按壓動畫
    pressAnimation.value = withSpring(1, {
      damping: 20,
      stiffness: 500,
    });
    
    // 啟動深度效果
    depthAnimation.value = withTiming(1, { duration: 100 });
    
    // 執行外部回調
    onPressIn?.(keyConfig.noteId, event);
  };

  /**
   * 處理按鍵釋放事件（增強版）
   */
  const handlePressOut = (event: GestureResponderEvent) => {
    // 恢復動畫
    pressAnimation.value = withSpring(0, {
      damping: 15,
      stiffness: 300,
    });
    
    // 恢復深度效果
    depthAnimation.value = withTiming(0, { duration: 150 });
    
    // 執行外部回調
    onPressOut?.(keyConfig.noteId, event);
  };

  // ========== 樣式計算 ==========
  
  /**
   * 黑鍵專用樣式
   */
  const blackKeyStyle = useMemo(() => [
    styles.blackKeyContainer,
    {
      width,
      height,
      borderColor: blackKeyColors.border,
      shadowColor: blackKeyColors.shadow,
    },
    BLACK_KEY_THEME.shadow,
  ], [width, height, blackKeyColors]);

  /**
   * 簡譜標記文字樣式（黑鍵專用）
   */
  const solfegeTextStyle = useMemo(() => [
    styles.solfegeText,
    {
      fontSize: Math.min(width * 0.25, 12), // 黑鍵字體稍小
      color: '#FFFFFF',
    }
  ], [width]);

  /**
   * 音符名稱文字樣式（黑鍵專用）
   */
  const noteNameTextStyle = useMemo(() => [
    styles.noteNameText,
    {
      fontSize: Math.min(width * 0.2, 10),
      color: '#CCCCCC',
    }
  ], [width]);

  // ========== 渲染內容 ==========

  /**
   * 渲染黑鍵光澤效果
   */
  const renderGlossEffect = () => (
    <View style={styles.glossOverlay}>
      <View style={[styles.glossHighlight, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
    </View>
  );

  /**
   * 渲染黑鍵內容
   */
  const renderBlackKeyContent = () => (
    <View style={styles.keyContent}>
      {/* 文字標籤區域 */}
      <View style={styles.labelContainer}>
        {/* 簡譜標記 */}
        {showSolfege && (
          <Text style={solfegeTextStyle} numberOfLines={1}>
            {keyConfig.solfege}
          </Text>
        )}
        
        {/* 音符名稱（黑鍵通常顯示#符號）*/}
        {showNoteName && (
          <Text style={noteNameTextStyle} numberOfLines={1}>
            {keyConfig.noteName}
          </Text>
        )}
      </View>
      
      {/* 光澤效果 */}
      {renderGlossEffect()}
    </View>
  );

  // ========== 主要渲染 ==========

  return (
    <Animated.View style={[blackKeyStyle, animatedContainerStyle]}>
      <Animated.View style={[styles.blackKeyDepth, animatedDepthStyle]}>
        <PianoKey
          keyConfig={keyConfig}
          width={width}
          height={height}
          isPressed={isPressed}
          showSolfege={false} // 由自定義內容處理
          showNoteName={false} // 由自定義內容處理
          useColorCoding={false} // 黑鍵不使用顏色編碼
          hapticFeedback={hapticFeedback}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={animatedBackgroundStyle}
        />
        
        {/* 黑鍵專用內容覆蓋層 */}
        <Animated.View style={[styles.blackKeyOverlay, animatedBackgroundStyle]}>
          {renderBlackKeyContent()}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
});

// ========== 樣式定義 ==========

const styles = StyleSheet.create({
  blackKeyContainer: {
    borderRadius: BLACK_KEY_THEME.borderRadius,
    borderWidth: BLACK_KEY_THEME.borderWidth,
    overflow: 'hidden',
    zIndex: 10, // 確保黑鍵在白鍵上方
  },
  
  blackKeyDepth: {
    flex: 1,
  },
  
  blackKeyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BLACK_KEY_THEME.borderRadius,
    justifyContent: 'flex-end',
    alignItems: 'center',
    pointerEvents: 'none', // 不攔截觸控事件
  },
  
  keyContent: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 3,
    position: 'relative',
  },
  
  labelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  
  solfegeText: {
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  noteNameText: {
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  
  glossOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BLACK_KEY_THEME.borderRadius,
  },
  
  glossHighlight: {
    position: 'absolute',
    top: '10%',
    left: '20%',
    right: '20%',
    height: '30%',
    borderRadius: 2,
  },
});

// ========== 顯示名稱 ==========

BlackKey.displayName = 'BlackKey';

// ========== 導出元件 ==========

export default BlackKey;