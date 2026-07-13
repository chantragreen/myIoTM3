'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  const t = useTranslations('common.nav');

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-neon-cyan text-lg font-semibold mb-4">404</p>
        <h1 className="text-5xl font-bold neon-text mb-4">Page Not Found</h1>
        <p className="text-gray-400 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link href="/" className="btn-primary">
          {t('home')}
        </Link>
      </motion.div>
    </div>
  );
}
