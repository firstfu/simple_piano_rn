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
  /** 圓角半徑 - 底部圓角 */
  borderRadius: {
    top: 0,
    bottom: 3,
  },
  
  /** 基礎顏色配置 - 象牙白色系 */
  colors: {
    normal: {
      start: '#FFFFFF',      // 純白色頂部
      middle: '#FDFCF8',     // 象牙白中部
      end: '#F5F3F0',        // 淡象牙白底部
    },
    pressed: {
      start: '#F8F8F8',      // 按壓時稍微暗化
      middle: '#F0EDE8',     
      end: '#E8E5E0',        
    },
    highlight: 'rgba(255, 255, 255, 0.8)',  // 高光效果
    text: '#333333',
    separatorShadow: 'rgba(0, 0, 0, 0.15)', // 分隔陰影
  },
  
  /** 立體陰影配置 */
  shadow: {
    // 主要陰影 - 創造深度
    primary: {
      elevation: 3,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowColor: '#000000',
    },
    // 右側分隔陰影
    separator: {
      elevation: 1,
      shadowOffset: { width: 1, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      shadowColor: '#000000',
    },
  },
  
  /** 按壓時的陰影配置 */
  pressedShadow: {
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowColor: '#000000',
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
  
  // 動畫值
  const pressAnimation = useSharedValue(0);
  const glowAnimation = useSharedValue(0);
  
  // ========== 計算屬性 ==========
  
  /**
   * 計算白鍵顏色方案
   */
  const whiteKeyColors = useMemo(() => {
    // 象牙白色系主題
    return {
      normal: WHITE_KEY_THEME.colors.normal.start,
      pressed: WHITE_KEY_THEME.colors.pressed.start,
      accent: WHITE_KEY_THEME.colors.normal.start,
      background: WHITE_KEY_THEME.colors.normal.start,
      text: WHITE_KEY_THEME.colors.text,
      border: WHITE_KEY_THEME.colors.separatorShadow,
      shadow: WHITE_KEY_THEME.colors.separatorShadow,
    };
  }, []);

  // ========== 動畫樣式 ==========
  
  /**
   * 白鍵容器動畫樣式 - 3D 效果
   */
  const animatedContainerStyle = useAnimatedStyle(() => {
    const scale = withSpring(isPressed ? 0.98 : 1, {
      damping: 15,
      stiffness: 300,
    });
    
    const rotateX = withSpring(isPressed ? -2 : 0, {
      damping: 15,
      stiffness: 400,
    });
    
    return {
      transform: [
        { scale },
        { rotateX: `${rotateX}deg` },
      ],
      elevation: isPressed ? WHITE_KEY_THEME.pressedShadow.elevation : WHITE_KEY_THEME.shadow.primary.elevation,
      shadowOffset: isPressed ? WHITE_KEY_THEME.pressedShadow.shadowOffset : WHITE_KEY_THEME.shadow.primary.shadowOffset,
      shadowOpacity: isPressed ? WHITE_KEY_THEME.pressedShadow.shadowOpacity : WHITE_KEY_THEME.shadow.primary.shadowOpacity,
      shadowRadius: isPressed ? WHITE_KEY_THEME.pressedShadow.shadowRadius : WHITE_KEY_THEME.shadow.primary.shadowRadius,
      shadowColor: WHITE_KEY_THEME.shadow.primary.shadowColor,
    };
  });

  /**
   * 白鍵背景動畫樣式 - 漸層效果
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
   * 高光效果動畫樣式
   */
  const animatedHighlightStyle = useAnimatedStyle(() => {
    const opacity = withTiming(isPressed ? 0.6 : 1, { duration: 150 });
    
    return {
      opacity,
    };
  });

  // ========== 事件處理 ==========
  
  /**
   * 處理按鍵按下事件（增強版）
   */
  const handlePressIn = (noteId: NoteId, event: GestureResponderEvent) => {
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
    onPressIn?.(noteId, event);
  };

  /**
   * 處理按鍵釋放事件（增強版）
   */
  const handlePressOut = (noteId: NoteId, event: GestureResponderEvent) => {
    // 恢復動畫
    pressAnimation.value = withSpring(0, {
      damping: 12,
      stiffness: 200,
    });
    
    // 停止發光效果
    glowAnimation.value = withTiming(0, { duration: 300 });
    
    // 執行外部回調
    onPressOut?.(noteId, event);
  };

  // ========== 樣式計算 ==========
  
  /**
   * 白鍵專用樣式
   */
  const whiteKeyStyle = useMemo(() => ({
    width,
    height,
    borderBottomLeftRadius: WHITE_KEY_THEME.borderRadius.bottom,
    borderBottomRightRadius: WHITE_KEY_THEME.borderRadius.bottom,
    borderRightWidth: 0.5,
    borderRightColor: whiteKeyColors.border,
    backgroundColor: whiteKeyColors.normal,
    overflow: 'hidden' as const,
  }), [width, height, whiteKeyColors]);

  /**
   * 簡譜標記文字樣式
   */
  const solfegeTextStyle = useMemo(() => ({
    ...styles.solfegeText,
    color: whiteKeyColors.text,
    fontSize: Math.min(width * 0.2, 16), // 根據鍵寬動態調整字體大小
  }), [whiteKeyColors.text, width]);

  /**
   * 音符名稱文字樣式
   */
  const noteNameTextStyle = useMemo(() => ({
    ...styles.noteNameText,
    color: whiteKeyColors.text,
    fontSize: Math.min(width * 0.15, 12),
  }), [whiteKeyColors.text, width]);

  // ========== 渲染內容 ==========

  /**
   * 渲染音域指示器（小圓點）- 保持簡潔設計
   */
  const renderPitchIndicator = () => {
    return null; // 移除音域指示器以符合簡潔設計
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
    <Animated.View style={[whiteKeyStyle, animatedContainerStyle]}>
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
      
      {/* 白鍵高光效果層 */}
      <Animated.View style={[styles.whiteKeyOverlay, animatedHighlightStyle]}>
        {renderWhiteKeyContent()}
      </Animated.View>
    </Animated.View>
  );
});

// ========== 樣式定義 ==========

const styles = StyleSheet.create({  
  whiteKeyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    pointerEvents: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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