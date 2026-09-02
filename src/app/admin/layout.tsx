import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Control Center | Meetrix',
  description: 'Admin-only workspace controls, user roles, and security log audit.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
