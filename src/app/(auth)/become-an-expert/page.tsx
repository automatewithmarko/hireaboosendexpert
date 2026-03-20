import { SignInPage } from '@/components/auth/SignInPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Become an Expert | BooSend Experts',
};

export default function SignIn() {
  return <SignInPage />;
}
