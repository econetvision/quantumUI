import type { Metadata } from 'next';
import { Container, PageHeader } from '@/components/ui/primitives';
import { getSiteSettings } from '@/lib/site-settings';
import { SiteSettingsForm } from './SiteSettingsForm';

export const metadata: Metadata = { title: 'Site settings · QuantumUI' };

// Flags are read per request: an admin who just changed one should see the
// change, not a build-time snapshot from whenever the page was compiled.
export const dynamic = 'force-dynamic';

/**
 * Site-wide switches. The route itself is already behind the admin check in
 * src/proxy.ts; the PATCH endpoint re-checks the role, because the proxy is a
 * redirect layer for humans and not the security boundary.
 */
export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <Container size="narrow" className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Admin"
        title="Site settings"
        description="Feature flags and the maintenance banner. Changes apply within a minute for everyone."
      />
      <div className="mt-8">
        <SiteSettingsForm initial={settings} />
      </div>
    </Container>
  );
}
