'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type University = {
  id: string;
  name: string;
  slug: string;
  color_theme: string;
};

// 🔥 1. القائمة الثابتة (مرتبة وجاهزة عشان تطلع فوراً)
// ملاحظة: حطيت لك معرفات مؤقتة (temp_id) لين تجي المعرفات الحقيقية من الداتابيز
const STATIC_UNIVERSITIES: University[] = [
  { id: 'imam_temp', name: 'جامعة الإمام محمد بن سعود', slug: 'imam', color_theme: 'sky' },
  { id: 'mu_temp', name: 'جامعة المجمعة', slug: 'mu', color_theme: 'amber' }, // تأكدت أن السلاق mu حسب كودك القديم
  { id: 'ksu_temp', name: 'جامعة الملك سعود', slug: 'ksu', color_theme: 'blue' },
  { id: 'pnu_temp', name: 'جامعة الأميرة نورة', slug: 'pnu', color_theme: 'cyan' },
  { id: 'kfupm_temp', name: 'جامعة الملك فهد للبترول والمعادن', slug: 'kfupm', color_theme: 'emerald' },
  { id: 'qassim_temp', name: 'جامعة القصيم', slug: 'qassim', color_theme: 'cyan' },
  { id: 'kau_temp', name: 'جامعة الملك عبدالعزيز', slug: 'kau', color_theme: 'lime' },
  { id: 'psau_temp', name: 'جامعة الأمير سطام بن عبدالعزيز', slug: 'psau', color_theme: 'blue' },
  { id: 'iau_temp', name: 'جامعة الإمام عبدالرحمن بن فيصل', slug: 'iau', color_theme: 'green' },
];

const UniversityContext = createContext<any>(null);

export function UniversityProvider({ children }: { children: React.ReactNode }) {
  // 🔥 2. نبدأ بالقائمة الجاهزة فوراً (بدون انتظار)
  const [universities, setUniversities] = useState<University[]>(STATIC_UNIVERSITIES);
  
  // نختار أول جامعة كقيمة افتراضية فوراً
  const [selectedUni, setSelectedUni] = useState<University>(STATIC_UNIVERSITIES[0]);
  
  // 🔥 3. ألغينا حالة التحميل (لأن البيانات عندنا أصلاً)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function syncData() {
      try {
        // أ. نشوف وش آخر جامعة اختارها الطالب من الذاكرة ونحددها له فوراً
        const savedSlug = localStorage.getItem('selectedUniSlug');
        if (savedSlug) {
          const found = STATIC_UNIVERSITIES.find(u => u.slug === savedSlug);
          if (found) setSelectedUni(found);
        }

        // ب. نجيب البيانات الحقيقية من الداتابيز (عشان الـ IDs والترتيب لو تغير)
        const { data } = await supabase.from('universities').select('*');
        
        if (data && data.length > 0) {
            // دمج البيانات: نحدث القائمة الثابتة بالبيانات الحقيقية من السيرفر
            // هذا يضمن أننا نستخدم الـ ID الصحيح للربط مع الدكاترة
            const mergedList = STATIC_UNIVERSITIES.map(staticUni => {
                const realUni = data.find(d => d.slug === staticUni.slug);
                return realUni ? { ...staticUni, ...realUni } : staticUni;
            });

            setUniversities(mergedList);

            // تحديث الجامعة المختارة حالياً بالبيانات الحقيقية أيضاً
            setSelectedUni(prev => {
                const updated = mergedList.find(u => u.slug === prev.slug);
                return updated || prev;
            });
        }

      } catch (error) {
        console.error("Error syncing universities:", error);
      }
    }

    syncData();
  }, []);

  const changeUniversity = (uni: University) => {
    setSelectedUni(uni);
    localStorage.setItem('selectedUniSlug', uni.slug);
  };

  return (
    <UniversityContext.Provider value={{ universities, selectedUni, changeUniversity, isLoading }}>
      {children}
    </UniversityContext.Provider>
  );
}

export const useUniversity = () => useContext(UniversityContext);