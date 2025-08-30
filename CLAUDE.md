# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

這是一個基於 React Native Expo 的手機應用程式專案，專門用於開發簡易鋼琴應用。專案使用 Expo Router 進行檔案路由，支援 iOS、Android 和 Web 平台。

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
- `/components/` - 可重用的 React 元件
- `/components/ui/` - UI 專用元件
- `/hooks/` - 自訂 React Hooks
- `/constants/` - 常數定義（如 Colors.ts）
- `/assets/` - 靜態資源（圖片、字體等）

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
- Expo Router 用於檔案路由
- React Navigation 用於導覽
- Expo 各種原生功能模組

## 完成 todo 功能時的更新流程

每完成一個 todo 功能時，需將 docs/todo.md 裡面對應的功能標記為已完成。