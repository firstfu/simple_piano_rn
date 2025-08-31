/**
 * 簡譜鋼琴應用程式 - TypeScript 類型定義文件
 * 
 * 本文件定義了整個應用程式中使用的所有類型介面，
 * 包括音頻處理、鍵盤佈局、錄音系統等核心功能的類型規範。
 * 
 * @author Claude Code
 * @version 1.0.0
 * @since 2025-08-31
 */

// ========== 音符與音頻相關類型 ==========

/**
 * 音符名稱類型
 * 包含標準的西方音樂音符名稱
 */
export type NoteName = 
  | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' 
  | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

/**
 * 簡譜標記類型
 * 對應 1, 2, 3, 4, 5, 6, 7 七個音級數字
 */
export type SolfegeNote = 
  | '1' | '2' | '3' | '4' | '5' | '6' | '7';

/**
 * 音符完整標識類型
 * 結合音符名稱和八度音高，例如 'C4', 'A#3'
 */
export type NoteId = `${NoteName}${number}`;

/**
 * 琴鍵類型
 * 區分白鍵和黑鍵
 */
export type KeyType = 'white' | 'black';

/**
 * 音域範圍類型
 * 用於區分低音、中音、高音區域
 */
export type PitchRange = 'low' | 'middle' | 'high';

// ========== 鍵盤佈局相關類型 ==========

/**
 * 琴鍵配置介面
 * 定義每個琴鍵的基本屬性
 */
export interface PianoKeyConfig {
  /** 音符標識 */
  noteId: NoteId;
  /** 音符名稱 */
  noteName: NoteName;
  /** 簡譜標記 */
  solfege: SolfegeNote;
  /** 琴鍵類型 */
  keyType: KeyType;
  /** 音域範圍 */
  pitchRange: PitchRange;
  /** 頻率 (Hz) */
  frequency: number;
  /** 顯示顏色 */
  color: string;
  /** 在鍵盤中的位置索引 */
  index: number;
}

/**
 * 鍵盤佈局配置介面
 * 定義整個鍵盤的佈局參數
 */
export interface KeyboardLayout {
  /** 所有琴鍵配置 */
  keys: PianoKeyConfig[];
  /** 鍵盤總寬度 */
  totalWidth: number;
  /** 白鍵寬度 */
  whiteKeyWidth: number;
  /** 白鍵高度 */
  whiteKeyHeight: number;
  /** 黑鍵寬度 */
  blackKeyWidth: number;
  /** 黑鍵高度 */
  blackKeyHeight: number;
}

// ========== 音頻服務相關類型 ==========

/**
 * 音頻節點狀態類型
 */
export type AudioNodeState = 'idle' | 'playing' | 'stopping';

/**
 * 播放中的音符介面
 * 追蹤正在播放的音符狀態
 */
export interface PlayingNote {
  /** 音符標識 */
  noteId: NoteId;
  /** 音頻源節點 */
  source: any; // OscillatorNode from react-native-audio-api
  /** 音量包絡節點 */
  gainNode: any; // GainNode from react-native-audio-api
  /** 開始播放時間 */
  startTime: number;
  /** 節點狀態 */
  state: AudioNodeState;
}

/**
 * 音頻服務配置介面
 */
export interface AudioServiceConfig {
  /** 主音量 (0-1) */
  masterVolume: number;
  /** 音量包絡設置 */
  envelope: {
    attack: number;   // 起音時間
    decay: number;    // 衰減時間
    sustain: number;  // 維持音量
    release: number;  // 釋音時間
  };
  /** 低通濾波器頻率 */
  filterFrequency: number;
}

// ========== 錄音系統相關類型 ==========

/**
 * MIDI 事件類型
 */
export type MidiEventType = 'noteOn' | 'noteOff';

/**
 * MIDI 事件介面
 * 記錄鍵盤操作的時序資訊
 */
export interface MidiEvent {
  /** 事件類型 */
  type: MidiEventType;
  /** 音符標識 */
  noteId: NoteId;
  /** 事件時間戳 (相對於錄音開始) */
  timestamp: number;
  /** 按鍵力度 (0-127) */
  velocity: number;
}

