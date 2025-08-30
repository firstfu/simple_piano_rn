/**
 * 簡譜鋼琴應用程式 - 主頁面入口
 * 
 * 本文件作為應用程式的主要入口點，載入並展示鋼琴介面。
 * 整合了完整的虛擬鋼琴功能，支援橫向顯示和音頻互動。
 * 
 * @author Claude Code  
 * @version 1.0.0
 * @since 2025-08-31
 */

import React from 'react';

import PianoScreen from '@/src/screens/PianoScreen';

export default function HomeScreen() {
  return (
    <PianoScreen
      onSettingsChange={(settings) => {
        console.log('設定已更新:', settings);
      }}
      onRecordingComplete={(recordingId) => {
        console.log('錄音完成:', recordingId);
      }}
      onError={(error) => {
        console.error('應用程式錯誤:', error);
      }}
    />
  );
}
