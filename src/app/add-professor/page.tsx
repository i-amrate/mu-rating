'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { ArrowRight } from 'lucide-react';

const COLLEGES = [
  "كلية علوم الحاسب والمعلومات",
  "كلية إدارة الأعمال",
  "كلية الهندسة",
  "كلية الطب",
  "كلية العلوم الطبية التطبيقية",
  "كلية التربية",
  "كلية العلوم",
  "كلية العلوم والدراسات الإنسانية",
  "السنة التحضيرية",
  "أخرى (كتابة يدوية)"
];

export default function AddProfessor() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [college, setCollege] = useState(COLLEGES[0]);
  const [customCollege, setCustomCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cleanName = name.trim();
    let finalCollege = college === 'أخرى (كتابة يدوية)' ? customCollege.trim() : college;

    if (college === 'أخرى (كتابة يدوية)' && !customCollege.trim()) {
      alert('الرجاء كتابة اسم الكلية ✍️');
      setIsSubmitting(false);
      return;
    }

    // 1. التحقق إذا كان الدكتور موجود مسبقاً
    const { data: existingProf } = await supabase
      .from('professors')
      .select('id')
      .ilike('name', cleanName)
      .single();

    if (existingProf) {
      alert('هذا الدكتور موجود مسبقاً، سيتم توجيهك لصفحته للتقييم ✅');
      router.push(`/professor/${existingProf.id}`);
      return;
    }

    // 2. إضافة الدكتور الجديد وجلب الـ ID حقه فوراً
    const { data, error } = await supabase
      .from('professors')
      .insert([
        { 
          name: cleanName, 
          college: finalCollege,
          department: department.trim(),
          is_approved: true, // تفعيله فوراً لكي يتمكن الطالب من تقييمه
          request_count: 1
        }
      ])
      .select(); // 🔥 جلب البيانات المضافة

    if (error) {
      alert('حدث خطأ أثناء الإضافة، حاول مرة أخرى.');
    } else if (data && data.length > 0) {
      // 🚀 التوجيه الذكي لصفحة الدكتور الجديد فوراً 🚀
      router.push(`/professor/${data[0].id}`);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-right relative overflow-hidden" dir="rtl">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-900/20 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>

      <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl rounded-[24px] shadow-2xl border border-slate-800 p-8 relative z-10 animate-fade-in-up">
        
        <button 
          onClick={() => router.push('/')}
          className="absolute top-6 right-6 w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white border border-slate-700 transition-all shadow-sm group"
        >
          <ArrowRight size={18} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl font-extrabold text-white">إضافة دكتور جديد</h1>
          <p className="text-slate-400 text-xs mt-2">أضف الدكتور وابدأ بتقييمه فوراً</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 block">اسم الدكتور</label>
            <input 
              type="text" required value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="الاسم الكامل..."
              className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm focus:border-teal-500 outline-none text-slate-200 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 block">الكلية</label>
            <select 
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm focus:border-teal-500 outline-none text-slate-200 appearance-none cursor-pointer"
            >
              {COLLEGES.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-slate-300">{c}</option>
              ))}
            </select>
          </div>

          {college === 'أخرى (كتابة يدوية)' && (
            <div className="animate-fade-in-down">
              <label className="text-xs font-bold text-teal-400 mb-1.5 block">اسم الكلية يدوياً:</label>
              <input 
                type="text" value={customCollege}
                onChange={(e) => setCustomCollege(e.target.value)}
                placeholder="مثال: كلية العلوم الصحية..."
                className="w-full px-4 py-3.5 bg-slate-950/50 border border-teal-500/30 rounded-xl text-sm focus:border-teal-500 outline-none text-slate-200 transition-all"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 block">القسم</label>
            <input 
              type="text" required value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="محاسبة، حاسب، لغات..."
              className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm focus:border-teal-500 outline-none text-slate-200 transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-2 bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'جاري الإضافة...' : 'إضافة والذهاب للتقييم 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}