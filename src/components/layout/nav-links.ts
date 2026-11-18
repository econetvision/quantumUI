/**
 * Single source of truth for primary navigation.
 *
 * Header and mobile drawer both render from this list, so they can never drift
 * apart — the previous markup duplicated the nav on every page and quietly
 * hid Labs and Exam below the `sm` breakpoint with no way to reach them.
 */
export interface NavLink {
  href: string;
  label: string;
  description: string;
}

export const NAV_LINKS: NavLink[] = [
  // First, deliberately. Track 0 assumes no background and needs no account,
  // so it is the only entry point that works for someone who arrived knowing
  // nothing — which is most first-time visitors. It shipped reachable only by
  // typing the URL, which made it invisible to exactly the readers it is for.
  {
    href: '/learn/track-0',
    label: 'Start Here',
    description: 'Quantum for everyone — no maths needed',
  },
  {
    href: '/tracks',
    label: 'Tracks',
    description: '12 guided learning paths',
  },
  {
    href: '/labs',
    label: 'Labs',
    description: 'Hands-on coding exercises',
  },
  {
    href: '/algorithms',
    label: 'Algorithms',
    description: 'Run SDK algorithms live',
  },
  {
    href: '/visuals',
    label: 'Visuals',
    description: 'Computed physics animations',
  },
  {
    href: '/playground',
    label: 'Playground',
    description: 'Free-form circuit editor',
  },
  {
    href: '/exam',
    label: 'Exam Prep',
    description: 'Timed certification practice',
  },
  {
    href: '/community',
    label: 'Community',
    description: 'Ask questions, help other learners',
  },
];

export const SECONDARY_LINKS: NavLink[] = [
  // The second no-account door, after Track 0. It is not in NAV_LINKS because
  // a ninth primary item overflows the header below 1280px (Sign in goes off
  // screen); it is reached from the home hero, the Start Here index and the
  // Tracks page instead, and from here in the drawer.
  {
    href: '/learn/foundations',
    label: 'Foundations',
    description: 'The physics syllabus — 106 topics, three readings each',
  },
  { href: '/curriculum', label: 'Curriculum', description: 'Full syllabus map' },
  { href: '/projects', label: 'Projects', description: 'Build something real' },
];
