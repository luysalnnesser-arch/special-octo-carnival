import React, { useState } from 'react';
import { FileText, Download, Save, Printer } from 'lucide-react';
import { StudentReport } from '../types';

const ReportModule: React.FC = () => {
  const [form, setForm] = useState<StudentReport>({
    studentName: '',
    date: new Date().toISOString().split('T')[0],
    quranProgress: '',
    hadithProgress: '',
    notes: ''
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportTxt = () => {
    const content = `
تقرير متابعة الطالب - منصة منارة العلم
----------------------------------------
تاريخ التقرير: ${form.date}
اسم الطالب: ${form.studentName || 'غير محدد'}

[إنجازات القرآن الكريم]
${form.quranProgress || 'لا يوجد مدخلات'}

[إنجازات الحديث الشريف]
${form.hadithProgress || 'لا يوجد مدخلات'}

[ملاحظات المعلم]
${form.notes || 'لا توجد ملاحظات'}

----------------------------------------
تم إنشاء هذا التقرير آلياً بواسطة منصة منارة العلم
    `.trim();

    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `report_${form.studentName || 'student'}_${form.date}.txt`;
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none border border-gray-100">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white text-center print:bg-white print:text-black print:border-b">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto mb-4 flex items-center justify-center font-bold text-3xl font-quran print:hidden">م</div>
          <h2 className="text-3xl font-bold">تقرير متابعة الطالب</h2>
          <p className="opacity-90 mt-2 text-emerald-100">منصة منارة العلم التعليمية</p>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">اسم الطالب</label>
              <input 
                name="studentName" 
                value={form.studentName} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none" 
                placeholder="أدخل الاسم الثلاثي" 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">التاريخ</label>
              <input 
                type="date" 
                name="date" 
                value={form.date} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8">
             <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><FileText size={20}/></div>
                إنجازات القرآن الكريم
             </h3>
             <div className="bg-emerald-50/50 p-1 rounded-xl border border-emerald-100">
                <textarea 
                  name="quranProgress" 
                  value={form.quranProgress} 
                  onChange={handleChange} 
                  rows={2}
                  className="w-full p-4 bg-transparent border-none focus:ring-0 resize-none text-gray-700 placeholder-gray-400" 
                  placeholder="مثال: سورة الرحمن من آية 1 إلى 20..." 
                />
             </div>
          </div>

          <div>
             <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FileText size={20}/></div>
                إنجازات الحديث الشريف
             </h3>
             <div className="bg-amber-50/50 p-1 rounded-xl border border-amber-100">
                <textarea 
                  name="hadithProgress" 
                  value={form.hadithProgress} 
                  onChange={handleChange} 
                  rows={2}
                  className="w-full p-4 bg-transparent border-none focus:ring-0 resize-none text-gray-700 placeholder-gray-400" 
                  placeholder="مثال: حفظ حديث (إنما الأعمال بالنيات)..." 
                />
             </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات المعلم / الأداء العام</label>
             <textarea 
               name="notes" 
               value={form.notes} 
               onChange={handleChange} 
               rows={4} 
               className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition outline-none resize-none" 
               placeholder="اكتب ملاحظاتك التشجيعية هنا..."
             ></textarea>
          </div>

          <div className="flex flex-wrap gap-4 pt-4 print:hidden">
             <button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition shadow-lg shadow-emerald-200">
                <Save size={20} />
                {saved ? 'تم الحفظ' : 'حفظ التقرير'}
             </button>
             
             <div className="flex gap-2 flex-1">
                <button onClick={handleExportTxt} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition border border-gray-200">
                    <FileText size={20} />
                    TXT
                </button>
                <button onClick={handlePrint} className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition shadow-lg shadow-gray-200">
                    <Printer size={20} />
                    PDF / طباعة
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModule;