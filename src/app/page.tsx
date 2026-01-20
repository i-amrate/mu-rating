'use client';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { Search, Plus, LayoutGrid, ArrowRight, X } from 'lucide-react';

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

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [professors, setProfessors] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const executeSearch = async (term: string) => {
    if (!term.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    setShowMenu(false);
    setSearchTerm(term);

    const cleanTerm = term.replace(/^د\./, '').replace(/^د\s/, '').trim();

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

  const handleSearchClick = () => executeSearch(searchTerm);
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') executeSearch(searchTerm); };
  const clearSearch = () => { setHasSearched(false); setSearchTerm(''); setProfessors([]); };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-right relative overflow-x-hidden selection:bg-teal-500/30" dir="rtl">
      
      {/* خلفية جمالية */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-teal-600/10 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* وسعنا الكونتينر شوي (max-w-2xl) عشان يكفي الأزرار لما تتمدد */}
      <main className="flex-1 w-full max-w-2xl mx-auto p-6 flex flex-col justify-center relative z-10">
        
        {/* عنوان الصفحة */}
        <div className={`transition-all duration-500 ${hasSearched ? 'mt-4 mb-6' : 'mt-2 mb-10 text-center'}`}>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300 mb-2 tracking-tight">
            {hasSearched ? 'نتائج البحث' : 'دليلك نحو الأفضل'}
          </h1>
        </div>

        {/* منطقة البحث والأزرار */}
        <div className="relative mb-6 z-50">
          <div className="flex gap-2.5 items-center justify-between h-12">
            
            {hasSearched && (
              <button 
                onClick={clearSearch}
                className="w-12 h-12 flex-none flex items-center justify-center bg-slate-800 rounded-xl shadow-lg border border-slate-700 text-slate-300 hover:text-red-400 hover:bg-slate-700 transition-all duration-300 active:scale-95 animate-fade-in-down"
                title="مسح البحث"
              >
                 <ArrowRight size={20} className="rotate-180" />
              </button>
            )}

            {/* --- زر إضافة دكتور (المتمدد) --- */}
            <Link 
              href="/add-professor"
              className="group flex items-center h-12 bg-slate-800 rounded-xl shadow-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-teal-600 hover:border-teal-500 transition-all duration-500 ease-in-out w-12 hover:w-[130px] overflow-hidden"
            >
              <div className="w-12 h-12 flex items-center justify-center flex-none group-hover:rotate-90 transition-transform duration-500">
                <Plus size={22} className="group-hover:scale-110" />
              </div>
              <span className="whitespace-nowrap font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mr-1">
                إضافة دكتور
              </span>
            </Link>

            {/* --- زر الكليات (المتمدد) --- */}
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`group flex items-center h-12 bg-slate-800 rounded-xl shadow-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-teal-500 transition-all duration-500 ease-in-out w-12 hover:w-[130px] overflow-hidden ${showMenu ? 'bg-teal-600 text-white border-teal-500' : ''}`}
            >
              <div className="w-12 h-12 flex items-center justify-center flex-none">
                <LayoutGrid size={20} />
              </div>
              <span className="whitespace-nowrap font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mr-1">
                تصفح الكليات
              </span>
            </button>

            {/* مربع البحث */}
            <div className="flex-1 h-full relative group">
              <div className="h-full flex bg-slate-800 rounded-xl shadow-lg border border-slate-700 group-focus-within:border-teal-500 group-focus-within:ring-2 group-focus-within:ring-teal-500/20 transition-all duration-300">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="ابحث عن دكتور..."
                  className="flex-1 h-full px-4 bg-transparent outline-none text-white placeholder-slate-400 text-sm rounded-xl min-w-0"
                />
                <button 
                  onClick={handleSearchClick}
                  disabled={isSearching}
                  className="h-full px-4 text-slate-400 hover:text-teal-400 transition-colors"
                >
                  {isSearching ? <span className="animate-spin block text-teal-400">↻</span> : <Search size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* القائمة المنسدلة */}
          {showMenu && (
            <div className="absolute top-full right-0 mt-3 w-72 bg-slate-800 rounded-2xl shadow-2xl shadow-black/50 border border-slate-700 p-4 animate-fade-in-down z-50">
              <div className="flex items-center justify-between mb-3 px-1 border-b border-slate-700 pb-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">تصفح بالكليات</p>
                <button onClick={() => setShowMenu(false)} className="text-slate-500 hover:text-red-400 transition-colors"><X size={14} /></button>
              </div>
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
              </div>
            )}
          </div>
        ) : (
          <div className="mt-10"></div>
        )}
      </main>
    </div>
  );
}