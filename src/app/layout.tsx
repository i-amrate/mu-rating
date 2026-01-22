import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Instagram } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AZZAM Guide | جامعة المجمعة",
  description: "دليلك لتقييم واختيار دكاترة جامعة المجمعة",
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="bg-slate-950">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-200 min-h-screen`}>
        
        {/* --- الهيدر الثابت --- */}
        <nav className="fixed top-0 inset-x-0 z-[100] bg-slate-950 border-b border-slate-800 h-20 transition-all duration-300 flex items-center justify-end md:justify-center pl-4 md:pl-0 shadow-2xl shadow-black/20">
          
          {/* 1. اسم الجامعة (يمين) */}
          <div className="absolute right-5 md:right-8 top-1/2 -translate-y-1/2 flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-500 cursor-default select-none group">
            <div className="h-9 w-1 bg-gradient-to-b from-teal-400 to-emerald-500 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.3)] group-hover:shadow-[0_0_20px_rgba(45,212,191,0.6)] transition-all duration-500"></div>
            <div className="flex flex-col items-start justify-center">
              <span className="text-xs md:text-sm font-black text-white leading-none tracking-wide drop-shadow-md">
                جامعة المجمعة
              </span>
              <span className="text-[9px] md:text-[10px] text-teal-400 font-mono font-bold tracking-[0.2em] uppercase mt-1.5">
                Majmaah Universit
              </span>
            </div>
          </div>

          {/* 2. القائمة الوسطية (شعارك) */}
          <div className="flex items-center bg-slate-900 rounded-full border border-slate-700/50 px-3 sm:px-4 py-2 gap-3 sm:gap-4 shadow-xl hover:border-teal-500/30 transition-all duration-300 group">
            
            {/* الشعار AZ (مع حركة التوسع عند اللمس) */}
            <Link href="/" className="group/logo">
              <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center border border-slate-600 group-hover/logo:bg-teal-600 group-hover/logo:border-teal-500 group-active/logo:bg-teal-600 group-active/logo:border-teal-500 transition-all duration-300 shadow-lg overflow-hidden relative">
                <div className="relative flex items-center justify-center font-black text-base leading-none select-none tracking-tighter" dir="ltr">
                   <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-500/55 -mr-[0.25em] group-hover/logo:text-white group-hover/logo:bg-none group-hover/logo:-translate-x-0.5 group-active/logo:text-white group-active/logo:bg-none group-active/logo:-translate-x-0.5 transition-all duration-300">A</span>
                   <span className="relative z-0 text-transparent bg-clip-text bg-gradient-to-r from-teal-500/55 to-emerald-400 group-hover/logo:text-white group-hover/logo:bg-none group-hover/logo:translate-x-0.5 group-active/logo:text-white group-active/logo:bg-none group-active/logo:translate-x-0.5 transition-all duration-300">Z</span>
                </div>
              </div>
            </Link>

            {/* 🔥 التعديل النهائي: AZZAM GUIDE داخل صندوق تيل واحد فخم 🔥 */}
            <Link href="/" className="flex items-center pt-0.5">
               <span className="font-mono font-bold text-[10px] sm:text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 sm:px-3 py-1.5 rounded-lg tracking-widest shadow-[0_0_15px_rgba(45,212,191,0.05)] hover:bg-teal-500/20 hover:shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:border-teal-500/40 transition-all duration-300">
                 AZZAM GUIDE
               </span>
            </Link>

            <div className="w-px h-5 bg-slate-700"></div>

            {/* الإنستقرام */}
            <a 
              href="https://instagram.com/acc.azzamsa" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-pink-500 hover:bg-pink-500/10 transition-all duration-300 transform hover:scale-110"
              title="تابعنا على إنستقرام"
            >
              <Instagram size={18} />
            </a>
          </div>
        </nav>

        {/* مسافة المحتوى */}
        <div className="pt-24">
          {children}
        </div>

      </body>
    </html>
  );
}