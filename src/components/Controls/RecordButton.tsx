/**
 * 簡譜鋼琴應用程式 - 錄音按鈕元件
 * 
 * 本文件實作了錄音功能的控制按鈕，包括錄音開始/停止的視覺狀態切換、
 * 脈衝動畫效果以及錄音狀態指示。提供直觀的錄音操作體驗。
 * 
 * @author Claude Code
 * @version 1.0.0
 * @since 2025-08-31
 */

import React, { memo, useMemo } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Haptics } from 'expo-haptics';

import type { RecordingState } from '../../types';
import { getThemeColors, BASE_COLORS } from '../../utils/colorScheme';

// ========== 元件 Props 介面 ==========

export interface RecordButtonProps {
  /** 錄音狀態 */
  recordingState: RecordingState;
  
  /** 按鈕大小 */
  size?: number;
  
  /** 是否啟用觸覺回饋 */
  hapticFeedback?: boolean;
  
  /** 是否禁用按鈕 */
  disabled?: boolean;
  
  /** 錄音開始回調 */
  onStartRecording?: () => void;
  
  /** 錄音停止回調 */
  onStopRecording?: () => void;
  
  /** 錄音暫停回調 */
  onPauseRecording?: () => void;
  
  /** 錄音繼續回調 */
  onResumeRecording?: () => void;
  
  /** 自定義樣式 */
  style?: any;
}

// ========== 動畫配置 ==========

const ANIMATION_CONFIG = {
  /** 按壓動畫 */
  press: {
    duration: 150,
    scale: 0.9,
  },
  
  /** 脈衝動畫 */
  pulse: {
    duration: 1000,
    scale: { min: 1, max: 1.1 },
  },
  
  /** 狀態切換動畫 */
  stateChange: {
    duration: 300,
    damping: 15,
    stiffness: 200,
  },
} as const;

// ========== 錄音按鈕元件 ==========

/**
 * 錄音按鈕元件
 * 支援多種錄音狀態的視覺表現和動畫效果
 */
