import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/auth/session';
import { submitExpertApplicationAction } from '@/lib/marketplace/actions';
import { getExpertDashboardData } from '@/lib/marketplace/repository';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert Onboarding | BooSend Experts',
};

interface PageProps {
  searchParams: Promise<{ submitted?: string; error?: string }>;
}

export default async function ExpertOnboardingPage({ searchParams }: PageProps) {
  const [{ user, marketplace }, params] = await Promise.all([
    getCurrentUserContext(),
    searchParams,
  ]);

  if (!user || !marketplace) {
    redirect('/become-an-expert');
  }

  if (marketplace.expertProfile?.application_status === 'approved') {
    redirect('/expert/dashboard');
  }

  const dashboard = await getExpertDashboardData(
    marketplace.account.id,
    marketplace.roles,
  );
  const seller = dashboard.seller;
  const currentStatus =
    marketplace.expertProfile?.application_status ??
    dashboard.latestApplication?.status ??
    'draft';

  return (
    <div className="orders-page" style={{ maxWidth: 980, margin: '0 auto' }}>
      <div className="orders-header">
        <h1 className="orders-title">Expert Onboarding</h1>
        <p className="orders-subtitle">
          Build your public seller profile, submit it for approval, and then
          start publishing gigs.
        </p>
      </div>

      {(params.submitted || currentStatus === 'submitted' || currentStatus === 'under_review') && (
        <div className="order-detail-toast" style={{ position: 'static', marginBottom: '1.5rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          Your application is in review. You can still update and resubmit this profile.
        </div>
      )}

      {params.error && (
        <div className="signin-error" style={{ marginBottom: '1.5rem' }}>
          Please complete the required profile fields and try again.
        </div>
      )}

      <div className="order-detail-service-card">
        <form action={submitExpertApplicationAction} className="signin-form">
          <div className="auth-field">
            <label htmlFor="username" className="auth-label">Username</label>
            <input
              id="username"
              name="username"
              className="auth-input"
              defaultValue={seller?.username.replace(/^@/, '') ?? ''}
              placeholder="alexautomation"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="headline" className="auth-label">Headline</label>
            <input
              id="headline"
              name="headline"
              className="auth-input"
              defaultValue={seller?.headline ?? ''}
              placeholder="WhatsApp automation strategist"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="bio" className="auth-label">Bio</label>
            <textarea
              id="bio"
              name="bio"
              className="auth-input"
              defaultValue={seller?.bio ?? ''}
              rows={5}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="location" className="auth-label">Location</label>
            <input
              id="location"
              name="location"
              className="auth-input"
              defaultValue={seller?.location ?? ''}
              placeholder="Karachi, PK"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="skills" className="auth-label">Skills</label>
            <input
              id="skills"
              name="skills"
              className="auth-input"
              defaultValue={seller?.skills.join(', ') ?? ''}
              placeholder="WhatsApp API, BooSend, CRM Integration"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="serviceTitle" className="auth-label">Primary Service Title</label>
            <input
              id="serviceTitle"
              name="serviceTitle"
              className="auth-input"
              defaultValue={seller?.serviceTitle ?? ''}
              placeholder="I will build your WhatsApp sales automation"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="serviceDescription" className="auth-label">Primary Service Description</label>
            <textarea
              id="serviceDescription"
              name="serviceDescription"
              className="auth-input"
              defaultValue={seller?.serviceDescription ?? ''}
              rows={4}
              required
            />
          </div>

          <button type="submit" className="auth-submit">
            Submit For Review
          </button>
        </form>
      </div>
    </div>
  );
}
