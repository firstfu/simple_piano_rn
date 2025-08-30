/**
 * 簡譜鋼琴應用程式 - 音符頻率對照表
 * 
 * 本文件包含標準音樂音符的頻率對照表和相關的音樂理論計算工具，
 * 基於等程律調音系統，以 A4 = 440Hz 為基準音高。
 * 
 * @author Claude Code
 * @version 1.0.0
 * @since 2025-08-31
 */

import type { NoteName, NoteId, SolfegeNote } from '../types';

// ========== 基礎常數定義 ==========

/**
 * 基準音高頻率 (A4)
 * 國際標準調音 440Hz
 */
export const A4_FREQUENCY = 440;

/**
 * A4 音符在MIDI中的編號
 */
export const A4_MIDI_NUMBER = 69;

/**
 * 半音之間的頻率比例
 * 基於等程律調音系統的十二次方根
 */
export const SEMITONE_RATIO = Math.pow(2, 1/12);

// ========== 音符名稱映射 ==========

/**
 * 音符名稱到半音偏移量的映射
 * 以 C 為基準，計算其他音符相對於 C 的半音數
 */
export const NOTE_TO_SEMITONE_OFFSET: Record<NoteName, number> = {
  'C': 0,   // Do
  'C#': 1,  // Do#
  'D': 2,   // Re
  'D#': 3,  // Re#
  'E': 4,   // Mi
  'F': 5,   // Fa
  'F#': 6,  // Fa#
  'G': 7,   // Sol
  'G#': 8,  // Sol#
  'A': 9,   // La
  'A#': 10, // La#
  'B': 11,  // Si
};

/**
 * 音符名稱到簡譜標記的映射
 */
export const NOTE_TO_SOLFEGE: Record<NoteName, SolfegeNote> = {
  'C': 'Do',
  'C#': 'Do',   // #號音使用原音名
  'D': 'Re',
  'D#': 'Re',   // #號音使用原音名
  'E': 'Mi',
  'F': 'Fa',
  'F#': 'Fa',   // #號音使用原音名
  'G': 'Sol',
  'G#': 'Sol',  // #號音使用原音名
  'A': 'La',
  'A#': 'La',   // #號音使用原音名
  'B': 'Si',
};

/**
 * 簡譜標記到音符名稱的反向映射
 */
export const SOLFEGE_TO_NOTE: Record<SolfegeNote, NoteName> = {
  'Do': 'C',
  'Re': 'D',
  'Mi': 'E',
  'Fa': 'F',
  'Sol': 'G',
  'La': 'A',
  'Si': 'B',
};

// ========== 頻率計算函數 ==========

/**
 * 將音符名稱和八度轉換為MIDI音符編號
 * 
 * @param noteName 音符名稱 (C, C#, D, ...)
 * @param octave 八度數 (0-9)
 * @returns MIDI音符編號 (0-127)
 * 
 * @example
 * ```typescript
 * const midiNumber = noteToMidiNumber('A', 4); // 69
 * const midiNumber = noteToMidiNumber('C', 4); // 60
 * ```
 */
export function noteToMidiNumber(noteName: NoteName, octave: number): number {
  // C4 在MIDI中是60號
  const baseNote = 60; // C4
  const semitoneOffset = NOTE_TO_SEMITONE_OFFSET[noteName];
  const octaveOffset = (octave - 4) * 12;
  
  return baseNote + semitoneOffset + octaveOffset;
}

/**
 * 將MIDI音符編號轉換為頻率
 * 
 * @param midiNumber MIDI音符編號 (0-127)
 * @returns 頻率 (Hz)
 * 
 * @example
 * ```typescript
 * const frequency = midiNumberToFrequency(69); // 440 (A4)
 * const frequency = midiNumberToFrequency(60); // 261.626 (C4)
 * ```
 */
export function midiNumberToFrequency(midiNumber: number): number {
  // 基於 A4 = 440Hz 計算其他音符頻率
  const semitonesFromA4 = midiNumber - A4_MIDI_NUMBER;
  return A4_FREQUENCY * Math.pow(SEMITONE_RATIO, semitonesFromA4);
}

/**
 * 直接計算音符頻率
 * 
 * @param noteName 音符名稱
 * @param octave 八度數
 * @returns 頻率 (Hz)
 * 
 * @example
 * ```typescript
 * const frequency = calculateNoteFrequency('A', 4); // 440
 * const frequency = calculateNoteFrequency('C', 4); // 261.626
 * ```
 */
export function calculateNoteFrequency(noteName: NoteName, octave: number): number {
  const midiNumber = noteToMidiNumber(noteName, octave);
  return midiNumberToFrequency(midiNumber);
}

/**
 * 解析音符ID字符串為音符名稱和八度
 * 
 * @param noteId 音符ID (例如: "C4", "F#3")
 * @returns 解析結果 {noteName, octave}
 * 
 * @example
 * ```typescript
 * const result = parseNoteId('C4'); // {noteName: 'C', octave: 4}
 * const result = parseNoteId('F#3'); // {noteName: 'F#', octave: 3}
 * ```
 */
