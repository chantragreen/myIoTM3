import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Thailand-Japan Game Programming Hackathon 2026',
  description: 'Unite Thai and Japanese developers. Create. Compete. Connect.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%2300f0ff"/><path d="M30 50 L50 30 L70 50 L50 70 Z" fill="%230a0e27"/></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
