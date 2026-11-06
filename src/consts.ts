/**
 * Site-wide constants.
 *
 * SITE_URL is the canonical origin used for canonical URLs, Open Graph,
 * the sitemap and the RSS feed. When the custom domain is attached,
 * change it to 'https://devwiseai.com' (no trailing slash) and redeploy.
 */
export const SITE_URL = 'https://devwiseai.vercel.app';

export const SITE_NAME = 'DevWiseAI';
export const SITE_TAGLINE = 'Smarter software development with AI';
export const SITE_DESCRIPTION =
  'Practical guides on AI tools for developers, programming tutorials and honest software reviews. Learn to use AI to write better code, not more code.';

export const AUTHOR = {
  name: 'Amgd Al-Subaihi',
  url: '/about/',
};

export const PUBLISHER = {
  name: 'MIGOTEK',
};

export const CONTACT_EMAIL = 'mi9otek@gmail.com';

export const CATEGORIES = [
  {
    slug: 'ai-tools',
    name: 'AI Tools',
    description: 'How to choose, set up and get real value from AI tools in a developer workflow.',
  },
  {
    slug: 'tutorials',
    name: 'Tutorials',
    description: 'Step-by-step programming guides you can follow along with and apply the same day.',
  },
  {
    slug: 'reviews',
    name: 'Reviews',
    description: 'Hands-on, criteria-driven reviews of developer software and services.',
  },
  {
    slug: 'dev-productivity',
    name: 'Dev Productivity',
    description: 'Habits, workflows and tooling that help you ship better software with less friction.',
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/blog/', label: 'Blog' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
];
