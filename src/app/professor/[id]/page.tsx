'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
// تأكد من الرابط (ثلاث مرات للخلف)
import { supabase } from '../../../lib/supabase';

const GRADES = ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F", "DN", "محتسب"];

// 🚫 قائمة الكلمات الممنوعة (تقدر تزيد عليها)
const BAD_WORDS = [
  "كلام بذيء", "سب", "شتم", "لعن", "حقير", "زباله", "زبالة", "تبن", "حيوان", "غبي", "حمار"
];

export default function ProfessorPage() {
  const { id } = useParams();
  const [professor, setProfessor] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(0);
  const [grade, setGrade] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: profData } = await supabase.from('professors').select('*').eq('id', id).single();
      if (profData) setProfessor(profData);

      const { data: reviewsData } = await supabase.from('reviews').select('*').eq('professor_id', id).order('created_at', { ascending: false });
      if (reviewsData) setReviews(reviewsData);
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. التحقق من النجوم
    if (rating === 0) {
      alert('الرجاء اختيار عدد النجوم ⭐');
      return;
    }

    // 2. التحقق من طول النص (حماية من النصوص الطويلة جداً)
    if (newReview.length > 500) {
      alert('التعليق طويل جداً! المسموح 500 حرف.');
      return;
    }

    // 3. التحقق من الكلمات البذيئة (Filter)
    const hasBadWord = BAD_WORDS.some(word => newReview.includes(word));
    if (hasBadWord) {
      alert('عذراً، التعليق يحتوي على كلمات غير لائقة. يرجى الالتزام بالاحترام.');
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await supabase.from('reviews').insert([{
      professor_id: id,
      content: newReview,
      rating: rating,
      grade: grade || null
    }]).select();

    if (error) {
      alert('حدث خطأ أثناء الإرسال');
    } else {
      setReviews([data[0], ...reviews]);
      setNewReview('');
      setRating(0);
      setGrade('');
    }
    setIsSubmitting(false);
  };

  const averageRating = reviews.length ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : 'جديد';

  if (!professor) return <div className="text-center mt-20">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6 text-right" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* زر العودة للرئيسية */}
        <div className="mb-4">
            <a href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition font-bold text-sm">
                <span>➜</span> العودة للرئيسية
            </a>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">{professor.name}</h1>
          <p className="text-gray-500 mb-4">{professor.college} • {professor.department}</p>
          <div className="inline-flex items-center gap-2 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
            <span className="text-4xl font-bold text-emerald-600">{averageRating}</span>
            <div className="text-left">
              <div className="text-xs text-emerald-800 font-bold uppercase tracking-wider">التقييم العام</div>
              <div className="text-xs text-emerald-600">من {reviews.length} طالب</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">أضف تجربتك</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 mb-2">تقييمك للدكتور</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} className={`text-3xl transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
                  ))}
                </div>
              </div>
              <div className="w-32">
                <label className="block text-xs font-bold text-gray-500 mb-2">الدرجة اللي أخذتها</label>
                <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 text-sm font-bold text-gray-700">
                  <option value="">اختر...</option>
                  {GRADES.map(g => (<option key={g} value={g}>{g}</option>))}
                </select>
              </div>
            </div>
            
            <div className="relative">
                <textarea value={newReview} onChange={(e) => setNewReview(e.target.value)} placeholder="اكتب تجربتك بكل صدق.. كيف شرحه؟ كيف تعامله؟" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 min-h-[120px]" required />
                <div className="absolute bottom-3 left-3 text-xs text-gray-400">{newReview.length}/500</div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-md">{isSubmitting ? 'جاري النشر...' : 'نشر التقييم'}</button>
          </form>
        </div>

        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400 text-sm">{[...Array(5)].map((_, i) => (<span key={i}>{i < review.rating ? '★' : '☆'}</span>))}</div>
                  <span className="text-gray-300 text-xs">•</span>
                  <span className="text-gray-400 text-xs">{new Date(review.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
                {review.grade && (<span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">أخذ عنده: {review.grade}</span>)}
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{review.content}</p>
            </div>
          ))}
          {reviews.length === 0 && (<div className="text-center py-10 opacity-50"><div className="text-4xl mb-2">💬</div><p>كن أول من يقيم هذا الدكتور!</p></div>)}
        </div>
      </div>
    </div>
  );
}