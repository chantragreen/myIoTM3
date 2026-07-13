'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = (): TimeLeft => {
      // Event date: December 31, 2026
      const targetDate = new Date('2026-12-31T23:59:59').getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  const TimeUnit = ({
    value,
    label,
    index,
  }: {
    value: number;
    label: string;
    index: number;
  }) => (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <motion.div
        key={value}
        className="relative"
        initial={{ rotateX: 90 }}
        animate={{ rotateX: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 border-2 border-neon-cyan rounded-lg p-4 min-w-20 shadow-neon-cyan">
          <p className="text-3xl md:text-4xl font-bold neon-text">
            {String(value).padStart(2, '0')}
          </p>
        </div>
      </motion.div>
      <p className="text-gray-400 text-xs md:text-sm mt-3 uppercase font-semibold">
        {label}
      </p>
    </motion.div>
  );

  return (
    <div className="flex justify-center items-center gap-4 md:gap-8 flex-wrap">
      <TimeUnit value={timeLeft.days} label="Days" index={0} />
      <div className="text-neon-cyan text-2xl md:text-3xl font-bold animate-pulse">:</div>
      <TimeUnit value={timeLeft.hours} label="Hours" index={1} />
      <div className="text-neon-magenta text-2xl md:text-3xl font-bold animate-pulse">:</div>
      <TimeUnit value={timeLeft.minutes} label="Minutes" index={2} />
      <div className="text-neon-cyan text-2xl md:text-3xl font-bold animate-pulse">:</div>
      <TimeUnit value={timeLeft.seconds} label="Seconds" index={3} />
    </div>
  );
}
