# Thailand-Japan Game Programming Hackathon 2026 - Frontend

A stunning, responsive landing page and registration portal for the Thailand-Japan Game Programming Hackathon 2026, built with modern web technologies and the "Cyber-Fusion" design theme.

## 🎮 Project Overview

This is the frontend application for the hackathon platform featuring:
- **Landing Page** with hero section, countdown timer, and event information
- **Multi-language Support** (Thai, English, Japanese)
- **Tournament Structure** timeline with two stages
- **Prizes & Mentors** showcase
- **Registration Portal** (foundation for phase 2)
- **Responsive Design** optimized for mobile, tablet, and desktop
- **Cyber-Fusion Theme** with neon colors and smooth animations

## 🛠️ Tech Stack

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS 3.4
- **Animations:** Framer Motion
- **Internationalization:** next-intl (TH, EN, JP)
- **Icons:** Lucide React
- **Language:** TypeScript
- **Intersection Observer:** For scroll-triggered animations

## 📋 Project Structure

```
.
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # Locale-specific layout with i18n
│   │   └── page.tsx            # Landing page
│   ├── globals.css             # Global styles with Cyber-Fusion theme
│   └── layout.tsx              # Root layout
├── components/
│   ├── Navigation.tsx          # Header navigation with language switcher
│   ├── LanguageSwitcher.tsx    # Language selection dropdown
│   ├── Footer.tsx              # Footer with contact info
│   ├── CountdownTimer.tsx      # Animated countdown to event
│   └── sections/
│       ├── Hero.tsx            # Hero section with CTA
│       ├── About.tsx           # About event section
│       ├── Stages.tsx          # Tournament structure timeline
│       └── Prizes.tsx          # Prizes and mentors section
├── messages/
│   ├── en.json                 # English translations
│   ├── th.json                 # Thai translations
│   └── ja.json                 # Japanese translations
├── middleware.ts               # i18n routing middleware
├── i18n.ts                     # i18n configuration
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS theme
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository:**
```bash
cd webProj
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```

3. **Create environment file:**
```bash
cp .env.example .env.local
```

4. **Run development server:**
```bash
npm run dev
# or
yarn dev
```

5. **Open in browser:**
Navigate to `http://localhost:3000`

## 🎨 Design Features

### Color Palette (Cyber-Fusion Theme)
- **Primary Dark:** `#0a0e27` (Cyber Dark)
- **Secondary Dark:** `#1a1f4d` (Cyber Indigo)
- **Neon Cyan:** `#00f0ff`
- **Neon Magenta:** `#ff00ff`
- **Neon Purple:** `#9d00ff`

### Animation Effects
- Glowing neon shadows
- Smooth page transitions
- Floating elements
- Countdown timer animations
- Hover effects with scale transforms
- Scroll-triggered section animations

## 🌐 Multi-Language Support

The site supports three languages through the `next-intl` library:

- **English** (en) - Default
- **Thai** (th) - ไทย
- **Japanese** (ja) - 日本語

Language can be switched via the dropdown menu in the navigation bar.

## 📱 Responsive Design

- **Mobile:** Optimized for small screens with hamburger menu
- **Tablet:** Adjusted spacing and grid layouts
- **Desktop:** Full experience with all features
- **Large Screens:** Optimized for ultra-wide displays

## 🔧 Available Scripts

### Development
```bash
npm run dev
```
Runs the development server with hot reload.

### Build
```bash
npm run build
```
Creates an optimized production build.

### Production
```bash
npm start
```
Runs the production server (requires build first).

### Linting
```bash
npm run lint
```
Runs ESLint to check code quality.

## 📚 Key Components

### Navigation
- Fixed header with logo and menu
- Mobile-responsive hamburger menu
- Language switcher with dropdown
- Quick register CTA button

### Hero Section
- Animated gradient background elements
- Main headline with neon text effect
- Event countdown timer (days, hours, minutes, seconds)
- Dual CTA buttons
- Key statistics cards

### About Section
- Mission statement
- Event overview
- 4-feature grid with icons
- Hover effects and animations

### Stages Section
- Timeline visualization of 2 competition stages
- Stage 1: Thailand Domestic Qualifier
- Stage 2: Grand Final (Thailand vs Japan)
- Animated timeline dots

### Prizes Section
- 3-tier prize structure
- Industry mentors showcase
- Additional benefits grid
- Animated award icons

### Footer
- Contact information
- Quick links
- Social media links
- Sponsor section
- Copyright information

## 🎯 Sections & Routes

- `/` - Landing page (redirects to `/en`)
- `/en` - English landing page
- `/th` - Thai landing page
- `/ja` - Japanese landing page

### Sections (via hash navigation)
- `#hero` - Hero section
- `#about` - About section
- `#stages` - Tournament structure
- `#prizes` - Prizes and mentors
- `#contact` - Contact/Footer
- `#register` - Registration (placeholder)

## 🔐 Security Considerations

- No sensitive data stored in frontend
- CORS configured for backend API integration
- Environment variables for sensitive configuration
- XSS protection through React's built-in security

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
Create a Dockerfile for containerized deployment.

### Manual Hosting
Build and deploy to any Node.js-compatible hosting:
```bash
npm run build
npm start
```

## 🛣️ Roadmap

### Phase 2 (Planned)
- User authentication (Login/Register)
- Team dashboard
- Profile management
- Team creation and management
- Document upload system

### Phase 3 (Planned)
- Admin panel
- Submission review system
- Scoring/judging interface
- Leaderboard
- Notification system

## 🤝 Contributing

To contribute to this project:
1. Create a feature branch (`git checkout -b feature/your-feature`)
2. Commit changes (`git commit -m 'Add your feature'`)
3. Push to the branch (`git push origin feature/your-feature`)
4. Open a Pull Request

## 📞 Support

For issues or questions, please reach out to:
- Email: contact@hackathon2026.com
- GitHub Issues: [Project Issues]

## 📄 License

This project is part of the Thailand-Japan Game Programming Hackathon 2026.

## 🙏 Acknowledgments

- Design inspired by modern cyberpunk and gaming aesthetics
- Built with Next.js, Tailwind CSS, and Framer Motion
- Icons provided by Lucide React
- Internationalization by next-intl

---

**Event Date:** Throughout 2026  
**Stage 1 (Qualifier):** Q1-Q2 2026  
**Stage 2 (Grand Final):** Q3-Q4 2026
