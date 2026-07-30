import { AppNavbar } from '@/components/layout/AppNavbar';

export default function MessagingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNavbar />
      {children}
    </>
  );
}
