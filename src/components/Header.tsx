'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Instagram, 
  ChevronDown, 
  Check, 
  Building2, 
  GraduationCap, 
  MessageSquarePlus,
  BookOpen,
  Anchor,
  Zap,
  Leaf,
  Shield,
  Palette,
  Heart
} from 'lucide-react';
import { useUniversity } from '../context/UniversityContext';
import { Amiri } from 'next/font/google';

const amiriFont = Amiri({ 
  subsets: ['arabic'],
  weight: ['400', '700'], 
  variable: '--font-amiri'
});

// 🔥 بيانات الجامعات المحدثة (الاسم الكامل) 🔥
const UNI_DATA_EXTENDED: Record<string, { fullName: string }> = {
  'imam': { fullName: 'جامعة الإمام محمد بن سعود' },
  'ksu': { fullName: 'جامعة الملك سعود' },
  'pnu': { fullName: 'جامعة الأميرة نورة' },
  'kfupm': { fullName: 'جامعة الملك فهد للبترول والمعادن' },
  'majmaah': { fullName: 'جامعة المجمعة' },
  'qassim': { fullName: 'جامعة القصيم' },
  'kau': { fullName: 'جامعة الملك عبدالعزيز' },
};

const UNI_SYMBOLS: Record<string, { icon: any, color: string }> = {
  'imam': { icon: BookOpen, color: 'text-sky-400' },
  'ksu': { icon: GraduationCap, color: 'text-blue-500' },
  'pnu': { icon: Heart, color: 'text-rose-400' },
  'kfupm': { icon: Zap, color: 'text-emerald-500' },
  'majmaah': { icon: Shield, color: 'text-amber-500' },
  'qassim': { icon: Leaf, color: 'text-green-500' },
  'kau': { icon: Anchor, color: 'text-cyan-500' },
  'uqu': { icon: Palette, color: 'text-indigo-400' },
  'taibah': { icon: Building2, color: 'text-teal-500' },
};

export default function Header() {
  const { universities, selectedUni, changeUniversity, isLoading } = useUniversity();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) return null;

  const sortedUniversities = [...universities].sort((a: any, b: any) => {
    const priority = ['imam', 'majmaah']; 
    const indexA = priority.indexOf(a.slug?.toLowerCase());
    const indexB = priority.indexOf(b.slug?.toLowerCase());
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });

  return (
    <nav className="fixed top-0 inset-x-0 z-[100] bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50 h-20 md:h-24 px-4 md:px-8 shadow-2xl">
      
      <style jsx>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .header-shimmer {
          background: linear-gradient(to right, #2dd4bf 20%, #ffffff 50%, #2dd4bf 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      <div className="h-full max-w-7xl mx-auto grid grid-cols-3 items-center" dir="rtl">
        
        {/* 1. اليمين: اختيار الجامعة */}
        <div className="flex items-center justify-start border-l border-slate-800/50 h-10 md:h-12 overflow-visible" ref={dropdownRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-start gap-3 group transition-all text-right h-fit"
          >
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 group-hover:border-teal-500/50 transition-colors mt-0.5">
              {(() => {
                const config = UNI_SYMBOLS[selectedUni?.slug?.toLowerCase() || ''];
                const Icon = config?.icon || Building2;
                return <Icon size={22} className={`${config?.color || 'text-slate-400'} transition-all group-hover:scale-110`} />;
              })()}
            </div>
            
            <div className="flex flex-col items-start min-w-0">
              <div className="flex items-start gap-1">
                <span className="text-[11px] md:text-[14px] font-bold text-slate-100 leading-[1.2] group-hover:text-teal-400 transition-colors max-w-[90px] md:max-w-[160px] break-words">
                  {selectedUni ? (UNI_DATA_EXTENDED[selectedUni.slug?.toLowerCase()]?.fullName || selectedUni.name) : 'اختر الجامعة'}
                </span>
                <ChevronDown size={14} className={`text-slate-500 shrink-0 mt-1 transition-transform ${isMenuOpen ? 'rotate-180 text-teal-400' : ''}`} />
              </div>
              
              <span className="text-[8px] md:text-[10px] text-slate-500 font-mono tracking-[0.2em] uppercase leading-none mt-1.5">
                {selectedUni?.slug}
              </span>
            </div>
          </button>

          {isMenuOpen && (
            <div className="absolute top-full right-4 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 z-[110]">
              <div className="p-2 space-y-1 max-h-[350px] overflow-y-auto custom-scrollbar">
                {sortedUniversities.map((uni: any) => {
                  const slug = uni.slug?.toLowerCase();
                  const config = UNI_SYMBOLS[slug] || { icon: Building2, color: 'text-slate-500' };
                  const Icon = config.icon;
                  const displayName = UNI_DATA_EXTENDED[slug]?.fullName || uni.name;

                  return (
                    <button
                      key={uni.id}
                      onClick={() => {
                        changeUniversity(uni);
                        setIsMenuOpen(false);
                        if (window.location.pathname === '/') window.location.reload();
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${selectedUni?.id === uni.id ? 'bg-teal-500/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                          <Icon size={18} className={config.color} />
                        </div>
                        <span className={`text-xs font-bold text-right leading-tight ${selectedUni?.id === uni.id ? 'text-teal-400' : 'text-slate-300'}`}>
                          {displayName}
                        </span>
                      </div>
                      {selectedUni?.id === uni.id && <Check size={16} className="text-teal-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. الوسط: شعار الموقع "مُرشِد" (تم حذف الـ tracking لضمان اتصال الحروف) */}
        <div className="flex justify-center items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-teal-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <GraduationCap className="text-teal-400 relative z-10 w-7 h-7 md:w-10 md:h-10" strokeWidth={1.5} />
            </div>
            {/* 🔥 التعديل هنا: حذف tracking-[0.2em] 🔥 */}
            <span className={`${amiriFont.className} text-2xl md:text-4xl font-black header-shimmer py-1`}>
              مُرشِد
            </span>
          </Link>
        </div>

        {/* 3. اليسار: الأيقونات */}
        <div className="flex items-center justify-end gap-3 md:gap-5 border-r border-slate-800/50 h-10 md:h-12 pr-4 md:pr-0">
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSeQabOUnRPa40dQkm7SqvrW-3YiCGtwi2r3wecDmdPEassO3A/viewform?usp=header" 
            target="_blank"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-teal-400 hover:border-teal-500/50 transition-all"
            title="اقتراحات"
          >
            <MessageSquarePlus size={20} />
          </a>
          <a 
            href="https://www.instagram.com/acc.azzamsa?igsh=MWhjY3luN2htbDJs&utm_source=qr" 
            target="_blank"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-teal-400 hover:border-teal-500/50 transition-all"
            title="إنستقرام"
          >
            <Instagram size={20} />
          </a>
        </div>

      </div>
    </nav>
  );
}