/**
 * 錄音資料介面
 */
export interface RecordingData {
  /** 錄音唯一標識 */
  id: string;
  /** 錄音名稱 */
  name: string;
  /** 錄音時長 (毫秒) */
  duration: number;
  /** MIDI 事件序列 */
  events: MidiEvent[];
  /** 創建時間 */
  createdAt: Date;
  /** 最後修改時間 */
  updatedAt: Date;
}

/**
 * 錄音狀態類型
 */
export type RecordingState = 'idle' | 'recording' | 'paused' | 'playing';

/**
 * 錄音服務狀態介面
 */
export interface RecordingServiceState {
  /** 當前錄音狀態 */
  state: RecordingState;
  /** 當前錄音資料 */
  currentRecording: RecordingData | null;
  /** 錄音開始時間 */
  startTime: number;
  /** 已錄製時長 */
  elapsedTime: number;
}

// ========== 播放控制相關類型 ==========

/**
 * 播放狀態類型
 */
export type PlaybackState = 'idle' | 'playing' | 'paused' | 'stopped';

/**
 * 播放控制介面
 */
export interface PlaybackControl {
  /** 播放狀態 */
  state: PlaybackState;
  /** 當前播放進度 (0-1) */
  progress: number;
  /** 播放速度倍數 */
  speed: number;
  /** 是否循環播放 */
  loop: boolean;
}

// ========== UI 組件相關類型 ==========

/**
 * 琴鍵按壓狀態
 */
export interface KeyPressState {
  /** 是否被按下 */
  isPressed: boolean;
  /** 按下時間戳 */
  pressTimestamp: number;
  /** 按下力度 */
  pressure: number;
}

/**
 * 鍵盤互動事件介面
 */
export interface KeyboardInteractionEvent {
  /** 事件類型 */
  type: 'keyDown' | 'keyUp';
  /** 音符標識 */
  noteId: NoteId;
  /** 事件時間戳 */
  timestamp: number;
  /** 觸控位置 */
  position: {
    x: number;
    y: number;
  };
}

// ========== 應用程式設置相關類型 ==========

/**
 * 應用程式主題類型
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * 音色類型
 */
export type SoundType = 'piano' | 'electricPiano' | 'organ' | 'synthesizer';

/**
 * 應用程式設置介面
 */
export interface AppSettings {
  /** 主題模式 */
  theme: ThemeMode;
  /** 主音量 */
  masterVolume: number;
  /** 選擇的音色 */
  soundType: SoundType;
  /** 是否啟用觸覺反饋 */
  hapticFeedback: boolean;
  /** 是否顯示簡譜標記 */
  showSolfege: boolean;
  /** 是否顯示音符名稱 */
  showNoteNames: boolean;
  /** 是否啟用音域顏色編碼 */
  colorCoding: boolean;
}

// ========== 錯誤處理相關類型 ==========

/**
 * 錯誤類型枚舉
 */
export enum ErrorType {
  AUDIO_INIT_FAILED = 'AUDIO_INIT_FAILED',
  AUDIO_PLAYBACK_FAILED = 'AUDIO_PLAYBACK_FAILED',
  RECORDING_FAILED = 'RECORDING_FAILED',
  STORAGE_FAILED = 'STORAGE_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 應用程式錯誤介面
 */
export interface AppError {
  /** 錯誤類型 */
  type: ErrorType;
  /** 錯誤訊息 */
  message: string;
  /** 錯誤詳情 */
  details?: any;
  /** 發生時間 */
  timestamp: Date;
}

// ========== 輔助工具類型 ==========

/**
 * 回調函數類型
 */
export type Callback<T = void> = (data: T) => void;

/**
 * 非同步回調函數類型
 */
export type AsyncCallback<T = void> = (data: T) => Promise<void>;

/**
 * 事件監聽器類型
 */
export type EventListener<T = any> = (event: T) => void;

/**
 * 清理函數類型
 */
export type CleanupFunction = () => void;