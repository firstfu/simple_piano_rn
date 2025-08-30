# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

這是一個基於 React Native Expo 的手機應用程式專案，專門開發**簡譜鋼琴應用**。應用程式提供完整的虛擬鋼琴功能，包括：

- **橫向鋼琴鍵盤**: 支援 C3-C6 共 37 鍵的完整鋼琴佈局
- **簡譜標記系統**: 顯示 Do, Re, Mi, Fa, Sol, La, Si 簡譜標記
- **音域顏色編碼**: 低音區(紅色)、中音區(青綠色)、高音區(藍色)
- **高品質音頻**: 使用 react-native-audio-api 實現低延遲音頻合成
- **錄音功能**: 支援演奏錄音與播放
- **觸覺回饋**: 提供真實的按鍵觸感體驗

專案使用 Expo Router 進行檔案路由，支援 iOS、Android 和 Web 平台。

## 常用開發命令

### 啟動和開發
```bash
npm install          # 安裝依賴套件
npx expo start       # 啟動開發伺服器
npm run ios          # 在 iOS 模擬器中啟動
npm run android      # 在 Android 模擬器中啟動
npm run web          # 在網頁瀏覽器中啟動
```

### 程式碼品質
```bash
npm run lint         # 執行 ESLint 檢查
```

### 專案重置
```bash
npm run reset-project  # 將範例程式碼移至 app-example，建立空白 app 目錄
```

## 架構和程式碼結構

### 主要目錄結構
- `/app/` - 主要應用程式邏輯，使用 Expo Router 的檔案路由系統
- `/app/(tabs)/` - Tab 導覽頁面
- `/src/` - **核心功能模組**
  - `/src/components/Piano/` - **鋼琴鍵盤元件**
    - `PianoKeyboard.tsx` - 主鍵盤容器
    - `PianoKey.tsx` - 基礎琴鍵元件  
    - `WhiteKey.tsx` - 白鍵專用元件
    - `BlackKey.tsx` - 黑鍵專用元件
  - `/src/components/Controls/` - **控制介面元件**
    - `RecordButton.tsx` - 錄音按鈕
    - `Timer.tsx` - 計時器顯示
  - `/src/components/UI/` - **UI 介面元件**
    - `TopBar.tsx` - 頂部工具列
  - `/src/screens/` - **應用程式畫面**
    - `PianoScreen.tsx` - 主鋼琴畫面
  - `/src/services/` - **核心服務層**
    - `AudioService.ts` - 音頻處理服務
  - `/src/utils/` - **工具函數**
    - `noteFrequencies.ts` - 音符頻率對照表
    - `pianoLayout.ts` - 鋼琴佈局計算
    - `colorScheme.ts` - 顏色主題系統
  - `/src/types/` - **TypeScript 類型定義**
- `/components/` - 原 Expo 範例元件
- `/constants/` - 常數定義（如 Colors.ts）
- `/assets/` - 靜態資源（圖片、字體等）
- `/docs/` - **專案文件**
  - `prd.md` - 產品需求文件
  - `todo.md` - 待辦事項清單

### 重要配置文件
- `app.json` - Expo 配置檔案
- `tsconfig.json` - TypeScript 配置，使用 `@/` 作為根目錄別名
- `package.json` - 專案依賴和腳本

### 主題系統
專案實作了深色/淺色主題切換系統：
- 使用 `useColorScheme` Hook 來偵測當前主題
- `Constants/Colors.ts` 定義主題色彩
- `ThemedText` 和 `ThemedView` 元件提供主題適配

### 導覽結構
- 使用 Expo Router 和 React Navigation 的 Tab 系統
- 主要 Tab：Home (index) 和 Explore
- 支援 iOS 的毛玻璃效果和觸覺反饋

## 開發注意事項

### TypeScript 支援
- 專案完全使用 TypeScript
- 開啟 strict 模式
- 使用 `@/` 路徑別名指向專案根目錄

### 跨平台開發
- 支援 iOS、Android 和 Web 三個平台
- 針對不同平台有特定的元件檔案（如 `.ios.tsx`）
- 使用 React Native 的 Platform API 進行平台特定邏輯

### Expo 功能
- 啟用新架構 (New Architecture)
- 支援 typed routes
- 包含 expo-haptics、expo-blur 等原生功能支援

### 依賴關係
專案使用 React 19 和 React Native 0.79.6，搭配最新的 Expo SDK 53。主要依賴包括：

**核心框架:**
- Expo Router 用於檔案路由
- React Navigation 用於導覽
- React Native Reanimated 用於動畫效果

**音頻處理:**
- `react-native-audio-api` - 高品質音頻合成與處理
- `expo-haptics` - 觸覺回饋支援

**UI 增強:**
- `react-native-svg` - SVG 圖形支援
- `expo-screen-orientation` - 螢幕方向控制
- `@react-native-async-storage/async-storage` - 本地儲存

**其他 Expo 功能模組:**
- `expo-blur` - 毛玻璃效果
- `expo-constants` - 應用常數
- `expo-font` - 字體載入
- `expo-status-bar` - 狀態列控制

## 已完成功能 (v1.0)

✅ **專案基礎架構**
- 完整的 TypeScript 專案結構
- 模組化的元件架構設計
- 完善的類型定義系統

✅ **核心音頻系統**
- 高品質音頻合成引擎 (AudioService)
- 標準 440Hz A4 調音系統
- ADSR 音量包絡處理
- 低延遲音頻響應 (< 50ms)
- 多點觸控音符播放支援

✅ **鋼琴鍵盤介面**
- C3-C6 完整三八度音域 (37鍵)
- 標準鋼琴鍵佈局 (21白鍵 + 16黑鍵)
- 簡譜標記系統 (Do, Re, Mi...)
- 音域顏色編碼 (低/中/高音區)
- 響應式鍵盤佈局適配

✅ **使用者介面**
- 強制橫向顯示模式
- 深色主題設計
- 頂部工具列與控制面板
- 錄音按鈕與計時器
- 觸覺回饋支援

✅ **互動體驗**
- 流暢的按鍵動畫效果
- 真實的觸控回饋
- 視覺化音域指示
- 優雅的入場動畫

## 完成 todo 功能時的更新流程

每完成一個 todo 功能時，需將 docs/todo.md 裡面對應的功能標記為已完成。