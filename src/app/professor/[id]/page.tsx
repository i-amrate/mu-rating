'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';
import { Star, ArrowRight, Award } from 'lucide-react';

// إعداد Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfessorPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // حالات البيانات
  const [professor, setProfessor] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  
  // حالات النموذج
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [grade, setGrade] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const grades = ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"];

  useEffect(() => {
    async function getData() {
      const { data: prof } = await supabase
        .from('professors')
        .select('*')
        .eq('id', id)
        .single();
      
      setProfessor(prof);

      if (prof) {
        const { data: revs } = await supabase
          .from('reviews')
          .select('*')
          .eq('professor_id', prof.id)
          .order('created_at', { ascending: false });
        
        setReviews(revs || []);
      }
    }

    if (id) getData();
  }, [id]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!newReview.trim() || rating === 0 || !grade) {
      alert("الرجاء تعبئة التقييم واختيار النجوم والدرجة");
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('reviews')
      .insert([
        { 
          content: newReview, 
          rating: rating,
          grade: grade,
          professor_id: professor.id 
        }
      ]);

    if (!error) {
      setNewReview('');
      setRating(0);
      setGrade('');
      
      const { data: updatedReviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('professor_id', professor.id)
        .order('created_at', { ascending: false });
        
      setReviews(updatedReviews || []);
    } else {
      alert('صار خطأ بسيط، حاول مرة ثانية');
      console.error(error);
    }
    
    setIsSubmitting(false);
  }

  if (!professor) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30" dir="rtl">
      
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <button 
            onClick={() => router.push('/')} 
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowRight size={20} />
            <span>العودة للقائمة</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 mb-4">
            {professor.name}
          </h1>
          <div className="flex flex-wrap gap-4 text-slate-300 items-center">
            <span className="bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-600 text-sm">
              {professor.department}
            </span>
            <span className="text-slate-500 text-sm">•</span>
<span className="text-sm text-slate-400">جامعة المجمعة</span>          </div>
        </div>

        <div className="bg-slate-900/60 p-6 md:p-8 rounded-2xl border border-slate-800 mb-12">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Award className="text-emerald-500" />
            أضف تجربتك
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-wrap gap-8 items-center">
              <div>
                <label className="block text-sm text-slate-400 mb-2">تقييمك العام</label>
                <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        size={28} 
                        className={`${
                          star <= (hoverRating || rating) 
                            ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" 
                            : "text-slate-600"
                        } transition-colors duration-200`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">الدرجة</label>
                <select 
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">اختر الدرجة</option>
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">رأيك بالتفصيل</label>
              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="كيف كان شرحه؟ تعامله؟ الاختبارات؟..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[120px] resize-y placeholder:text-slate-600"
              />
            </div>

            <button 
              disabled={isSubmitting}
              type="submit" 
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 w-full sm:w-auto"
            >
              {isSubmitting ? 'جاري النشر...' : 'نشر التقييم ✨'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            آراء الطلاب
            <span className="text-sm bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700 font-normal">
              {reviews.length} تقييم
            </span>
          </h3>

          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
              <p className="text-slate-500">لا توجد تقييمات بعد، كن أول المبادرين! 😎</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={16} 
                          className={star <= review.rating ? "fill-yellow-500 text-yellow-500" : "text-slate-700"} 
                        />
                      ))}
                    </div>
                    {review.grade && (
                      <span className="text-xs font-bold bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded border border-emerald-900/50">
                        الدرجة: {review.grade}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500" dir="ltr">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {review.content}
                </p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}