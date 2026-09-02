import type { Metadata } from 'next';
import { Fraunces, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/i18n/I18nContext';
import { MainContentLayout } from '@/components/layout/MainContentLayout';
import { MeetingAssistantWidget } from '@/components/chat/MeetingAssistantWidget';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Meetrix | Spoken Meetings into Tracked Decisions & Owned Tasks',
  description: 'Authoritative cross-meeting decision audit trail, diarized speech ingestion, and owner accountability engine.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${fraunces.variable} ${jakarta.variable} ${mono.variable}`}>
      <body className="bg-[#0B0D17] text-[#F8FAFC] min-h-screen flex antialiased font-sans selection:bg-[#6366F1]/20 selection:text-[#818CF8]">
        <I18nProvider>
          <MainContentLayout>{children}</MainContentLayout>
          <MeetingAssistantWidget />
        </I18nProvider>
      </body>
    </html>
  );
}
