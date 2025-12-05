export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
}

export interface Hadith {
  id: number;
  header: string;
  body: string;
  book: string;
  tags: string[];
}

export interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface StudentReport {
  studentName: string;
  date: string;
  quranProgress: string;
  hadithProgress: string;
  notes: string;
}

export enum AppTab {
  HOME = 'HOME',
  QURAN = 'QURAN',
  HADITH = 'HADITH',
  PRAYER = 'PRAYER',
  AI_CHAT = 'AI_CHAT',
  REPORTS = 'REPORTS'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}