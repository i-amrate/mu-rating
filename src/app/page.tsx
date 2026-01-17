'use client';
import React, { useState } from 'react';
// رابط الاستيراد المعتمد (نقطتين)
import { supabase } from '../lib/supabase';

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

    const cleanTerm = term
      .replace(/^د\./, '')
      .replace(/^د\s/, '')
      .trim();

    const { data, error } = await supabase
      .from('professors')
      .select('*')
      .eq('is_approved', true) 
      .or(`name.ilike.%${cleanTerm}%,college.ilike.%${cleanTerm}%,department.ilike.%${cleanTerm}%`);

    if (!error) {
      setProfessors(data || []);
    }
    setIsSearching(false);
  };

  const handleSearchClick = () => executeSearch(searchTerm);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') executeSearch(searchTerm);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-right relative overflow-x-hidden" dir="rtl">
      
      {/* --- الخلفية الحية --- */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="fixed top-[-10%] right-[-10%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="fixed bottom-[-20%] left-[20%] w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none"></div>

      <main className="flex-1 w-full max-w-md mx-auto p-6 flex flex-col justify-center relative z-10">
        
        {/* --- الشعار الملون --- */}
        {!hasSearched && (
          <div className="flex justify-center mb-8 animate-fade-in-down">
            <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-[2rem] shadow-xl shadow-emerald-500/20 flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-all duration-300">
              <span className="text-5xl text-white drop-shadow-md">🏛️</span>
            </div>
          </div>
        )}

        {/* الهيدر */}
        <div className={`transition-all duration-500 ${hasSearched ? 'mt-4 mb-6' : 'mt-2 mb-10 text-center'}`}>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-800 mb-2 tracking-tight">
            {hasSearched ? 'نتائج البحث' : 'قيّم تجربة دكتورك'}
          </h1>
          {!hasSearched && (
            <p className="text-gray-400 text-sm font-medium">جامعة المجمعة</p>
          )}
        </div>

        {/* --- منطقة البحث + القائمة --- */}
        <div className="relative mb-6 z-50">
          <div className="flex gap-3 items-stretch">
            
            {/* زر القائمة */}
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50 hover:border-emerald-500 hover:text-emerald-600 transition-all text-gray-500 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* مربع البحث */}
            <div className="relative flex-1 group">
              <div className="relative flex bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="ابحث عن دكتور، كلية، قسم..."
                  className="flex-1 p-4 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm"
                />
                <button 
                  onClick={handleSearchClick}
                  disabled={isSearching}
                  className="m-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all shadow-md active:scale-95 text-sm"
                >
                  {isSearching ? '...' : 'بحث'}
                </button>
              </div>
            </div>
          </div>

          {/* القائمة المنسدلة */}
          {showMenu && (
            <div className="absolute top-full right-0 mt-3 w-72 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-4 animate-fade-in-down z-50">
              <a 
                href="/add-professor" 
                className="flex items-center gap-3 w-full p-3 mb-4 bg-emerald-50/80 text-emerald-700 rounded-2xl hover:bg-emerald-100 transition font-bold border border-emerald-100"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg shadow-sm">➕</div>
                <span>إضافة دكتور جديد</span>
              </a>
              
              <div className="h-px bg-gray-100 mb-3 mx-2"></div>
              
              <p className="text-[10px] text-gray-400 font-bold mb-2 pr-2 uppercase tracking-wider">تصفح بالكليات</p>
              
              <div className="max-h-60 overflow-y-auto pl-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
                {COLLEGES.map((college, index) => (
                  <button
                    key={index}
                    onClick={() => executeSearch(college)}
                    className="flex items-center gap-2 w-full text-right px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-emerald-600 rounded-xl transition group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-emerald-500 transition-colors"></span>
                    {college}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- النتائج --- */}
        {hasSearched ? (
          <div className="space-y-4 pb-10 animate-fade-in-up">
            <div className="mb-4 flex items-center gap-2">
              <button onClick={() => { setHasSearched(false); setSearchTerm(''); }} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-emerald-600 shadow-sm border border-gray-100 transition-all">
                ➜
              </button>
              <span className="text-xs text-gray-400 font-medium">العودة للرئيسية</span>
            </div>

            {professors.map((prof) => (
              <a 
                key={prof.id} 
                href={`/professor/${prof.id}`}
                className="block bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-white/60 hover:border-emerald-200 hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">{prof.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      {prof.college}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 mr-4">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                      {prof.department}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                    ➜
                  </div>
                </div>
              </a>
            ))}
            
            {professors.length === 0 && (
              <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/50">
                <div className="text-6xl mb-4 opacity-50">🔍</div>
                <p className="text-gray-500 font-medium">ما لقينا نتائج</p>
                <p className="text-xs text-gray-400 mt-2">جرب تبحث باسم ثاني أو تأكد من الإملاء</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-10"></div>
        )}
      </main>

      {/* --- الفوتر (التغيير هنا: صار بالوسط) --- */}
      <footer className="w-full p-6 mt-auto relative z-10 flex justify-center">
        <div className="flex items-center justify-center gap-1 text-sm text-gray-400 font-medium bg-white/50 backdrop-blur-sm p-3 rounded-full w-fit shadow-sm border border-white/50 mx-auto">
          <span>صُنِع بحب ❤️ من قبل</span>
          <a 
            href="https://instagram.com/acc.azzamsa" 
            target="_blank" 
            rel="noopener noreferrer"
            dir="ltr"
            className="text-emerald-600 hover:text-emerald-800 transition-colors font-bold tracking-wide"
          >
            @acc.azzamsa
          </a>
        </div>
      </footer>

    </div>
  );
}