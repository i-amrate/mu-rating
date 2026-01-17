'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// رابط الاستيراد المعتمد (نقطتين)
import { supabase } from '../../lib/supabase';

const APPROVAL_THRESHOLD = 3;

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
    
    let finalCollege = college;
    if (college === 'أخرى (كتابة يدوية)') {
      if (!customCollege.trim()) {
        alert('الرجاء كتابة اسم الكلية ✍️');
        setIsSubmitting(false);
        return;
      }
      finalCollege = customCollege.trim();
    }

    const { data: existingProf } = await supabase
      .from('professors')
      .select('*')
      .ilike('name', cleanName)
      .single();

    if (existingProf) {
      if (existingProf.is_approved) {
        alert('هذا الدكتور موجود في الموقع مسبقاً! سيتم تحويلك لصفحته.');
        router.push(`/professor/${existingProf.id}`);
      } else {
        const newCount = (existingProf.request_count || 1) + 1;
        const shouldApprove = newCount >= APPROVAL_THRESHOLD;

        await supabase
          .from('professors')
          .update({ 
            request_count: newCount,
            is_approved: shouldApprove 
          })
          .eq('id', existingProf.id);

        if (shouldApprove) {
          alert('✅ تم اعتماد الدكتور وإضافته للقائمة بنجاح! شكراً لمساهمتك.');
          router.push(`/professor/${existingProf.id}`);
        } else {
          alert('✅ تم استلام طلبك! سيقوم فريق العمل بمراجعة الاسم وإضافته قريباً.');
          router.push('/');
        }
      }
    } else {
      const { error } = await supabase
        .from('professors')
        .insert([
          { 
            name: cleanName, 
            college: finalCollege,
            department: department.trim(),
            is_approved: false,
            request_count: 1
          }
        ]);

      if (error) {
        alert('حدث خطأ بسيط، حاول مرة أخرى.');
      } else {
        alert('✅ شكراً لك! تم رفع الطلب للإدارة، وسيظهر الدكتور في الموقع بعد التحقق من صحة البيانات.');
        router.push('/');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-right relative overflow-hidden" dir="rtl">
      
      {/* --- خلفية جمالية --- */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* --- الكارت الرئيسي --- */}
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 relative z-10 animate-fade-in-up">
        
        {/* زر العودة (أيقونة البيت) */}
        <button 
          onClick={() => router.push('/')}
          className="absolute top-6 right-6 w-9 h-9 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm border border-gray-100 group"
          title="عودة للرئيسية"
        >
          {/* SVG أيقونة البيت */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </button>

        {/* الهيدر */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-100 to-teal-50 rounded-2xl mb-4 shadow-inner text-2xl">
            ✨
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">إضافة دكتور جديد</h1>
          <p className="text-gray-400 text-xs mt-1">ساعد زملاءك في الوصول لأفضل الدكاترة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* حقل الاسم */}
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block mr-1">اسم الدكتور</label>
            <div className="relative group">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
              </div>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="د. محمد عبدالله..."
                className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm text-gray-700 placeholder-gray-300"
              />
            </div>
          </div>

          {/* حقل الكلية */}
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block mr-1">الكلية</label>
            <div className="relative group">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg>
              </div>
              <select 
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm text-gray-700 appearance-none cursor-pointer"
              >
                {COLLEGES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</div>
            </div>
          </div>

          {/* حقل اسم الكلية اليدوي */}
          {college === 'أخرى (كتابة يدوية)' && (
            <div className="animate-fade-in-down">
              <label className="text-xs font-bold text-emerald-600 mb-1.5 block mr-1">اكتب اسم الكلية هنا:</label>
              <div className="relative group">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                </div>
                <input 
                  type="text" 
                  value={customCollege}
                  onChange={(e) => setCustomCollege(e.target.value)}
                  placeholder="مثال: كلية طب الأسنان..."
                  className="w-full pl-4 pr-10 py-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* حقل القسم */}
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block mr-1">القسم</label>
            <div className="relative group">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg>
              </div>
              <input 
                type="text" 
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="محاسبة، قانون، فيزياء..."
                className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm text-gray-700 placeholder-gray-300"
              />
            </div>
          </div>

          {/* زر الإرسال */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
          >
            {isSubmitting ? 'جاري الإرسال...' : (
              <>
                <span>إضافة للقائمة</span>
                <span>🚀</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-400 mt-6">
           🔒 تخضع جميع الإضافات للمراجعة الآلية لضمان الجودة
        </p>

      </div>
    </div>
  );
}