'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CountdownTimer from '@/components/CountdownTimer';

export default function Hero() {
  const t = useTranslations('hero');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden px-4 sm:px-6 lg:px-8"
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-neon-cyan/10 rounded-full blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 40, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-neon-magenta/10 rounded-full blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-neon-cyan mb-4 text-sm md:text-base font-semibold uppercase tracking-widest">
            🎮 Thailand × Japan
          </motion.p>

          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 neon-text leading-tight"
          >
            {t('title')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            {t('subtitle')}
          </motion.p>

          {/* Countdown Timer */}
          <motion.div variants={itemVariants} className="mb-12">
            <p className="text-neon-magenta text-lg font-semibold mb-6">{t('countdown_title')}</p>
            <CountdownTimer />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link href="#register" className="btn-primary">
              {t('cta')}
            </Link>
            <a href="#about" className="btn-secondary">
              Learn More
            </a>
          </motion.div>

          {/* Floating cards info */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16"
          >
            {[
              { number: '2', label: 'Stages' },
              { number: '50+', label: 'Teams Expected' },
              { number: '2', label: 'Countries' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="p-6 bg-cyber-indigo/40 border border-neon-cyan/30 rounded-lg backdrop-blur hover:border-neon-cyan hover:shadow-neon-cyan transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <p className="text-3xl font-bold neon-text">{item.number}</p>
                <p className="text-gray-400 text-sm mt-2">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
