/**
 * Lab prompts occasionally carry an `<img>` tag — a gate matrix or circuit
 * diagram the task refers to. The prompt renderers show text, not HTML, so
 * without this the learner saw the literal tag markup in the middle of the
 * task.
 *
 * This splits a prompt into displayable text and the image paths to render
 * beside it. Only site-local `/images/` paths are kept: prompt data is
 * generated from third-party notebooks, and an external URL rendered into the
 * page would hotlink whatever host the notebook named. (The two images this
 * was written for are vendored under `public/images/labs/`.)
 */

const IMG_TAG_RE = /<img\b[^>]*>/gi;
const SRC_RE = /src\s*=\s*["']([^"']+)["']/i;

export interface PromptParts {
  text: string;
  images: string[];
}

export function extractPromptImages(prompt: string): PromptParts {
  const images: string[] = [];
  const text = prompt
    .replace(IMG_TAG_RE, (tag) => {
      const src = SRC_RE.exec(tag)?.[1];
      if (src && src.startsWith('/images/')) images.push(src);
      return ' ';
    })
    .replace(/[ \t]{2,}/g, ' ');
  return { text, images };
}
