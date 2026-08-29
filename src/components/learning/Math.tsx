import 'server-only';
import katex from 'katex';

/**
 * Rendered maths for the Student and Professional tiers.
 *
 * A *server* component on purpose. KaTeX is 4.3MB installed, and none of it
 * needs to reach the browser: renderToString produces plain HTML that the CSS
 * styles, so the client downloads ~23KB of stylesheet and the fonts rather
 * than a formula engine. Equations in a lesson never change after render,
 * so there is nothing for client-side KaTeX to do.
 *
 * `throwOnError: false` renders a malformed expression in red instead of
 * crashing the lesson around it — a typo in one formula should not blank the
 * page a child is reading.
 */
export function Math({
  children,
  display = false,
  className = '',
}: {
  /** LaTeX source, e.g. `\ket{\psi} = \alpha\ket{0} + \beta\ket{1}` */
  children: string;
  /** Centred block rather than inline. */
  display?: boolean;
  className?: string;
}) {
  const html = katex.renderToString(children, {
    displayMode: display,
    throwOnError: false,
    // Dirac notation shorthand, so lessons write \ket{0} rather than
    // |0\rangle every time and cannot drift between authors.
    macros: {
      '\\ket': '\\left|#1\\right\\rangle',
      '\\bra': '\\left\\langle#1\\right|',
      '\\braket': '\\left\\langle#1\\middle|#2\\right\\rangle',
    },
    strict: false,
  });

  const Tag = display ? 'div' : 'span';
  return (
    <Tag
      className={`${display ? 'my-4 overflow-x-auto' : ''} ${className}`}
      // KaTeX output is generated from our own lesson source, not user input.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
