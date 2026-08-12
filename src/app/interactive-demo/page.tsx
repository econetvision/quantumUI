import { permanentRedirect } from 'next/navigation';

/**
 * `/interactive-demo` was the Bloch sphere plus the code playground on one
 * page. Both now live in `/playground` (which additionally renders Bloch
 * vectors computed from the real statevector), so this route redirects rather
 * than maintaining a second copy that would drift.
 */
export default function InteractiveDemoPage() {
  permanentRedirect('/playground');
}
