'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { Search, Plus, LayoutGrid, ArrowRight, X, Star, Trophy, BookOpen, Medal, GraduationCap } from 'lucide-react';

const COLLEGES = [
  "كلية علوم الحاسب والمعلومات", "كلية إدارة الأعمال", "كلية الهندسة", "كلية الطب", 
  "كلية العلوم الطبية التطبيقية", "كلية التربية", "كلية العلوم", "كلية العلوم والدراسات الإنسانية", "السنة التحضيرية"
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [courseSearchTerm, setCourseSearchTerm] = useState(''); 
  const [professors, setProfessors] = useState<any[]>([]);
  const [top3Professors, setTop3Professors] = useState<any[]>([]);
  const [sortedColleges, setSortedColleges] = useState<any[]>([]);
  const [dynamicCourses, setDynamicCourses] = useState<string[]>([]);
  
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [showCollegesMenu, setShowCollegesMenu] = useState(false);
  const [showCoursesMenu, setShowCoursesMenu] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      // 1. جلب التقييمات والدكاترة معاً
      const { data: reviews } = await supabase.from('reviews').select('professor_id, rating, course');
      const { data: allProfs } = await supabase.from('professors').select('*');

      if (reviews && allProfs) {
        // حساب إحصائيات الدكاترة
        const profStats: Record<string, { total: number, count: number }> = {};
        reviews.forEach(r => {
          if (!profStats[r.professor_id]) profStats[r.professor_id] = { total: 0, count: 0 };
          profStats[r.professor_id].total += r.rating;
          profStats[r.professor_id].count += 1;
        });

        // ربط البيانات وحساب المعدل لكل دكتور
        const profsWithRatings = allProfs.map(p => ({
          ...p,
          avg: profStats[p.id] ? (profStats[p.id].total / profStats[p.id].count).toFixed(1) : "0.0"
        }));

        // أفضل 3 دكاترة
        const top3 = [...profsWithRatings]
          .filter(p => parseFloat(p.avg) > 0)
          .sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg))
          .slice(0, 3);
        setTop3Professors(top3);

        // حساب معدل كل كلية
        const collegeMap: Record<string, { total: number, count: number }> = {};
        profsWithRatings.forEach(p => {
          if (!collegeMap[p.college]) collegeMap[p.college] = { total: 0, count: 0 };
          if (parseFloat(p.avg) > 0) {
            collegeMap[p.college].total += parseFloat(p.avg);
            collegeMap[p.college].count += 1;
          }
        });

        const finalColleges = COLLEGES.map(name => ({
          name,
          avg: collegeMap[name] && collegeMap[name].count > 0 
               ? (collegeMap[name].total / collegeMap[name].count).toFixed(1) 
               : "0.0"
        })).sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));

        setSortedColleges(finalColleges);
        setDynamicCourses(Array.from(new Set(reviews.map(r => r.course).filter(Boolean))));
      }
    }
    fetchStats();
  }, []);

  const executeSearch = async (term: string) => {
    if (!term.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    setShowCollegesMenu(false);
    setShowCoursesMenu(false);
    setSearchTerm(term);
    const { data } = await supabase.from('professors').select('*').or(`name.ilike.%${term}%,college.ilike.%${term}%,department.ilike.%${term}%`);
    setProfessors(data || []);
    setIsSearching(false);
  };

  const clearSearch = () => { setHasSearched(false); setSearchTerm(''); setProfessors([]); };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-right relative overflow-x-hidden selection:bg-teal-500/30" dir="rtl">
      
      {/* الخلفية الجمالية */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-teal-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <main className="flex-1 w-full max-w-lg mx-auto p-6 flex flex-col justify-start pt-12 relative z-10">
        
        <div className={`transition-all duration-500 text-center ${hasSearched ? 'mb-4' : 'mb-8'}`}>
          <h1 className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300 tracking-widest">
            {hasSearched ? 'نتائج البحث' : 'دليلك نحو الأفضل'}
          </h1>
        </div>

        <div className="w-full space-y-3 mb-8">
            {/* مربع البحث */}
            <div className="relative group w-full h-12">
              <div className="h-full flex bg-slate-800 rounded-xl shadow-lg border border-slate-700 group-focus-within:border-teal-500 transition-all duration-300">
                <input 
                  type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && executeSearch(searchTerm)}
                  placeholder="ابحث عن دكتور، مادة، أو تخصص..."
                  className="flex-1 h-full px-4 bg-transparent outline-none text-white placeholder-slate-400 text-sm rounded-xl min-w-0"
                />
                <button onClick={() => executeSearch(searchTerm)} className="px-4 text-slate-400 hover:text-teal-400">
                  {isSearching ? <span className="animate-spin block">↻</span> : <Search size={20} />}
                </button>
                {hasSearched && <button onClick={clearSearch} className="px-3 text-red-400"><X size={18} /></button>}
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
                <Link href="/add-professor" className="flex items-center justify-between w-full h-12 px-4 bg-slate-800 rounded-xl border border-slate-700 hover:bg-teal-600 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center"><Plus size={18} /></div>
                    <span className="font-bold text-sm text-slate-300 group-hover:text-white">إضافة دكتور</span>
                  </div>
                  <ArrowRight size={16} className="text-slate-500 group-hover:text-white rotate-180" />
                </Link>

                {/* تصفح الكليات */}
                <div className="relative w-full">
                  <button onClick={() => {setShowCollegesMenu(!showCollegesMenu); setShowCoursesMenu(false);}} className={`flex items-center justify-between w-full h-12 px-4 bg-slate-800 rounded-xl border border-slate-700 transition-all ${showCollegesMenu ? 'bg-teal-600 text-white' : ''}`}>
                    <div className="flex items-center gap-3">
                      <LayoutGrid size={18} className="text-teal-400" />
                      <span className="font-bold text-sm">تصفح الكليات</span>
                    </div>
                    <ArrowRight size={16} className={`rotate-180 transition-transform ${showCollegesMenu ? 'rotate-90' : ''}`} />
                  </button>
                  {showCollegesMenu && (
                    <div className="absolute top-full right-0 left-0 mt-2 bg-slate-800 rounded-2xl p-2 z-50 shadow-2xl border border-slate-700">
                      {COLLEGES.map((c, i) => (
                        <button key={i} onClick={() => executeSearch(c)} className="w-full text-right p-3 hover:bg-slate-700 rounded-xl text-slate-300 text-xs transition-colors">{c}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* تصفح المقررات */}
                <div className="relative w-full">
                  <button onClick={() => {setShowCoursesMenu(!showCoursesMenu); setShowCollegesMenu(false);}} className={`flex items-center justify-between w-full h-12 px-4 bg-slate-800 rounded-xl border border-slate-700 transition-all ${showCoursesMenu ? 'bg-teal-600 text-white' : ''}`}>
                    <div className="flex items-center gap-3">
                      <BookOpen size={18} className="text-teal-400" />
                      <span className="font-bold text-sm">تصفح المقررات</span>
                    </div>
                    <ArrowRight size={16} className={`rotate-180 transition-transform ${showCoursesMenu ? 'rotate-90' : ''}`} />
                  </button>
                  {showCoursesMenu && (
                    <div className="absolute top-full right-0 left-0 mt-2 bg-slate-800 rounded-2xl p-4 z-50 shadow-2xl border border-slate-700">
                      <input autoFocus placeholder="بحث في المقررات..." value={courseSearchTerm} onChange={(e) => setCourseSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white mb-3 outline-none focus:border-teal-500" />
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {dynamicCourses.filter(c => c.includes(courseSearchTerm)).map((c, i) => (
                          <button key={i} onClick={() => executeSearch(c)} className="w-full text-right p-2 hover:bg-slate-700 rounded-lg text-slate-400 text-xs">{c}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 🔥 الأقسام الجديدة 🔥 */}
                {!hasSearched && (
                  <div className="pt-6 space-y-10 animate-fade-in">
                    
                    {/* 1. أفضل 3 دكاترة */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 border-r-4 border-amber-500 pr-3">
                        <Trophy className="text-amber-500" size={20} />
                        <h2 className="text-lg font-black text-white">أفضل 3 دكاترة بالجامعة</h2>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {top3Professors.map((p, i) => (
                          <Link key={p.id} href={`/professor/${p.id}`} className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-amber-500/30 transition-all">
                            <div className="flex items-center gap-4">
                              <span className="text-xl font-black text-slate-700">#{i+1}</span>
                              <div>
                                <h3 className="font-bold text-slate-200 text-sm">{p.name}</h3>
                                <p className="text-[10px] text-slate-500">{p.department}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                              <span className="text-xs font-bold text-amber-500">{p.avg}</span>
                              <Star size={12} className="text-amber-500 fill-amber-500" />
                            </div>
                          </Link>
                        ))}
                        {top3Professors.length === 0 && <p className="text-center text-slate-600 text-xs py-4">سيظهر الدكاترة هنا بعد أول تقييم</p>}
                      </div>
                    </section>

                    {/* 2. أفضل الكليات (القائمة الكاملة مرتبة) */}
                    <section className="space-y-4 pb-10">
                      <div className="flex items-center gap-2 border-r-4 border-blue-500 pr-3">
                        <Medal className="text-blue-500" size={20} />
                        <h2 className="text-lg font-black text-white">ترتيب الكليات</h2>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {sortedColleges.map((c, i) => (
                          <div key={i} onClick={() => executeSearch(c.name)} className="flex items-center justify-between p-4 bg-slate-900/20 border border-slate-800/50 rounded-xl cursor-pointer hover:bg-blue-500/5 transition-all">
                            <div className="flex items-center gap-3">
                              <GraduationCap size={18} className="text-slate-500" />
                              <h3 className="font-bold text-slate-300 text-xs">{c.name}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${parseFloat(c.avg) > 0 ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-600'}`}>
                                {c.avg}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}
            </div>
        </div>

        {/* نتائج البحث */}
        {hasSearched && (
          <div className="space-y-4 pb-10 animate-fade-in-up">
            {professors.map((prof) => (
              <Link key={prof.id} href={`/professor/${prof.id}`} className="block bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-teal-500 transition-all group">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">{prof.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{prof.college}</p>
                  </div>
                  <ArrowRight size={16} className="rotate-180 text-slate-600" />
                </div>
              </Link>
            ))}
            {professors.length === 0 && (
              <div className="text-center py-12 bg-slate-800/50 rounded-3xl border border-dashed border-slate-700">
                <p className="text-slate-400 text-sm">ما لقينا نتائج لبحثك</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 