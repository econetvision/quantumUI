import { permanentRedirect } from 'next/navigation';

/**
 * `/demo` used to render a mock lab: static Qiskit source, a "Run Circuit"
 * button that only linked to the signup page, and a Bloch sphere placeholder
 * captioned "available in full version". None of that is true any more — the
 * platform is free and `/playground` executes real circuits against the SDK.
 *
 * The route is kept as a redirect so existing links and bookmarks still work.
 */
export default function DemoPage() {
  permanentRedirect('/playground');
}
