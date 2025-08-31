/**
 * 簡譜鋼琴應用程式 - 音頻服務層
 * 
 * 本文件實作了完整的音頻處理服務，包括音頻上下文管理、
 * 音符播放、音量包絡處理、多點觸控支援等核心功能。
 * 使用 react-native-audio-api 提供高品質、低延遲的音頻體驗。
 * 
 * @author Claude Code
 * @version 1.0.0
 * @since 2025-08-31
 */

import { 
  AudioContext, 
  GainNode,
  BiquadFilterNode
} from 'react-native-audio-api';

import type { 
  NoteId, 
  PlayingNote, 
  AudioServiceConfig, 
  ErrorType
} from '../types';

import { PIANO_FREQUENCIES, isSupportedNote } from '../utils/noteFrequencies';

// ========== 類型定義 ==========

/**
 * 音頻服務事件類型
 */
export interface AudioServiceEvents {
  noteStart: { noteId: NoteId; timestamp: number };
  noteEnd: { noteId: NoteId; timestamp: number };
  error: { type: ErrorType; message: string };
  contextStateChange: { state: string };
}

/**
 * 音頻服務事件監聽器類型
 */
export type AudioServiceEventListener<T extends keyof AudioServiceEvents> = 
  (event: AudioServiceEvents[T]) => void;

// ========== 音頻服務類別 ==========

/**
 * 音頻服務單例類別
 * 負責管理整個應用程式的音頻功能
 */
export class AudioService {
  private static instance: AudioService | null = null;
  
  // 音頻上下文和節點
  private audioContext: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private compressorNode: GainNode | null = null; // 軟限幅器
  
  // 播放狀態管理
  private playingNotes: Map<NoteId, PlayingNote> = new Map();
  private isInitialized: boolean = false;
  
  // 配置參數 - 平衡音量和穩定性
  private config: AudioServiceConfig = {
    masterVolume: 0.4,  // 適度提高主音量
    envelope: {
      attack: 0.05,   // 50ms 起音時間
      decay: 0.2,     // 適中的衰減
      sustain: 0.7,   // 70% 維持音量
      release: 0.3,   // 300ms 釋放時間
    },
    filterFrequency: 4000, // 4kHz 濾波，保留更多高頻
  };
  
  // 事件監聽器
  private eventListeners: Map<keyof AudioServiceEvents, Set<Function>> = new Map();
  
  // 防崩潰機制
  private cleanupTimer: number | null = null;
  private lastCleanupTime: number = 0;

  // ========== 單例模式實作 ==========

  /**
   * 獲取音頻服務實例
   */
  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  /**
   * 私有建構函數，防止直接實例化
   */
  private constructor() {
    this.initializeEventListeners();
  }

  // ========== 初始化方法 ==========

  /**
   * 初始化音頻服務
   * 
   * @param config 可選的配置參數
   * @returns Promise<boolean> 是否初始化成功
   */
  public async initialize(config?: Partial<AudioServiceConfig>): Promise<boolean> {
    try {
      if (this.isInitialized) {
        console.log('AudioService 已經初始化');
        return true;
      }

      // 合併配置參數
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // 建立音頻上下文
      this.audioContext = new AudioContext();
      
      // 建立主音量節點
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.gain.value = this.config.masterVolume;
      
      // 建立替代的動態處理 - 使用額外增益節點進行軟限幅
      this.compressorNode = this.audioContext.createGain();
      this.compressorNode.gain.value = 0.8; // 輕微降低增益以防止峰值
      
      // 建立低通濾波器（去除高頻噪音）
      this.filterNode = this.audioContext.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = this.config.filterFrequency;
      this.filterNode.Q.value = 0.8; // 降低 Q 值，避免共振峰
      
      // 簡化連接：主音量 → 軟限幅器 → 濾波器 → 輸出
      this.masterGainNode.connect(this.compressorNode);
      this.compressorNode.connect(this.filterNode);
      this.filterNode.connect(this.audioContext.destination);

      this.isInitialized = true;
      
      // 啟動定期清理機制防止記憶體洩漏
      this.startPeriodicCleanup();
      
      console.log('AudioService 初始化成功');
      this.emit('contextStateChange', { state: this.audioContext.state });
      
      return true;
      
    } catch (error) {
      console.error('AudioService 初始化失敗:', error);
      this.emit('error', { 
        type: 'AUDIO_INIT_FAILED' as ErrorType, 
        message: `音頻服務初始化失敗: ${error}` 
      });
      return false;
    }
  }

