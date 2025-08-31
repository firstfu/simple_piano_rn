/**
 * 簡譜鋼琴應用程式 - 計時器元件
 * 
 * 本文件實作了錄音和播放時間的顯示元件，支援不同的時間格式顯示、
 * 動畫效果以及錄音狀態指示。提供清晰的時間資訊展示。
 * 
 * @author Claude Code
 * @version 1.0.0
 * @since 2025-08-31
 */

import React, { memo, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';

import type { RecordingState, PlaybackState } from '../../types';
import { getThemeColors, BASE_COLORS } from '../../utils/colorScheme';

// ========== 元件 Props 介面 ==========

export interface TimerProps {
  /** 經過的時間（毫秒） */
  elapsedTime: number;
  
  /** 總時間（毫秒，用於播放進度） */
  totalTime?: number;
  
  /** 錄音狀態 */
  recordingState?: RecordingState;
  
  /** 播放狀態 */
  playbackState?: PlaybackState;
  
  /** 時間顯示格式 */
  format?: 'mm:ss' | 'hh:mm:ss' | 'mm:ss.ms';
  
  /** 字體大小 */
  fontSize?: number;
  
  /** 是否顯示進度條 */
  showProgress?: boolean;
  
  /** 是否顯示閃爍效果 */
  showBlinking?: boolean;
  
  /** 自定義樣式 */
  style?: any;
  
  /** 文字樣式 */
  textStyle?: any;
}

// ========== 工具函數 ==========

/**
 * 格式化時間顯示
 * 
 * @param timeMs 時間（毫秒）
 * @param format 格式
 * @returns 格式化後的時間字符串
 */
const formatTime = (timeMs: number, format: TimerProps['format'] = 'mm:ss'): string => {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hours = Math.floor(minutes / 60);
  const displayMinutes = minutes % 60;
  const milliseconds = Math.floor((timeMs % 1000) / 10); // 顯示兩位小數
  
  switch (format) {
    case 'hh:mm:ss':
      return `${hours.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    case 'mm:ss.ms':
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    
    default: // 'mm:ss'
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
};

/**
 * 計算進度百分比
 * 
 * @param elapsed 已經過時間
 * @param total 總時間
 * @returns 進度百分比 (0-1)
 */
const calculateProgress = (elapsed: number, total: number): number => {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, elapsed / total));
};

// ========== 計時器元件 ==========

/**
 * 計時器元件
 * 顯示錄音或播放的時間資訊
 */
const Timer: React.FC<TimerProps> = memo(({
  elapsedTime = 0,
  totalTime,
  recordingState = 'idle',
  playbackState = 'idle',
  format = 'mm:ss',
  fontSize = 18,
  showProgress = false,
  showBlinking = false,
  style,
  textStyle,
}) => {
  // ========== Hooks ==========
  
  const colorScheme = useColorScheme();
  
  // 動畫值
  const blinkAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);
  
  // ========== 計算屬性 ==========
  
  /**
   * 主題顏色
   */
  const themeColors = useMemo(() => getThemeColors(colorScheme), [colorScheme]);

  /**
   * 計時器顏色配置
   */
  const timerColors = useMemo(() => {
    const isRecording = recordingState === 'recording';
    const isPlaying = playbackState === 'playing';
    
    if (isRecording) {
      return {
        text: BASE_COLORS.error,
        background: 'rgba(255, 59, 48, 0.1)',
        progress: BASE_COLORS.error,
      };
    }
    
    if (isPlaying) {
      return {
        text: BASE_COLORS.success,
        background: 'rgba(52, 199, 89, 0.1)',
        progress: BASE_COLORS.success,
      };
    }
    
    return {
      text: themeColors.text.primary,
      background: themeColors.surface.secondary,
      progress: themeColors.text.secondary,
    };
  }, [recordingState, playbackState, themeColors]);

  /**
   * 格式化後的時間文字
   */
  const formattedTime = useMemo(() => {
    return formatTime(elapsedTime, format);
  }, [elapsedTime, format]);

  /**
   * 進度百分比
   */
  const progress = useMemo(() => {
    return totalTime ? calculateProgress(elapsedTime, totalTime) : 0;
  }, [elapsedTime, totalTime]);

  // ========== 動畫效果 ==========
  
  /**
   * 閃爍動畫效果（錄音時）
   */
  useEffect(() => {
    if (showBlinking && recordingState === 'recording') {
      blinkAnimation.value = withRepeat(
        withTiming(1, { duration: 500 }),
        -1,
        true
      );
    } else {
      blinkAnimation.value = withTiming(1, { duration: 200 });
    }
  }, [showBlinking, recordingState, blinkAnimation]);

  /**
   * 進度條動畫
   */
  useEffect(() => {
    progressAnimation.value = withTiming(progress, { duration: 100 });
  }, [progress, progressAnimation]);

  /**
   * 縮放動畫（狀態變化時）
   */
  useEffect(() => {
    const isActive = recordingState !== 'idle' || playbackState !== 'idle';
    scaleAnimation.value = withTiming(isActive ? 1.05 : 1, { duration: 300 });
  }, [recordingState, playbackState, scaleAnimation]);

  // ========== 動畫樣式 ==========
  
  /**
   * 計時器容器動畫樣式
   */
  const animatedContainerStyle = useAnimatedStyle(() => {
    const scale = scaleAnimation.value;
    
    return {
      transform: [{ scale }],
    };
  });

  /**
   * 時間文字動畫樣式
   */
  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      blinkAnimation.value,
      [0, 1],
      [0.6, 1]
    );
    
    return {
      opacity,
      color: timerColors.text,
    };
  });

  /**
   * 進度條動畫樣式
   */
  const animatedProgressStyle = useAnimatedStyle(() => {
    const width = `${progressAnimation.value * 100}%`;
    
    return {
      width: width as any,
      backgroundColor: timerColors.progress,
    };
  });

  // ========== 樣式計算 ==========
  
  /**
   * 容器樣式
   */
  const containerStyle = useMemo(() => [
    styles.timerContainer,
    {
      backgroundColor: timerColors.background,
    },
    style,
  ], [timerColors, style]);

  /**
   * 時間文字樣式
   */
  const timeTextStyle = useMemo(() => [
    styles.timeText,
    {
      fontSize,
      fontFamily: 'monospace', // 等寬字體確保數字對齊
    },
    textStyle,
  ], [fontSize, textStyle]);

  // ========== 渲染方法 ==========
  
  /**
   * 渲染進度條
   */
  const renderProgressBar = () => {
    if (!showProgress || !totalTime) {
      return null;
    }
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, animatedProgressStyle]} />
        </View>
        <Text style={[styles.totalTimeText, { color: timerColors.text }]}>
          {formatTime(totalTime, format)}
        </Text>
      </View>
    );
  };

  /**
   * 渲染狀態指示器
   */
  const renderStatusIndicator = () => {
    const isRecording = recordingState === 'recording';
    const isPlaying = playbackState === 'playing';
    const isPaused = recordingState === 'paused' || playbackState === 'paused';
    
    if (!isRecording && !isPlaying && !isPaused) {
      return null;
    }
    
    let statusText = '';
    let statusColor = timerColors.text;
    
    if (isRecording) {
      statusText = '● REC';
      statusColor = BASE_COLORS.error;
    } else if (isPlaying) {
      statusText = '▶ PLAY';
      statusColor = BASE_COLORS.success;
    } else if (isPaused) {
      statusText = '⏸ PAUSE';
      statusColor = BASE_COLORS.warning as any;
    }
    
    return (
      <Text style={[styles.statusText, { color: statusColor }]}>
        {statusText}
      </Text>
    );
  };

  // ========== 主要渲染 ==========

  return (
    <Animated.View style={[containerStyle, animatedContainerStyle]}>
      {/* 狀態指示器 */}
      {renderStatusIndicator()}
      
      {/* 時間顯示 */}
      <Animated.Text 
        style={[timeTextStyle, animatedTextStyle]}
        accessibilityLabel={`時間: ${formattedTime}`}
      >
        {formattedTime}
      </Animated.Text>
      
      {/* 進度條 */}
      {renderProgressBar()}
    </Animated.View>
  );
});

// ========== 樣式定義 ==========

const styles = StyleSheet.create({
  timerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  
  timeText: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
  },
  
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  progressContainer: {
    width: '100%',
    marginTop: 6,
    alignItems: 'center',
  },
  
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  
  progressBar: {
    height: '100%',
    borderRadius: 1.5,
  },
  
  totalTimeText: {
    fontSize: 10,
    marginTop: 2,
    opacity: 0.7,
    fontFamily: 'monospace',
  },
});

// ========== 顯示名稱 ==========

Timer.displayName = 'Timer';

// ========== 導出元件 ==========

export default Timer;