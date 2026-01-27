'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // تأكد أن المسار صحيح لملف supabase
import Home from '../page'; // نستدعي الصفحة الرئيسية عشان نعرضها بنفس التصميم
import { useUniversity } from '@/context/UniversityContext'; // تأكد من المسار

export default function UniversityPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { setSelectedUni } = useUniversity();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchUniversity() {
      if (!slug) return;

      setLoading(true);
      // نبحث عن الجامعة بالـ Slug حقها
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .ilike('slug', slug) // ilike عشان ما تفرق كابيتال او سمول
        .single();

      if (error || !data) {
        console.error('University not found:', error);
        setError(true);
      } else {
        // نحدث الكونتكست بالجامعة اللي لقيناها
        setSelectedUni(data);
      }
      setLoading(false);
    }

    fetchUniversity();
  }, [slug, setSelectedUni]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-500 font-bold animate-pulse">
        جاري تحميل الجامعة...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <h1 className="text-2xl font-bold text-red-500">عذراً، الجامعة غير موجودة!</h1>
        <p>تأكد من الرابط الصحيح (مثال: /majmaah)</p>
        <a href="/" className="bg-teal-600 text-white px-6 py-2 rounded-xl hover:bg-teal-500 transition-all">
          العودة للرئيسية
        </a>
      </div>
    );
  }

  // إذا وجدنا الجامعة، نعرض الصفحة الرئيسية (وهي بتشوف الـ Context محدث وتعرض بيانات الجامعة)
  return <Home />;
}