'use client';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { useUniversity } from '../context/UniversityContext';
import { Search, UserRoundPlus, LayoutGrid, ArrowRight, X, Trophy, BookOpen, GraduationCap, ChevronLeft, ChevronDown, ChevronUp, User, Loader2 } from 'lucide-react';
import { Amiri } from 'next/font/google';

const amiriFont = Amiri({ 
  subsets: ['arabic'],
  weight: ['400', '700'], 
  variable: '--font-amiri'
});

const UNIVERSITY_CONFIG: Record<string, { fullName: string, color: string, colleges: string[] }> = {
  'imam': { fullName: "جامعة الإمام محمد بن سعود", color: '#38bdf8', colleges: [] },
  'ksu': { fullName: "جامعة الملك سعود", color: '#1d4ed8', colleges: [] },
  'pnu': { fullName: "جامعة الأميرة نورة", color: '#0e7490', colleges: [] },
  'kfupm': { fullName: "جامعة الملك فهد للبترول والمعادن", color: '#047857', colleges: [] },
  'majmaah': { fullName: "جامعة المجمعة", color: '#d97706', colleges: [] },
  'qassim': { fullName: "جامعة القصيم", color: '#06b6d4', colleges: [] },
  'kau': { fullName: "جامعة الملك عبدالعزيز", color: '#65a30d', colleges: [] }
};

const DEFAULT_COLLEGES: string[] = []; 

const getSmartColor = (percentage: number) => {
  if (percentage >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.15)]';
  if (percentage >= 75) return 'text-green-400 bg-green-500/10 border-green-500/20';
  if (percentage >= 60) return 'text-lime-400 bg-lime-500/10 border-lime-500/20';
  if (percentage >= 50) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
  if (percentage >= 30) return 'text-red-400 bg-red-500/10 border-red-500/20';
  return 'text-red-600 bg-red-900/20 border-red-900/30';
};

const getBadgeStyle = (badge: string) => {
  if (["شرييح", "متعاون", "لين بالتحضير", "اختباراته سهله", "رهييب بالمشروع", "محتررم", "عسسلل", "اخلاق"].includes(badge)) return 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10';
  if (["شرحه سيئ", "غير متعاون", "شدييد بالتحضير", "اختباراته صععبه", "شديد بالمشروع", "غثيث", "وقح"].includes(badge)) return 'bg-red-500/5 text-red-400 border-red-500/10';
  return 'bg-slate-800 text-slate-400 border-slate-700';
};

