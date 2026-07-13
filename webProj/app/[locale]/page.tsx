import { setRequestLocale } from 'next-intl/server';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Stages from '@/components/sections/Stages';
import Prizes from '@/components/sections/Prizes';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const titles: { [key: string]: string } = {
    en: 'Thailand-Japan Game Programming Hackathon 2026',
    th: 'ประเทศไทย-ญี่ปุ่น แข่งขันเขียนโปรแกรมเกม 2026',
    ja: 'タイ・日本ゲームプログラミングハッカソン2026',
  };

  return {
    title: titles[locale] || titles['en'],
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="w-full">
      <Hero />
      <About />
      <Stages />
      <Prizes />
    </div>
  );
}
