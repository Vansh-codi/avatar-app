// app/layout.tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Space_Mono } from 'next/font/google';
import './globals.css'
import { Providers } from '@/components/ui/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'], 
  variable: '--font-mono' 
});

export const metadata: Metadata = {
  title: 'AvatarAI — Real-Time 3D Avatar Generator',
  description: 'Generate and animate your personalized 3D avatar using real-time face and body tracking powered by MediaPipe and Three.js.',
  keywords: ['avatar', '3D', 'AI', 'face tracking', 'body tracking', 'MediaPipe', 'Three.js'],
  openGraph: {
    title: 'AvatarAI — Real-Time 3D Avatar Generator',
    description: 'Animate your 3D avatar with your face and body in real time.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children:ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} ${spaceMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
