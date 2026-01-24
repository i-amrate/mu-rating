'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; // تأكد أن المسار صحيح حسب مجلداتك
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useUniversity } from '../../context/UniversityContext';

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
  const customCollegeRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [customCollege, setCustomCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dynamicColleges, setDynamicColleges] = useState<string[]>([]);

  // 1. جلب الكليات وترتيبها أبجدياً
  useEffect(() => {
    async function fetchExistingColleges() {
      if (!selectedUni) return;

      const { data } = await supabase
        .from('professors')
        .select('college')
        .eq('university_id', selectedUni.id);

      if (data) {
        const uniqueColleges = Array.from(
          new Set(data.map((p: any) => p.college?.trim()))
        ).filter(Boolean) as string[];
        
        // ترتيب أبجدي لسهولة البحث
        setDynamicColleges(uniqueColleges.sort((a, b) => a.localeCompare(b, 'ar')));
      }
    }
    fetchExistingColleges();
  }, [selectedUni]);

  // 2. دمج وتحديث القائمة
  const allAvailableColleges = Array.from(new Set([
    ...(UNIVERSITY_CONFIG[selectedUni?.slug?.toLowerCase() || '']?.colleges || []),
    ...dynamicColleges
  ]));

  // تحديد القيمة الافتراضية
  useEffect(() => {
    if (!college && allAvailableColleges.length > 0) {
      setCollege(allAvailableColleges[0]);
    } else if (!college) {
        setCollege('أخرى (كتابة يدوية)');
    }
  }, [allAvailableColleges, college]);

  // التركيز التلقائي عند اختيار "أخرى"
  useEffect(() => {
    if (college === 'أخرى (كتابة يدوية)') {
        setTimeout(() => customCollegeRef.current?.focus(), 100);
    }
  }, [college]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedUni) {
        alert('حدث خطأ: لم يتم تحديد الجامعة.');
        setIsSubmitting(false);
        return;
    }

    const cleanName = name.trim();
    const cleanDepartment = department.trim();
    let finalCollege = (college === 'أخرى (كتابة يدوية)' ? customCollege : college).trim();

    if (college === 'أخرى (كتابة يدوية)' && !finalCollege) {
      alert('الرجاء كتابة اسم الكلية ✍️');
      setIsSubmitting(false);
      return;
    }

    // 🛡️ حماية من التكرار: هل الدكتور موجود في نفس الجامعة؟
    const { data: existingProf } = await supabase
      .from('professors')
      .select('id')
      .ilike('name', cleanName)
      .eq('university_id', selectedUni.id)
      .maybeSingle();

    if (existingProf) {
      if (confirm('هذا الدكتور موجود مسبقاً! هل تريد الذهاب لصفحته لتقييمه؟ 🤔')) {
          router.push(`/professor/${existingProf.id}`);
      }
      setIsSubmitting(false);
      return;
    }

    // إضافة الدكتور الجديد
    const { data, error } = await supabase
      .from('professors')
      .insert([
        { 
          name: cleanName, 
          college: finalCollege,
          department: cleanDepartment,
          is_approved: true, // موافقة تلقائية (للانطلاق السريع)
          request_count: 1,
          university_id: selectedUni.id
        }
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      alert('حدث خطأ أثناء الإضافة، حاول مرة أخرى.');
    } else if (data) {
      // توجيه مباشر لصفحة الدكتور الجديد
      router.push(`/professor/${data.id}`);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-right relative overflow-hidden" dir="rtl">
      {/* خلفية جمالية */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-teal-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl rounded-[32px] shadow-2xl border border-slate-800 p-8 relative z-10 animate-fade-in-up">
        
        <button onClick={() => router.back()} className="absolute top-6 right-6 w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white border border-slate-700 transition-all shadow-lg hover:scale-110">
          <ArrowRight size={20} />
        </button>

        <div className="text-center mb-10 pt-4">
          <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-500/20 shadow-[0_0_30px_rgba(20,184,166,0.1)]">
            <CheckCircle2 size={32} className="text-teal-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">إضافة دكتور جديد</h1>
          {selectedUni && (
             <p className="text-slate-400 text-sm">
               إلى <span className="text-teal-400 font-bold">{selectedUni.name}</span>
             </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 mr-1">اسم الدكتور <span className="text-red-500">*</span></label>
            <input 
                type="text" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="مثال: محمد زقراطي العتيبي" 
                className="w-full px-5 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 outline-none text-white transition-all placeholder:text-slate-600" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 mr-1">الكلية <span className="text-red-500">*</span></label>
            <div className="relative">
                <select 
                    value={college} 
                    onChange={(e) => setCollege(e.target.value)} 
                    className="w-full px-5 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl text-sm focus:border-teal-500 outline-none text-slate-200 appearance-none cursor-pointer hover:bg-slate-900/80 transition-colors"
                >
                {allAvailableColleges.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-slate-300">{c}</option>
                ))}
                <option value="أخرى (كتابة يدوية)" className="bg-slate-800 text-teal-400 font-bold">➕ كتابة كلية جديدة...</option>
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown size={16} />
                </div>
            </div>
          </div>

          {college === 'أخرى (كتابة يدوية)' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <input 
                ref={customCollegeRef}
                type="text" 
                value={customCollege} 
                onChange={(e) => setCustomCollege(e.target.value)} 
                placeholder="اكتب اسم الكلية هنا..." 
                className="w-full px-5 py-4 bg-slate-950/50 border border-teal-500/50 rounded-2xl text-sm focus:border-teal-400 outline-none text-white transition-all shadow-[0_0_15px_rgba(20,184,166,0.05)]" 
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 mr-1">القسم <span className="text-red-500">*</span></label>
            <input 
                type="text" 
                required 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)} 
                placeholder="مثال: علوم الحاسب، المحاسبة..." 
                className="w-full px-5 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 outline-none text-white transition-all placeholder:text-slate-600" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !selectedUni} 
            className="w-full mt-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-teal-900/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <>إضافة والذهاب للتقييم <ArrowRight size={18} className="group-hover:-translate-x-1 transition-transform" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

// مكون أيقونة السهم لـ Select (عشان الشكل يكون مرتب)
const ChevronDown = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);