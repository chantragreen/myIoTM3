'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navigation({ locale }: { locale: string }) {
  const t = useTranslations('common.nav');
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: t('home'), href: '#hero' },
    { label: t('about'), href: '#about' },
    { label: t('stages'), href: '#stages' },
    { label: t('prizes'), href: '#prizes' },
    { label: t('contact'), href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-cyber-dark/80 border-b border-neon-cyan/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-neon-magenta rounded-lg flex items-center justify-center">
              <span className="text-cyber-dark font-bold">H</span>
            </div>
            <span className="hidden sm:inline font-bold neon-text">Hackathon 2026</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-300 hover:text-neon-cyan transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher currentLocale={locale} />
            <a href={`/${locale}#register`} className="hidden md:block btn-primary text-sm">
              {t('register')}
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-neon-cyan"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-neon-cyan/30">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block px-4 py-2 text-gray-300 hover:text-neon-cyan transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href={`/${locale}#register`}
              className="block mx-4 mt-4 btn-primary text-center text-sm"
              onClick={() => setIsOpen(false)}
            >
              {t('register')}
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
