import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// إعداد عميل Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BASE_URL = 'https://morshed-uni.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. نجيب كل الدكاترة من الداتابيز عشان نسوي لهم روابط
  const { data: professors } = await supabase
    .from('professors')
    .select('id, updated_at');

  // 2. نسوي الروابط الديناميكية للدكاترة
  const professorUrls = (professors || []).map((prof) => ({
    url: `${BASE_URL}/professor/${prof.id}`,
    lastModified: new Date(prof.updated_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 3. ندمجها مع الروابط الثابتة (الرئيسية، صفحة الإضافة)
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/add-professor`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...professorUrls,
  ];
}