import { CustomerSignInPage } from '@/components/auth/CustomerSignInPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | BooSend Experts',
};

export default function SignIn() {
  return <CustomerSignInPage />;
}
