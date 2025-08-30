/**
 * 簡譜鋼琴應用程式 - 基礎琴鍵元件
 * 
 * 本文件實作了單個琴鍵的視覺呈現和互動邏輯，支援觸控回饋、
 * 簡譜標記顯示、音域顏色編碼以及按壓動畫效果。
 * 是整個虛擬鋼琴鍵盤的基礎構建元件。
 * 
 * @author Claude Code
 * @version 1.0.0
 * @since 2025-08-31
 */

import React, { memo, useCallback, useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  GestureResponderEvent,
} from 'react-native';
import { Haptics } from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import type { 
  PianoKeyConfig, 
  KeyPressState, 
  NoteId 
} from '../../types';

import { 
  getKeyColor, 
  getKeyBorderColor, 
  getKeyShadowColor,
  getPitchRangeDynamicColor 
} from '../../utils/colorScheme';

// ========== 元件 Props 介面 ==========

export interface PianoKeyProps {
  /** 琴鍵配置資訊 */
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
  
  /** 琴鍵樣式覆寫 */
  style?: any;
}

// ========== 動畫配置 ==========

const ANIMATION_CONFIG = {
  /** 按壓縮放動畫配置 */
  pressScale: {
    duration: 100,
    easing: 'easeOut' as const,
  },
  
  /** 顏色變化動畫配置 */
  colorTransition: {
    duration: 150,
    easing: 'easeInOut' as const,
  },
  
  /** 彈簧動畫配置 */
  spring: {
    damping: 12,
    stiffness: 200,
  }
} as const;

// ========== 琴鍵元件 ==========

/**
 * 琴鍵基礎元件
 * 支援觸控互動、動畫效果和自定義樣式
 */
