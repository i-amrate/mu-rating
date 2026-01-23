'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { Search, UserRoundPlus, LayoutGrid, ArrowRight, X, Trophy, BookOpen, GraduationCap, ChevronLeft, ChevronDown, ChevronUp, User } from 'lucide-react';

const COLLEGES = [
  "كلية علوم الحاسب والمعلومات", "كلية إدارة الأعمال", "كلية الهندسة", "كلية الطب", 
  "كلية العلوم الطبية التطبيقية", "كلية التربية", "كلية العلوم", "كلية العلوم والدراسات الإنسانية", "السنة التحضيرية"
];

// دالة الألوان الذكية
const getSmartColor = (percentage: number) => {
  if (percentage >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.15)]';
  if (percentage >= 75) return 'text-green-400 bg-green-500/10 border-green-500/20';
  if (percentage >= 60) return 'text-lime-400 bg-lime-500/10 border-lime-500/20';
  if (percentage >= 50) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
  if (percentage >= 30) return 'text-red-400 bg-red-500/10 border-red-500/20';
  return 'text-red-600 bg-red-900/20 border-red-900/30';
};

// دالة ألوان الشارات
const getBadgeStyle = (badge: string) => {
  const positive = ["شرييح", "متعاون", "لين بالتحضير", "اختباراته سهله", "رهييب بالمشروع", "محتررم", "عسسلل", "اخلاق"];
  const negative = ["شرحه سيئ", "غير متعاون", "شدييد بالتحضير", "اختباراته صععبه", "شديد بالمشروع", "غثيث", "وقح"];
  if (positive.includes(badge)) return 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10';
  if (negative.includes(badge)) return 'bg-red-500/5 text-red-400 border-red-500/10';
  return 'bg-slate-800 text-slate-400 border-slate-700';
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [courseSearchTerm, setCourseSearchTerm] = useState(''); 
  const [professors, setProfessors] = useState<any[]>([]); 
  const [allTopProfessors, setAllTopProfessors] = useState<any[]>([]); 
  const [sortedColleges, setSortedColleges] = useState<any[]>([]);
  const [coursesWithStats, setCoursesWithStats] = useState<{name: string, avg: number}[]>([]);
  
  const [showMoreProfs, setShowMoreProfs] = useState(false);
  const [showMoreColleges, setShowMoreColleges] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showCollegesMenu, setShowCollegesMenu] = useState(false);
  const [showCoursesMenu, setShowCoursesMenu] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      const { data: reviews } = await supabase.from('reviews').select('professor_id, rating, course, tags');
      const { data: allProfs } = await supabase.from('professors').select('*');

      if (reviews && allProfs) {
        const profStats: Record<string, { total: number, count: number, tags: string[] }> = {};
        reviews.forEach(r => {
          if (!profStats[r.professor_id]) profStats[r.professor_id] = { total: 0, count: 0, tags: [] };
          profStats[r.professor_id].total += (r.rating / 5) * 100;
          profStats[r.professor_id].count += 1;
          if (r.tags) profStats[r.professor_id].tags.push(...r.tags);
        });

        const profsWithRatings = allProfs.map(p => {
          const tagCounts: Record<string, number> = {};
          profStats[p.id]?.tags.forEach(t => { if(!t.includes('طبيعي')) tagCounts[t] = (tagCounts[t] || 0) + 1 });
          const topTags = Object.entries(tagCounts).sort((a,b) => b[1] - a[1]).slice(0, 3).map(t => t[0]);
          return {
            ...p,
            percent: profStats[p.id] ? Math.round(profStats[p.id].total / profStats[p.id].count) : 0,
            topTags
          };
        }).sort((a, b) => b.percent - a.percent);

        setAllTopProfessors(profsWithRatings);

        const collegeMap: Record<string, { total: number, count: number }> = {};
        profsWithRatings.forEach(p => {
          if (!collegeMap[p.college]) collegeMap[p.college] = { total: 0, count: 0 };
          collegeMap[p.college].total += p.percent;
          collegeMap[p.college].count += 1;
        });
        
        setSortedColleges(COLLEGES.map(name => ({ 
            name, 
            percent: collegeMap[name] && collegeMap[name].count > 0 ? Math.round(collegeMap[name].total / collegeMap[name].count) : 0 
        })).sort((a, b) => b.percent - a.percent));

        const courseMap: Record<string, { total: number, count: number }> = {};
        reviews.forEach(r => {
          if (r.course) {
            const cName = r.course.trim();
            if (!courseMap[cName]) courseMap[cName] = { total: 0, count: 0 };
            courseMap[cName].total += (r.rating / 5) * 100;
            courseMap[cName].count += 1;
          }
        });
        setCoursesWithStats(Object.entries(courseMap).map(([name, s]) => ({ name, avg: Math.round(s.total / s.count) })).sort((a, b) => b.avg - a.avg));
      }
    }
    fetchStats();
  }, []);

  const executeSearch = (term: string) => {
    if (!term.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    setShowCollegesMenu(false);
    setShowCoursesMenu(false);
    setSearchTerm(term);

    const lowerTerm = term.toLowerCase().trim();
    const results = allTopProfessors.filter(p => 
        p.name.toLowerCase().includes(lowerTerm) || 
        p.college.toLowerCase().includes(lowerTerm) || 
        p.department.toLowerCase().includes(lowerTerm)
    );

    setProfessors(results);
    setIsSearching(false);
  };

  const eliteProfessors = allTopProfessors.slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-right relative overflow-x-hidden selection:bg-teal-500/30" dir="rtl">
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-teal-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <main className="flex-1 w-full max-w-lg mx-auto p-6 pt-12 relative z-10">
        
        <div className={`transition-all duration-700 text-center ${hasSearched ? 'mb-4' : 'mb-8'}`}>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300 tracking-tighter">
            {hasSearched ? 'نتائج البحث' : 'دليلك نحو الأفضل'}
          </h1>
        </div>

        <div className="w-full space-y-3 mb-8">
            <div className="h-14 flex bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700 group-focus-within:border-teal-500 transition-all duration-500 shadow-2xl relative overflow-hidden">
                <input 
                  type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && executeSearch(searchTerm)}
                  placeholder="ابحث عن دكتور، مادة، أو تخصص..."
                  className="flex-1 h-full px-6 bg-transparent outline-none text-white placeholder-slate-500 text-sm font-medium"
                />
                <button onClick={() => executeSearch(searchTerm)} className="px-5 text-slate-400 hover:text-teal-400">
                  {isSearching ? <span className="animate-spin block">↻</span> : <Search size={22} />}
                </button>
                {hasSearched && <button onClick={() => { setHasSearched(false); setSearchTerm(''); }} className="px-4 text-red-400 hover:scale-110 transition-transform"><X size={20} /></button>}
            </div>

            <div className="grid grid-cols-2 gap-3 h-[120px]">
                <Link href="/add-professor" className="group relative overflow-hidden flex flex-col items-center justify-center gap-2 rounded-[24px] border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 transition-all duration-500 hover:border-teal-500/40 hover:shadow-[0_0_30px_rgba(20,184,166,0.15)]">
                    <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                    <div className="relative w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-slate-800 group-hover:border-teal-500/30 group-hover:shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                        <UserRoundPlus size={24} className="text-slate-400 group-hover:text-teal-400 transition-colors duration-300" />
                    </div>
                    <div className="flex flex-col items-center gap-0.5 relative z-10">
                        <span className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">إضافة دكتور</span>
                        <span className="text-[9px] text-slate-500 font-medium group-hover:text-teal-500/80 transition-colors">ساهم في بناء المجتمع</span>
                    </div>
                </Link>

                <div className="flex flex-col gap-2">
                    <button onClick={() => {setShowCollegesMenu(!showCollegesMenu); setShowCoursesMenu(false);}} className={`flex-1 flex items-center justify-between px-4 bg-slate-900/40 rounded-2xl border transition-all duration-300 ${showCollegesMenu ? 'border-teal-500 bg-teal-500/5' : 'border-slate-800 hover:border-slate-600'}`}>
                        <div className="flex items-center gap-2">
                            <LayoutGrid size={16} className={showCollegesMenu ? 'text-teal-400' : 'text-slate-500'} />
                            <span className="font-bold text-[11px] text-slate-300">الكليات</span>
                        </div>
                        <ChevronLeft size={16} className={`text-slate-600 transition-transform duration-300 ${showCollegesMenu ? '-rotate-90 text-teal-400' : ''}`} />
                    </button>
                    <button onClick={() => {setShowCoursesMenu(!showCoursesMenu); setShowCollegesMenu(false);}} className={`flex-1 flex items-center justify-between px-4 bg-slate-900/40 rounded-2xl border transition-all duration-300 ${showCoursesMenu ? 'border-teal-500 bg-teal-500/5' : 'border-slate-800 hover:border-slate-600'}`}>
                        <div className="flex items-center gap-2">
                            <BookOpen size={16} className={showCoursesMenu ? 'text-teal-400' : 'text-slate-500'} />
                            <span className="font-bold text-[11px] text-slate-300">المقررات</span>
                        </div>
                        <ChevronLeft size={16} className={`text-slate-600 transition-transform duration-300 ${showCoursesMenu ? '-rotate-90 text-teal-400' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="relative">
                {showCollegesMenu && (
                    <div className="absolute top-0 right-0 left-0 mt-1 bg-slate-900 border border-slate-700 rounded-2xl p-2 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2">
                        <div className="max-h-60 overflow-y-auto space-y-1">
                            {sortedColleges.map((c, i) => (
                                <button key={i} onClick={() => executeSearch(c.name)} className="w-full flex items-center justify-between p-2.5 hover:bg-slate-800 rounded-xl transition-all">
                                    <span className="text-slate-300 text-xs font-bold">{c.name}</span>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-lg border font-black ${getSmartColor(c.percent)}`}>{c.percent}%</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {showCoursesMenu && (
                    <div className="absolute top-0 right-0 left-0 mt-1 bg-slate-900 border border-slate-700 rounded-2xl p-4 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2">
                        <input autoFocus placeholder="بحث في المقررات..." value={courseSearchTerm} onChange={(e) => setCourseSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white mb-3 outline-none focus:border-teal-500" />
                        <div className="max-h-48 overflow-y-auto space-y-2">
                            {coursesWithStats.filter(c => c.name.includes(courseSearchTerm)).map((c, i) => (
                                <button key={i} onClick={() => executeSearch(c.name)} className="w-full flex items-center justify-between p-3 hover:bg-slate-800 rounded-xl transition-all">
                                    <span className="text-slate-300 text-xs font-bold group-hover/item:text-teal-400">{c.name}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-black ${getSmartColor(c.avg)}`}>{c.avg}%</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {!hasSearched && (
          <div className="pt-4 space-y-8 animate-fade-in-up">
            <section className="space-y-3">
                <div className="flex items-center gap-3 pr-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#BF953F] via-[#FCF6BA] to-[#B38728] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.3)]"></div>
                    <Trophy className="text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" size={20} />
                    <h2 className="text-lg font-black text-white tracking-tight">نخبة الدكاترة</h2>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {(showMoreProfs ? eliteProfessors : eliteProfessors.slice(0, 3)).map((p, i) => (
                        <Link key={p.id} href={`/professor/${p.id}`} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800/60 rounded-2xl hover:bg-slate-800/80 hover:border-[#D4AF37]/30 transition-all duration-300 group">
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i < 3 ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                    {i + 1}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-200 text-sm group-hover:text-teal-300 transition-colors">{p.name}</h3>
                                    {p.topTags && p.topTags.length > 0 && (
                                        <div className="flex gap-1 mt-1">
                                            {p.topTags.map((tag: string, idx: number) => (
                                                <span key={idx} className={`text-[7px] px-1 rounded border ${getBadgeStyle(tag)}`}>{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded-lg border font-black text-[10px] ${getSmartColor(p.percent)}`}>
                                {p.percent}%
                            </div>
                        </Link>
                    ))}
                    {eliteProfessors.length > 3 && (
                        <button onClick={() => setShowMoreProfs(!showMoreProfs)} className="w-full py-2.5 flex items-center justify-center gap-2 text-slate-500 hover:text-white transition-all text-[10px] font-bold bg-slate-900/20 rounded-xl border border-dashed border-slate-800 active:scale-[0.98]">
                            {showMoreProfs ? <><ChevronUp size={12}/> عرض أقل</> : <><ChevronDown size={12}/> عرض المزيد (+{eliteProfessors.length - 3})</>}
                        </button>
                    )}
                </div>
            </section>

            <section className="space-y-3 pb-12">
                <div className="flex items-center gap-3 pr-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-[#BF953F] via-[#FCF6BA] to-[#B38728] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.3)]"></div>
                    <Trophy className="text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" size={20} />
                    <h2 className="text-lg font-black text-white tracking-tight">ترتيب الكليات</h2>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {(showMoreColleges ? sortedColleges : sortedColleges.slice(0, 3)).map((c, i) => {
                        const collegeColorClass = getSmartColor(c.percent).split(' ')[0];
                        return (
                            <div key={i} onClick={() => executeSearch(c.name)} className="flex items-center justify-between p-3 bg-slate-900/30 border border-slate-800/50 rounded-2xl cursor-pointer hover:bg-slate-800 transition-all duration-300 group">
                                <div className="flex items-center gap-3">
                                    <GraduationCap size={18} className={`${collegeColorClass} transition-colors duration-500`} />
                                    <h3 className="font-bold text-slate-300 text-xs group-hover:text-white transition-colors">{c.name}</h3>
                                </div>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg border transition-all ${getSmartColor(c.percent)}`}>
                                    {c.percent}%
                                </span>
                            </div>
                        );
                    })}
                    {sortedColleges.length > 3 && (
                        <button onClick={() => setShowMoreColleges(!showMoreColleges)} className="w-full py-2.5 flex items-center justify-center gap-2 text-slate-500 hover:text-white transition-all text-[10px] font-bold bg-slate-900/20 rounded-xl border border-dashed border-slate-800 active:scale-[0.98]">
                            {showMoreColleges ? <><ChevronUp size={12}/> عرض أقل</> : <><ChevronDown size={12}/> عرض المزيد</>}
                        </button>
                    )}
                </div>
            </section>
          </div>
        )}

        {/* 🔥 نتائج البحث الذكي مع الخط الممتد والكليات 🔥 */}
        {hasSearched && (
          <div className="space-y-3 pb-10 animate-fade-in">
            {professors.map((prof) => (
              <Link key={prof.id} href={`/professor/${prof.id}`} className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl hover:border-teal-500/30 hover:bg-slate-900 transition-all group">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-teal-500/30 transition-colors">
                        <User size={20} className="text-slate-400 group-hover:text-teal-400" />
                    </div>
                    <div>
                        {/* 🔥 الاسم مع الخط الذكي الممتد 🔥 */}
                        <div className="w-fit border-b-2 border-teal-500/50 pb-1 mb-1.5 group-hover:border-teal-400 transition-colors">
                            <span className="text-[10px] text-teal-500 font-bold ml-1">دكتور |</span>
                            <span className="font-bold text-slate-100 text-sm group-hover:text-white transition-colors">{prof.name}</span>
                        </div>
                        
                        {/* 🔥 عرض اسم الكلية 🔥 */}
                        <p className="text-[9px] text-slate-500 mb-1.5">{prof.college}</p>

                        {/* الشارات في البحث */}
                        {prof.topTags && prof.topTags.length > 0 ? (
                            <div className="flex gap-1">
                                {prof.topTags.map((tag: string, idx: number) => (
                                    <span key={idx} className={`text-[7px] px-1.5 py-0.5 rounded-md border font-medium ${getBadgeStyle(tag)}`}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        ) : <span className="text-[8px] text-slate-600">لا توجد شارات بعد</span>}
                    </div>
                </div>
                
                {/* النسبة المئوية في البحث */}
                <div className="flex items-center gap-3">
                    {prof.percent !== undefined && (
                        <div className={`px-2 py-1 rounded-lg border font-black text-[10px] ${getSmartColor(prof.percent)}`}>
                            {prof.percent}%
                        </div>
                    )}
                    <ArrowRight size={16} className="text-slate-600 rotate-180 group-hover:text-teal-400 transition-colors" />
                </div>
              </Link>
            ))}
            {professors.length === 0 && (
                <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
                    <p className="text-slate-500 text-xs">لا توجد نتائج مطابقة</p>
                </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 