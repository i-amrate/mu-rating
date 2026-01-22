'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { Search, Plus, LayoutGrid, ArrowRight, X, Star, Trophy, BookOpen } from 'lucide-react'; // أضفنا BookOpen

// قائمة الكليات
const COLLEGES = [
  "كلية علوم الحاسب والمعلومات",
  "كلية إدارة الأعمال",
  "كلية الهندسة",
  "كلية الطب",
  "كلية العلوم الطبية التطبيقية",
  "كلية التربية",
  "كلية العلوم",
  "كلية العلوم والدراسات الإنسانية",
  "السنة التحضيرية"
];

// 🔥 قائمة المقررات (أمثلة) - تقدر تضيف موادك هنا
const COURSES = [
  "مبادئ المحاسبة (1)",
  "مبادئ المحاسبة (2)",
  "محاسبة التكاليف",
  "الفيزياء العامة",
  "تفاضل وتكامل (1)",
  "الثقافة الإسلامية (سلم)",
  "التحرير العربي (عرب)",
  "لغة إنجليزية",
  "مقدمة في البرمجة",
  "اقتصاد جزئي",
  "إدارة مالية"
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [professors, setProfessors] = useState<any[]>([]);
  const [topProfessors, setTopProfessors] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // حالات القوائم
  const [showCollegesMenu, setShowCollegesMenu] = useState(false);
  const [showCoursesMenu, setShowCoursesMenu] = useState(false); // حالة قائمة المقررات

  // --- جلب أفضل الدكاترة ---
  useEffect(() => {
    const fetchTopProfessors = async () => {
      const { data } = await supabase
        .from('professors')
        .select('*')
        .limit(5);
      
      if (data) setTopProfessors(data);
    };

    fetchTopProfessors();
  }, []);

  const executeSearch = async (term: string) => {
    if (!term.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    // نسكر القوائم أول ما يبدأ بحث
    setShowCollegesMenu(false);
    setShowCoursesMenu(false);
    setSearchTerm(term);

    const cleanTerm = term.replace(/^د\./, '').replace(/^د\s/, '').trim();

    // ملاحظة: هنا بيبحث عن اسم المادة في (الاسم، الكلية، القسم)
    // يفضل مستقبلاً تضيف عمود "courses" في قاعدة البيانات للدقة
    const { data, error } = await supabase
      .from('professors')
      .select('*')
      .or(`name.ilike.%${cleanTerm}%,college.ilike.%${cleanTerm}%,department.ilike.%${cleanTerm}%`);

    if (!error && data) {
      setProfessors(data);
    } else {
      setProfessors([]);
    }
    setIsSearching(false);
  };

  // دوال للتحكم في فتح القوائم (عشان ما يفتحون فوق بعض)
  const toggleColleges = () => {
    setShowCollegesMenu(!showCollegesMenu);
    setShowCoursesMenu(false);
  };

  const toggleCourses = () => {
    setShowCoursesMenu(!showCoursesMenu);
    setShowCollegesMenu(false);
  };

  const handleSearchClick = () => executeSearch(searchTerm);
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') executeSearch(searchTerm); };
  const clearSearch = () => { setHasSearched(false); setSearchTerm(''); setProfessors([]); };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-right relative overflow-x-hidden selection:bg-teal-500/30" dir="rtl">
      
      {/* خلفية جمالية */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-teal-600/10 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-96 h-96 bg-slate-800/10 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* ✨ القائمة الجانبية: أفضل الدكاترة (للشاشات الكبيرة) ✨ */}
      <div className="hidden xl:block fixed right-8 top-1/2 -translate-y-1/2 w-72 bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-3xl p-5 shadow-2xl z-40 animate-fade-in-right">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/50">
          <Trophy className="text-amber-400" size={20} />
          <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-l from-amber-200 to-amber-500">
            أفضل الدكاترة
          </h2>
        </div>
        <div className="space-y-3">
          {topProfessors.length > 0 ? (
            topProfessors.map((prof, index) => (
              <Link 
                key={prof.id} 
                href={`/professor/${prof.id}`}
                className="group flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-teal-500/30 rounded-xl transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${index === 0 ? 'bg-amber-500/20 text-amber-400' : index === 1 ? 'bg-slate-400/20 text-slate-300' : index === 2 ? 'bg-orange-700/20 text-orange-400' : 'bg-slate-800 text-slate-500'}`}>
                    {index + 1}
                  </span>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-200 group-hover:text-teal-400 transition-colors line-clamp-1">{prof.name}</p>
                    <p className="text-[9px] text-slate-500 truncate max-w-[100px]">{prof.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-slate-900/80 px-1.5 py-0.5 rounded-md border border-slate-700">
                  <span className="text-[10px] font-bold text-amber-400">5.0</span>
                  <Star size={8} className="text-amber-400 fill-amber-400" />
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-4 text-slate-500 text-xs">جاري التحميل...</div>
          )}
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 w-full max-w-lg mx-auto p-6 flex flex-col justify-start pt-12 relative z-10">
        
        {/* 1. عنوان الصفحة */}
        <div className={`transition-all duration-500 text-center ${hasSearched ? 'mb-4' : 'mb-8'}`}>
          <h1 className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300 tracking-widest leading-relaxed">
            {hasSearched ? 'نتائج البحث' : 'دليلك نحو الأفضل'}
          </h1>
        </div>

        {/* الحاوية الرئيسية للبحث والأزرار */}
        <div className="w-full space-y-3 mb-8">
            
            {/* 2. مربع البحث */}
            <div className="relative group w-full h-12">
              <div className="h-full flex bg-slate-800 rounded-xl shadow-lg border border-slate-700 group-focus-within:border-teal-500 group-focus-within:ring-2 group-focus-within:ring-teal-500/20 transition-all duration-300">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="ابحث عن دكتور، مادة، أو تخصص..."
                  className="flex-1 h-full px-4 bg-transparent outline-none text-white placeholder-slate-400 text-sm rounded-xl min-w-0"
                />
                <button 
                  onClick={handleSearchClick}
                  disabled={isSearching}
                  className="h-full px-4 text-slate-400 hover:text-teal-400 transition-colors border-r border-slate-700/50"
                >
                  {isSearching ? <span className="animate-spin block text-teal-400">↻</span> : <Search size={20} />}
                </button>
                {hasSearched && (
                  <button 
                    onClick={clearSearch}
                    className="h-full px-3 text-red-400 hover:text-red-300 transition-colors border-r border-slate-700/50"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* 3. الأزرار الرأسية */}
            <div className="flex flex-col gap-3 w-full">
                
                {/* زر إضافة دكتور */}
                <Link 
                  href="/add-professor"
                  className="flex items-center justify-between w-full h-12 px-4 bg-slate-800 rounded-xl shadow-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-teal-600 hover:border-teal-500 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <Plus size={18} />
                    </div>
                    <span className="font-bold text-sm">إضافة دكتور</span>
                  </div>
                  <ArrowRight size={16} className="text-slate-500 group-hover:text-white rotate-180 transition-colors" />
                </Link>

                {/* زر تصفح الكليات */}
                <div className="relative w-full">
                    <button 
                      onClick={toggleColleges}
                      className={`flex items-center justify-between w-full h-12 px-4 bg-slate-800 rounded-xl shadow-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-teal-500 transition-all duration-300 group ${showCollegesMenu ? 'bg-teal-600 text-white border-teal-500' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <LayoutGrid size={18} />
                        </div>
                        <span className="font-bold text-sm">تصفح الكليات</span>
                      </div>
                      <ArrowRight size={16} className={`text-slate-500 group-hover:text-white rotate-180 transition-colors ${showCollegesMenu ? 'text-white rotate-90' : ''}`} />
                    </button>

                    {/* قائمة الكليات */}
                    {showCollegesMenu && (
                        <div className="absolute top-full right-0 left-0 mt-2 bg-slate-800 rounded-2xl shadow-2xl shadow-black/50 border border-slate-700 p-2 animate-fade-in-down z-50">
                          <div className="max-h-60 overflow-y-auto pl-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-600">
                            {COLLEGES.map((college, index) => (
                              <button key={index} onClick={() => executeSearch(college)} className="flex items-center gap-3 w-full text-right px-3 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-teal-400 rounded-xl transition-all duration-200 group">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-teal-500 transition-colors"></span>
                                {college}
                              </button>
                            ))}
                          </div>
                        </div>
                    )}
                </div>

                {/* 🔥 زر تصفح المقررات (الجديد) 🔥 */}
                <div className="relative w-full">
                    <button 
                      onClick={toggleCourses}
                      className={`flex items-center justify-between w-full h-12 px-4 bg-slate-800 rounded-xl shadow-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-teal-500 transition-all duration-300 group ${showCoursesMenu ? 'bg-teal-600 text-white border-teal-500' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <BookOpen size={18} />
                        </div>
                        <span className="font-bold text-sm">تصفح المقررات</span>
                      </div>
                      <ArrowRight size={16} className={`text-slate-500 group-hover:text-white rotate-180 transition-colors ${showCoursesMenu ? 'text-white rotate-90' : ''}`} />
                    </button>

                    {/* قائمة المقررات */}
                    {showCoursesMenu && (
                        <div className="absolute top-full right-0 left-0 mt-2 bg-slate-800 rounded-2xl shadow-2xl shadow-black/50 border border-slate-700 p-2 animate-fade-in-down z-50">
                          <div className="max-h-60 overflow-y-auto pl-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-600">
                            {COURSES.map((course, index) => (
                              <button key={index} onClick={() => executeSearch(course)} className="flex items-center gap-3 w-full text-right px-3 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-teal-400 rounded-xl transition-all duration-200 group">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-teal-500 transition-colors"></span>
                                {course}
                              </button>
                            ))}
                          </div>
                        </div>
                    )}
                </div>

            </div>
        </div>

        {/* النتائج */}
        {hasSearched ? (
          <div className="space-y-4 pb-10 animate-fade-in-up">
            {professors.map((prof) => (
              <Link 
                key={prof.id} 
                href={`/professor/${prof.id}`}
                className="block bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-700 hover:border-teal-500/50 hover:bg-slate-700 hover:shadow-teal-900/20 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">{prof.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><LayoutGrid size={12} />{prof.college}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 mr-4"><span className="w-3 h-3 flex items-center justify-center text-[8px]">🎓</span>{prof.department}</p>
                  </div>
                  <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-slate-500 border border-slate-800 group-hover:bg-teal-500 group-hover:text-white group-hover:border-teal-400 transition-all shadow-inner">
                    <ArrowRight size={16} className="rotate-180" />
                  </div>
                </div>
              </Link>
            ))}
            {professors.length === 0 && (
              <div className="text-center py-12 bg-slate-800/50 rounded-3xl border border-dashed border-slate-700">
                <div className="text-6xl mb-4 opacity-30 grayscale">🔍</div>
                <p className="text-slate-400 font-medium">ما لقينا نتائج</p>
                <p className="text-slate-500 text-xs mt-2">جرب تبحث باسم دكتور آخر أو مادة مختلفة</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-2"></div>
        )}
      </main>
    </div>
  );
}