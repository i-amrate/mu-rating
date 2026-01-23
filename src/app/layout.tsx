import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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

// 🔥 هنا تم تغيير الاسم والوصف 🔥
export const metadata: Metadata = {
  title: "مُرشِدك | دليلك الجامعي",
  description: "منصة مُرشِدك: دليلك الأول لتقييم واختيار دكاترة الجامعات السعودية بكل شفافية",
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
        
        {/* تغليف الموقع بمزود بيانات الجامعات */}
        <UniversityProvider>
          
          {/* الهيدر التفاعلي الجديد */}
          <Header />

          {/* محتوى الصفحة */}
          <div className="pt-24">
            {children}
          </div>

        </UniversityProvider>

      </body>
    </html>
  );
}