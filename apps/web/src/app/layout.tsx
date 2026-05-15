import './globals.css';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata = {
  title: 'TripTrack',
  description: 'Plan, track, and share trips with your travel group.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable)}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
