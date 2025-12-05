import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Bell, CloudSun, MoonStar, Sun } from 'lucide-react';
import { PrayerTimesData } from '../types';

const PrayerModule: React.FC = () => {
  const [times, setTimes] = useState<PrayerTimesData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{name: string, time: string} | null>(null);
  const [countdown, setCountdown] = useState<string>('--:--:--');
  const [city, setCity] = useState<string>('جاري تحديد الموقع...');

  // Mocked for reliability in demo - ideally uses Adhan API based on geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const date = new Date();
          // Using Aladhan API
          const response = await fetch(`https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}?latitude=${latitude}&longitude=${longitude}&method=4`);
          const data = await response.json();
          
          if(data.code === 200) {
             setTimes(data.data.timings);
             setCity(data.data.meta.timezone.split('/')[1] || "موقعي الحالي");
          }
        } catch (e) {
          console.error("Failed to fetch prayer times", e);
          setCity("مكة المكرمة"); // Fallback
        }
      });
    }
  }, []);

  // Countdown Logic
  useEffect(() => {
    if (!times) return;

    const timer = setInterval(() => {
      const now = new Date();
      const timeNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const arNames: Record<string, string> = {'Fajr': 'الفجر', 'Dhuhr': 'الظهر', 'Asr': 'العصر', 'Maghrib': 'المغرب', 'Isha': 'العشاء'};
      
      let next = null;
      let diff = Infinity;

      for (const name of timeNames) {
        const [hours, minutes] = times[name].split(':').map(Number);
        const prayerDate = new Date();
        prayerDate.setHours(hours, minutes, 0);
        
        if (prayerDate.getTime() < now.getTime()) {
           continue;
        }

        const d = prayerDate.getTime() - now.getTime();
        if (d < diff) {
          diff = d;
          next = { name: arNames[name], time: times[name] };
        }
      }

      // If all passed today
      if (!next) {
         next = { name: 'فجر الغد', time: times['Fajr'] };
         setCountdown("انتهت صلوات اليوم");
      } else {
         const h = Math.floor(diff / (1000 * 60 * 60));
         const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
         const s = Math.floor((diff % (1000 * 60)) / 1000);
         setCountdown(`${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
      
      setNextPrayer(next);

    }, 1000);

    return () => clearInterval(timer);
  }, [times]);

  const prayers = [
    { key: 'Fajr', name: 'الفجر', icon: <CloudSun size={24} className="text-orange-300" /> },
    { key: 'Sunrise', name: 'الشروق', icon: <Sun size={24} className="text-yellow-400" /> },
    { key: 'Dhuhr', name: 'الظهر', icon: <Sun size={24} className="text-amber-500" /> },
    { key: 'Asr', name: 'العصر', icon: <CloudSun size={24} className="text-amber-400" /> },
    { key: 'Maghrib', name: 'المغرب', icon: <MoonStar size={24} className="text-purple-400" /> },
    { key: 'Isha', name: 'العشاء', icon: <MoonStar size={24} className="text-blue-800" /> },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
       {/* Main Card */}
       <div className="relative overflow-hidden bg-gradient-to-br from-[#059669] to-[#047857] rounded-[30px] p-8 text-white flex flex-col justify-between shadow-2xl group">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 rounded-full -ml-10 -mb-10 blur-3xl"></div>
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-100 mb-2 bg-black/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
               <MapPin size={16} />
               <span className="text-xs font-bold">{city}</span>
            </div>
            
            <h2 className="text-2xl font-bold mt-4 opacity-90">الصلاة القادمة</h2>
            <div className="text-6xl font-bold mt-2 font-mono tracking-wider tabular-nums drop-shadow-lg">
               {countdown}
            </div>
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
               <span className="text-amber-300 font-bold text-xl">{nextPrayer?.name}</span>
               <span className="text-white/80">|</span>
               <span className="text-xl font-mono">{nextPrayer?.time}</span>
            </div>
          </div>

          <div className="relative z-10 mt-8 flex gap-4">
             <button className="flex-1 bg-white text-emerald-800 hover:bg-emerald-50 px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition font-bold shadow-lg">
                <Bell size={20} />
                <span>تفعيل الأذان</span>
             </button>
          </div>
       </div>

       {/* List */}
       <div className="bg-white rounded-[30px] shadow-lg p-6 border border-gray-100 flex flex-col justify-center">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 px-2">
             <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
               <Clock size={20} />
             </div>
             أوقات الصلاة اليوم
          </h3>
          <div className="space-y-3">
             {prayers.map((p) => (
                <div key={p.key} className={`flex justify-between items-center p-4 rounded-2xl transition-all duration-300 border ${nextPrayer?.name === p.name ? 'bg-emerald-50 border-emerald-200 scale-105 shadow-md' : 'bg-gray-50/50 border-transparent hover:bg-gray-50'}`}>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
                         {p.icon}
                      </div>
                      <span className={`font-bold ${nextPrayer?.name === p.name ? 'text-emerald-800' : 'text-gray-600'}`}>
                         {p.name}
                      </span>
                   </div>
                   <div className={`px-4 py-1 rounded-full font-mono font-bold ${nextPrayer?.name === p.name ? 'bg-emerald-600 text-white' : 'text-gray-500 bg-gray-200/50'}`}>
                      {times ? times[p.key].split(' ')[0] : '--:--'}
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default PrayerModule;