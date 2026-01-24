import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 1. استيراد مكون التحليلات من فيرسل
import { Analytics } from "@vercel/analytics/react";
// استيراد مزود الجامعات والهيدر الجديد
import { UniversityProvider } from "../context/UniversityContext";
import Header from "../components/Header"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🔥 هنا مربط الفرس للانتشار (SEO) 🔥
export const metadata: Metadata = {
  metadataBase: new URL('https://morshed-uni.vercel.app'), // رابط موقعك الأساسي
  title: {
    template: '%s | منصة مرشد',
    default: 'مرشد | تقييم دكاترة الجامعات السعودية (الإمام، سعود، نورة)', // العنوان الرئيسي اللي يظهر بقوقل
  },
  description: 'اكتشف تقييمات دكاترة الجامعات السعودية في منصة مرشد. اضمن معدلك واختر جدولك بذكاء مع آراء طلاب حقيقيين لجامعة الإمام، الملك سعود، نورة، وغيرها. سهالات، شرح، درجات، وكل اللي يهمك.',
  keywords: [
    'تقييم دكاترة', 
    'جامعة الإمام', 
    'جامعة الملك سعود', 
    'جامعة الأميرة نورة',
    'مرشد', 
    'تقييم مواد', 
    'دكاترة', 
    'سهالات', 
    'معدل',
    'جدول دراسي',
    'الحذف والإضافة',
    'أفضل دكتور',
    'شرح',
    'درجات'
  ],
  authors: [{ name: 'فريق مرشد' }],
  creator: 'Morshed Team',
  publisher: 'Morshed Platform',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'مرشد | دليلك لتقييم الدكاترة وضبط الجدول',
    description: 'لا تنزل مادة وأنت مغمض! شف تقييمات الطلاب للدكاترة قبل تنزل المادة. اضمن الـ A+ مع مرشد.',
    url: 'https://morshed-uni.vercel.app',
    siteName: 'منصة مرشد الجامعية',
    locale: 'ar_SA',
    type: 'website',
    images: [
      {
        url: '/og-image.png', 
        width: 1200,
        height: 630,
        alt: 'منصة مرشد لتقييم الجامعات',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مرشد | منصة تقييم الجامعات السعودية',
    description: 'قيم دكتورك وشوف تقييمات غيرك. دليلك الشامل لجامعات المملكة.',
  },
  icons: {
    icon: '/favicon.ico', 
  },
  // ✅ تم وضع كود التحقق الصحيح هنا
  verification: {
    google: '-OD2HaWe1XUR2PIEEuTBtZNKn0PmTphI-iFzNBqa4-Q', 
  },
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
        
        <UniversityProvider>
          
          <Header />

          <div className="pt-24">
            {children}
          </div>

          {/* 2. إضافة مكون التحليلات هنا ليعمل على كامل الموقع */}
          <Analytics />

        </UniversityProvider>

      </body>
    </html>
  );
}