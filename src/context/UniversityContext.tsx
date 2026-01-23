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
          setUniversities(data);
          // نحاول نجيب الجامعة من الذاكرة المحلية (Local Storage)
          const savedSlug = localStorage.getItem('selectedUniSlug');
          const found = data.find(u => u.slug === savedSlug);
          
          // إذا ما فيه شيء محفوظ، نختار المجمعة (mu) كافتراضي
          const defaultUni = found || data.find(u => u.slug === 'mu') || data[0];
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