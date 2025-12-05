import React, { useState } from 'react';
import { Search, Bookmark, Sparkles, Book, Plus, Loader2 } from 'lucide-react';
import { MOCK_HADITHS } from '../constants';
import { GoogleGenAI, Type } from '@google/genai';
import AIExplainModal from './AIExplainModal';
import { Hadith } from '../types';

const HadithModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [generatedHadiths, setGeneratedHadiths] = useState<Hadith[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // AI Modal State
  const [modalData, setModalData] = useState<{isOpen: boolean, text: string, source: string}>({
    isOpen: false, text: '', source: ''
  });

  const allHadiths = [...MOCK_HADITHS, ...generatedHadiths];

  const filtered = allHadiths.filter(h => 
    h.body.includes(searchTerm) || h.header.includes(searchTerm) || h.tags.some(t => t.includes(searchTerm))
  );

  const toggleFav = (id: number) => {
    if (favorites.includes(id)) setFavorites(favorites.filter(f => f !== id));
    else setFavorites([...favorites, id]);
  };

  const handleExplain = (text: string, source: string) => {
    setModalData({ isOpen: true, text, source });
  };

  const generateMoreHadiths = async () => {
    if (!searchTerm.trim()) return;
    setIsGenerating(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `قم بالبحث عن 3 أحاديث صحيحة متعلقة بموضوع: "${searchTerm}". 
        يجب أن تكون الأحاديث صحيحة ومختلفة عما هو موجود مسبقاً.
        Return the result strictly as a valid JSON array of objects.
        Each object must have these exact keys:
        - "header": (string) Short title for the Hadith.
        - "body": (string) The full text of the Hadith in Arabic.
        - "book": (string) The source book (e.g., Sahih Bukhari).
        - "tags": (array of strings) 2-3 keywords.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
             type: Type.ARRAY,
             items: {
               type: Type.OBJECT,
               properties: {
                 header: { type: Type.STRING },
                 body: { type: Type.STRING },
                 book: { type: Type.STRING },
                 tags: { type: Type.ARRAY, items: { type: Type.STRING } }
               }
             }
          }
        }
      });

      if (response.text) {
        const newItems = JSON.parse(response.text);
        // Add IDs to new items
        const processedItems = newItems.map((item: any, idx: number) => ({
           ...item,
           id: Date.now() + idx
        }));
        setGeneratedHadiths(prev => [...prev, ...processedItems]);
      }
    } catch (error) {
      console.error("Failed to generate hadiths", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden">
       {/* Search Bar */}
       <div className="bg-white p-6 shadow-sm border-b border-gray-100 z-10">
          <div className="relative max-w-2xl mx-auto flex gap-2">
             <div className="relative flex-1">
               <input 
                 type="text" 
                 placeholder="ابحث في الأحاديث (عن الصدق، الصلاة، الأخلاق...)"
                 className="w-full pl-4 pr-12 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm bg-gray-50 focus:bg-white transition"
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && searchTerm && generateMoreHadiths()}
               />
               <Search className="absolute right-4 top-3.5 text-gray-400" size={20} />
             </div>
             
             {searchTerm.length > 2 && (
               <button 
                 onClick={generateMoreHadiths}
                 disabled={isGenerating}
                 className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold flex items-center gap-2 transition disabled:opacity-50 shadow-md shadow-emerald-200"
               >
                 {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} className="text-amber-300" />}
                 <span className="hidden sm:inline">توليد المزيد</span>
               </button>
             )}
          </div>
          
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
             {['أخلاق', 'عقيدة', 'صلاة', 'رمضان'].map(tag => (
               <button key={tag} onClick={() => setSearchTerm(tag)} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm hover:bg-emerald-100 transition border border-emerald-100">
                 #{tag}
               </button>
             ))}
          </div>
       </div>

       {/* List */}
       <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-400 mt-10 flex flex-col items-center">
               <Book size={48} className="mb-4 opacity-20" />
               <p>لا توجد نتائج بحث.</p>
               {searchTerm && (
                 <button 
                   onClick={generateMoreHadiths}
                   disabled={isGenerating}
                   className="mt-4 px-6 py-2 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition font-bold flex items-center gap-2"
                 >
                    {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                    اطلب من الذكاء الاصطناعي إيجاد أحاديث عن "{searchTerm}"
                 </button>
               )}
            </div>
          ) : (
            <>
              {filtered.map(hadith => (
                <div key={hadith.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100 group">
                   <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                         <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                         {hadith.header}
                      </h3>
                      <div className="flex gap-2">
                         <button onClick={() => toggleFav(hadith.id)} className={`p-2 rounded-full transition ${favorites.includes(hadith.id) ? 'text-amber-400 bg-amber-50' : 'text-gray-300 hover:bg-gray-100'}`}>
                            <Bookmark size={20} fill={favorites.includes(hadith.id) ? "currentColor" : "none"} />
                         </button>
                      </div>
                   </div>
                   
                   <div className="relative">
                      <p className="text-gray-700 leading-[2.2] text-lg font-serif mb-6 px-2">
                         {hadith.body}
                      </p>
                   </div>

                   <div className="flex flex-wrap justify-between items-center gap-4 border-t border-gray-50 pt-4">
                      <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                         📚 {hadith.book}
                      </span>
                      
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                          <button 
                             onClick={() => handleExplain(hadith.body, hadith.book)}
                             className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-100 transition transform hover:-translate-y-0.5"
                          >
                             <Sparkles size={16} className="text-amber-300"/>
                             شرح الحديث
                          </button>
                      </div>
                   </div>
                </div>
              ))}
              
              {/* Prompt to load more at the bottom of results */}
              {searchTerm && !isGenerating && (
                 <div className="flex justify-center pt-4 pb-8">
                    <button 
                      onClick={generateMoreHadiths}
                      className="px-6 py-3 bg-white border border-emerald-200 text-emerald-700 rounded-full hover:bg-emerald-50 transition font-bold flex items-center gap-2 shadow-sm"
                    >
                       <Plus size={18} />
                       هل تريد المزيد عن "{searchTerm}"؟
                    </button>
                 </div>
              )}
              
              {isGenerating && (
                 <div className="flex justify-center py-8">
                    <div className="flex items-center gap-3 text-emerald-600 animate-pulse">
                       <Loader2 className="animate-spin" size={24} />
                       <span className="font-bold">جاري البحث في المصادر الإسلامية...</span>
                    </div>
                 </div>
              )}
            </>
          )}
       </div>

       {/* AI Modal */}
       <AIExplainModal 
         isOpen={modalData.isOpen} 
         onClose={() => setModalData({...modalData, isOpen: false})}
         text={modalData.text}
         type="hadith"
         source={modalData.source}
       />
    </div>
  );
};

export default HadithModule;