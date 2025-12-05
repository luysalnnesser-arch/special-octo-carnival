import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { X, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { SEVEN_AI_SYSTEM_INSTRUCTION } from '../constants';

interface AIExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  type: 'quran' | 'hadith';
  source?: string; // Surah name or Book name
}

const AIExplainModal: React.FC<AIExplainModalProps> = ({ isOpen, onClose, text, type, source }) => {
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && text) {
      fetchExplanation();
    } else {
      setExplanation('');
    }
  }, [isOpen, text]);

  const fetchExplanation = async () => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = type === 'quran' 
        ? `فسر هذه الآية الكريمة من ${source || 'القرآن الكريم'} بشكل مبسط ومناسب للطلاب، واستخرج منها 3 فوائد تربوية: "${text}"`
        : `اشرح هذا الحديث الشريف من ${source || 'السنة النبوية'} بشكل مبسط، ووضح معاني الكلمات الصعبة والدروس المستفادة: "${text}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SEVEN_AI_SYSTEM_INSTRUCTION,
        }
      });
      
      setExplanation(response.text || 'تعذر الحصول على الشرح.');
    } catch (error) {
      console.error(error);
      setExplanation('حدث خطأ أثناء الاتصال بالمعلم الذكي.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-amber-300" />
            <h3 className="font-bold text-lg">
              {type === 'quran' ? 'التفسير الميسر (SevenAI)' : 'شرح الحديث (SevenAI)'}
            </h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 text-center font-quran text-xl text-gray-700 leading-loose">
            "{text}"
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-emerald-600">
              <Loader2 size={40} className="animate-spin mb-4" />
              <p className="animate-pulse">جاري تحليل النص واستخراج الفوائد...</p>
            </div>
          ) : (
            <div className="prose prose-emerald max-w-none text-right">
               <div className="whitespace-pre-wrap leading-relaxed text-gray-800 font-medium">
                 {explanation}
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
           <button 
             onClick={handleCopy}
             className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition text-sm font-bold"
           >
             {copied ? <Check size={16} /> : <Copy size={16} />}
             {copied ? 'تم النسخ' : 'نسخ الشرح'}
           </button>
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold transition"
           >
             إغلاق
           </button>
        </div>
      </div>
    </div>
  );
};

export default AIExplainModal;