import { Navbar } from '@/components/layout/Navbar';

export default function MessagingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
