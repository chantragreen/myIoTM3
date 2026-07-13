'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Trophy, Medal, Award, Sparkles } from 'lucide-react';

export default function Prizes() {
  const t = useTranslations('prizes');
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

  const prizes = [
    {
      rank: t('first_place'),
      amount: '$10,000',
      icon: Trophy,
      color: 'from-neon-cyan to-neon-cyan',
      textColor: 'text-neon-cyan',
      borderColor: 'border-neon-cyan',
      shadowColor: 'shadow-neon-cyan',
      position: 'top-0',
    },
    {
      rank: t('second_place'),
      amount: '$5,000',
      icon: Medal,
      color: 'from-neon-magenta to-neon-magenta',
      textColor: 'text-neon-magenta',
      borderColor: 'border-neon-magenta',
      shadowColor: 'shadow-neon-magenta',
      position: 'top-20',
    },
    {
      rank: t('third_place'),
      amount: '$2,500',
      icon: Award,
      color: 'from-neon-purple to-neon-purple',
      textColor: 'text-neon-purple',
      borderColor: 'border-neon-purple',
      shadowColor: 'shadow-neon-magenta',
      position: 'top-40',
    },
  ];

  const mentors = [
    {
      name: 'Senior Game Developer',
      company: 'Leading Game Studio',
    },
    {
      name: 'UI/UX Designer',
      company: 'Tech Company',
    },
    {
      name: 'Backend Engineer',
      company: 'Gaming Platform',
    },
    {
      name: 'Producer',
      company: 'International Studio',
    },
  ];

  return (
    <section id="prizes" className="py-20 px-4 sm:px-6 lg:px-8 relative" ref={ref}>
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

        {/* Prizes Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
        >
          {prizes.map((prize, idx) => {
            const Icon = prize.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className={`relative ${idx === 0 ? 'md:scale-110 md:z-10' : ''}`}
              >
                <div className={`p-8 bg-gradient-to-br from-cyber-indigo/40 to-tech-gray/40 border-2 ${prize.borderColor} rounded-lg backdrop-blur transition-all duration-300 hover:${prize.shadowColor}`}>
                  <div className="text-center">
                    <motion.div
                      className="flex justify-center mb-4"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Icon className={`w-16 h-16 ${prize.textColor}`} />
                    </motion.div>
                    <h3 className={`text-2xl font-bold ${prize.textColor} mb-2`}>
                      {prize.rank}
                    </h3>
                    <p className="text-3xl font-bold neon-text mb-2">{prize.amount}</p>
                    <p className="text-gray-400 text-sm">
                      Prize money + mentorship + networking opportunities
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Mentors Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mt-20"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h3 className="text-3xl font-bold neon-text mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8" />
              {t('mentors_title')}
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {t('mentors_text')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mentors.map((mentor, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="group p-6 bg-cyber-indigo/30 border border-neon-magenta/30 rounded-lg hover:border-neon-magenta hover:shadow-neon-magenta transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-neon-magenta to-neon-cyan rounded-lg mb-4" />
                <h4 className="font-bold text-neon-magenta mb-2 group-hover:text-neon-cyan transition-colors">
                  {mentor.name}
                </h4>
                <p className="text-sm text-gray-400">{mentor.company}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional Benefits */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mt-20 p-8 border-2 border-neon-cyan/50 rounded-lg bg-cyber-indigo/20"
        >
          <motion.h4 variants={itemVariants} className="text-xl font-bold text-neon-cyan mb-6">
            🎁 All Winners Receive:
          </motion.h4>
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              'Exclusive Merchandise',
              'Internship Opportunities',
              'Portfolio Boost',
              'Industry Connections',
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-4 bg-cyber-dark/50 border border-neon-cyan/20 rounded-lg text-center"
              >
                <p className="text-neon-cyan font-semibold">{benefit}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
