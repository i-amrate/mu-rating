'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type University = {
  id: string;
  name: string;
  slug: string;
  color_theme: string;
};

const UniversityContext = createContext<any>(null);

export function UniversityProvider({ children }: { children: React.ReactNode }) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUni, setSelectedUni] = useState<University | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // جلب الجامعات مرة واحدة عند فتح الموقع
  useEffect(() => {
    async function fetchUniversities() {
      try {
        const { data } = await supabase.from('universities').select('*');
        
        if (data && data.length > 0) {
          // 🔥 هنا سحر الترتيب: الإمام أولاً، ثم المجمعة، ثم الباقي
          const sortedData = data.sort((a, b) => {
            // 1. جامعة الإمام محمد بن سعود (تأكد أن السلاق حقها في الداتابيز هو 'imam')
            if (a.slug === 'imam') return -1;
            if (b.slug === 'imam') return 1;
            
            // 2. جامعة المجمعة (mu)
            if (a.slug === 'mu') return -1;
            if (b.slug === 'mu') return 1;
            
            // 3. باقي الجامعات ما يهم ترتيبها
            return 0;
          });

          setUniversities(sortedData);

          // نحاول نجيب الجامعة من الذاكرة المحلية (Local Storage)
          const savedSlug = localStorage.getItem('selectedUniSlug');
          const found = sortedData.find(u => u.slug === savedSlug);
          
          // إذا ما فيه شيء محفوظ، نختار المجمعة (mu) أو أول جامعة في القائمة
          const defaultUni = found || sortedData.find(u => u.slug === 'mu') || sortedData[0];
          setSelectedUni(defaultUni);
        }
      } catch (error) {
        console.error("Error fetching universities:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUniversities();
  }, []);

  // دالة تغيير الجامعة وحفظها في الذاكرة
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