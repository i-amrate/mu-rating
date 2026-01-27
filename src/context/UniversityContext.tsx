'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

type University = {
  id: string;
  name: string;
  slug: string;
  color_theme: string;
  logo_url?: string;
};

// القائمة الثابتة (تأكدنا من majmaah)
const STATIC_UNIVERSITIES: University[] = [
  { id: 'imam_temp', name: 'جامعة الإمام محمد بن سعود', slug: 'imam', color_theme: 'sky' },
  { id: 'mu_temp', name: 'جامعة المجمعة', slug: 'majmaah', color_theme: 'amber' },
  { id: 'ksu_temp', name: 'جامعة الملك سعود', slug: 'ksu', color_theme: 'blue' },
  { id: 'pnu_temp', name: 'جامعة الأميرة نورة', slug: 'pnu', color_theme: 'cyan' },
  { id: 'kfupm_temp', name: 'جامعة الملك فهد للبترول والمعادن', slug: 'kfupm', color_theme: 'emerald' },
  { id: 'qassim_temp', name: 'جامعة القصيم', slug: 'qassim', color_theme: 'cyan' },
  { id: 'kau_temp', name: 'جامعة الملك عبدالعزيز', slug: 'kau', color_theme: 'lime' },
  { id: 'psau_temp', name: 'جامعة الأمير سطام بن عبدالعزيز', slug: 'psau', color_theme: 'blue' },
  { id: 'iau_temp', name: 'جامعة الإمام عبدالرحمن بن فيصل', slug: 'iau', color_theme: 'green' },
];

type UniversityContextType = {
  universities: University[];
  selectedUni: University;
  setSelectedUni: (uni: University) => void;
  changeUniversity: (uni: University) => void;
  isLoading: boolean;
};

const UniversityContext = createContext<UniversityContextType>({
  universities: STATIC_UNIVERSITIES,
  selectedUni: STATIC_UNIVERSITIES[0],
  setSelectedUni: () => {},
  changeUniversity: () => {},
  isLoading: false,
});

export function UniversityProvider({ children }: { children: React.ReactNode }) {
  const [universities, setUniversities] = useState<University[]>(STATIC_UNIVERSITIES);
  const [selectedUni, setSelectedUniState] = useState<University>(STATIC_UNIVERSITIES[0]);
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 هنا كان الحل السحري: استخدام useCallback لتثبيت الدالة ومنع الدوران اللانهائي
  const updateUniversity = useCallback((uni: University) => {
    setSelectedUniState(uni);
    if (typeof window !== 'undefined') {
        localStorage.setItem('selectedUniSlug', uni.slug);
    }
  }, []); // القوسين الفاضية [] تعني: لا تعيد إنشاء الدالة أبداً

  useEffect(() => {
    async function syncData() {
      try {
        if (typeof window !== 'undefined') {
            const savedSlug = localStorage.getItem('selectedUniSlug');
            if (savedSlug) {
              const found = STATIC_UNIVERSITIES.find(u => u.slug === savedSlug);
              if (found) setSelectedUniState(found);
            }
        }

        const { data } = await supabase.from('universities').select('*');
        
        if (data && data.length > 0) {
            const mergedList = STATIC_UNIVERSITIES.map(staticUni => {
                const realUni = data.find(d => d.slug === staticUni.slug);
                return realUni ? { ...staticUni, ...realUni } : staticUni;
            });
            setUniversities(mergedList);
            setSelectedUniState(prev => {
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

  return (
    <UniversityContext.Provider value={{ 
        universities, 
        selectedUni, 
        setSelectedUni: updateUniversity,    
        changeUniversity: updateUniversity,  
        isLoading 
    }}>
      {children}
    </UniversityContext.Provider>
  );
}

export const useUniversity = () => useContext(UniversityContext);