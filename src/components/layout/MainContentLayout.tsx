'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export function MainContentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalonePage = pathname === '/' || pathname === '/welcome' || pathname === '/login';

  if (isStandalonePage) {
    return <div className="w-full min-h-screen">{children}</div>;
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#EEF2FF] text-[#1E1B4B] relative selection:bg-[#4F46E5]/20 selection:text-[#3730A3]">
        <Header />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">{children}</main>
      </div>
    </>
  );
}
