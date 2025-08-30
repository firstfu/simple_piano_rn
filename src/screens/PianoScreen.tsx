/**
 * 簡譜鋼琴應用程式 - 主畫面
 * 
 * 本文件實作了應用程式的主要介面，整合了鋼琴鍵盤、錄音控制、
 * 頂部工具列等核心元件，並管理橫向顯示模式和整體的使用者互動流程。
 * 
 * @author Claude Code
 * @version 1.0.0
 * @since 2025-08-31
 */

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo,
  useRef 
} from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  Alert,
  BackHandler,
  AppState,
  AppStateStatus,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

import type { 
  NoteId, 
  RecordingState,
  KeyboardInteractionEvent,
  AppSettings 
} from '../types';

import { getThemeColors } from '../utils/colorScheme';
import AudioService from '../services/AudioService';

import PianoKeyboard from '../components/Piano/PianoKeyboard';
import TopBar from '../components/UI/TopBar';

// ========== 介面 Props 定義 ==========

export interface PianoScreenProps {
  /** 初始應用設定 */
  initialSettings?: Partial<AppSettings>;
  
  /** 設定變更回調 */
  onSettingsChange?: (settings: AppSettings) => void;
  
  /** 錄音完成回調 */
  onRecordingComplete?: (recordingId: string) => void;
  
  /** 錯誤處理回調 */
  onError?: (error: string) => void;
}

// ========== 預設設定 ==========

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  masterVolume: 0.7,
  soundType: 'piano',
  hapticFeedback: true,
  showSolfege: true,
  showNoteNames: false,
  colorCoding: true,
};

// ========== 鋼琴主畫面元件 ==========

/**
 * 鋼琴主畫面元件
 * 管理整個應用程式的主要功能和使用者互動
 */
