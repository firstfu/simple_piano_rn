/**
 * 簡譜鋼琴應用程式 - 簡化版鋼琴鍵盤元件
 * 
 * 本文件實作了一個簡化版本的鋼琴鍵盤，專注於基本功能的正常運作，
 * 確保琴鍵能正確顯示和響應觸控事件。
 * 
 * @author Claude Code
 * @version 1.0.0
 * @since 2025-08-31
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';

import type { NoteId, PianoKeyConfig } from '../../types';
import { generateKeyboardLayout } from '../../utils/pianoLayout';
import { getThemeColors, PITCH_RANGE_COLORS } from '../../utils/colorScheme';
import AudioService from '../../services/AudioService';

// ========== 簡化鍵盤元件 Props ==========

export interface SimplePianoKeyboardProps {
  onNoteStart?: (noteId: NoteId) => void;
  onNoteEnd?: (noteId: NoteId) => void;
  onError?: (error: string) => void;
}

// ========== 簡化鍵盤元件 ==========

const SimplePianoKeyboard: React.FC<SimplePianoKeyboardProps> = ({
  onNoteStart,
  onNoteEnd,
  onError,
}) => {
  // ========== 狀態管理 ==========
  
  const colorScheme = useColorScheme();
  const [keyboardLayout, setKeyboardLayout] = useState(generateKeyboardLayout());
  const [pressedKeys, setPressedKeys] = useState<Set<NoteId>>(new Set());
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // ========== 音頻初始化 ==========
  
  useEffect(() => {
    const initAudio = async () => {
      try {
        const audioService = AudioService;
        const success = await audioService.initialize();
        setIsAudioReady(success);
        
        if (!success) {
          onError?.('音頻服務初始化失敗');
        }
      } catch (error) {
        console.error('音頻初始化錯誤:', error);
        onError?.(`音頻初始化錯誤: ${error}`);
      }
    };
    
    initAudio();
  }, [onError]);

  // ========== 佈局處理 ==========
  
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    
    if (width > 0 && height > 0) {
      setContainerSize({ width, height });
      const newLayout = generateKeyboardLayout(width, height);
      setKeyboardLayout(newLayout);
    }
  }, []);

  // ========== 琴鍵互動 ==========
  
  const handleKeyPress = useCallback(async (noteId: NoteId) => {
    if (!isAudioReady) return;
    
    setPressedKeys(prev => new Set(prev).add(noteId));
    
    try {
      const audioService = AudioService;
      await audioService.startNote(noteId);
      onNoteStart?.(noteId);
    } catch (error) {
      console.error(`播放音符失敗: ${noteId}`, error);
      onError?.(`播放音符失敗: ${error}`);
    }
  }, [isAudioReady, onNoteStart, onError]);

  const handleKeyRelease = useCallback(async (noteId: NoteId) => {
    if (!isAudioReady) return;
    
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(noteId);
      return newSet;
    });
    
    try {
      const audioService = AudioService;
      await audioService.stopNote(noteId);
      onNoteEnd?.(noteId);
    } catch (error) {
      console.error(`停止音符失敗: ${noteId}`, error);
    }
  }, [isAudioReady, onNoteEnd]);

  // ========== 樣式計算 ==========
  
  const themeColors = getThemeColors(colorScheme);

  const getKeyStyle = (keyConfig: PianoKeyConfig, isPressed: boolean) => {
    const { keyType, pitchRange } = keyConfig;
    
    if (keyType === 'white') {
      const pitchColors = PITCH_RANGE_COLORS[pitchRange];
      return [
        styles.whiteKey,
        {
          width: keyboardLayout.whiteKeyWidth,
          height: keyboardLayout.whiteKeyHeight,
          backgroundColor: isPressed ? pitchColors.secondary : pitchColors.primary,
          borderColor: pitchColors.accent,
        }
      ];
    } else {
      return [
        styles.blackKey,
        {
          width: keyboardLayout.blackKeyWidth,
          height: keyboardLayout.blackKeyHeight,
          backgroundColor: isPressed ? '#555555' : '#333333',
        }
      ];
    }
  };

  // ========== 渲染琴鍵 ==========
  
  const renderPianoKey = (keyConfig: PianoKeyConfig) => {
    const isPressed = pressedKeys.has(keyConfig.noteId);
    const keyStyle = getKeyStyle(keyConfig, isPressed);
    
    return (
      <TouchableOpacity
        key={keyConfig.noteId}
        style={keyStyle}
        onPressIn={() => handleKeyPress(keyConfig.noteId)}
        onPressOut={() => handleKeyRelease(keyConfig.noteId)}
        activeOpacity={0.7}
      >
        <View style={styles.keyContent}>
          <Text style={[
            styles.keyLabel,
            { color: keyConfig.keyType === 'white' ? '#FFFFFF' : '#FFFFFF' }
          ]}>
            {keyConfig.solfege}
          </Text>
          <Text style={[
            styles.noteLabel,
            { color: keyConfig.keyType === 'white' ? '#FFFFFF' : '#CCCCCC' }
          ]}>
            {keyConfig.noteName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ========== 渲染鍵盤 ==========
  
  const renderWhiteKeys = () => {
    const whiteKeys = keyboardLayout.keys.filter(key => key.keyType === 'white');
    return (
      <View style={styles.whiteKeysContainer}>
        {whiteKeys.map(renderPianoKey)}
      </View>
    );
  };

  const renderBlackKeys = () => {
    const blackKeys = keyboardLayout.keys.filter(key => key.keyType === 'black');
    
    return (
      <View style={styles.blackKeysContainer}>
        {blackKeys.map((keyConfig) => {
          // 簡化的黑鍵位置計算
          const whiteKeysBefore = keyboardLayout.keys
            .slice(0, keyConfig.index)
            .filter(key => key.keyType === 'white').length;
          
          const leftPosition = (whiteKeysBefore * (keyboardLayout.whiteKeyWidth + 2)) 
            - (keyboardLayout.blackKeyWidth / 2);
          
          return (
            <View
              key={keyConfig.noteId}
              style={[
                styles.blackKeyWrapper,
                {
                  left: Math.max(0, leftPosition),
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
  };

  // ========== 主要渲染 ==========

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background.primary }]} onLayout={handleLayout}>
      {containerSize.width > 0 && containerSize.height > 0 ? (
        <>
          {/* 白鍵層 */}
          {renderWhiteKeys()}
          
          {/* 黑鍵層 */}
          {renderBlackKeys()}
          
          {/* 狀態指示 */}
          {!isAudioReady && (
            <View style={styles.statusOverlay}>
              <Text style={{ color: themeColors.text.primary }}>
                音頻載入中...
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={{ color: themeColors.text.primary }}>
            鍵盤載入中...
          </Text>
        </View>
      )}
    </View>
  );
};

// ========== 樣式定義 ==========

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  
  whiteKeysContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  
  blackKeysContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    height: '65%',
  },
  
  blackKeyWrapper: {
    position: 'absolute',
    top: 0,
  },
  
  whiteKey: {
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  blackKey: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#222222',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 6,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowColor: '#000000',
  },
  
  keyContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  keyLabel: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  noteLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  statusOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default SimplePianoKeyboard;