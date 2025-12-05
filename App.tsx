import React, { useState } from 'react';
import { BookOpen, Calendar, MessageCircle, UserCheck, Book, Settings, Heart } from 'lucide-react';
import { AppTab } from './types';
import QuranModule from './components/QuranModule';
import PrayerModule from './components/PrayerModule';
import HadithModule from './components/HadithModule';
import SevenAIModule from './components/SevenAIModule';
import ReportModule from './components/StudentReport';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.AI_CHAT);

  const tabs = [
    { id: AppTab.AI_CHAT, label: 'المعلم الذكي', icon: MessageCircle },
    { id: AppTab.QURAN, label: 'القرآن الكريم', icon: BookOpen },
    { id: AppTab.HADITH, label: 'الأحاديث', icon: Book },
    { id: AppTab.PRAYER, label: 'مواقيت الصلاة', icon: Calendar },
    { id: AppTab.REPORTS, label: 'متابعة الطالب', icon: UserCheck },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.QURAN: return <QuranModule />;
      case AppTab.HADITH: return <HadithModule />;
      case AppTab.PRAYER: return <PrayerModule />;
      case AppTab.AI_CHAT: return <SevenAIModule />;
      case AppTab.REPORTS: return <ReportModule />;
      default: return <SevenAIModule />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f3f6f4] text-gray-800 font-sans overflow-hidden select-none">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-l border-emerald-100/50 shadow-2xl z-20 relative">
        <div className="p-8 border-b border-gray-50 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600"></div>
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-3xl shadow-lg flex items-center justify-center mb-4 text-white text-4xl font-bold font-quran transform rotate-3 hover:rotate-0 transition-all duration-500">
            م
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">منارة العلم</h1>
          <p className="text-xs text-emerald-600/80 mt-1 font-medium bg-emerald-50 px-3 py-1 rounded-full">معلمك الإسلامي الذكي</p>
        </div>

        <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-200 shadow-lg translate-x-[-4px]' 
                  : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              <tab.icon size={22} className={`relative z-10 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="font-bold text-base relative z-10">{tab.label}</span>
              {activeTab === tab.id && (
                 <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-emerald-600 shadow-sm">
               <Settings size={18} />
             </div>
             <div className="text-sm">
                <p className="font-bold text-gray-800">الإصدار 2.0</p>
                <p className="text-gray-400 text-[10px]">SevenAI-Mini</p>
             </div>
          </div>
          
          <div className="text-center pt-4 border-t border-gray-200/50">
            <p className="text-[11px] text-gray-600 font-bold mb-1">تم التطوير بواسطة أخوكم بالله ليث</p>
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
               <span>صُنع بحب</span>
               <Heart size={10} className="text-red-500 fill-red-500 animate-pulse" />
               <span>ادعوا لنا</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#f8fafc]">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-4 z-20 sticky top-0">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">م</div>
              <h1 className="font-bold text-lg text-gray-800">منارة العلم</h1>
           </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto scroll-smooth relative">
           {/* Background Pattern */}
           <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" 
                style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}>
           </div>
           
           <div className="relative z-10 min-h-full flex flex-col p-4 md:p-6 lg:p-8">
             {/* Animation Wrapper */}
             <div key={activeTab} className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
               {renderContent()}
             </div>

             {/* Mobile & Global Footer */}
             <footer className="mt-16 mb-8 text-center opacity-80">
                <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <p className="text-xs font-bold text-gray-500 mb-1">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mt-2">
                   <span className="text-xs text-gray-600">تم التطوير بواسطة</span>
                   <span className="text-xs font-bold text-emerald-600">أخوكم بالله ليث</span>
                   <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                   <span className="text-[10px] text-gray-400">ادعوا لنا</span>
                </div>
             </footer>
           </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden bg-white/90 backdrop-blur-lg border-t flex justify-around p-2 pb-safe z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
           {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'text-emerald-600 bg-emerald-50 scale-105' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className="text-[9px] font-bold mt-1">{tab.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default App;