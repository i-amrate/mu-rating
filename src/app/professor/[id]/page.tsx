'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';
import { Cairo } from 'next/font/google';
import { Star, Award, GraduationCap, Building2, MessageSquareQuote, ThumbsUp, MessageCircle, CornerDownRight, Send, ArrowRight, Clock, Reply, Filter, MessagesSquare, Share2, TrendingUp, Users } from 'lucide-react';

const cairoFont = Cairo({ 
  subsets: ['arabic'],
  weight: ['500', '600', '700', '800', '900'] 
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- دالة تفكيك التاريخ المنظم ---
const getDateParts = (dateString: string, calendar: 'islamic-umalqura' | 'gregory') => {
  const date = new Date(dateString);
  const formatter = new Intl.DateTimeFormat('ar-SA', {
    calendar: calendar,
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true, numberingSystem: 'latn'
  });
  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
  const dayPeriod = getPart('dayPeriod').replace(/[مصهـ]/g, '').trim();
  return {
    year: getPart('year').replace(/[مصهـ]/g, '').trim(),
    month: getPart('month'),
    day: getPart('day'),
    time: `${getPart('hour')}:${getPart('minute')} ${dayPeriod}`
  };
};

const StructuredDate = ({ dateString, calendar, label, isHijri }: { dateString: string, calendar: any, label: string, isHijri: boolean }) => {
  const p = getDateParts(dateString, calendar);
  const baseClass = isHijri ? "bg-teal-950/20 text-teal-400 border-teal-500/10" : "bg-slate-800/30 text-slate-500 border-slate-700/30";
  return (
    <div className={`flex items-center gap-0.5 text-[10px] font-mono leading-none px-1.5 py-0.5 rounded-md border shadow-sm ${baseClass}`}>
      <Clock size={9} className={isHijri ? "text-teal-600/40" : "text-slate-600"} />
      <span className="w-8 text-center font-bold">{p.year}</span>
      <span className="opacity-20">/</span>
      <span className="w-4 text-center font-bold">{p.month}</span>
      <span className="opacity-20">/</span>
      <span className="w-4 text-center font-bold">{p.day}</span>
      <span className="mx-0.5 h-2 w-[1px] bg-slate-700/40"></span>
      <span className="w-14 text-center font-bold tracking-tighter">{p.time}</span>
    </div>
  );
};

const getGradeStyle = (grade: string) => {
  switch (grade) {
    case 'A+': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    case 'A':  return 'bg-emerald-600/20 text-emerald-500 border-emerald-600/40';
    case 'B+': return 'bg-lime-500/20 text-lime-400 border-lime-500/40';
    case 'B':  return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    case 'C+': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    case 'C':  return 'bg-orange-600/20 text-orange-500 border-orange-600/40';
    case 'D+': return 'bg-red-400/20 text-red-400 border-red-400/40';
    case 'D':  return 'bg-red-600/20 text-red-500 border-red-600/40';
    case 'F':  return 'bg-red-900/40 text-red-600 border-red-900/60 font-black';
    default:   return 'bg-slate-700 text-slate-300 border-slate-600';
  }
};

const ReplyItem = ({ reply, allReplies, onReplyClick, activeReplyId, replyContent, setReplyContent, submitReply, submitting, parentText }: any) => {
  const childReplies = allReplies.filter((r: any) => r.parent_id === reply.id);
  const greg = getDateParts(reply.created_at, 'gregory');
  const hijri = getDateParts(reply.created_at, 'islamic-umalqura');

  return (
    <div className="relative mt-4 mr-3 md:mr-6">
      <div className="absolute -right-3 md:-right-5 top-0 bottom-0 w-px bg-slate-700/50">
        <div className="absolute top-0 right-0 w-3 md:w-5 h-8 border-r border-t border-slate-700/50 rounded-tr-xl"></div>
      </div>
      <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl text-sm text-slate-200 shadow-sm hover:border-teal-500/30 transition-all">
        <div className="flex justify-between items-start mb-3">
          {parentText && (
            <div className="flex items-center gap-1.5 text-[10px] bg-slate-900 px-2 py-1 rounded-md text-slate-500 border border-slate-700/30">
              <Reply size={10} className="rotate-180" />
              <span className="truncate max-w-[120px] text-slate-400 italic">"{parentText}"</span>
            </div>
          )}
          <div className="relative group/time mr-auto">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-950/50 px-2 py-1 rounded-md border border-slate-800 cursor-pointer">
              <Clock size={10} />
              <span className="font-bold">{greg.time}</span>
            </div>
            <div className="invisible group-hover/time:visible opacity-0 group-hover/time:opacity-100 absolute bottom-full mb-2 left-0 z-50 transition-all pointer-events-none">
              <div className="bg-slate-950 border border-teal-500/40 p-2 rounded-lg shadow-2xl text-[9px] min-w-[110px]">
                <div className="mb-1 pb-1 border-b border-slate-800">م: {greg.day}/{greg.month}/{greg.year}</div>
                <div className="text-teal-400">هـ: {hijri.day}/{hijri.month}/{hijri.year}</div>
              </div>
            </div>
          </div>
        </div>
        <p className="leading-relaxed text-slate-300">{reply.content}</p>
        <button onClick={() => onReplyClick(reply.id)} className={`text-[10px] font-bold mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${activeReplyId === reply.id ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' : 'bg-slate-900/50 text-slate-500 border-slate-700 hover:text-teal-400'}`}>
          <CornerDownRight size={12} /> {activeReplyId === reply.id ? 'إلغاء' : 'رد'}
        </button>
      </div>
      {activeReplyId === reply.id && (
        <div className="mt-3 flex gap-2 animate-fade-in-down pr-2">
          <input value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="اكتب ردك..." className="flex-grow bg-slate-900 border border-teal-500/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-teal-500 text-white shadow-inner" autoFocus />
          <button onClick={() => submitReply(reply.review_id, reply.id)} disabled={submitting} className="bg-teal-600 hover:bg-teal-500 text-white p-2 rounded-xl shadow-lg transition-all active:scale-95"><Send size={14} /></button>
        </div>
      )}
      {childReplies.map((child: any) => (
        <ReplyItem key={child.id} reply={child} allReplies={allReplies} onReplyClick={onReplyClick} activeReplyId={activeReplyId} replyContent={replyContent} setReplyContent={setReplyContent} submitReply={submitReply} submitting={submitting} parentText={reply.content} />
      ))}
    </div>
  );
};

export default function ProfessorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [professor, setProfessor] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [grade, setGrade] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'newest' | 'most_liked' | 'most_commented'>('newest');

  async function getData() {
    const { data: prof } = await supabase.from('professors').select('*').eq('id', id).single();
    setProfessor(prof);
    if (prof) {
      const { data: revs } = await supabase.from('reviews').select(`*, replies (*)`).eq('professor_id', prof.id).order('created_at', { ascending: false });
      setReviews(revs || []);
    }
  }

  useEffect(() => { if (id) getData(); }, [id]);

  // إحصائيات الدكتور
  const totalComments = reviews.reduce((acc, rev) => acc + (rev.replies?.length || 0), 0);
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1) : '0';
  const engagementScore = (reviews.length * 2) + totalComments;

  const handleShare = () => {
    const shareData = {
      title: `تقييم الدكتور ${professor?.name}`,
      text: `شف تقييمات الطلاب وتجاربهم مع الدكتور ${professor?.name} في جامعة المجمعة 🎓`,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ رابط الصفحة بنجاح! 📋');
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'most_liked') return (b.likes_count || 0) - (a.likes_count || 0);
    if (sortBy === 'most_commented') return (b.replies?.length || 0) - (a.replies?.length || 0);
    return 0;
  });

  const toggleReplies = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
        newExpanded.delete(reviewId);
        if (activeReplyId === reviewId) setActiveReplyId(null);
    } else {
        newExpanded.add(reviewId);
        setActiveReplyId(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  async function handleLike(reviewId: string) {
    if (likedReviews.has(reviewId)) return;
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, likes_count: (r.likes_count || 0) + 1 } : r));
    setLikedReviews(prev => new Set(prev).add(reviewId));
    // تم الإصلاح هنا: إزالة .catch
    await supabase.rpc('increment_likes', { review_id: reviewId });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (rating === 0 || !grade || !newReview.trim()) return;
    setIsSubmitting(true);
    const { error } = await supabase.from('reviews').insert([{ content: newReview, rating, grade, professor_id: professor.id }]);
    if (!error) window.location.reload();
    setIsSubmitting(false);
  }

  async function submitReply(reviewId: string, parentId: string | null = null) {
    if (!replyContent.trim()) return;
    setSubmittingReply(true);
    const { error } = await supabase.from('replies').insert([{ review_id: reviewId, parent_id: parentId, content: replyContent }]);
    if (!error) { setReplyContent(''); setActiveReplyId(null); await getData(); }
    setSubmittingReply(false);
  }

  if (!professor) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-500 font-bold">جاري التحميل...</div>;

  const cardStyle = "bg-slate-800 rounded-3xl border border-slate-700 shadow-xl overflow-hidden relative transition-all duration-300 hover:scale-[1.01] hover:border-teal-500/40 hover:shadow-[0_0_25px_rgba(45,212,191,0.1)]";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4" dir="rtl">
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-teal-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <main className="max-w-3xl mx-auto space-y-6 relative z-10 py-6">
        
        {/* هيدر التنقل والمشاركة */}
        <div className="flex justify-between items-center px-2">
          <button onClick={() => router.push('/')} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white border border-slate-700 transition-all active:scale-95 shadow-lg"><ArrowRight size={20} /></button>
          <button onClick={handleShare} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-teal-400 px-4 py-2 rounded-xl border border-slate-700 transition-all active:scale-95 shadow-lg font-bold text-xs">
            <Share2 size={16} /> مشاركة الصفحة
          </button>
        </div>

        {/* إحصائيات سريعة (Stats Bar) */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 hover:border-teal-500/30 transition-all">
            <TrendingUp size={16} className="text-amber-400" />
            <span className="text-white font-black text-sm">{avgRating} / 5</span>
            <span className="text-[9px] text-slate-500 font-bold">متوسط التقييم</span>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 hover:border-teal-500/30 transition-all">
            <MessagesSquare size={16} className="text-blue-400" />
            <span className="text-white font-black text-sm">{totalComments}</span>
            <span className="text-[9px] text-slate-500 font-bold">إجمالي الردود</span>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 hover:border-teal-500/30 transition-all">
            <Users size={16} className="text-purple-400" />
            <span className="text-white font-black text-sm">{engagementScore}</span>
            <span className="text-[9px] text-slate-500 font-bold">مستوى التفاعل</span>
          </div>
        </div>

        {/* الكارت 1: معلومات الدكتور */}
        <div className={`${cardStyle} p-8`}>
          <div className="inline-block mb-6">
            <h1 className={`flex items-baseline gap-2 text-white ${cairoFont.className}`}>
              <span className="text-teal-500 font-bold text-sm md:text-base opacity-90">اسم الدكتور |</span>
              <span className="text-lg md:text-xl font-black">{professor.name}</span>
            </h1>
            <div className="h-1.5 w-full bg-gradient-to-l from-teal-400 via-emerald-500/70 to-transparent rounded-full mt-3"></div>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="bg-slate-900/50 text-teal-300 px-4 py-2 rounded-xl text-sm font-bold border border-teal-500/20 flex items-center gap-2 shadow-sm"><GraduationCap size={16} /> {professor.department}</span>
            <span className="bg-slate-900/50 text-blue-300 px-4 py-2 rounded-xl text-sm font-bold border border-blue-500/20 flex items-center gap-2 shadow-sm"><Building2 size={16} /> {professor.college}</span>
          </div>
        </div>

        {/* الكارت 2: إضافة تقييم */}
        <div className={`${cardStyle} p-8`}>
          <div className="inline-block mb-6">
            <div className="flex items-center gap-2">
              <Award className="text-teal-400" size={20} />
              <h3 className={`text-lg font-bold text-white ${cairoFont.className}`}>إضافة تقييم</h3>
            </div>
            <div className="h-1 w-full bg-gradient-to-l from-teal-400 via-emerald-500/70 to-transparent rounded-full mt-1.5 shadow-sm"></div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-slate-400 mb-2">التقييم <span className="text-red-500 font-black">*</span></label>
                <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} type="button" onClick={() => setRating(s)} onMouseEnter={() => setHoverRating(s)} className="transition-transform hover:scale-110 active:scale-90"><Star size={28} className={s <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-slate-600"} /></button>
                  ))}
                </div>
              </div>
              <div className="w-32">
                <label className="block text-xs font-bold text-slate-400 mb-2">القريد <span className="text-red-500 font-black">*</span></label>
                <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition-all">
                  <option value="">اختر..</option>
                  {["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">التجربة <span className="text-red-500 font-black">*</span></label>
              <textarea value={newReview} onChange={(e) => setNewReview(e.target.value)} placeholder="اكتب تجربتك هنا..." className="w-full bg-slate-700 border border-slate-600 rounded-xl p-4 text-white min-h-[100px] focus:outline-none focus:border-teal-500 text-sm transition-all shadow-inner" />
            </div>
            <button disabled={isSubmitting} type="submit" className="w-full bg-teal-600 py-3 rounded-xl font-bold shadow-lg hover:bg-teal-500 transition-all active:scale-[0.98]">نشر التقييم 🚀</button>
          </form>
        </div>

        {/* الكارت 3: آراء الطلاب */}
        <div className={`${cardStyle} p-8`}>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <MessageSquareQuote size={24} className="text-teal-500" />
                <h3 className={`text-xl font-bold text-white ${cairoFont.className}`}>آراء الطلاب</h3>
              </div>
            </div>
            <div className="h-1.5 w-full bg-gradient-to-l from-teal-400 via-emerald-500/70 to-transparent rounded-full mb-6 shadow-sm"></div>
          </div>

          {/* الفرز */}
          <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/50 p-1 rounded-xl border border-slate-700 w-fit">
            <button onClick={() => setSortBy('newest')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'newest' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                <Clock size={14} /> الأحدث
            </button>
            <button onClick={() => setSortBy('most_liked')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'most_liked' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                <Filter size={14} /> الأكثر فائدة
            </button>
            <button onClick={() => setSortBy('most_commented')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'most_commented' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                <MessagesSquare size={14} /> الأكثر تعليقاً
            </button>
          </div>

          <div className="space-y-12">
            {sortedReviews.length === 0 ? (
              <p className="text-center text-slate-500 py-6 text-sm">لا توجد تقييمات بعد!</p>
            ) : (
              sortedReviews.map((review) => (
                <div key={review.id} className="bg-slate-900/40 border border-slate-700/50 rounded-3xl p-6 hover:border-teal-500/10 transition-all group/card shadow-sm">
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={14} fill={star <= review.rating ? "currentColor" : "none"} className={star <= review.rating ? "text-amber-400" : "text-slate-600"} />
                        ))}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getGradeStyle(review.grade)}`}>{review.grade}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        <StructuredDate dateString={review.created_at} calendar="gregory" label="ميلادي" isHijri={false} />
                        <StructuredDate dateString={review.created_at} calendar="islamic-umalqura" label="هجري" isHijri={true} />
                    </div>
                  </div>

                  <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-6 whitespace-pre-wrap">{review.content}</p>
                  
                  <div className="flex items-center gap-6 border-t border-slate-700/30 pt-4 opacity-70 group-hover/card:opacity-100 transition-opacity">
                    <button onClick={() => handleLike(review.id)} className={`flex items-center gap-2 text-xs font-bold transition-colors ${likedReviews.has(review.id) ? 'text-teal-400' : 'text-slate-500 hover:text-teal-400'}`}>
                      <ThumbsUp size={16} className={likedReviews.has(review.id) ? "fill-teal-400" : ""} /> <span>{review.likes_count || 0}</span>
                    </button>
                    <button onClick={() => toggleReplies(review.id)} className={`flex items-center gap-2 text-xs font-bold transition-colors ${expandedReviews.has(review.id) ? 'text-teal-400' : 'text-slate-500 hover:text-teal-400'}`}>
                      <MessageCircle size={16} /> <span>{expandedReviews.has(review.id) ? 'إخفاء الردود' : `الردود (${review.replies?.length || 0})`}</span>
                    </button>
                  </div>

                  {expandedReviews.has(review.id) && (
                    <div className="mt-6 space-y-2">
                      <div className={`flex gap-3 items-center bg-slate-900/80 border p-3 rounded-2xl transition-all mb-6 ${activeReplyId === review.id ? 'border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.1)]' : 'border-slate-800'}`}>
                        <CornerDownRight className="text-slate-600" size={18} />
                        <input value={activeReplyId === review.id ? replyContent : ''} onChange={(e) => { setActiveReplyId(review.id); setReplyContent(e.target.value); }} onFocus={() => setActiveReplyId(review.id)} placeholder="اكتب ردك هنا..." className="flex-grow bg-transparent border-none text-sm focus:outline-none text-white" onKeyDown={(e) => { if (e.key === 'Enter') submitReply(review.id); }} />
                        <button onClick={() => submitReply(review.id)} disabled={submittingReply} className="bg-teal-600 hover:bg-teal-500 text-white p-2 rounded-xl transition-all"><Send size={16} /></button>
                      </div>
                      <div className="pr-2 md:pr-4">
                        {review.replies?.filter((r:any) => !r.parent_id).map((reply: any) => (
                          <ReplyItem key={reply.id} reply={reply} allReplies={review.replies} onReplyClick={(id: string) => { setActiveReplyId(id); setReplyContent(''); }} activeReplyId={activeReplyId} replyContent={replyContent} setReplyContent={setReplyContent} submitReply={submitReply} submitting={submittingReply} parentText={review.content} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}