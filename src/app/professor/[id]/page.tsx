'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';
import { Cairo } from 'next/font/google';
import { Star, Award, GraduationCap, Building2, MessageSquareQuote, ThumbsUp, MessageCircle, CornerDownRight, Send, ArrowRight, Clock, Reply, Filter, MessagesSquare, Share2, Activity, Percent, BookOpen, Tag, BarChart3, Medal, Eye, CalendarClock, PenTool, Smile } from 'lucide-react';

const cairoFont = Cairo({ 
  subsets: ['arabic'],
  weight: ['500', '600', '700', '800', '900'] 
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🔥 1. إعدادات أنواع الشارات وتصنيفها 🔥
const BADGE_PRIORITY: Record<string, number> = {
  'positive': 1, 'neutral': 2, 'negative': 3
};

const BADGE_TYPES: Record<string, 'positive' | 'neutral' | 'negative'> = {
  // المجموعة 1: التحضير
  "ما يحضر": 'positive', "لين بالتحضير": 'positive', "تحضير_طبيعي": 'neutral', "شدييد بالتحضير": 'negative',
  // المجموعة 2: الشرح
  "شرييح": 'positive', "شرحه عادي": 'neutral', "شرحه سيئ": 'negative',
  // المجموعة 3: التعاون
  "متعاون": 'positive', "تعاون_طبيعي": 'neutral', "غير متعاون": 'negative',
  // المجموعة 4: المشاريع
  "رهييب بالمشروع": 'positive', "مشروعه طبيعي": 'neutral', "شديد بالمشروع": 'negative',
  // المجموعة 5: الاختبارات
  "اختباراته سهله": 'positive', "اختباراته وسط": 'neutral', "اختباراته صععبه": 'negative',
  // المجموعة 6: الشخصية
  "عسسلل": 'positive', "محتررم": 'positive', "شخصية_طبيعية": 'neutral', "اخلاق": 'positive', "غثيث": 'negative', "وقح": 'negative',
  // المجموعة 7: أخرى
  "يعطي بونص": 'positive', 
  "يدف بالتصحيح": 'positive', 
  "يعطيك حقك": 'positive',
  "شديد بالتصحيح": 'negative', 
  "محاضرته ممتعه": 'positive', 
  "محاضرته ممله": 'negative',
  "أسئلته مكررة": 'positive'
};

const BADGE_GROUPS = [
  { id: 'attendance', label: 'التحضير', options: ["ما يحضر", "لين بالتحضير", "تحضير_طبيعي", "شدييد بالتحضير"] },
  { id: 'explanation', label: 'الشرح', options: ["شرييح", "شرحه عادي", "شرحه سيئ"] },
  { id: 'cooperation', label: 'التعاون', options: ["متعاون", "تعاون_طبيعي", "غير متعاون"] },
  { id: 'projects', label: 'المشاريع', options: ["رهييب بالمشروع", "مشروعه طبيعي", "شديد بالمشروع"] },
  { id: 'exams', label: 'الاختبارات', options: ["اختباراته سهله", "اختباراته وسط", "اختباراته صععبه"] },
  { id: 'personality', label: 'الشخصية', options: ["عسسلل", "محتررم", "شخصية_طبيعية", "غثيث", "وقح"] },
  { 
    id: 'other', 
    label: 'أخرى', 
    options: [
        "يعطي بونص", 
        "يدف بالتصحيح", 
        "يعطيك حقك", 
        "شديد بالتصحيح", 
        "محاضرته ممتعه", 
        "محاضرته ممله", 
        "أسئلته مكررة"
    ] 
  }
];

const sortBadges = (tags: string[]) => {
  if (!tags) return [];
  return [...tags].sort((a, b) => {
    const typeA = BADGE_TYPES[a] || 'positive';
    const typeB = BADGE_TYPES[b] || 'positive';
    return BADGE_PRIORITY[typeA] - BADGE_PRIORITY[typeB];
  });
};

const getBadgeLabel = (badge: string) => {
  if (badge.includes('_طبيعي') || badge === 'مشروعه طبيعي' || badge === 'اختباراته وسط' || badge === 'شرحه عادي') return "طبيعي";
  return badge;
};

// 🔥 دالة التلوين 🔥
const getBadgeColorStyle = (badge: string, isSelected: boolean) => {
  let type = BADGE_TYPES[badge];
  if (!type) type = 'positive'; 

  if (type === 'neutral') {
     if (isSelected) return 'bg-slate-600 text-white border-slate-500 shadow-lg';
     return 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500';
  }

  if (isSelected) {
    switch (type) {
      case 'positive': return 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/40';
      case 'negative': return 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/40';
      default: return 'bg-slate-600 text-white border-slate-500 shadow-lg';
    }
  } else {
    switch (type) {
      case 'positive': return 'bg-emerald-500/5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10';
      case 'negative': return 'bg-red-500/5 text-red-400 border-red-500/30 hover:bg-red-500/10';
      default: return 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500';
    }
  }
};

const getBadgeDisplayColor = (badge: string) => {
    let type = BADGE_TYPES[badge];
    if (!type) type = 'positive';

    switch (type) {
        case 'positive': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        case 'negative': return 'bg-red-500/10 text-red-400 border-red-500/30';
        default: return 'bg-slate-700/50 text-slate-400 border-slate-600';
    }
}

const getReviewPercentStyle = (percentage: number) => {
  if (percentage >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (percentage >= 80) return 'text-lime-400 bg-lime-500/10 border-lime-500/20';
  if (percentage >= 70) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
  if (percentage >= 60) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
  return 'text-red-400 bg-red-500/10 border-red-500/20';
};

const getDateParts = (dateString: string, calendar: 'islamic-umalqura' | 'gregory') => {
  const date = new Date(dateString);
  const formatter = new Intl.DateTimeFormat('ar-SA', {
    calendar: calendar,
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true, 
    numberingSystem: 'latn'
  });
  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
  return {
    year: getPart('year').replace(/[مصهـ]/g, '').trim(),
    month: getPart('month'),
    day: getPart('day'),
    time: `${getPart('hour')}:${getPart('minute')} ${getPart('dayPeriod')}`
  };
};

const CompactDate = ({ dateString }: { dateString: string }) => {
  const hijri = getDateParts(dateString, 'islamic-umalqura');
  const greg = getDateParts(dateString, 'gregory');
  return (
    <div className="flex items-center gap-2 text-[10px] font-mono leading-tight text-slate-500 opacity-80">
      <div className="flex items-center">
        <span>{hijri.day}/{hijri.month}/{hijri.year}</span>
      </div>
      <span className="text-slate-700">|</span>
      <div className="flex items-center">
        <span>{greg.day}/{greg.month}/{greg.year}</span>
      </div>
    </div>
  );
};

const TimeDisplay = ({ dateString }: { dateString: string }) => {
    const greg = getDateParts(dateString, 'gregory');
    return (
        <span className="text-[10px] font-bold font-mono text-slate-400 border-b border-slate-600/50 pb-0.5">
            {greg.time}
        </span>
    );
};

const SuperSmartCircle = ({ percentage }: { percentage: number }) => {
  const radius = 32; 
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const progressOffset = circumference - (percentage / 100) * circumference;
    setTimeout(() => setOffset(progressOffset), 500);
  }, [percentage, circumference]);

  let colorStart = "#10b981"; let colorEnd = "#34d399"; let shadowColor = "rgba(16, 185, 129, 0.8)";
  if (percentage < 50) { colorStart = "#ef4444"; colorEnd = "#f87171"; shadowColor = "rgba(239, 68, 68, 0.8)"; }
  else if (percentage < 80) { colorStart = "#f59e0b"; colorEnd = "#fbbf24"; shadowColor = "rgba(245, 158, 11, 0.8)"; }

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90 overflow-visible">
        <defs>
            <linearGradient id="smartGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colorStart} />
                <stop offset="100%" stopColor={colorEnd} />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        
        <circle
          cx="48" cy="48" r={radius}
          stroke="url(#smartGrad)"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter="url(#glow)"
          className="transition-[stroke-dashoffset] duration-[1500ms] ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white tracking-tighter" style={{ textShadow: `0 0 15px ${shadowColor}` }}>
            {percentage}%
        </span>
      </div>
    </div>
  );
};

