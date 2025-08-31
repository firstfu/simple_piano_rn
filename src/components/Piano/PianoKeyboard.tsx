/**
 * 簡譜鋼琴應用程式 - 鋼琴鍵盤主元件
 * 
 * 本文件實作了完整的虛擬鋼琴鍵盤，包括白鍵和黑鍵的佈局管理、
 * 多點觸控支援、音頻播放整合以及響應式設計。
 * 是整個鋼琴應用程式的核心互動元件。
 * 
 * @author Claude Code
 * @version 1.0.0
 * @since 2025-08-31
 */

import React, { 
  memo, 
  useMemo, 
  useCallback, 
  useState, 
  useEffect,
  useRef 
} from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  GestureResponderEvent,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import type { 
  NoteId, 
  PianoKeyConfig, 
  KeyPressState,
  KeyboardInteractionEvent 
} from '../../types';

import { generateKeyboardLayout } from '../../utils/pianoLayout';
import { getThemeColors } from '../../utils/colorScheme';
import AudioService from '../../services/AudioService';

import WhiteKey from './WhiteKey';
import BlackKey from './BlackKey';

// ========== 元件 Props 介面 ==========

export interface PianoKeyboardProps {
  /** 是否顯示簡譜標記 */
  showSolfege?: boolean;
  
  /** 是否顯示音符名稱 */
  showNoteName?: boolean;
  
  /** 是否啟用音域顏色編碼 */
  useColorCoding?: boolean;
  
  /** 是否啟用觸覺回饋 */
  hapticFeedback?: boolean;
  
  /** 主音量 (0-1) */
  masterVolume?: number;
  
  /** 鍵盤互動事件回調 */
  onKeyboardInteraction?: (event: KeyboardInteractionEvent) => void;
  
  /** 音符開始播放回調 */
  onNoteStart?: (noteId: NoteId) => void;
  
  /** 音符停止播放回調 */
  onNoteEnd?: (noteId: NoteId) => void;
  
  /** 音頻錯誤回調 */
  onAudioError?: (error: string) => void;
  
  /** 自定義樣式 */
  style?: any;
}

// ========== 鋼琴鍵盤元件 ==========

/**
 * 鋼琴鍵盤主元件
 * 管理整個虛擬鋼琴鍵盤的佈局和互動
 */
