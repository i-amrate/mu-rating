'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useUniversity } from '../../context/UniversityContext';

// القائمة الثابتة (مفرغة حالياً لتضيف ما تراه مناسباً لاحقاً)
const UNIVERSITY_CONFIG: Record<string, { colleges: string[] }> = {
  'imam': { colleges: [] },
  'ksu': { colleges: [] },
  'pnu': { colleges: [] },
  'kfupm': { colleges: [] },
  'majmaah': { colleges: [] },
  'qassim': { colleges: [] },
  'kau': { colleges: [] }
};

export default function AddProfessor() {
  const router = useRouter();
  const { selectedUni } = useUniversity();

  const [name, setName] = useState('');
  const [college, setCollege] = useState('أخرى (كتابة يدوية)');
  const [customCollege, setCustomCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dynamicColleges, setDynamicColleges] = useState<string[]>([]); // 🔥 حالة الكليات المستخرجة من الداتا بيز

  // 1. جلب الكليات المضافة مسبقاً في قاعدة البيانات لهذه الجامعة
  useEffect(() => {
    async function fetchExistingColleges() {
      if (!selectedUni) return;

      const { data, error } = await supabase
        .from('professors')
        .select('college')
        .eq('university_id', selectedUni.id);

      if (data) {
        // تنظيف المسميات وحذف التكرار
        const uniqueColleges = Array.from(
          new Set(data.map((p: any) => p.college?.trim()))
        ).filter(Boolean) as string[];
        
        setDynamicColleges(uniqueColleges);
      }
    }
    fetchExistingColleges();
  }, [selectedUni]);

  // 2. دمج الكليات الثابتة مع الديناميكية
  const currentConfig = selectedUni ? UNIVERSITY_CONFIG[selectedUni.slug?.toLowerCase()] : null;
  const staticColleges = currentConfig?.colleges || [];
  const allAvailableColleges = Array.from(new Set([...staticColleges, ...dynamicColleges]));

  // تحديث الخيار الافتراضي
  useEffect(() => {
    if (allAvailableColleges.length > 0) {
      setCollege(allAvailableColleges[0]);
    } else {
      setCollege('أخرى (كتابة يدوية)');
    }
  }, [selectedUni, dynamicColleges]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedUni) {
        alert('حدث خطأ: لم يتم تحديد الجامعة.');
        setIsSubmitting(false);
        return;
    }

    const cleanName = name.trim();
    let finalCollege = (college === 'أخرى (كتابة يدوية)' ? customCollege : college).trim();

    if (college === 'أخرى (كتابة يدوية)' && !customCollege.trim()) {
      alert('الرجاء كتابة اسم الكلية ✍️');
      setIsSubmitting(false);
      return;
    }

    const { data: existingProf } = await supabase
      .from('professors')
      .select('id')
      .ilike('name', cleanName)
      .eq('university_id', selectedUni.id)
      .maybeSingle();

    if (existingProf) {
      alert('هذا الدكتور موجود مسبقاً ✅');
      router.push(`/professor/${existingProf.id}`);
      return;
    }

    const { data, error } = await supabase
      .from('professors')
      .insert([
        { 
          name: cleanName, 
          college: finalCollege,
          department: department.trim(),
          is_approved: true, 
          request_count: 1,
          university_id: selectedUni.id
        }
      ])
      .select();

    if (error) {
      alert('حدث خطأ أثناء الإضافة');
    } else if (data && data.length > 0) {
      router.push(`/professor/${data[0].id}`);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-right relative overflow-hidden" dir="rtl">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-900/20 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>

      <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl rounded-[24px] shadow-2xl border border-slate-800 p-8 relative z-10 animate-fade-in-up">
        
        <button onClick={() => router.push('/')} className="absolute top-6 right-6 w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white border border-slate-700 transition-all shadow-sm group">
          <ArrowRight size={18} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl font-extrabold text-white">إضافة دكتور جديد</h1>
          {selectedUni && (
             <p className="text-slate-400 text-xs mt-2">
               إضافة إلى: <span className="text-teal-400 font-bold">{selectedUni.name}</span>
             </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 block">اسم الدكتور</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل..." className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm focus:border-teal-500 outline-none text-slate-200 transition-all" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 block">الكلية</label>
            <select value={college} onChange={(e) => setCollege(e.target.value)} className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm focus:border-teal-500 outline-none text-slate-200 appearance-none cursor-pointer">
              {/* 🔥 عرض الكليات المسجلة سابقاً في الجامعة 🔥 */}
              {allAvailableColleges.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-slate-300">{c}</option>
              ))}
              <option value="أخرى (كتابة يدوية)" className="bg-slate-900 text-teal-400 font-bold">إضافة كلية جديدة... ✍️</option>
            </select>
          </div>

          {college === 'أخرى (كتابة يدوية)' && (
            <div className="animate-fade-in-down">
              <label className="text-xs font-bold text-teal-400 mb-1.5 block">اسم الكلية الجديدة:</label>
              <input type="text" value={customCollege} onChange={(e) => setCustomCollege(e.target.value)} placeholder="مثال: كلية الهندسة..." className="w-full px-4 py-3.5 bg-slate-950/50 border border-teal-500/30 rounded-xl text-sm focus:border-teal-500 outline-none text-slate-200 transition-all" />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 block">القسم</label>
            <input type="text" required value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="محاسبة، حاسب، لغات..." className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm focus:border-teal-500 outline-none text-slate-200 transition-all" />
          </div>

          <button type="submit" disabled={isSubmitting || !selectedUni} className="w-full mt-2 bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> جاري الإضافة...</> : 'إضافة والذهاب للتقييم 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}