const StatBar = ({ label, value, icon: Icon, colorClass, bgClass }: { label: string, value: number, icon: any, colorClass: string, bgClass: string }) => {
    const [width, setWidth] = useState(0);
    const percentage = value > 0 ? (value / 5) * 100 : 0;
    
    let statusText = "غير مقيّم";
    if (value >= 4.5) statusText = "أسطوري";
    else if (value >= 3.5) statusText = "ممتاز";
    else if (value >= 2.5) statusText = "جيد";
    else if (value > 0) statusText = "سيء";

    useEffect(() => {
        const timer = setTimeout(() => setWidth(percentage), 300);
        return () => clearTimeout(timer);
    }, [percentage]);

    return (
        <div className="mb-4 group">
            <div className="flex justify-between items-end mb-1.5">
                <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
                    <Icon size={14} className={colorClass.replace('bg-', 'text-')} /> 
                    {label}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">{statusText}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 rounded">{value > 0 ? value.toFixed(1) : '-'}</span>
                </div>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                <div 
                    className={`h-full rounded-full transition-all duration-[1200ms] ease-out ${bgClass} relative`}
                    style={{ width: `${width}%` }}
                >
                    <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-l from-white/20 to-transparent"></div>
                </div>
            </div>
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
    case 'أتحفظ عن الإفصاح': return 'bg-slate-700 text-slate-400 border-slate-600 border-dashed text-[10px]';
    default:   return 'bg-slate-700 text-slate-300 border-slate-600';
  }
};

