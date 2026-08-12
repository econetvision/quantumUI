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
];

export const SECONDARY_LINKS: NavLink[] = [
  { href: '/curriculum', label: 'Curriculum', description: 'Full syllabus map' },
  { href: '/projects', label: 'Projects', description: 'Build something real' },
];
