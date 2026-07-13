'use client';

import { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'th', label: 'ไทย' },
  { code: 'ja', label: '日本語' },
];

export default function LanguageSwitcher({
  currentLocale,
}: {
  currentLocale: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      // Replace the locale in the pathname
      const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
      router.push(newPathname);
    });
  };

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 text-neon-cyan hover:text-neon-magenta transition-colors">
        <Globe size={20} />
        <span className="text-sm font-semibold">{currentLocale.toUpperCase()}</span>
      </button>

      <div className="absolute right-0 mt-0 w-32 bg-cyber-indigo border border-neon-cyan/50 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 shadow-neon-cyan">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            disabled={isPending}
            className={`w-full px-4 py-2 text-left text-sm transition-colors ${
              currentLocale === lang.code
                ? 'bg-neon-cyan/20 text-neon-cyan font-semibold'
                : 'text-gray-300 hover:text-neon-cyan'
            } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