const PianoScreen: React.FC<PianoScreenProps> = ({
  initialSettings = {},
  onSettingsChange,
  onRecordingComplete,
  onError,
}) => {
  // ========== Hooks ==========
  
  const colorScheme = useColorScheme();
  const audioService = useRef(AudioService).current;
  
  // 狀態管理
  const [appSettings, setAppSettings] = useState<AppSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });
  
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isKeyboardReady, setIsKeyboardReady] = useState(false);
  const [playingNotes, setPlayingNotes] = useState<Set<NoteId>>(new Set());
  
  // 動畫值
  const screenOpacity = useSharedValue(0);
  const keyboardScale = useSharedValue(0.9);
  
  // Refs
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTime = useRef<number>(0);
  
  // ========== 初始化和清理 ==========
  
  /**
   * 初始化畫面設定
   */
  useEffect(() => {
    const initializeScreen = async () => {
      try {
        // 鎖定橫向顯示
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
        );
        
        // 啟動入場動畫
        screenOpacity.value = withTiming(1, { 
          duration: 800,
          easing: Easing.out(Easing.cubic) 
        });
        
        keyboardScale.value = withSpring(1, {
          damping: 12,
          stiffness: 100,
        });
        
        setIsKeyboardReady(true);
        
      } catch (error) {
        console.error('PianoScreen 初始化失敗:', error);
        onError?.(`畫面初始化失敗: ${error}`);
      }
    };
    
    initializeScreen();
    
    // 清理函數
    return () => {
      // 清理錄音計時器
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      
      // 停止所有音符
      audioService.stopAllNotes();
      
      // 解鎖螢幕方向
      ScreenOrientation.unlockAsync();
    };
  }, []);

  /**
   * 監聽應用狀態變化
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // 應用進入後台時停止所有音符和錄音
        audioService.stopAllNotes();
        if (recordingState === 'recording') {
          handleStopRecording();
        }
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => subscription?.remove();
  }, [recordingState]);

  /**
   * 監聽 Android 返回鍵
   */
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (recordingState === 'recording') {
          Alert.alert(
            '正在錄音',
            '是否要停止錄音並退出？',
            [
              { text: '取消', style: 'cancel' },
              { 
                text: '停止並退出', 
                style: 'destructive',
                onPress: () => {
                  handleStopRecording();
                  BackHandler.exitApp();
                }
              },
            ]
          );
          return true; // 阻止預設行為
        }
        return false; // 允許預設行為
      }
    );
    
    return () => backHandler.remove();
  }, [recordingState]);

  // ========== 錄音功能 ==========
  
  /**
   * 開始錄音計時器
   */
  const startRecordingTimer = useCallback(() => {
    recordingStartTime.current = Date.now();
    setRecordingTime(0);
    
    recordingTimer.current = setInterval(() => {
      const elapsed = Date.now() - recordingStartTime.current;
      setRecordingTime(elapsed);
    }, 100); // 每100ms更新一次
  }, []);

  /**
   * 停止錄音計時器
   */
  const stopRecordingTimer = useCallback(() => {
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
  }, []);

  /**
   * 處理開始錄音
   */
  const handleStartRecording = useCallback(async () => {
    try {
      setRecordingState('recording');
      startRecordingTimer();
      
      // TODO: 實際錄音邏輯
      console.log('開始錄音...');
      
    } catch (error) {
      console.error('開始錄音失敗:', error);
      onError?.(`開始錄音失敗: ${error}`);
      setRecordingState('idle');
      stopRecordingTimer();
    }
  }, [startRecordingTimer, stopRecordingTimer, onError]);

  /**
   * 處理停止錄音
   */
  const handleStopRecording = useCallback(async () => {
    try {
      const finalTime = recordingTime;
      
      setRecordingState('idle');
      stopRecordingTimer();
      
      // TODO: 儲存錄音邏輯
      console.log(`錄音結束，時長: ${finalTime}ms`);
      
      if (finalTime > 1000) { // 至少錄音1秒
        const recordingId = `recording_${Date.now()}`;
        onRecordingComplete?.(recordingId);
      }
      
    } catch (error) {
      console.error('停止錄音失敗:', error);
      onError?.(`停止錄音失敗: ${error}`);
    } finally {
      setRecordingTime(0);
    }
  }, [recordingTime, stopRecordingTimer, onRecordingComplete, onError]);

  // ========== 鋼琴互動處理 ==========
  
  /**
   * 處理音符開始播放
   */
  const handleNoteStart = useCallback((noteId: NoteId) => {
    setPlayingNotes(prev => new Set(prev).add(noteId));
    console.log(`音符開始: ${noteId}`);
  }, []);

  /**
   * 處理音符停止播放
   */
  const handleNoteEnd = useCallback((noteId: NoteId) => {
    setPlayingNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(noteId);
      return newSet;
    });
    console.log(`音符結束: ${noteId}`);
  }, []);

  /**
   * 處理鍵盤互動
   */
  const handleKeyboardInteraction = useCallback((event: KeyboardInteractionEvent) => {
    // TODO: 記錄MIDI事件（用於錄音）
    console.log('鍵盤互動:', event);
  }, []);

  /**
   * 處理音頻錯誤
   */
  const handleAudioError = useCallback((error: string) => {
    console.error('音頻錯誤:', error);
    onError?.(error);
  }, [onError]);

  // ========== UI 事件處理 ==========
  
  /**
   * 處理設定按鈕點擊
   */
  const handleSettingsPress = useCallback(() => {
    // TODO: 開啟設定頁面
    console.log('開啟設定');
  }, []);

  /**
   * 處理選單按鈕點擊
   */
  const handleMenuPress = useCallback(() => {
    // TODO: 開啟側邊選單
    console.log('開啟選單');
  }, []);

  // ========== 樣式計算 ==========
  
  /**
   * 主題顏色
   */
  const themeColors = useMemo(() => getThemeColors(colorScheme), [colorScheme]);

  /**
   * 畫面動畫樣式
   */
  const animatedScreenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  /**
   * 鍵盤動畫樣式
   */
  const animatedKeyboardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: keyboardScale.value }],
  }));

  /**
   * 容器樣式
   */
  const containerStyle = useMemo(() => [
    styles.container,
    {
      backgroundColor: themeColors.background.primary,
    }
  ], [themeColors]);

  // ========== 主要渲染 ==========

  return (
    <Animated.View style={[containerStyle, animatedScreenStyle]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* 頂部工具列 */}
      <TopBar
        title="Piano"
        recordingState={recordingState}
        recordingTime={recordingTime}
        showRecordingControls={true}
        onSettingsPress={handleSettingsPress}
        onMenuPress={handleMenuPress}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
      />
      
      {/* 鋼琴鍵盤區域 */}
      <View style={styles.keyboardArea}>
        <Animated.View style={[styles.keyboardContainer, animatedKeyboardStyle]}>
          {isKeyboardReady && (
            <PianoKeyboard
              showSolfege={appSettings.showSolfege}
              showNoteName={appSettings.showNoteNames}
              useColorCoding={appSettings.colorCoding}
              hapticFeedback={appSettings.hapticFeedback}
              masterVolume={appSettings.masterVolume}
              onKeyboardInteraction={handleKeyboardInteraction}
              onNoteStart={handleNoteStart}
              onNoteEnd={handleNoteEnd}
              onAudioError={handleAudioError}
            />
          )}
        </Animated.View>
      </View>
    </Animated.View>
  );
};

// ========== 樣式定義 ==========

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  keyboardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  keyboardContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 1024, // 限制最大寬度
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ========== 導出元件 ==========

export default PianoScreen;