const ReplyItem = ({ reply, allReplies, onReplyClick, activeReplyId, replyContent, setReplyContent, submitReply, submitting, parentText, onLikeReply, likedReplies }: any) => {
  const childReplies = allReplies.filter((r: any) => r.parent_id === reply.id);
  const isLiked = likedReplies.has(reply.id);

  return (
    <div className="relative mt-4 mr-3 md:mr-6">
      <div className="absolute -right-3 md:-right-5 top-0 bottom-0 w-px bg-slate-700/50">
        <div className="absolute top-0 right-0 w-3 md:w-5 h-8 border-r border-t border-slate-700/50 rounded-tr-xl"></div>
      </div>
      <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl text-sm text-slate-200 shadow-sm hover:border-teal-500/30 transition-all relative overflow-hidden">
        
        <div className="absolute top-3 left-3">
            <TimeDisplay dateString={reply.created_at} />
        </div>

        <div className="flex justify-between items-start mb-2">
          {parentText && (
            <div className="flex items-center gap-1.5 text-[10px] bg-slate-900 px-2 py-1 rounded-md text-slate-500 border border-slate-700/30 mb-2">
              <Reply size={10} className="rotate-180" />
              <span className="truncate max-w-[120px] text-slate-400 italic">"{parentText}"</span>
            </div>
          )}
        </div>
        
        <p className="leading-relaxed text-slate-300 mb-3 ml-2 break-words whitespace-pre-wrap">{reply.content}</p>
        
        <div className="flex items-center justify-between border-t border-slate-700/50 pt-2 mt-2">
            <div className="flex gap-3 items-center">
                <button onClick={() => onReplyClick(reply.id)} className={`text-[10px] font-bold flex items-center gap-1.5 transition-all ${activeReplyId === reply.id ? 'text-teal-400' : 'text-slate-500 hover:text-teal-400'}`}>
                  <CornerDownRight size={12} /> {activeReplyId === reply.id ? 'إلغاء' : 'رد'}
                </button>
                <button onClick={() => onLikeReply(reply.id)} className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${isLiked ? 'text-teal-400' : 'text-slate-500 hover:text-teal-400'}`}>
                    <ThumbsUp size={12} className={isLiked ? "fill-teal-400" : ""} /> {reply.likes_count > 0 ? reply.likes_count : ''}
                </button>
            </div>
            <CompactDate dateString={reply.created_at} />
        </div>
      </div>

      {activeReplyId === reply.id && (
        <div className="mt-3 flex gap-2 animate-fade-in-down pr-2">
          <input value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="اكتب ردك..." className="flex-grow bg-slate-900 border border-teal-500/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-teal-500 text-white shadow-inner" autoFocus />
          <button onClick={() => submitReply(reply.review_id, reply.id)} disabled={submitting} className="bg-teal-600 hover:bg-teal-500 text-white p-2 rounded-xl shadow-lg transition-all active:scale-95"><Send size={14} /></button>
        </div>
      )}
      {childReplies.map((child: any) => (
        <ReplyItem key={child.id} reply={child} allReplies={allReplies} onReplyClick={onReplyClick} activeReplyId={activeReplyId} replyContent={replyContent} setReplyContent={setReplyContent} submitReply={submitReply} submitting={submitting} parentText={reply.content} onLikeReply={onLikeReply} likedReplies={likedReplies} />
      ))}
    </div>
  );
};

const StarRatingInput = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => {
    const ratings = ["سيء جداً", "سيء", "مقبول", "جيد", "ممتاز"];
    return (
        <div className="flex flex-col gap-1.5 items-center sm:items-end">
            <label className="text-[10px] font-bold text-slate-400">{label}</label>
            <div className="flex flex-col items-center sm:items-end gap-1">
                <div className="flex gap-0.5 justify-center sm:justify-end">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => onChange(s)} className="focus:outline-none transition-transform active:scale-90 hover:scale-110">
                            <Star size={18} className={s <= value ? "fill-amber-400 text-amber-400" : "text-slate-600"} />
                        </button>
                    ))}
                </div>
                <span className={`text-[10px] font-bold transition-all duration-300 h-4 ${value > 0 ? 'opacity-100 text-teal-400' : 'opacity-0'}`}>
                    {value > 0 ? ratings[value - 1] : ''}
                </span>
            </div>
        </div>
    );
};

export default function ProfessorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [professor, setProfessor] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  
  const [newReview, setNewReview] = useState('');
  const [grade, setGrade] = useState('');
  const [course, setCourse] = useState('');
  const [ratingAttendance, setRatingAttendance] = useState(0); 
  const [ratingTeaching, setRatingTeaching] = useState(0);     
  const [ratingBehavior, setRatingBehavior] = useState(0);     
  const [ratingGrading, setRatingGrading] = useState(0);       
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());
  
  const [sortBy, setSortBy] = useState<'newest' | 'most_liked' | 'most_commented'>('newest');
  const viewIncremented = useRef(false);

  useEffect(() => {
    const savedLikedReviews = localStorage.getItem('likedReviews');
    if (savedLikedReviews) setLikedReviews(new Set(JSON.parse(savedLikedReviews)));

    const savedLikedReplies = localStorage.getItem('likedReplies');
    if (savedLikedReplies) setLikedReplies(new Set(JSON.parse(savedLikedReplies)));
  }, []);

  async function getData() {
    const { data: prof } = await supabase.from('professors').select('*').eq('id', id).single();
    setProfessor(prof);
    
    if (prof && !viewIncremented.current) {
        viewIncremented.current = true;
        await supabase.rpc('increment_professor_view', { row_id: prof.id });
    }

    if (prof) {
      const { data: revs } = await supabase.from('reviews').select(`*, replies (*)`).eq('professor_id', prof.id).order('created_at', { ascending: false });
      setReviews(revs || []);
    }
  }

  useEffect(() => { if (id) getData(); }, [id]);

  const percentageRating = reviews.length > 0 
    ? Math.round((reviews.reduce((acc, rev) => acc + rev.rating, 0) / (reviews.length * 5)) * 100)
    : 0;

  const calculateAvg = (key: string) => {
    const validReviews = reviews.filter((r: any) => r[key] > 0);
    if (validReviews.length === 0) return 0;
    return validReviews.reduce((acc: any, r: any) => acc + r[key], 0) / validReviews.length;
  };

  const avgAttendance = calculateAvg('rating_attendance');
  const avgTeaching = calculateAvg('rating_teaching');
  const avgBehavior = calculateAvg('rating_behavior');
  const avgGrading = calculateAvg('rating_grading');
  
  const getTopBadges = () => {
    const badgeCounts: Record<string, number> = {};
    reviews.forEach(r => { r.tags?.forEach((t: string) => { 
        if(!t.includes('طبيعي')) {
            const label = t; 
            badgeCounts[label] = (badgeCounts[label] || 0) + 1; 
        }
    }); });
    return Object.entries(badgeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([badge]) => badge);
  };
  const topBadges = getTopBadges();

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
    const newLiked = new Set(likedReviews).add(reviewId);
    setLikedReviews(newLiked);
    localStorage.setItem('likedReviews', JSON.stringify(Array.from(newLiked)));
    await supabase.rpc('increment_likes', { review_id: reviewId });
  }

  async function handleReplyLike(replyId: string) {
    if (likedReplies.has(replyId)) return;

    const updatedReviews = reviews.map(review => ({
        ...review,
        replies: review.replies.map((r: any) => 
            r.id === replyId ? { ...r, likes_count: (r.likes_count || 0) + 1 } : r
        )
    }));
    setReviews(updatedReviews);

    const newLiked = new Set(likedReplies).add(replyId);
    setLikedReplies(newLiked);
    localStorage.setItem('likedReplies', JSON.stringify(Array.from(newLiked)));

    await supabase.rpc('increment_reply_likes', { reply_id: replyId });
  }

  // 🔥 منطق اختيار المجموعات الجديد (يدعم التعدد في "أخرى") 🔥
  const toggleBadge = (badge: string, groupOptions: string[], groupId: string) => {
    let newBadges = [...selectedBadges];
    
    // إذا كانت المجموعة "أخرى"، نسمح باختيار متعدد
    if (groupId === 'other') {
        if (newBadges.includes(badge)) {
            newBadges = newBadges.filter(b => b !== badge);
        } else {
            newBadges.push(badge);
        }
    } 
    // إذا كانت شخصية (معقدة شوي)
    else if (groupId === 'personality') {
      const positiveTraits = ["محتررم", "عسسلل"];
      const negativeTraits = ["غثيث", "وقح"];
      
      if (badge === "شخصية_طبيعية") {
        newBadges = newBadges.filter(b => !groupOptions.includes(b));
        if (!selectedBadges.includes("شخصية_طبيعية")) newBadges.push("شخصية_طبيعية");
      } else {
        newBadges = newBadges.filter(b => b !== "شخصية_طبيعية"); 
        
        const isPositiveSelection = positiveTraits.includes(badge);
        if (isPositiveSelection) newBadges = newBadges.filter(b => !negativeTraits.includes(b));
        else newBadges = newBadges.filter(b => !positiveTraits.includes(b));
        
        if (newBadges.includes(badge)) newBadges = newBadges.filter(b => b !== badge);
        else newBadges.push(badge);
      }
    } 
    // باقي المجموعات (اختيار واحد فقط)
    else {
      newBadges = newBadges.filter(b => !groupOptions.includes(b));
      if (!selectedBadges.includes(badge)) newBadges.push(badge);
    }
    setSelectedBadges(newBadges);
  };

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!grade || !newReview.trim() || !course.trim()) {
        alert("الرجاء تعبئة جميع الحقول المطلوبة (المقرر، الدرجة، التجربة)");
        return;
    }
    if (ratingAttendance === 0 || ratingTeaching === 0 || ratingBehavior === 0 || ratingGrading === 0) {
        alert("الرجاء تقييم الدكتور في جميع المعايير الأربعة");
        return;
    }

    // 🔥 تم إلغاء شرط الإجبار هنا 🔥
    // الآن الطالب حر يختار اللي يبي من الشارات أو يتركها

    setIsSubmitting(true);
    const overallRating = Math.round(((ratingAttendance + ratingTeaching + ratingBehavior + ratingGrading) / 4));

    const { error } = await supabase.from('reviews').insert([{ 
        content: newReview, 
        rating: overallRating, 
        grade, 
        professor_id: professor.id,
        course: course,
        rating_attendance: ratingAttendance,
        rating_teaching: ratingTeaching,
        rating_behavior: ratingBehavior,
        rating_grading: ratingGrading,
        tags: selectedBadges
    }]);

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

        {/* الكارت 1: معلومات الدكتور */}
        <div className={`${cardStyle} p-8`}>
          <div className="flex flex-col gap-4">
            <div className="inline-block">
                <h1 className={`flex items-baseline gap-2 text-white ${cairoFont.className} relative w-fit`}>
                    <span className="text-teal-500 font-bold text-sm md:text-base opacity-90">اسم الدكتور |</span>
                    <span className="text-lg md:text-2xl font-black">{professor.name}</span>
                    <span className="absolute bottom-[-6px] right-0 h-1.5 w-full bg-gradient-to-l from-teal-400 via-teal-400 via-75% to-transparent rounded-full"></span>
                </h1>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-2">
                <span className="bg-slate-900/50 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2">
                    <Building2 size={14} /> {professor.college}
                </span>
                <span className="bg-slate-900/50 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2">
                    <GraduationCap size={14} /> {professor.department}
                </span>
            </div>
          </div>
        </div>

        {/* الكارت 2: إضافة تقييم (تم نقله هنا ليصبح الثاني) */}
        <div className={`${cardStyle} p-6 md:p-8`}>
          <div className="inline-block mb-6 w-full">
            <div className="flex items-center gap-2">
              <Award className="text-teal-400" size={20} />
              <h3 className={`text-lg font-bold text-white ${cairoFont.className}`}>قيّم تجربتك</h3>
            </div>
            {/* 🔥 الخط المعدل: نبض مستمر + وهج مضيء 🔥 */}
            <div className="h-1.5 w-full bg-gradient-to-l from-teal-400 via-emerald-500/70 to-transparent rounded-full mt-3 shadow-[0_0_15px_rgba(45,212,191,0.6)] animate-pulse"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-2 block">المقرر <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <BookOpen size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="مثال: محاسبة 101" className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pr-9 pl-4 py-3 text-sm focus:border-teal-500 outline-none text-white transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-2 block">الدرجة <span className="text-red-500">*</span></label>
                    <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-teal-500 outline-none text-white transition-all appearance-none cursor-pointer">
                        <option value="">اختر..</option>
                        {["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"].map(g => <option key={g} value={g}>{g}</option>)}
                        <option value="أتحفظ عن الإفصاح" className="text-slate-400 bg-slate-800">أتحفظ عن الإفصاح</option>
                    </select>
                  </div>
            </div>
            
            <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-600">
                    <Activity size={16} className="text-teal-500" />
                    <span className="text-sm font-bold text-slate-300">معايير التقييم</span>
                    <span className="text-red-500 text-sm">*</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-right">
                    <StarRatingInput label="نظام التحضير" value={ratingAttendance} onChange={setRatingAttendance} />
                    <StarRatingInput label="جودة الشرح" value={ratingTeaching} onChange={setRatingTeaching} />
                    <StarRatingInput label="الأخلاق والتعامل" value={ratingBehavior} onChange={setRatingBehavior} />
                    <StarRatingInput label="الدرجات" value={ratingGrading} onChange={setRatingGrading} />
                </div>
            </div>

            <div>
                <div className="flex items-center gap-2 mb-4 group/hint relative w-fit">
                    <label className="text-xs font-bold text-slate-400 block flex items-center gap-1 cursor-pointer">
                        <Tag size={12}/> اختر الصفات (اختياري)
                    </label>
                </div>
                <div className="space-y-4">
                    {BADGE_GROUPS.map((group) => (
                        <div key={group.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-bold w-16 shrink-0">{group.label}:</span>
                            <div className="flex flex-wrap gap-2">
                                {group.options.map(badge => (
                                    <button 
                                        key={badge} 
                                        type="button" 
                                        onClick={() => toggleBadge(badge, group.options, group.id)} 
                                        className={`text-[10px] px-3 py-1.5 rounded-lg border transition-all duration-200 font-medium ${getBadgeColorStyle(badge, selectedBadges.includes(badge))}`}
                                    >
                                        {getBadgeLabel(badge)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">
                اكتب تقييمك بكل مصداقية <span className="text-red-500">*</span>
              </label>
              <textarea value={newReview} onChange={(e) => setNewReview(e.target.value)} placeholder="اكتب تقييمك هنا..." className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white min-h-[100px] focus:outline-none focus:border-teal-500 text-sm transition-all shadow-inner" />
            </div>
            <button disabled={isSubmitting} type="submit" className="w-full bg-teal-600 py-3 rounded-xl font-bold shadow-lg hover:bg-teal-500 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                {isSubmitting ? 'جاري النشر...' : <><Send size={16} /> نشر التقييم</>}
            </button>
          </form>
        </div>

        {/* الكارت 3: الإحصائيات (تم نقله هنا ليصبح الثالث) */}
        <div className={`${cardStyle} p-6 mt-6`}>
            
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <Activity className="text-teal-500" size={24} />
                    <h3 className={`text-xl font-bold text-white ${cairoFont.className}`}>إحصائيات التقييم</h3>
                </div>
                <div className="h-1.5 w-full bg-gradient-to-l from-teal-400 via-emerald-500/70 to-transparent rounded-full mt-3 opacity-80 shadow-sm"></div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-700/50">
                <div className="flex items-center w-full sm:w-auto justify-center sm:justify-start">
                    <SuperSmartCircle percentage={percentageRating} />
                </div>
                <div className="hidden sm:block w-px h-12 bg-slate-700"></div>
                <div className="flex items-center justify-end gap-4 w-full sm:w-1/3">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-400">عدد التقييمات</span>
                        <span className="text-2xl font-black text-white">{reviews.length}</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-full border border-slate-700 text-blue-400 shadow-lg">
                        <BarChart3 size={24} />
                    </div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-slate-700"></div>
                <div className="flex items-center justify-end gap-4 w-full sm:w-1/3">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-400">عدد الزيارات</span>
                        <span className="text-2xl font-black text-white">{professor.view_count || 0}</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-full border border-slate-700 text-purple-400 shadow-lg">
                        <Eye size={24} />
                    </div>
                </div>
            </div>

            {/* تفاصيل التقييمات */}
            {reviews.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 py-6 border-b border-slate-700/50">
                    <StatBar label="جودة الشرح" value={avgTeaching} icon={BookOpen} colorClass="text-purple-400" bgClass="bg-purple-500" />
                    <StatBar label="نظام التحضير" value={avgAttendance} icon={CalendarClock} colorClass="text-blue-400" bgClass="bg-blue-500" />
                    <StatBar label="الأخلاق والتعامل" value={avgBehavior} icon={Smile} colorClass="text-emerald-400" bgClass="bg-emerald-500" />
                    <StatBar label="سهولة الدرجات" value={avgGrading} icon={PenTool} colorClass="text-orange-400" bgClass="bg-orange-500" />
                </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center sm:justify-start">
                <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
                    <Medal size={12} className="text-amber-400"/> أبرز صفات الدكتور:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                    {topBadges.length > 0 ? topBadges.map((badge, idx) => {
                        const style = getBadgeDisplayColor(badge);
                        const label = getBadgeLabel(badge);
                        return (
                            <span key={idx} className={`text-[10px] px-3 py-1 rounded-md border shadow-sm ${style}`}>
                                {label}
                            </span>
                        );
                    }) : <span className="text-[10px] text-slate-600">لا توجد بيانات كافية</span>}
                </div>
            </div>
        </div>

        {/* الكارت 4: قائمة التقييمات */}
        <div className={`${cardStyle} p-6 md:p-8`}>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquareQuote size={24} className="text-teal-500" />
                <h3 className={`text-xl font-bold text-white ${cairoFont.className}`}>
                    تقييمات الطلاب 
                    <span className="mr-2 text-sm bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{reviews.length}</span>
                </h3>
              </div>
            </div>
            <div className="h-1.5 w-full bg-gradient-to-l from-teal-400 via-emerald-500/70 to-transparent rounded-full mb-6 shadow-sm"></div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/50 p-1 rounded-xl border border-slate-700 w-fit">
            <button onClick={() => setSortBy('newest')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'newest' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                <Clock size={14} /> الأحدث
            </button>
            <button onClick={() => setSortBy('most_liked')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'most_liked' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                <Filter size={14} /> الأكثر فائدة
            </button>
            <button onClick={() => setSortBy('most_commented')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'most_commented' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30' : 'text-slate-400 hover:text-orange-400'}`}>
                <MessagesSquare size={14} /> الأكثر تعليقاً
            </button>
          </div>

          <div className="space-y-8">
            {sortedReviews.length === 0 ? (
              <p className="text-center text-slate-500 py-6 text-sm">لا توجد تقييمات بعد!</p>
            ) : (
              sortedReviews.map((review) => (
                <div key={review.id} className="bg-slate-900/40 border border-slate-700/50 rounded-3xl overflow-hidden hover:border-teal-500/10 transition-all group/card shadow-sm relative">
                  
                  {/* الهيدر المنفصل */}
                  <div className="bg-slate-900/60 p-5 border-b border-slate-800">
                      
                      {/* الصف الأول */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            {review.course && (
                                <div className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                                    <BookOpen size={12}/> {review.course}
                                </div>
                            )}
                            <span className={`text-[12px] font-black px-3 py-1.5 rounded-lg border shadow-sm ${getGradeStyle(review.grade)}`}>
                                {review.grade}
                            </span>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <span className={`text-[12px] font-black px-2 py-1 rounded-lg border shadow-sm flex items-center gap-0.5 ${getReviewPercentStyle((review.rating / 5) * 100)}`}>
                                {Math.round((review.rating / 5) * 100)}<Percent size={10} strokeWidth={3} />
                            </span>
                            <TimeDisplay dateString={review.created_at} />
                        </div>
                      </div>

                      {/* الصف الثاني: الشارات المرتبة */}
                      {review.tags && review.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                              {sortBadges(review.tags).map((tag: string, idx: number) => {
                                  const style = getBadgeDisplayColor(tag);
                                  const label = getBadgeLabel(tag);
                                  return (
                                      <span key={idx} className={`text-[10px] px-2 py-0.5 rounded-md border ${style}`}>
                                          {label}
                                      </span>
                                  );
                              })}
                          </div>
                      )}
                  </div>

                  {/* منطقة النص */}
                  <div className="p-6">
                      <p className="text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">{review.content}</p>
                  </div>
                  
                  {/* الفوتر */}
                  <div className="bg-slate-900/30 px-6 py-3 flex items-center justify-between border-t border-slate-800/50">
                    <div className="flex gap-4">
                        <button onClick={() => handleLike(review.id)} className={`flex items-center gap-2 text-xs font-bold transition-colors ${likedReviews.has(review.id) ? 'text-teal-400' : 'text-slate-500 hover:text-teal-400'}`}>
                        <ThumbsUp size={16} className={likedReviews.has(review.id) ? "fill-teal-400" : ""} /> <span>{review.likes_count || 0}</span>
                        </button>
                        <button onClick={() => toggleReplies(review.id)} className={`flex items-center gap-2 text-xs font-bold transition-colors ${expandedReviews.has(review.id) ? 'text-teal-400' : 'text-slate-500 hover:text-teal-400'}`}>
                        <MessageCircle size={16} /> <span>{expandedReviews.has(review.id) ? 'إخفاء الردود' : `الردود (${review.replies?.length || 0})`}</span>
                        </button>
                    </div>
                    <CompactDate dateString={review.created_at} />
                  </div>

                  {/* قسم الردود */}
                  {expandedReviews.has(review.id) && (
                    <div className="p-6 pt-0 space-y-2 border-t border-slate-800/50 bg-slate-900/20">
                      <div className={`mt-4 flex gap-3 items-center bg-slate-900/80 border p-3 rounded-2xl transition-all mb-6 ${activeReplyId === review.id ? 'border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.1)]' : 'border-slate-800'}`}>
                        <CornerDownRight className="text-slate-600" size={18} />
                        <input value={activeReplyId === review.id ? replyContent : ''} onChange={(e) => { setActiveReplyId(review.id); setReplyContent(e.target.value); }} onFocus={() => setActiveReplyId(review.id)} placeholder="اكتب ردك هنا..." className="flex-grow bg-transparent border-none text-sm focus:outline-none text-white" onKeyDown={(e) => { if (e.key === 'Enter') submitReply(review.id); }} />
                        <button onClick={() => submitReply(review.id)} disabled={submittingReply} className="bg-teal-600 hover:bg-teal-500 text-white p-2 rounded-xl transition-all"><Send size={16} /></button>
                      </div>
                      <div className="pr-2 md:pr-4">
                        {review.replies?.filter((r:any) => !r.parent_id).map((reply: any) => (
                          <ReplyItem key={reply.id} reply={reply} allReplies={review.replies} onReplyClick={(id: string) => { setActiveReplyId(id); setReplyContent(''); }} activeReplyId={activeReplyId} replyContent={replyContent} setReplyContent={setReplyContent} submitReply={submitReply} submitting={submittingReply} parentText={review.content} onLikeReply={onLikeReply} likedReplies={likedReplies} />
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