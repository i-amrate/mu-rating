'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';

// إعداد Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfessorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [professor, setProfessor] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]); // حالة لحفظ التعليقات
  const [newReview, setNewReview] = useState(''); // حالة لحفظ النص الجديد
  const [isSubmitting, setIsSubmitting] = useState(false); // حالة زر الإرسال

  useEffect(() => {
    async function getData() {
      // 1. جيب بيانات الدكتور
      const { data: prof } = await supabase
        .from('professors')
        .select('*')
        .eq('id', id)
        .single();
      
      setProfessor(prof);

      // 2. جيب التعليقات حقته
      if (prof) {
        const { data: revs } = await supabase
          .from('reviews')
          .select('*')
          .eq('professor_id', prof.id)
          .order('created_at', { ascending: false }); // الأحدث فوق
        
        setReviews(revs || []);
      }
    }

    if (id) getData();
  }, [id]);

  // دالة إرسال التعليق
  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!newReview.trim()) return; // لو الخانة فاضية لا ترسل شي

    setIsSubmitting(true);
    
    // إرسال التعليق لـ Supabase
    const { error } = await supabase
      .from('reviews')
      .insert([
        { content: newReview, professor_id: professor.id }
      ]);

    if (!error) {
      setNewReview(''); // فضي الخانة بعد الإرسال
      
      // حدث القائمة عشان يطلع التعليق الجديد فوراً
      const { data: updatedReviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('professor_id', professor.id)
        .order('created_at', { ascending: false });
        
      setReviews(updatedReviews || []);
    } else {
      alert('صار خطأ بسيط، تأكد من النت!');
      console.log(error);
    }
    
    setIsSubmitting(false);
  }

  if (!professor) return <div className="p-10 text-white text-center">جاري التحميل... ⏳</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-sans" dir="rtl">
      {/* زر الرجوع */}
      <button onClick={() => router.push('/')} className="mb-6 text-emerald-400 hover:underline">
        ← رجوع للقائمة
      </button>

      {/* بطاقة الدكتور */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-700 mb-8">
          <h1 className="text-4xl font-bold text-emerald-400 mb-2">{professor.name}</h1>
          <p className="text-xl text-gray-300 mb-4">{professor.department}</p>
          <div className="flex gap-4 text-sm text-gray-400 border-t border-slate-700 pt-4">
             <span>جامعة الإمام</span>
             <span>•</span>
             <span>كلية الاقتصاد والعلوم الإدارية</span>
          </div>
        </div>

        {/* قسم التعليقات الجديد */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            💬 تعليقات الطلاب
            <span className="text-sm bg-slate-700 px-2 py-1 rounded-full text-gray-300 font-normal">
              {reviews.length}
            </span>
          </h3>

          {/* نموذج الكتابة */}
          <form onSubmit={handleSubmit} className="mb-8">
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="اكتب تجربتك مع الدكتور بكل أمانة..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500 min-h-[100px]"
            />
            <button 
              disabled={isSubmitting}
              type="submit" 
              className="mt-3 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {isSubmitting ? 'جاري النشر...' : 'انشر التعليق 🚀'}
            </button>
          </form>

          {/* عرض التعليقات */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لسه ما فيه تعليقات، كن أول واحد يقيم! 😎</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{review.content}</p>
                  <p className="text-xs text-gray-500 mt-3 text-left" dir="ltr">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}