const PianoKeyboard: React.FC<PianoKeyboardProps> = memo(({
  showSolfege = true,
  showNoteName = false,
  useColorCoding = true,
  hapticFeedback = true,
  masterVolume = 0.7,
  onKeyboardInteraction,
  onNoteStart,
  onNoteEnd,
  onAudioError,
  style,
}) => {
  // ========== Hooks ==========
  
  const colorScheme = useColorScheme();
  const audioService = useRef(AudioService).current;
  
  // 狀態管理
  const [keyboardLayout, setKeyboardLayout] = useState(generateKeyboardLayout());
  const [pressedKeys, setPressedKeys] = useState<Set<NoteId>>(new Set());
  const [keyboardDimensions, setKeyboardDimensions] = useState({ width: 0, height: 0 });
  const [isAudioReady, setIsAudioReady] = useState(false);
  
  // 動畫值
  const keyboardOpacity = useSharedValue(0);
  
  // ========== 初始化 ==========
  
  /**
   * 初始化音頻服務
   */
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const success = await audioService.initialize({
          masterVolume,
          envelope: {
            attack: 0.02,
            decay: 0.3,
            sustain: 0.7,
            release: 0.8,
          },
          filterFrequency: 8000,
        });
        
        if (success) {
          setIsAudioReady(true);
          keyboardOpacity.value = withSpring(1, { damping: 15 });
          
          // 註冊音頻事件監聽器
          audioService.addEventListener('noteStart', ({ noteId }) => {
            onNoteStart?.(noteId);
          });
          
          audioService.addEventListener('noteEnd', ({ noteId }) => {
            onNoteEnd?.(noteId);
          });
          
          audioService.addEventListener('error', ({ message }) => {
            onAudioError?.(message);
          });
          
        } else {
          throw new Error('音頻服務初始化失敗');
        }
      } catch (error) {
        console.error('PianoKeyboard 音頻初始化失敗:', error);
        onAudioError?.(`音頻初始化失敗: ${error}`);
      }
    };
    
    initializeAudio();
    
    // 清理函數
    return () => {
      audioService.stopAllNotes();
    };
  }, []);

  /**
   * 響應主音量變化
   */
  useEffect(() => {
    if (isAudioReady) {
      audioService.setMasterVolume(masterVolume);
    }
  }, [masterVolume, isAudioReady]);

  // ========== 佈局計算 ==========
  
  /**
   * 處理鍵盤佈局變化
   */
  const handleLayoutChange = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setKeyboardDimensions({ width, height });
    
    // 重新計算鍵盤佈局
    const newLayout = generateKeyboardLayout();
    setKeyboardLayout(newLayout);
  }, []);

  // ========== 互動事件處理 ==========
  
  /**
   * 處理琴鍵按下事件
   */
  const handleKeyPressIn = useCallback(async (noteId: NoteId, event: GestureResponderEvent) => {
    if (!isAudioReady) {
      console.warn('音頻服務尚未準備好');
      return;
    }
    
    // 更新按鍵狀態
    setPressedKeys(prev => new Set(prev).add(noteId));
    
    // 開始播放音符
    try {
      const velocity = 100; // 可以根據觸控壓力調整
      await audioService.startNote(noteId, velocity);
      
      // 發送鍵盤互動事件
      onKeyboardInteraction?.({
        type: 'keyDown',
        noteId,
        timestamp: Date.now(),
        position: {
          x: event.nativeEvent.locationX || 0,
          y: event.nativeEvent.locationY || 0,
        },
      });
      
    } catch (error) {
      console.error(`播放音符失敗: ${noteId}`, error);
      onAudioError?.(`播放音符失敗: ${error}`);
    }
  }, [isAudioReady, audioService, onKeyboardInteraction, onAudioError]);

  /**
   * 處理琴鍵釋放事件
   */
  const handleKeyPressOut = useCallback(async (noteId: NoteId, event: GestureResponderEvent) => {
    if (!isAudioReady) {
      return;
    }
    
    // 更新按鍵狀態
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(noteId);
      return newSet;
    });
    
    // 停止播放音符
    try {
      await audioService.stopNote(noteId);
      
      // 發送鍵盤互動事件
      onKeyboardInteraction?.({
        type: 'keyUp',
        noteId,
        timestamp: Date.now(),
        position: {
          x: event.nativeEvent.locationX || 0,
          y: event.nativeEvent.locationY || 0,
        },
      });
      
    } catch (error) {
      console.error(`停止音符失敗: ${noteId}`, error);
    }
  }, [isAudioReady, audioService, onKeyboardInteraction]);

  // ========== 樣式計算 ==========
  
  /**
   * 主題顏色
   */
  const themeColors = useMemo(() => getThemeColors(colorScheme), [colorScheme]);

  /**
   * 鍵盤容器動畫樣式
   */
  const animatedKeyboardStyle = useAnimatedStyle(() => ({
    opacity: keyboardOpacity.value,
  }));

  /**
   * 鍵盤容器樣式
   */
  const keyboardContainerStyle = useMemo(() => [
    styles.keyboardContainer,
    {
      backgroundColor: themeColors.background.primary,
    },
    style,
  ], [themeColors, style]);

  // ========== 渲染方法 ==========
  
  /**
   * 渲染單個琴鍵
   */
  const renderPianoKey = useCallback((keyConfig: PianoKeyConfig) => {
    const isPressed = pressedKeys.has(keyConfig.noteId);
    
    const keyProps = {
      keyConfig,
      width: keyConfig.keyType === 'white' ? keyboardLayout.whiteKeyWidth : keyboardLayout.blackKeyWidth,
      height: keyConfig.keyType === 'white' ? keyboardLayout.whiteKeyHeight : keyboardLayout.blackKeyHeight,
      isPressed,
      showSolfege,
      showNoteName,
      useColorCoding,
      hapticFeedback,
      onPressIn: handleKeyPressIn,
      onPressOut: handleKeyPressOut,
    };
    
    if (keyConfig.keyType === 'white') {
      return (
        <WhiteKey 
          key={keyConfig.noteId} 
          {...keyProps}
        />
      );
    } else {
      return (
        <BlackKey 
          key={keyConfig.noteId} 
          {...keyProps}
        />
      );
    }
  }, [
    pressedKeys, 
    keyboardLayout, 
    showSolfege, 
    showNoteName, 
    useColorCoding, 
    hapticFeedback,
    handleKeyPressIn,
    handleKeyPressOut
  ]);

  /**
   * 渲染白鍵層
   */
  const renderWhiteKeys = useMemo(() => {
    const whiteKeys = keyboardLayout.keys.filter(key => key.keyType === 'white');
    
    return (
      <View style={styles.whiteKeysContainer}>
        {whiteKeys.map(renderPianoKey)}
      </View>
    );
  }, [keyboardLayout, renderPianoKey]);

  /**
   * 渲染黑鍵層
   */
  const renderBlackKeys = useMemo(() => {
    const blackKeys = keyboardLayout.keys.filter(key => key.keyType === 'black');
    
    return (
      <View style={styles.blackKeysContainer}>
        {blackKeys.map((keyConfig, index) => {
          // 計算黑鍵的絕對位置
          const whiteKeysBefore = keyboardLayout.keys
            .slice(0, keyConfig.index)
            .filter(key => key.keyType === 'white').length;
          
          const leftPosition = (whiteKeysBefore * (keyboardLayout.whiteKeyWidth + 2)) 
            - (keyboardLayout.blackKeyWidth / 2) - 1;
          
          return (
            <View 
              key={keyConfig.noteId}
              style={[
                styles.blackKeyWrapper,
                {
                  left: leftPosition,
                  width: keyboardLayout.blackKeyWidth,
                  height: keyboardLayout.blackKeyHeight,
                }
              ]}
            >
              {renderPianoKey(keyConfig)}
            </View>
          );
        })}
      </View>
    );
  }, [keyboardLayout, renderPianoKey]);

  // ========== 主要渲染 ==========

  return (
    <Animated.View 
      style={[keyboardContainerStyle, animatedKeyboardStyle]}
      onLayout={handleLayoutChange}
    >
      {/* 白鍵層 */}
      {renderWhiteKeys}
      
      {/* 黑鍵層（覆蓋在白鍵上方）*/}
      {renderBlackKeys}
      
      {/* 載入指示器或錯誤狀態 */}
      {!isAudioReady && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingIndicator} />
        </View>
      )}
    </Animated.View>
  );
});

// ========== 樣式定義 ==========

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 15,
    // 鋼琴木紋背景效果
    backgroundColor: '#2C1810',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  whiteKeysContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    width: '100%',
    gap: 2,
  },
  
  blackKeysContainer: {
    position: 'absolute',
    top: 20,
    left: 10,
    right: 10,
    height: '65%', // 黑鍵高度為白鍵的65%
  },
  
  blackKeyWrapper: {
    position: 'absolute',
    top: 0,
  },
  
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
    // 這裡可以加入旋轉動畫
  },
});

// ========== 顯示名稱 ==========

PianoKeyboard.displayName = 'PianoKeyboard';

// ========== 導出元件 ==========

export default PianoKeyboard;