/**
 * 簡譜鋼琴應用程式 - 頂部工具列元件
 * 
 * 本文件實作了應用程式的頂部導覽列，包括設定按鈕、應用標題、
 * 選單按鈕以及錄音控制區域。提供清晰的導覽和功能入口。
 * 
 * @author Claude Code
 * @version 1.0.0
 * @since 2025-08-31
 */

import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RecordingState } from '../../types';
import { getThemeColors } from '../../utils/colorScheme';
import RecordButton from '../Controls/RecordButton';
import Timer from '../Controls/Timer';

// ========== 元件 Props 介面 ==========

export interface TopBarProps {
  /** 應用標題 */
  title?: string;
  
  /** 錄音狀態 */
  recordingState?: RecordingState;
  
  /** 錄音經過時間 */
  recordingTime?: number;
  
  /** 是否顯示錄音控制 */
  showRecordingControls?: boolean;
  
  /** 設定按鈕點擊回調 */
  onSettingsPress?: () => void;
  
  /** 選單按鈕點擊回調 */
  onMenuPress?: () => void;
  
  /** 錄音開始回調 */
  onStartRecording?: () => void;
  
  /** 錄音停止回調 */
  onStopRecording?: () => void;
  
  /** 自定義樣式 */
  style?: any;
}

// ========== 頂部工具列元件 ==========

/**
 * 頂部工具列元件
 * 提供應用程式的主要導覽和控制功能
 */
const TopBar: React.FC<TopBarProps> = memo(({
  title = 'Piano',
  recordingState = 'idle',
  recordingTime = 0,
  showRecordingControls = true,
  onSettingsPress,
  onMenuPress,
  onStartRecording,
  onStopRecording,
  style,
}) => {
  // ========== Hooks ==========
  
  const colorScheme = useColorScheme();
  const safeAreaInsets = useSafeAreaInsets();
  
  // 動畫值
  const settingsAnimation = useSharedValue(1);
  const menuAnimation = useSharedValue(1);
  
  // ========== 計算屬性 ==========
  
  /**
   * 主題顏色
   */
  const themeColors = useMemo(() => getThemeColors(colorScheme), [colorScheme]);

  /**
   * 狀態列樣式
   */
  const statusBarStyle = useMemo(() => {
    return colorScheme === 'dark' ? 'light-content' : 'dark-content';
  }, [colorScheme]);

  /**
   * 是否顯示錄音狀態
   */
  const showRecordingStatus = useMemo(() => {
    return showRecordingControls && (recordingState === 'recording' || recordingState === 'paused');
  }, [showRecordingControls, recordingState]);

  // ========== 動畫樣式 ==========
  
  /**
   * 設定按鈕動畫樣式
   */
  const animatedSettingsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: settingsAnimation.value }],
  }));

  /**
   * 選單按鈕動畫樣式
   */
  const animatedMenuStyle = useAnimatedStyle(() => ({
    transform: [{ scale: menuAnimation.value }],
  }));

  // ========== 事件處理 ==========
  
  /**
   * 處理設定按鈕按下
   */
  const handleSettingsPressIn = () => {
    settingsAnimation.value = withSpring(0.9, { damping: 10 });
  };

  /**
   * 處理設定按鈕釋放
   */
  const handleSettingsPressOut = () => {
    settingsAnimation.value = withSpring(1, { damping: 10 });
  };

  /**
   * 處理設定按鈕點擊
   */
  const handleSettingsPress = () => {
    onSettingsPress?.();
  };

  /**
   * 處理選單按鈕按下
   */
  const handleMenuPressIn = () => {
    menuAnimation.value = withSpring(0.9, { damping: 10 });
  };

  /**
   * 處理選單按鈕釋放
   */
  const handleMenuPressOut = () => {
    menuAnimation.value = withSpring(1, { damping: 10 });
  };

  /**
   * 處理選單按鈕點擊
   */
  const handleMenuPress = () => {
    onMenuPress?.();
  };

  // ========== 樣式計算 ==========
  
  /**
   * 容器樣式
   */
  const containerStyle = useMemo(() => [
    styles.container,
    {
      backgroundColor: themeColors.background.primary,
      borderBottomColor: themeColors.border.subtle,
      paddingTop: safeAreaInsets.top,
    },
    style,
  ], [themeColors, safeAreaInsets, style]);

  /**
   * 標題文字樣式
   */
  const titleTextStyle = useMemo(() => [
    styles.titleText,
    {
      color: themeColors.text.primary,
    }
  ], [themeColors]);

  /**
   * 圖示顏色
   */
  const iconColor = useMemo(() => themeColors.text.primary, [themeColors]);

  // ========== 渲染方法 ==========
  
  /**
   * 渲染左側控制區（設定按鈕）
   */
  const renderLeftControls = () => (
    <View style={styles.leftControls}>
      <Animated.View style={animatedSettingsStyle}>
        <TouchableOpacity
          style={styles.iconButton}
          onPressIn={handleSettingsPressIn}
          onPressOut={handleSettingsPressOut}
          onPress={handleSettingsPress}
          accessibilityLabel="設定"
          accessibilityRole="button"
          accessibilityHint="開啟應用程式設定"
        >
          <Ionicons 
            name="settings-outline" 
            size={24} 
            color={iconColor} 
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  /**
   * 渲染中央區域（標題或錄音控制）
   */
  const renderCenterArea = () => {
    if (showRecordingStatus) {
      // 顯示錄音狀態和計時器
      return (
        <View style={styles.recordingArea}>
          <Timer
            elapsedTime={recordingTime}
            recordingState={recordingState}
            format="mm:ss"
            fontSize={16}
            showBlinking={true}
          />
        </View>
      );
    }

    // 顯示應用標題
    return (
      <View style={styles.titleArea}>
        <Text style={titleTextStyle}>{title}</Text>
      </View>
    );
  };

  /**
   * 渲染右側控制區（選單按鈕和錄音按鈕）
   */
  const renderRightControls = () => (
    <View style={styles.rightControls}>
      {/* 錄音按鈕 */}
      {showRecordingControls && (
        <RecordButton
          recordingState={recordingState}
          size={36}
          onStartRecording={onStartRecording}
          onStopRecording={onStopRecording}
          style={styles.recordButton}
        />
      )}
      
      {/* 選單按鈕 */}
      <Animated.View style={animatedMenuStyle}>
        <TouchableOpacity
          style={styles.iconButton}
          onPressIn={handleMenuPressIn}
          onPressOut={handleMenuPressOut}
          onPress={handleMenuPress}
          accessibilityLabel="選單"
          accessibilityRole="button"
          accessibilityHint="開啟主選單"
        >
          <Ionicons 
            name="menu-outline" 
            size={24} 
            color={iconColor} 
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  // ========== 主要渲染 ==========

  return (
    <>
      {/* 狀態列 */}
      <StatusBar 
        barStyle={statusBarStyle} 
        backgroundColor={themeColors.background.primary}
      />
      
      {/* 工具列容器 */}
      <View style={containerStyle}>
        <View style={styles.contentArea}>
          {/* 左側控制區 */}
          {renderLeftControls()}
          
          {/* 中央區域 */}
          {renderCenterArea()}
          
          {/* 右側控制區 */}
          {renderRightControls()}
        </View>
      </View>
    </>
  );
});

// ========== 樣式定義 ==========

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  contentArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  titleArea: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  recordingArea: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    gap: 8,
  },
  
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  recordButton: {
    marginRight: 4,
  },
});

// ========== 顯示名稱 ==========

TopBar.displayName = 'TopBar';

// ========== 導出元件 ==========

export default TopBar;