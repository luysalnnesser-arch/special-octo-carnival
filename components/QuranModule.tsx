import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronRight, ChevronLeft, Sun, Moon, Sparkles, Volume2, Search, BookOpen, Repeat, StopCircle, AlertCircle } from 'lucide-react';
import { Surah, Ayah } from '../types';
import AIExplainModal from './AIExplainModal';

const QuranModule: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [currentSurah, setCurrentSurah] = useState<number>(1);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState(32); 
  const [darkMode, setDarkMode] = useState(false);
  
  // Audio State
  const [activeAyah, setActiveAyah] = useState<number | null>(null); 
  const [activeAyahText, setActiveAyahText] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // AI Modal State
  const [showExplain, setShowExplain] = useState(false);

  // Fetch Surah List
  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then(res => res.json())
      .then(data => setSurahs(data.data));
  }, []);

  // Fetch Ayahs when surah changes
  useEffect(() => {
    setIsLoading(true);
    setActiveAyah(null);
    setIsPlaying(false);
    setIsAutoPlay(false);
    setAudioError(false);
    fetch(`https://api.alquran.cloud/v1/surah/${currentSurah}`)
      .then(res => res.json())
      .then(data => {
        setAyahs(data.data.ayahs);
        setIsLoading(false);
      });
  }, [currentSurah]);

  const playAyah = (ayahNumberInSurah: number, text: string) => {
    if (!audioRef.current) return;

    setActiveAyahText(text);
    setAudioError(false);

    // Pad numbers for Alafasy Source
    const s = String(currentSurah).padStart(3, '0');
    const a = String(ayahNumberInSurah).padStart(3, '0');
    const url = `https://everyayah.com/data/Alafasy_128kbps/${s}${a}.mp3`;

    if (activeAyah === ayahNumberInSurah && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsAutoPlay(false); // Stop autoplay if user manually pauses
    } else {
      audioRef.current.src = url;
      audioRef.current.play().catch(e => {
        console.error("Audio playback failed", e);
        setAudioError(true);
        setIsPlaying(false);
      });
      setActiveAyah(ayahNumberInSurah);
      setIsPlaying(true);
    }
  };

  const playFullSurah = () => {
    if (ayahs.length > 0) {
      setIsAutoPlay(true);
      playAyah(1, ayahs[0].text);
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsAutoPlay(false);
    setActiveAyah(null);
  };

  const handleAudioEnded = () => {
     if (isAutoPlay && activeAyah !== null) {
       const nextAyahNum = activeAyah + 1;
       const nextAyahData = ayahs.find(a => a.numberInSurah === nextAyahNum);
       
       if (nextAyahData) {
         playAyah(nextAyahNum, nextAyahData.text);
       } else {
         // End of Surah
         setIsPlaying(false);
         setIsAutoPlay(false);
       }
     } else {
       setIsPlaying(false);
     }
  };

  const handleAudioError = () => {
    setAudioError(true);
    setIsPlaying(false);
    setIsAutoPlay(false);
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden transition-colors duration-500 relative ${darkMode ? 'bg-[#1a1c23] text-gray-100' : 'bg-[#fdfbf7] text-gray-900'}`}>
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded} 
        onError={handleAudioError}
        className="hidden" 
      />
      
      {/* Background Texture for "Paper" feel */}
      {!darkMode && (
         <div className="absolute inset-0 pointer-events-none opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] z-0"></div>
      )}

      {/* Top Bar */}
      <div className={`p-4 border-b flex flex-wrap gap-4 justify-between items-center z-20 shadow-sm relative ${darkMode ? 'border-gray-800 bg-[#1a1c23]/95' : 'border-[#e5e0d0] bg-[#fdfbf7]/95'}`}>
        
        {/* Navigation */}
        <div className="flex items-center gap-2">
           <div className={`flex items-center rounded-lg p-1 ${darkMode ? 'bg-gray-800' : 'bg-[#eeeadd]'}`}>
              <button 
                onClick={() => setCurrentSurah(Math.min(114, currentSurah + 1))} 
                className="p-2 hover:bg-black/5 rounded-md disabled:opacity-30 transition"
                disabled={currentSurah === 114}
              >
                <ChevronRight size={20}/>
              </button>
              
              <div className="relative mx-2">
                 <select 
                   value={currentSurah} 
                   onChange={(e) => setCurrentSurah(Number(e.target.value))}
                   className={`appearance-none bg-transparent font-bold text-center w-40 py-1 focus:outline-none cursor-pointer ${darkMode ? 'text-gray-200' : 'text-[#3d3328]'}`}
                 >
                   {surahs.map(s => (
                     <option key={s.number} value={s.number} className={darkMode ? 'bg-gray-800' : 'bg-[#fdfbf7]'}>
                       {s.number}. {s.name}
                     </option>
                   ))}
                 </select>
                 <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none opacity-50">
                    <BookOpen size={14} />
                 </div>
              </div>

              <button 
                onClick={() => setCurrentSurah(Math.max(1, currentSurah - 1))} 
                className="p-2 hover:bg-black/5 rounded-md disabled:opacity-30 transition"
                disabled={currentSurah === 1}
              >
                <ChevronLeft size={20}/>
              </button>
           </div>
           
           <div className={`hidden md:block px-4 py-1.5 rounded-lg text-sm font-bold opacity-70 ${darkMode ? 'bg-gray-800' : 'bg-[#eeeadd]'}`}>
              {surahs[currentSurah-1]?.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surahs[currentSurah-1]?.numberOfAyahs} آية
           </div>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-3">
          {/* Font Resizer */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-[#d4ceb8] bg-white'}`}>
             <button onClick={() => setFontSize(Math.max(20, fontSize - 4))} className="text-xs font-bold hover:text-emerald-500">A-</button>
             <span className="text-xs opacity-30">|</span>
             <button onClick={() => setFontSize(Math.min(60, fontSize + 4))} className="text-lg font-bold hover:text-emerald-500">A+</button>
          </div>

          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className={`p-2 rounded-full transition-all shadow-sm ${darkMode ? 'bg-amber-400 text-black' : 'bg-gray-800 text-white'}`}
          >
            {darkMode ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
        </div>
      </div>

      {/* Reader Area */}
      <div className="flex-1 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-emerald-200">
        <div className="min-h-full py-8 px-4 md:px-8 lg:px-16 flex flex-col items-center">
           
           {/* Decorative Border Container */}
           <div className={`w-full max-w-5xl mx-auto border-[6px] border-double rounded-[30px] p-6 md:p-12 relative shadow-lg ${darkMode ? 'border-gray-700 bg-[#20232c]' : 'border-[#d4ceb8] bg-white'}`}>
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-emerald-600 opacity-70">
                   <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                   <p className="font-bold">جاري تحميل السورة...</p>
                </div>
              ) : (
                <>
                  {/* Surah Header & Play All */}
                  <div className="text-center mb-10 relative">
                     <div className="inline-block relative">
                        <h1 className={`text-4xl md:text-6xl font-quran font-bold mb-4 drop-shadow-sm ${darkMode ? 'text-emerald-400' : 'text-[#2c2621]'}`}>
                           {surahs[currentSurah - 1]?.name}
                        </h1>
                     </div>
                     
                     <div className="flex justify-center gap-4 mb-6">
                        {isAutoPlay ? (
                          <button 
                            onClick={stopPlayback}
                            className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg shadow-red-200 font-bold text-sm"
                          >
                            <StopCircle size={18} fill="currentColor" />
                            إيقاف التلاوة
                          </button>
                        ) : (
                          <button 
                            onClick={playFullSurah}
                            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 font-bold text-sm"
                          >
                            <Play size={18} fill="currentColor" />
                            تشغيل السورة كاملة
                          </button>
                        )}
                     </div>

                     {currentSurah !== 1 && currentSurah !== 9 && (
                       <div className={`font-quran text-2xl md:text-3xl mt-2 opacity-80 ${darkMode ? 'text-emerald-500/80' : 'text-[#8a7e6b]'}`}>
                         بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                       </div>
                     )}
                  </div>

                  {/* Ayahs Text */}
                  <div 
                    className={`font-quran leading-[2.6] md:leading-[3.0] text-justify text-center-last transition-all`} 
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {ayahs.map((ayah) => {
                       const isActive = activeAyah === ayah.numberInSurah;
                       return (
                        <span 
                          key={ayah.number} 
                          onClick={() => playAyah(ayah.numberInSurah, ayah.text)}
                          className={`
                            inline relative rounded-lg cursor-pointer transition-all duration-300 py-1 select-none
                            ${isActive 
                              ? (darkMode ? 'bg-emerald-900/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.1)] px-1' : 'bg-amber-100/60 text-[#1a1814] shadow-[0_0_20px_rgba(251,191,36,0.2)] px-1') 
                              : 'hover:text-emerald-600'}
                          `}
                          title="اضغط للاستماع"
                        >
                          {ayah.text} 
                          <span className={`
                             inline-flex items-center justify-center w-[1.2em] h-[1.2em] mx-1 md:mx-2 align-middle
                             text-[0.45em] font-sans opacity-90
                             ${darkMode ? 'text-emerald-500' : 'text-[#d4b483]'}
                          `}>
                             ۝{ayah.numberInSurah.toLocaleString('ar-EG')}
                          </span>
                        </span>
                       );
                    })}
                  </div>
                </>
              )}
           </div>

           {/* Footer padding */}
           <div className="h-24"></div>
        </div>
      </div>
      
      {/* Error Toast */}
      {audioError && (
         <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-4 z-50">
            <AlertCircle size={18} />
            <span className="text-sm font-bold">تعذر تشغيل الملف الصوتي. تأكد من الاتصال بالإنترنت.</span>
         </div>
      )}
      
      {/* Floating Action Bar (When Ayah Selected) */}
      {activeAyah && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 pr-4 bg-emerald-700 text-white rounded-full shadow-2xl animate-in slide-in-from-bottom-6 z-50 backdrop-blur-md bg-opacity-95 border border-emerald-600">
           
           <div className="flex flex-col mr-2">
              <span className="text-[10px] opacity-70 font-bold uppercase tracking-wider">الآية {activeAyah}</span>
              <span className="text-xs font-bold truncate max-w-[150px]">سورة {surahs[currentSurah-1]?.name}</span>
           </div>

           <div className="h-8 w-[1px] bg-white/20 mx-1"></div>

           <button 
             onClick={() => isPlaying ? audioRef.current?.pause() : audioRef.current?.play()} 
             className="p-2 rounded-full hover:bg-white/20 transition flex items-center justify-center"
             title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
           >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
           </button>
           
           <button
             onClick={() => setShowExplain(true)}
             className="flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-700 rounded-full font-bold text-xs hover:bg-emerald-50 transition shadow-sm ml-1"
           >
              <Sparkles size={14} className="text-amber-500" />
              تفسير بالذكاء الاصطناعي
           </button>
        </div>
      )}

      {/* AI Modal */}
      <AIExplainModal 
        isOpen={showExplain}
        onClose={() => setShowExplain(false)}
        text={activeAyahText}
        type="quran"
        source={`سورة ${surahs[currentSurah - 1]?.name} - الآية ${activeAyah}`}
      />
    </div>
  );
};

export default QuranModule;