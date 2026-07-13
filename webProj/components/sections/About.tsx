'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Zap, Globe, Users, Trophy } from 'lucide-react';

export default function About() {
  const t = useTranslations('about');
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const features = [
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Push the boundaries of game development with cutting-edge technology',
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Connect with developers from Thailand and Japan',
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Build amazing projects with like-minded developers',
    },
    {
      icon: Trophy,
      title: 'Excellence',
      description: 'Compete at the highest level and win amazing prizes',
    },
  ];

  return (
    <section
      id="about"
      className="py-20 px-4 sm:px-6 lg:px-8 relative"
      ref={ref}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.h2 variants={itemVariants} className="section-title">
            {t('title')}
          </motion.h2>
          <motion.p variants={itemVariants} className="section-subtitle">
            {t('description')}
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          {/* Mission Statement */}
          <motion.div
            variants={itemVariants}
            className="glow-box group hover:shadow-neon-magenta transition-all duration-300"
          >
            <h3 className="text-2xl font-bold text-neon-magenta mb-4">
              {t('mission')}
            </h3>
            <p className="text-gray-300 leading-relaxed">{t('mission_text')}</p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="glow-box hover:shadow-neon-cyan transition-all duration-300">
              <p className="text-neon-cyan font-bold text-lg">2 Countries</p>
              <p className="text-gray-400">Thailand & Japan united</p>
            </div>
            <div className="glow-box hover:shadow-neon-magenta transition-all duration-300">
              <p className="text-neon-magenta font-bold text-lg">2 Stages</p>
              <p className="text-gray-400">Qualifier & Grand Final</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-magenta opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300" />
                <div className="relative p-6 border border-neon-cyan/20 rounded-lg group-hover:border-neon-cyan group-hover:shadow-neon-cyan transition-all duration-300 h-full">
                  <Icon className="w-12 h-12 text-neon-cyan mb-4 group-hover:text-neon-magenta transition-colors" />
                  <h4 className="text-lg font-bold text-neon-cyan mb-2 group-hover:text-neon-magenta transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
