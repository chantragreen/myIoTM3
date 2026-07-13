'use client';

import { useTranslations } from 'next-intl';
import { Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer id="contact" className="mt-20 border-t border-neon-cyan/30 bg-gradient-to-b from-cyber-dark/50 to-tech-gray pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 className="text-neon-cyan font-bold mb-4">Hackathon 2026</h3>
            <p className="text-gray-400 text-sm">
              Uniting Thai and Japanese developers for innovation, competition, and excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-neon-magenta font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#hero" className="hover:text-neon-cyan transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-neon-cyan transition-colors">About</a></li>
              <li><a href="#stages" className="hover:text-neon-cyan transition-colors">Tournament</a></li>
              <li><a href="#prizes" className="hover:text-neon-cyan transition-colors">Prizes</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-neon-magenta font-bold mb-4">{t('contact')}</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Mail size={16} className="text-neon-cyan" />
                <a href={`mailto:${t('email')}`} className="hover:text-neon-cyan transition-colors">
                  {t('email')}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <MapPin size={16} className="text-neon-magenta" />
                <span>Thailand & Japan</span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-neon-magenta font-bold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-cyber-dark transition-all flex items-center justify-center">
                <span>f</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:text-cyber-dark transition-all flex items-center justify-center">
                <span>𝕏</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-cyber-dark transition-all flex items-center justify-center">
                <span>in</span>
              </a>
            </div>
          </div>
        </div>

        {/* Sponsors */}
        <div className="border-t border-neon-cyan/20 pt-8 mb-8">
          <h4 className="text-neon-cyan font-bold mb-4 text-center">{t('sponsors')}</h4>
          <div className="flex flex-wrap justify-center items-center gap-6">
            <div className="text-gray-500 text-sm">Your Company Here</div>
            <div className="text-gray-500 text-sm">Your Company Here</div>
            <div className="text-gray-500 text-sm">Your Company Here</div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-neon-cyan/20 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2026 Thailand-Japan Game Programming Hackathon. {t('rights')}.</p>
        </div>
      </div>
    </footer>
  );
}