export default function Home() {
  const { selectedUni } = useUniversity();
  const [searchTerm, setSearchTerm] = useState('');
  const [courseSearchTerm, setCourseSearchTerm] = useState(''); 
  const [collegeSearchTerm, setCollegeSearchTerm] = useState('');
  const [professors, setProfessors] = useState<any[]>([]); 
  const [allTopProfessors, setAllTopProfessors] = useState<any[]>([]); 
  const [sortedColleges, setSortedColleges] = useState<any[]>([]);
  const [coursesWithStats, setCoursesWithStats] = useState<{name: string, avg: number}[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isEliteOpen, setIsEliteOpen] = useState(false); 
  const [isCollegesOpen, setIsCollegesOpen] = useState(false);
  const [showMoreProfs, setShowMoreProfs] = useState(false);
  const [showMoreColleges, setShowMoreColleges] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showCollegesMenu, setShowCollegesMenu] = useState(false);
  const [showCoursesMenu, setShowCoursesMenu] = useState(false);
  const menusRef = useRef<HTMLDivElement>(null);

  const currentConfig = selectedUni ? UNIVERSITY_CONFIG[selectedUni.slug?.toLowerCase()] : null;
  const primaryColor = currentConfig?.color || '#14b8a6';
  const universityName = currentConfig?.fullName || selectedUni?.name || 'الجامعة';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menusRef.current && !menusRef.current.contains(event.target as Node)) {
        setShowCollegesMenu(false);
        setShowCoursesMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!selectedUni) return;
    async function fetchStats() {
      setIsLoadingData(true);
      try {
        const { data: allProfs } = await supabase.from('professors').select('*').eq('university_id', selectedUni.id);
        
        if (!allProfs || allProfs.length === 0) {
          setAllTopProfessors([]); setSortedColleges([]); setCoursesWithStats([]);
          setIsLoadingData(false); return;
        }

        const dbColleges = Array.from(new Set(allProfs.map(p => p.college?.trim()))).filter(Boolean);
        const configColleges = (currentConfig?.colleges || []).map(c => c.trim());
        const allUniqueColleges = Array.from(new Set([...configColleges, ...dbColleges]));

        const professorIds = allProfs.map(p => p.id);
        const { data: reviews } = await supabase.from('reviews').select('professor_id, rating, course, tags').in('professor_id', professorIds);
        
        const profStats: Record<string, { total: number, count: number, tags: string[] }> = {};
        const courseMap: Record<string, { total: number, count: number }> = {}; // 🔥 لحساب متوسط المقررات

        if (reviews) {
          reviews.forEach(r => {
            if (!profStats[r.professor_id]) profStats[r.professor_id] = { total: 0, count: 0, tags: [] };
            profStats[r.professor_id].total += (r.rating / 5) * 100;
            profStats[r.professor_id].count += 1;
            if (r.tags) profStats[r.professor_id].tags.push(...r.tags);

            // 🔥 تجميع المقررات ديناميكياً من قاعدة البيانات (التقييمات) 🔥
            if (r.course && r.course.trim()) {
              const cName = r.course.trim();
              if (!courseMap[cName]) courseMap[cName] = { total: 0, count: 0 };
              courseMap[cName].total += (r.rating / 5) * 100;
              courseMap[cName].count += 1;
            }
          });
        }

        const profsWithRatings = allProfs.map(p => {
          const tagCounts: Record<string, number> = {};
          profStats[p.id]?.tags.forEach(t => { if(!t.includes('طبيعي')) tagCounts[t] = (tagCounts[t] || 0) + 1 });
          const topTags = Object.entries(tagCounts).sort((a,b) => b[1] - a[1]).slice(0, 3).map(t => t[0]);
          return { ...p, percent: profStats[p.id] ? Math.round(profStats[p.id].total / profStats[p.id].count) : 0, topTags };
        }).sort((a, b) => b.percent - a.percent);
        
        setAllTopProfessors(profsWithRatings);

        const collegeMap: Record<string, { total: number, count: number }> = {};
        profsWithRatings.forEach(p => {
          const cName = p.college?.trim();
          if (cName) {
            if (!collegeMap[cName]) collegeMap[cName] = { total: 0, count: 0 };
            collegeMap[cName].total += p.percent;
            collegeMap[cName].count += 1;
          }
        });

        setSortedColleges(allUniqueColleges.map(name => ({ 
          name, 
          percent: collegeMap[name] && collegeMap[name].count > 0 ? Math.round(collegeMap[name].total / collegeMap[name].count) : 0 
        })).sort((a, b) => b.percent - a.percent));

        // 🔥 تحديث قائمة المقررات المستخرجة طبق الأصل من منطق الكليات 🔥
        setCoursesWithStats(Object.entries(courseMap).map(([name, s]) => ({ 
          name, 
          avg: Math.round(s.total / s.count) 
        })).sort((a, b) => b.avg - a.avg));

      } catch (err) { console.error(err); }
      setIsLoadingData(false);
    }
    fetchStats();
  }, [selectedUni, currentConfig]);

  const executeSearch = (term: string) => {
    if (!term.trim()) return;
    setIsSearching(true); setHasSearched(true); setShowCollegesMenu(false); setShowCoursesMenu(false); setSearchTerm(term);
    const results = allTopProfessors.filter(p => p.name.includes(term) || (p.college && p.college.includes(term)));
    setProfessors(results); setIsSearching(false);
  };

  const eliteProfessors = allTopProfessors.slice(0, 10);
  if (!selectedUni) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-500 font-bold animate-pulse">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-right relative overflow-x-hidden selection:bg-teal-500/30" dir="rtl">
      
      <style jsx>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .full-sentence-shimmer {
          background: linear-gradient(to right, #2dd4bf 20%, #ffffff 50%, #2dd4bf 80%);
          background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent;
          -webkit-text-fill-color: transparent; animation: shimmer 4s linear infinite; display: inline-block;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>

      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 rounded-full blur-[80px] pointer-events-none translate-z-0 opacity-15" style={{ backgroundColor: primaryColor }}></div>

      <main className="flex-1 w-full max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto p-4 pt-[80px] md:pt-[100px] relative z-10">
        
        <div className={`transition-all duration-500 text-center -mt-20 mb-8 ${amiriFont.className}`}>
          {hasSearched ? <h2 className="text-xl md:text-2xl font-bold text-slate-200">نتائج البحث</h2> : 
          <h1 className="text-2xl md:text-4xl select-none leading-relaxed full-sentence-shimmer font-bold">لـ {universityName}</h1>}
        </div>

        <div className="w-full space-y-2 mb-3">
            <div className="h-14 md:h-16 flex bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700 group-focus-within:border-teal-500 transition-all duration-300 shadow-xl relative overflow-hidden">
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && executeSearch(searchTerm)} placeholder="ابحث عن دكتور، مادة، أو تخصص..." className="flex-1 h-full px-6 bg-transparent outline-none text-white text-sm" />
                <button onClick={() => executeSearch(searchTerm)} className="px-5 text-slate-400 hover:text-teal-400">{isSearching ? <Loader2 size={22} className="animate-spin" /> : <Search size={22} />}</button>
                {hasSearched && <button onClick={() => { setHasSearched(false); setSearchTerm(''); }} className="px-4 text-red-400 hover:scale-110 transition-transform"><X size={20} /></button>}
            </div>
            
            <div ref={menusRef}>
                <div className="grid grid-cols-2 gap-3 md:gap-5 h-40 md:h-48">
                    <Link href="/add-professor" className="group relative overflow-hidden flex flex-col items-center justify-center gap-2 rounded-[24px] border border-slate-700/60 bg-slate-900 hover:border-teal-500/40 transition-all">
                        <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center transition-all group-hover:scale-110 group-hover:border-teal-500/30"><UserRoundPlus size={28} className="text-slate-400 group-hover:text-teal-400" /></div>
                        <div className="flex flex-col items-center gap-0.5 relative z-10"><span className="font-bold text-base text-slate-200 group-hover:text-white transition-colors">إضافة دكتور</span><span className="text-[11px] md:text-xs text-slate-500 font-medium group-hover:text-teal-500/80 transition-colors">ساهم في بناء المجتمع</span></div>
                    </Link>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => {setShowCollegesMenu(!showCollegesMenu); setShowCoursesMenu(false);}} className={`flex-1 flex items-center justify-between px-5 bg-slate-900/40 rounded-2xl border transition-all duration-200 ${showCollegesMenu ? 'border-teal-500 bg-teal-500/5' : 'border-slate-800 hover:border-slate-600'}`}><div className="flex items-center gap-3"><LayoutGrid size={22} className="text-teal-400" /><span className="font-bold text-sm text-slate-300">الكليات</span></div><ChevronLeft size={18} className={showCollegesMenu ? '-rotate-90 text-teal-400' : ''} /></button>
                        <button onClick={() => {setShowCoursesMenu(!showCoursesMenu); setShowCollegesMenu(false);}} className={`flex-1 flex items-center justify-between px-5 bg-slate-900/40 rounded-2xl border transition-all duration-200 ${showCoursesMenu ? 'border-teal-500 bg-teal-500/5' : 'border-slate-800 hover:border-slate-600'}`}><div className="flex items-center gap-3"><BookOpen size={22} className="text-teal-400" /><span className="font-bold text-sm text-slate-300">المقررات</span></div><ChevronLeft size={18} className={showCoursesMenu ? '-rotate-90 text-teal-400' : ''} /></button>
                    </div>
                </div>

                <div className="relative">
                    {showCollegesMenu && (
                        <div className="absolute top-0 right-0 left-0 mt-1 bg-slate-900 border border-slate-700 rounded-2xl p-4 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                            <input placeholder="بحث في الكليات..." value={collegeSearchTerm} onChange={(e) => setCollegeSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white mb-3 outline-none focus:border-teal-500 transition-all" />
                            <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                                {sortedColleges.filter(c => c.name.includes(collegeSearchTerm)).map((c, i) => (
                                    <button key={i} onClick={() => executeSearch(c.name)} className="w-full flex items-center justify-between p-2.5 hover:bg-slate-800 rounded-xl transition-all">
                                        <span className="text-slate-300 text-xs font-bold">{c.name}</span>
                                        <span className={`text-[9px] px-2 py-0.5 rounded-lg border font-black ${getSmartColor(c.percent)}`}>{c.percent}%</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* 🔥 قائمة المقررات المحدثة طبق الأصل من منطق الكليات 🔥 */}
                    {showCoursesMenu && (
                        <div className="absolute top-0 right-0 left-0 mt-1 bg-slate-900 border border-slate-700 rounded-2xl p-4 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                            <input placeholder="بحث في المقررات..." value={courseSearchTerm} onChange={(e) => setCourseSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white mb-3 outline-none focus:border-teal-500 transition-all" />
                            <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                                {coursesWithStats.filter(c => c.name.includes(courseSearchTerm)).length > 0 ? (
                                  coursesWithStats.filter(c => c.name.includes(courseSearchTerm)).map((c, i) => ( 
                                    <button key={i} onClick={() => executeSearch(c.name)} className="w-full flex items-center justify-between p-3 hover:bg-slate-800 rounded-xl transition-all"> 
                                      <span className="text-slate-300 text-xs font-bold">{c.name}</span> 
                                      <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-black ${getSmartColor(c.avg)}`}>{c.avg}%</span> 
                                    </button> 
                                  ))
                                ) : (
                                  <div className="text-center py-4 text-slate-500 text-xs">لا توجد مقررات مضافة بعد</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {!hasSearched && (
          <div className="mt-8 space-y-4 animate-fade-in-up">
            <section className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-800/60 overflow-hidden transition-all duration-300">
                <button onClick={() => setIsEliteOpen(!isEliteOpen)} className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3"><div className="w-1.5 h-5 bg-gradient-to-b from-[#BF953F] via-[#FCF6BA] to-[#B38728] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.3)]"></div><Trophy className="text-[#D4AF37]" size={20} /><h2 className="text-base font-black text-white">نخبة الدكاترة</h2></div>
                    <ChevronLeft size={20} className={`text-slate-500 transition-transform duration-300 ${isEliteOpen ? '-rotate-90 text-[#D4AF37]' : ''}`} />
                </button>
                <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isEliteOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden"><div className="p-4 pt-0 space-y-2">
                        {allTopProfessors.length > 0 ? (
                            eliteProfessors.slice(0, 3).map((p, i) => (
                                <Link key={p.id} href={`/professor/${p.id}`} className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800/60 rounded-xl hover:bg-slate-800 transition-all group">
                                    <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">{i + 1}</div><h3 className="font-bold text-slate-200 text-xs md:text-sm group-hover:text-teal-300 transition-colors">{p.name}</h3></div>
                                    <div className={`px-2 py-0.5 rounded-lg border font-black text-[10px] ${getSmartColor(p.percent)}`}>{p.percent}%</div>
                                </Link>
                            ))
                        ) : <div className="text-center py-2 text-slate-500 text-xs">لا يوجد بيانات</div>}
                    </div></div>
                </div>
            </section>
            
            <section className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-800/60 overflow-hidden transition-all duration-300">
                <button onClick={() => setIsCollegesOpen(!isCollegesOpen)} className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3"><div className="w-1.5 h-5 bg-gradient-to-b from-[#BF953F] via-[#FCF6BA] to-[#B38728] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.3)]"></div><Trophy className="text-[#D4AF37]" size={20} /><h2 className="text-base font-black text-white">ترتيب الكليات</h2></div>
                    <ChevronLeft size={20} className={`text-slate-500 transition-transform duration-300 ${isCollegesOpen ? '-rotate-90 text-[#D4AF37]' : ''}`} />
                </button>
                <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isCollegesOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden"><div className="p-4 pt-0 space-y-2">
                        {sortedColleges.length > 0 ? (
                            sortedColleges.slice(0, 3).map((c, i) => (
                                <div key={i} onClick={() => executeSearch(c.name)} className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition-all">
                                    <h3 className="font-bold text-slate-300 text-xs">{c.name}</h3>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${getSmartColor(c.percent)}`}>{c.percent}%</span>
                                </div>
                            ))
                        ) : <div className="text-center py-2 text-slate-500 text-xs">لا توجد بيانات</div>}
                    </div></div>
                </div>
            </section>
          </div>
        )}

        {hasSearched && (
          <div className="space-y-3 pb-10 animate-fade-in">
            {professors.map((prof) => (
              <Link key={prof.id} href={`/professor/${prof.id}`} className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl hover:border-teal-500/30 hover:bg-slate-900 transition-all group">
                <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-teal-500/30 transition-colors"><User size={18} className="text-slate-400 group-hover:text-teal-400" /></div>
                    <div><div className="w-fit border-b-2 border-teal-500/50 pb-1 mb-1 group-hover:border-teal-400 transition-colors"><span className="text-[9px] text-teal-500 font-bold ml-1">دكتور |</span><span className="font-bold text-slate-100 text-xs md:text-sm group-hover:text-white transition-colors">{prof.name}</span></div><p className="text-[8px] text-slate-500 mb-1">{prof.college}</p></div>
                </div>
                <div className="flex items-center gap-3">{prof.percent !== undefined && ( <div className={`px-2 py-0.5 rounded-lg border font-black text-[9px] ${getSmartColor(prof.percent)}`}>{prof.percent}%</div> )}<ArrowRight size={14} className="text-slate-600 rotate-180 group-hover:text-teal-400 transition-colors" /></div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}  