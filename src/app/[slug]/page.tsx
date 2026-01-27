'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js'; // استدعاء المكتبة مباشرة
import Home from '../page';
import { useUniversity } from '@/context/UniversityContext';

// تعريف الاتصال داخل الملف مباشرة لضمان العمل
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UniversityPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { setSelectedUni } = useUniversity();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchUniversity() {
      if (!slug) return;
      console.log("Start fetching for:", slug); // للتجربة

      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('universities')
          .select('*')
          .ilike('slug', slug)
          .single();

        if (error) {
          console.error('Supabase Error:', error);
          setErrorMsg(error.message);
        } else if (!data) {
          console.error('No data found');
          setErrorMsg('الجامعة غير موجودة في البيانات');
        } else {
          console.log("University Found:", data);
          setSelectedUni(data);
        }
      } catch (err: any) {
        console.error('Catch Error:', err);
        setErrorMsg(err.message || 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    }

    fetchUniversity();
  }, [slug, setSelectedUni]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-teal-500 font-bold animate-pulse">جاري جلب بيانات الجامعة...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4" dir="rtl">
        <h1 className="text-2xl font-bold text-red-500">حدث خطأ!</h1>
        <p className="bg-slate-900 p-4 rounded-xl border border-red-900 text-red-300 font-mono text-sm">
          {errorMsg}
        </p>
        <p>تأكد أن الـ Slug في الرابط يطابق قاعدة البيانات (majmaah)</p>
        <a href="/" className="bg-teal-600 text-white px-6 py-2 rounded-xl hover:bg-teal-500 transition-all">
          العودة للرئيسية
        </a>
      </div>
    );
  }

  return <Home />;
}