const PianoKey: React.FC<PianoKeyProps> = memo(({
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
  style,
}) => {
  // ========== Hooks ==========
  
  const colorScheme = useColorScheme();
  
  // 動畫值
  const pressedScale = useSharedValue(1);
  const pressedOpacity = useSharedValue(1);
  
  // ========== 計算屬性 ==========
  
  /**
   * 計算琴鍵顏色
   */
  const keyColors = useMemo(() => {
    if (useColorCoding && keyConfig.keyType === 'white') {
      // 使用音域顏色編碼
      return {
        normal: getPitchRangeDynamicColor(keyConfig.pitchRange, false, 0.9),
        pressed: getPitchRangeDynamicColor(keyConfig.pitchRange, true, 1.0),
        border: getPitchRangeDynamicColor(keyConfig.pitchRange, false, 0.3),
      };
    } else {
      // 使用預設黑白鍵顏色
      return {
        normal: getKeyColor(keyConfig.keyType, colorScheme, false),
        pressed: getKeyColor(keyConfig.keyType, colorScheme, true),
        border: getKeyBorderColor(keyConfig.keyType, colorScheme),
      };
    }
  }, [keyConfig, colorScheme, useColorCoding]);

  /**
   * 計算文字顏色
   */
  const textColor = useMemo(() => {
    if (keyConfig.keyType === 'black') {
      return '#FFFFFF';
    }
    
    if (useColorCoding) {
      return '#FFFFFF';
    }
    
    return colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  }, [keyConfig.keyType, useColorCoding, colorScheme]);

  /**
   * 計算陰影顏色
   */
  const shadowColor = useMemo(() => {
    return getKeyShadowColor(keyConfig.keyType, colorScheme);
  }, [keyConfig.keyType, colorScheme]);

  // ========== 動畫樣式 ==========
  
  /**
   * 琴鍵容器動畫樣式
   */
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            pressedScale.value,
            [1, 0.95],
            [1, 0.95]
          )
        }
      ],
      opacity: pressedOpacity.value,
    };
  });

  /**
   * 琴鍵背景動畫樣式
   */
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = isPressed ? keyColors.pressed : keyColors.normal;
    
    return {
      backgroundColor: withTiming(backgroundColor, {
        duration: ANIMATION_CONFIG.colorTransition.duration,
      }),
    };
  });

  // ========== 事件處理函數 ==========

  /**
   * 處理按鍵按下事件
   */
  const handlePressIn = useCallback((event: GestureResponderEvent) => {
    // 啟動按壓動畫
    pressedScale.value = withSpring(0.95, ANIMATION_CONFIG.spring);
    pressedOpacity.value = withTiming(0.8, { duration: 100 });
    
    // 觸覺回饋
    if (hapticFeedback) {
      Haptics.impactAsync(
        keyConfig.keyType === 'black' 
          ? Haptics.ImpactFeedbackStyle.Medium 
          : Haptics.ImpactFeedbackStyle.Light
      );
    }
    
    // 執行外部回調
    onPressIn?.(keyConfig.noteId, event);
  }, [keyConfig, hapticFeedback, onPressIn, pressedScale, pressedOpacity]);

  /**
   * 處理按鍵釋放事件
   */
  const handlePressOut = useCallback((event: GestureResponderEvent) => {
    // 恢復動畫
    pressedScale.value = withSpring(1, ANIMATION_CONFIG.spring);
    pressedOpacity.value = withTiming(1, { duration: 150 });
    
    // 執行外部回調
    onPressOut?.(keyConfig.noteId, event);
  }, [keyConfig, onPressOut, pressedScale, pressedOpacity]);

  // ========== 樣式計算 ==========
  
  /**
   * 琴鍵容器樣式
   */
  const containerStyle = useMemo(() => [
    styles.keyContainer,
    {
      width,
      height,
      borderColor: keyColors.border,
      shadowColor,
      zIndex: keyConfig.keyType === 'black' ? 2 : 1, // 黑鍵在上層
    },
    keyConfig.keyType === 'black' ? styles.blackKeyContainer : styles.whiteKeyContainer,
    style,
  ], [width, height, keyColors.border, shadowColor, keyConfig.keyType, style]);

  /**
   * 文字標籤樣式
   */
  const textLabelStyle = useMemo(() => [
    styles.keyLabel,
    {
      color: textColor,
      fontSize: keyConfig.keyType === 'black' ? 10 : 12,
    }
  ], [textColor, keyConfig.keyType]);

  // ========== 渲染方法 ==========

  /**
   * 渲染琴鍵標籤文字
   */
  const renderKeyLabel = () => {
    const labels = [];
    
    if (showSolfege) {
      labels.push(keyConfig.solfege);
    }
    
    if (showNoteName) {
      labels.push(keyConfig.noteName);
    }
    
    if (labels.length === 0) {
      return null;
    }
    
    return (
      <Text style={textLabelStyle} numberOfLines={2} adjustsFontSizeToFit>
        {labels.join('\\n')}
      </Text>
    );
  };

  // ========== 主要渲染 ==========

  return (
    <Animated.View style={[containerStyle, animatedContainerStyle]}>
      <TouchableOpacity
        style={styles.touchable}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1} // 由自定義動畫控制透明度
        accessibilityLabel={`琴鍵 ${keyConfig.solfege} ${keyConfig.noteId}`}
        accessibilityRole="button"
        accessibilityHint={`播放 ${keyConfig.solfege} 音符`}
      >
        <Animated.View style={[styles.keyBackground, animatedBackgroundStyle]}>
          <Text style={styles.keyLabel}>
            {showSolfege && keyConfig.solfege}
          </Text>
          {showNoteName && (
            <Text style={[styles.noteNameLabel, { color: textColor }]}>
              {keyConfig.noteName}
            </Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ========== 樣式定義 ==========

const styles = StyleSheet.create({
  keyContainer: {
    borderRadius: 8,
    borderWidth: 1,
    elevation: 3, // Android 陰影
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
  whiteKeyContainer: {
    // 白鍵特定樣式
  },
  
  blackKeyContainer: {
    // 黑鍵特定樣式
    elevation: 5, // 更高的陰影層級
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  
  touchable: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  keyBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
    borderRadius: 8,
  },
  
  keyLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  noteNameLabel: {
    fontSize: 8,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.8,
  },
});

// ========== 顯示名稱 ==========

PianoKey.displayName = 'PianoKey';

// ========== 導出元件 ==========

export default PianoKey;