const RecordButton: React.FC<RecordButtonProps> = memo(({
  recordingState = 'idle',
  size = 60,
  hapticFeedback = true,
  disabled = false,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  style,
}) => {
  // ========== Hooks ==========
  
  const colorScheme = useColorScheme();
  
  // 動畫值
  const pressAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);
  const stateAnimation = useSharedValue(0);
  
  // ========== 計算屬性 ==========
  
  /**
   * 主題顏色
   */
  const themeColors = useMemo(() => getThemeColors(colorScheme), [colorScheme]);

  /**
   * 按鈕顏色配置
   */
  const buttonColors = useMemo(() => {
    switch (recordingState) {
      case 'recording':
        return {
          background: BASE_COLORS.error,      // 錄音時使用紅色
          border: BASE_COLORS.error,
          shadow: BASE_COLORS.error,
          inner: '#FF6B6B',
        };
      case 'paused':
        return {
          background: BASE_COLORS.warning,    // 暫停時使用橘色
          border: BASE_COLORS.warning,
          shadow: BASE_COLORS.warning,
          inner: '#FFB347',
        };
      case 'playing':
        return {
          background: BASE_COLORS.success,    // 播放時使用綠色
          border: BASE_COLORS.success,
          shadow: BASE_COLORS.success,
          inner: '#68D391',
        };
      default: // 'idle'
        return {
          background: themeColors.surface.secondary,
          border: themeColors.border.primary,
          shadow: themeColors.text.primary,
          inner: themeColors.surface.tertiary,
        };
    }
  }, [recordingState, themeColors]);

  /**
   * 按鈕圖示形狀
   */
  const iconShape = useMemo(() => {
    switch (recordingState) {
      case 'recording':
        return 'square'; // 停止圖示
      case 'paused':
        return 'circle'; // 錄音圖示
      case 'playing':
        return 'pause';  // 暫停圖示
      default:
        return 'circle'; // 錄音圖示
    }
  }, [recordingState]);

  // ========== 動畫效果 ==========
  
  /**
   * 啟動脈衝動畫（錄音時）
   */
  React.useEffect(() => {
    if (recordingState === 'recording') {
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: ANIMATION_CONFIG.pulse.duration }),
        -1,
        true
      );
    } else {
      pulseAnimation.value = withTiming(0, { duration: 200 });
    }
  }, [recordingState, pulseAnimation]);

  /**
   * 狀態切換動畫
   */
  React.useEffect(() => {
    stateAnimation.value = withSpring(
      recordingState === 'idle' ? 0 : 1,
      {
        damping: ANIMATION_CONFIG.stateChange.damping,
        stiffness: ANIMATION_CONFIG.stateChange.stiffness,
      }
    );
  }, [recordingState, stateAnimation]);

  // ========== 動畫樣式 ==========
  
  /**
   * 按鈕容器動畫樣式
   */
  const animatedButtonStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pressAnimation.value,
      [0, 1],
      [1, ANIMATION_CONFIG.press.scale]
    );
    
    const pulseScale = interpolate(
      pulseAnimation.value,
      [0, 1],
      [ANIMATION_CONFIG.pulse.scale.min, ANIMATION_CONFIG.pulse.scale.max]
    );
    
    return {
      transform: [{ scale: scale * pulseScale }],
    };
  });

  /**
   * 按鈕背景動畫樣式
   */
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: buttonColors.background,
      borderColor: buttonColors.border,
      shadowColor: buttonColors.shadow,
    };
  });

  /**
   * 內部圖示動畫樣式
   */
  const animatedIconStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      stateAnimation.value,
      [0, 1],
      [0, iconShape === 'square' ? 0 : 45]
    );
    
    return {
      transform: [{ rotate: `${rotation}deg` }],
      backgroundColor: buttonColors.inner,
    };
  });

  // ========== 事件處理 ==========
  
  /**
   * 處理按鈕按下
   */
  const handlePressIn = () => {
    pressAnimation.value = withSpring(1, { damping: 10 });
    
    // 觸覺回饋
    if (hapticFeedback && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  /**
   * 處理按鈕釋放
   */
  const handlePressOut = () => {
    pressAnimation.value = withSpring(0, { damping: 10 });
  };

  /**
   * 處理按鈕點擊
   */
  const handlePress = () => {
    if (disabled) return;
    
    switch (recordingState) {
      case 'idle':
        onStartRecording?.();
        break;
      case 'recording':
        onStopRecording?.();
        break;
      case 'paused':
        onResumeRecording?.();
        break;
      case 'playing':
        onPauseRecording?.();
        break;
    }
  };

  // ========== 樣式計算 ==========
  
  /**
   * 按鈕容器樣式
   */
  const buttonContainerStyle = useMemo(() => [
    styles.buttonContainer,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      opacity: disabled ? 0.5 : 1,
    },
    style,
  ], [size, disabled, style]);

  /**
   * 內部圖示樣式
   */
  const iconInnerStyle = useMemo(() => {
    const iconSize = size * 0.4;
    
    return [
      styles.iconInner,
      {
        width: iconSize,
        height: iconSize,
        borderRadius: iconShape === 'square' ? 4 : iconSize / 2,
      },
    ];
  }, [size, iconShape]);

  // ========== 渲染圖示 ==========
  
  /**
   * 渲染按鈕內部圖示
   */
  const renderIcon = () => {
    return (
      <Animated.View style={[iconInnerStyle, animatedIconStyle]} />
    );
  };

  // ========== 主要渲染 ==========

  return (
    <Animated.View style={[buttonContainerStyle, animatedButtonStyle]}>
      <TouchableOpacity
        style={styles.touchable}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityLabel={`錄音按鈕，當前狀態：${recordingState}`}
        accessibilityRole="button"
        accessibilityHint="點擊以開始或停止錄音"
      >
        <Animated.View style={[styles.buttonBackground, animatedBackgroundStyle]}>
          {renderIcon()}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ========== 樣式定義 ==========

const styles = StyleSheet.create({
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  touchable: {
    width: '100%',
    height: '100%',
    borderRadius: 50, // 會被動態覆蓋
  },
  
  buttonBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 50, // 會被動態覆蓋
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  
  iconInner: {
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

// ========== 顯示名稱 ==========

RecordButton.displayName = 'RecordButton';

// ========== 導出元件 ==========

export default RecordButton;