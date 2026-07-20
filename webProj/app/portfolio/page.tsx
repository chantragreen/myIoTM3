import type { Metadata } from 'next';
import { Bebas_Neue, Manrope } from 'next/font/google';
import {
  ArrowRight,
  Figma,
  Layers3,
  MonitorSmartphone,
  Sparkles,
  Workflow,
} from 'lucide-react';
import styles from './portfolio.module.css';

const headingFont = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--portfolio-heading-font',
});

const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--portfolio-body-font',
});

const projects = [
  {
    title: 'Pulse Commerce',
    tag: 'E-commerce UX Redesign',
    impact: '+42% checkout conversion',
    description:
      'Redesigned a fragmented shopping journey into a high-trust flow with predictive cart states and accessibility-first interaction patterns.',
  },
  {
    title: 'Northstar Banking',
    tag: 'Fintech Product Design',
    impact: '-31% support tickets',
    description:
      'Built a modular design system with onboarding experiments that reduced cognitive load and made complex transactions feel effortless.',
  },
  {
    title: 'Muse Studio',
    tag: 'Creative SaaS Platform',
    impact: '+68% weekly activation',
    description:
      'Created a cinematic onboarding loop and interactive workspace that helped new creators publish their first project in under 20 minutes.',
  },
];

const process = [
  {
    title: 'Strategy Sprint',
    detail:
      'I begin with user interviews, product analytics, and business constraints to frame the right problem before drawing any screen.',
    icon: Layers3,
  },
  {
    title: 'System-First UI',
    detail:
      'Every visual direction is translated into reusable components with clear behavior states, token scales, and accessibility baselines.',
    icon: Figma,
  },
  {
    title: 'Measure and Iterate',
    detail:
      'I validate releases with funnel analytics, usability tests, and rapid follow-up iterations to keep outcomes aligned with growth goals.',
    icon: Workflow,
  },
];

export const metadata: Metadata = {
  title: 'Portfolio Landing | Product Designer',
  description:
    'A bold portfolio landing page showcasing product design work, UX strategy, and measurable impact.',
};

export default function PortfolioPage() {
  return (
    <div className={`${styles.pageShell} ${headingFont.variable} ${bodyFont.variable}`}>
      <div className={styles.meshGlow} aria-hidden="true" />

      <header className={styles.navbar}>
        <p className={styles.brand}>Aster Vale</p>
        <a href="#contact" className={styles.navButton}>
          Start a Project
        </a>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.hero}>
          <p className={styles.kicker}>
            <Sparkles size={14} />
            Product Designer / UX Architect
          </p>
          <h1 className={styles.heroTitle}>
            I design digital products people remember and teams can scale.
          </h1>
          <p className={styles.heroDescription}>
            I help startups and global teams transform unclear ideas into premium digital experiences with
            measurable business impact.
          </p>

          <div className={styles.heroActions}>
            <a href="#work" className={styles.primaryButton}>
              Explore Work
              <ArrowRight size={18} />
            </a>
            <a href="#process" className={styles.secondaryButton}>
              How I Work
            </a>
          </div>

          <div className={styles.metricRow}>
            <article>
              <p className={styles.metricNumber}>8+</p>
              <p className={styles.metricLabel}>Years designing products</p>
            </article>
            <article>
              <p className={styles.metricNumber}>35</p>
              <p className={styles.metricLabel}>Products shipped globally</p>
            </article>
            <article>
              <p className={styles.metricNumber}>4.9/5</p>
              <p className={styles.metricLabel}>Average partner rating</p>
            </article>
          </div>
        </section>

        <section id="work" className={styles.workSection}>
          <div className={styles.sectionHeading}>
            <p>Selected Work</p>
            <h2>Outcomes over aesthetics, always.</h2>
          </div>

          <div className={styles.projectGrid}>
            {projects.map((project) => (
              <article key={project.title} className={styles.projectCard}>
                <div className={styles.cardTop}>
                  <span>{project.tag}</span>
                  <strong>{project.impact}</strong>
                </div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="process" className={styles.processSection}>
          <div className={styles.sectionHeading}>
            <p>Process</p>
            <h2>Structured thinking with creative execution.</h2>
          </div>

          <div className={styles.processGrid}>
            {process.map((item) => (
              <article key={item.title} className={styles.processCard}>
                <item.icon size={22} />
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.quoteSection}>
          <MonitorSmartphone size={20} />
          <p>
            &ldquo;Aster combines strategic clarity with flawless execution. Their UX thinking changed the way our
            entire product organization ships.&rdquo;
          </p>
          <span>Head of Product, Atlas Digital</span>
        </section>

        <section id="contact" className={styles.ctaSection}>
          <h2>Ready to build something category-defining?</h2>
          <p>
            Available for product strategy, UX direction, and high-impact interface design engagements.
          </p>
          <a href="mailto:hello@astervale.design" className={styles.primaryButton}>
            hello@astervale.design
            <ArrowRight size={18} />
          </a>
        </section>
      </main>
    </div>
  );
}