export function parseNoteId(noteId: NoteId): {noteName: NoteName, octave: number} {
  // 使用正則表達式解析音符ID
  const match = noteId.match(/^([A-G]#?)(\d+)$/);
  
  if (!match) {
    throw new Error(`無效的音符ID: ${noteId}`);
  }
  
  const noteName = match[1] as NoteName;
  const octave = parseInt(match[2], 10);
  
  return { noteName, octave };
}

/**
 * 從音符ID獲取頻率
 * 
 * @param noteId 音符ID (例如: "C4", "A4")
 * @returns 頻率 (Hz)
 * 
 * @example
 * ```typescript
 * const frequency = getNoteFrequency('A4'); // 440
 * const frequency = getNoteFrequency('C4'); // 261.626
 * ```
 */
export function getNoteFrequency(noteId: NoteId): number {
  const { noteName, octave } = parseNoteId(noteId);
  return calculateNoteFrequency(noteName, octave);
}

// ========== 預定義頻率表 ==========

/**
 * 鋼琴應用程式使用的音域範圍 (C3-C6)
 * 預先計算所有音符的頻率以提升性能
 */
export const PIANO_FREQUENCIES: Record<NoteId, number> = {
  // 第3八度 (低音區)
  'C3': calculateNoteFrequency('C', 3),   // 130.813
  'C#3': calculateNoteFrequency('C#', 3), // 138.591
  'D3': calculateNoteFrequency('D', 3),   // 146.832
  'D#3': calculateNoteFrequency('D#', 3), // 155.563
  'E3': calculateNoteFrequency('E', 3),   // 164.814
  'F3': calculateNoteFrequency('F', 3),   // 174.614
  'F#3': calculateNoteFrequency('F#', 3), // 184.997
  'G3': calculateNoteFrequency('G', 3),   // 195.998
  'G#3': calculateNoteFrequency('G#', 3), // 207.652
  'A3': calculateNoteFrequency('A', 3),   // 220.000
  'A#3': calculateNoteFrequency('A#', 3), // 233.082
  'B3': calculateNoteFrequency('B', 3),   // 246.942
  
  // 第4八度 (中音區)
  'C4': calculateNoteFrequency('C', 4),   // 261.626
  'C#4': calculateNoteFrequency('C#', 4), // 277.183
  'D4': calculateNoteFrequency('D', 4),   // 293.665
  'D#4': calculateNoteFrequency('D#', 4), // 311.127
  'E4': calculateNoteFrequency('E', 4),   // 329.628
  'F4': calculateNoteFrequency('F', 4),   // 349.228
  'F#4': calculateNoteFrequency('F#', 4), // 369.994
  'G4': calculateNoteFrequency('G', 4),   // 391.995
  'G#4': calculateNoteFrequency('G#', 4), // 415.305
  'A4': calculateNoteFrequency('A', 4),   // 440.000
  'A#4': calculateNoteFrequency('A#', 4), // 466.164
  'B4': calculateNoteFrequency('B', 4),   // 493.883
  
  // 第5八度 (高音區)
  'C5': calculateNoteFrequency('C', 5),   // 523.251
  'C#5': calculateNoteFrequency('C#', 5), // 554.365
  'D5': calculateNoteFrequency('D', 5),   // 587.330
  'D#5': calculateNoteFrequency('D#', 5), // 622.254
  'E5': calculateNoteFrequency('E', 5),   // 659.255
  'F5': calculateNoteFrequency('F', 5),   // 698.456
  'F#5': calculateNoteFrequency('F#', 5), // 739.989
  'G5': calculateNoteFrequency('G', 5),   // 783.991
  'G#5': calculateNoteFrequency('G#', 5), // 830.609
  'A5': calculateNoteFrequency('A', 5),   // 880.000
  'A#5': calculateNoteFrequency('A#', 5), // 932.328
  'B5': calculateNoteFrequency('B', 5),   // 987.767
  
  // 第6八度起始音 (超高音區)
  'C6': calculateNoteFrequency('C', 6),   // 1046.502
};

// ========== 工具函數 ==========

/**
 * 檢查音符ID是否在支援的音域範圍內
 * 
 * @param noteId 音符ID
 * @returns 是否支援該音符
 */
export function isSupportedNote(noteId: NoteId): boolean {
  return noteId in PIANO_FREQUENCIES;
}

/**
 * 獲取所有支援的音符ID列表
 * 
 * @returns 支援的音符ID數組
 */
export function getSupportedNotes(): NoteId[] {
  return Object.keys(PIANO_FREQUENCIES) as NoteId[];
}

/**
 * 根據音符名稱獲取簡譜標記
 * 
 * @param noteName 音符名稱
 * @returns 簡譜標記
 */
export function getSolfege(noteName: NoteName): SolfegeNote {
  return NOTE_TO_SOLFEGE[noteName];
}

/**
 * 獲取音符的半音偏移量 (相對於C)
 * 
 * @param noteName 音符名稱
 * @returns 半音偏移量 (0-11)
 */
export function getSemitoneOffset(noteName: NoteName): number {
  return NOTE_TO_SEMITONE_OFFSET[noteName];
}