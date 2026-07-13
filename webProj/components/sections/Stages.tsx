'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, MapPin } from 'lucide-react';

export default function Stages() {
  const t = useTranslations('stages');
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
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

  return (
    <section id="stages" className="py-20 px-4 sm:px-6 lg:px-8 relative" ref={ref}>
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
            {t('subtitle')}
          </motion.p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="relative"
        >
          {/* Timeline line */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-neon-cyan to-neon-magenta" />

          <div className="space-y-12">
            {/* Stage 1 */}
            <motion.div variants={itemVariants} className="relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Content */}
                <div className="lg:text-right lg:col-start-1">
                  <div className="glow-box hover:shadow-neon-cyan transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-neon-cyan font-bold text-lg">Stage 1</span>
                      <span className="text-xs bg-neon-cyan/20 text-neon-cyan px-3 py-1 rounded-full">
                        Q1-Q2 2026
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-neon-cyan mb-4">
                      {t('stage1.title')}
                    </h3>
                    <p className="text-gray-300 mb-4">{t('stage1.description')}</p>
                    <div className="flex items-center justify-end space-x-2 text-neon-magenta">
                      <MapPin size={16} />
                      <span className="text-sm">{t('stage1.location')}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline dot */}
                <motion.div
                  className="hidden lg:flex justify-center"
                  whileHover={{ scale: 1.2 }}
                >
                  <div className="relative">
                    <div className="w-6 h-6 bg-neon-cyan rounded-full" />
                    <div className="absolute inset-0 w-6 h-6 bg-neon-cyan rounded-full animate-pulse opacity-50" />
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Arrow */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center lg:hidden"
            >
              <ArrowRight className="w-6 h-6 text-neon-magenta rotate-90" />
            </motion.div>

            {/* Stage 2 */}
            <motion.div variants={itemVariants} className="relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Timeline dot */}
                <motion.div
                  className="hidden lg:flex justify-center"
                  whileHover={{ scale: 1.2 }}
                >
                  <div className="relative">
                    <div className="w-6 h-6 bg-neon-magenta rounded-full" />
                    <div className="absolute inset-0 w-6 h-6 bg-neon-magenta rounded-full animate-pulse opacity-50" />
                  </div>
                </motion.div>

                {/* Content */}
                <div className="lg:col-start-2">
                  <div className="glow-box hover:shadow-neon-magenta transition-all duration-300 border-neon-magenta">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-neon-magenta font-bold text-lg">Stage 2</span>
                      <span className="text-xs bg-neon-magenta/20 text-neon-magenta px-3 py-1 rounded-full">
                        Q3-Q4 2026
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-neon-magenta mb-4">
                      {t('stage2.title')}
                    </h3>
                    <p className="text-gray-300 mb-4">{t('stage2.description')}</p>
                    <div className="flex items-center space-x-2 text-neon-cyan">
                      <MapPin size={16} />
                      <span className="text-sm">{t('stage2.location')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