  /**
   * 初始化事件監聽器映射
   */
  private initializeEventListeners(): void {
    const eventTypes: (keyof AudioServiceEvents)[] = [
      'noteStart', 'noteEnd', 'error', 'contextStateChange'
    ];
    
    eventTypes.forEach(eventType => {
      this.eventListeners.set(eventType, new Set());
    });
  }


  // ========== 音符播放方法 ==========

  /**
   * 開始播放音符
   * 
   * @param noteId 音符ID
   * @param velocity 力度 (0-127)
   * @returns Promise<boolean> 是否開始播放成功
   */
  public async startNote(noteId: NoteId, velocity: number = 100): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.audioContext) {
        throw new Error('AudioService 未初始化');
      }

      if (!isSupportedNote(noteId)) {
        throw new Error(`不支援的音符: ${noteId}`);
      }

      // 適中的同時播放限制，平衡音量和穩定性
      const maxConcurrentNotes = 6; // 提高到 6 個
      if (this.playingNotes.size >= maxConcurrentNotes) {
        console.warn(`達到最大同時播放音符數量 (${maxConcurrentNotes})，忽略新音符: ${noteId}`);
        return false;
      }
      
      // 檢查 AudioContext 狀態
      if (!this.audioContext || this.audioContext.state === 'closed') {
        console.error('AudioContext 不可用或已關閉');
        return false;
      }

      // 如果該音符已在播放，強制停止並等待清理
      if (this.playingNotes.has(noteId)) {
        await this.stopNote(noteId);
        // 添加小延遲確保清理完成
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const frequency = PIANO_FREQUENCIES[noteId];
      const normalizedVelocity = Math.max(0.1, Math.min(1.0, velocity / 127));
      
      // 減少音量動態調整的影響
      const volumeReduction = Math.max(0.6, 1.0 - (this.playingNotes.size * 0.05)); // 更温和的調整
      
      // 使用單一振盪器避免音量疊加和複雜度
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const currentTime = this.audioContext.currentTime;
      
      // 設定振盪器
      oscillator.frequency.value = frequency;
      oscillator.type = 'triangle'; // 使用三角波，比正弦波豐富但比方波柔和
      
      // 實作 ADSR 包絡
      const { attack, decay, sustain } = this.config.envelope;
      const baseGain = normalizedVelocity * 0.15 * volumeReduction; // 適度提高基礎音量
      const peakGain = baseGain;
      const sustainGain = peakGain * sustain;
      
      // 設定 ADSR 包絡曲線 - 避免從 0 開始以防止數學錯誤
      gainNode.gain.setValueAtTime(0.001, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(peakGain, currentTime + attack);
      gainNode.gain.exponentialRampToValueAtTime(sustainGain, currentTime + attack + decay);
      
      // 連接音頻節點
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGainNode!);
      
      // 開始播放
      oscillator.start(currentTime);
      
      // 記錄播放狀態
      const playingNote: PlayingNote = {
        noteId,
        source: oscillator,
        gainNode,
        startTime: currentTime,
        state: 'playing'
      };
      
      this.playingNotes.set(noteId, playingNote);
      
      // 發送事件通知
      this.emit('noteStart', { noteId, timestamp: Date.now() });
      
      console.log(`開始播放音符: ${noteId} (${frequency}Hz), 音量比例: ${volumeReduction.toFixed(2)}`);
      return true;
      
    } catch (error) {
      console.error(`播放音符失敗: ${noteId}`, error);
      this.emit('error', { 
        type: 'AUDIO_PLAYBACK_FAILED' as ErrorType, 
        message: `播放音符失敗: ${error}` 
      });
      return false;
    }
  }

  /**
   * 停止播放音符
   * 
   * @param noteId 音符ID
   * @returns Promise<boolean> 是否停止播放成功
   */
  public async stopNote(noteId: NoteId): Promise<boolean> {
    try {
      const playingNote = this.playingNotes.get(noteId);
      
      if (!playingNote || !this.audioContext) {
        return false; // 音符未在播放
      }

      // 如果已經在停止狀態，避免重複處理
      if (playingNote.state === 'stopping') {
        return true;
      }

      const currentTime = this.audioContext.currentTime;
      
      // 標記為停止狀態
      playingNote.state = 'stopping';
      
      // 簡化的釋音處理，直接停止
      try {
        // 直接停止振盪器，不使用複雜的淡出
        playingNote.source.stop(currentTime);
      } catch (stopError) {
        // 如果節點已經停止，忽略錯誤
        console.warn(`振盪器停止失敗: ${noteId}`, stopError);
      }
      
      // 立即清理播放狀態
      this.playingNotes.delete(noteId);
      
      // 直接發送事件，不使用 setTimeout
      this.emit('noteEnd', { noteId, timestamp: Date.now() });
      
      console.log(`停止播放音符: ${noteId}`);
      return true;
      
    } catch (error) {
      console.error(`停止音符播放失敗: ${noteId}`, error);
      // 強制清理狀態
      this.playingNotes.delete(noteId);
      this.emit('error', { 
        type: 'AUDIO_PLAYBACK_FAILED' as ErrorType, 
        message: `停止音符播放失敗: ${error}` 
      });
      return false;
    }
  }

  /**
   * 停止所有正在播放的音符
   * 
   * @returns Promise<void>
   */
  public async stopAllNotes(): Promise<void> {
    const promises = Array.from(this.playingNotes.keys()).map(noteId => 
      this.stopNote(noteId)
    );
    
    await Promise.all(promises);
  }

  // ========== 音頻配置管理 ==========

  /**
   * 設定主音量
   * 
   * @param volume 音量 (0-1)
   */
  public setMasterVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.config.masterVolume = clampedVolume;
    
    if (this.masterGainNode) {
      const currentTime = this.audioContext?.currentTime || 0;
      this.masterGainNode.gain.linearRampToValueAtTime(clampedVolume, currentTime + 0.1);
    }
  }

  /**
   * 獲取主音量
   * 
   * @returns 當前主音量
   */
  public getMasterVolume(): number {
    return this.config.masterVolume;
  }

  /**
   * 設定音量包絡參數
   * 
   * @param envelope 包絡參數
   */
  public setEnvelope(envelope: Partial<AudioServiceConfig['envelope']>): void {
    this.config.envelope = { ...this.config.envelope, ...envelope };
  }

  /**
   * 獲取音量包絡參數
   * 
   * @returns 當前包絡參數
   */
  public getEnvelope(): AudioServiceConfig['envelope'] {
    return { ...this.config.envelope };
  }

  /**
   * 設定濾波器頻率
   * 
   * @param frequency 濾波器頻率 (Hz)
   */
  public setFilterFrequency(frequency: number): void {
    const clampedFreq = Math.max(100, Math.min(20000, frequency));
    this.config.filterFrequency = clampedFreq;
    
    if (this.filterNode && this.audioContext) {
      const currentTime = this.audioContext.currentTime;
      this.filterNode.frequency.linearRampToValueAtTime(clampedFreq, currentTime + 0.1);
    }
  }

  // ========== 狀態查詢方法 ==========

  /**
   * 檢查音頻服務是否已初始化
   * 
   * @returns 是否已初始化
   */
  public isReady(): boolean {
    return this.isInitialized && this.audioContext !== null;
  }

  /**
   * 獲取正在播放的音符列表
   * 
   * @returns 正在播放的音符ID數組
   */
  public getPlayingNotes(): NoteId[] {
    return Array.from(this.playingNotes.keys());
  }

  /**
   * 檢查特定音符是否正在播放
   * 
   * @param noteId 音符ID
   * @returns 是否正在播放
   */
  public isNotePlaying(noteId: NoteId): boolean {
    const playingNote = this.playingNotes.get(noteId);
    return playingNote?.state === 'playing';
  }

  /**
   * 獲取音頻上下文狀態
   * 
   * @returns 音頻上下文狀態
   */
  public getAudioContextState(): string {
    return this.audioContext?.state || 'suspended';
  }

  // ========== 事件管理方法 ==========

  /**
   * 註冊事件監聽器
   * 
   * @param eventType 事件類型
   * @param listener 監聽器函數
   */
  public addEventListener<T extends keyof AudioServiceEvents>(
    eventType: T, 
    listener: AudioServiceEventListener<T>
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * 移除事件監聽器
   * 
   * @param eventType 事件類型
   * @param listener 監聽器函數
   */
  public removeEventListener<T extends keyof AudioServiceEvents>(
    eventType: T, 
    listener: AudioServiceEventListener<T>
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 發送事件
   * 
   * @param eventType 事件類型
   * @param eventData 事件資料
   */
  private emit<T extends keyof AudioServiceEvents>(
    eventType: T, 
    eventData: AudioServiceEvents[T]
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          (listener as AudioServiceEventListener<T>)(eventData);
        } catch (error) {
          console.error(`事件監聽器執行失敗: ${eventType}`, error);
        }
      });
    }
  }

  // ========== 防崩潰和清理方法 ==========

  /**
   * 啟動定期清理機制
   */
  private startPeriodicCleanup(): void {
    // 每 10 秒檢查一次是否需要清理
    this.cleanupTimer = setInterval(() => {
      this.performPeriodicCleanup();
    }, 10000);
  }

  /**
   * 執行定期清理
   */
  private performPeriodicCleanup(): void {
    try {
      const now = Date.now();
      
      // 如果超過 30 秒沒有清理過，執行清理
      if (now - this.lastCleanupTime > 30000) {
        console.log('執行定期清理...');
        
        // 檢查並清理過期的播放狀態
        const staleNotes: NoteId[] = [];
        this.playingNotes.forEach((playingNote, noteId) => {
          // 如果音符播放超過 10 秒，視為異常
          if (now - playingNote.startTime * 1000 > 10000) {
            staleNotes.push(noteId);
          }
        });
        
        // 清理過期音符
        staleNotes.forEach(noteId => {
          console.warn(`清理過期音符: ${noteId}`);
          try {
            const playingNote = this.playingNotes.get(noteId);
            if (playingNote) {
              playingNote.source.stop();
            }
          } catch (error) {
            console.warn(`清理過期音符失敗: ${noteId}`, error);
          }
          this.playingNotes.delete(noteId);
        });
        
        this.lastCleanupTime = now;
        console.log(`定期清理完成，當前播放音符數量: ${this.playingNotes.size}`);
      }
    } catch (error) {
      console.error('定期清理失敗:', error);
    }
  }

  // ========== 清理方法 ==========

  /**
   * 銷毀音頻服務，釋放所有資源
   * 
   * @returns Promise<void>
   */
  public async destroy(): Promise<void> {
    try {
      // 停止所有播放中的音符
      await this.stopAllNotes();
      
      // 關閉音頻上下文
      if (this.audioContext) {
        await this.audioContext.close();
      }
      
      // 清理狀態
      this.audioContext = null;
      this.masterGainNode = null;
      this.filterNode = null;
      this.compressorNode = null;
      this.playingNotes.clear();
      this.isInitialized = false;
      
      // 清理定期清理 timer
      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
        this.cleanupTimer = null;
      }
      
      // 清理事件監聽器
      this.eventListeners.forEach(listeners => listeners.clear());
      
      // 重置單例
      AudioService.instance = null;
      
      console.log('AudioService 已銷毀');
      
    } catch (error) {
      console.error('AudioService 銷毀失敗:', error);
    }
  }
}

// ========== 導出服務實例 ==========

/**
 * 導出音頻服務單例實例
 */
export default AudioService.getInstance();