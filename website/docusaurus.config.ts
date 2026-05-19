import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'RulesGenie',
  tagline: 'Stop flipping through rulebooks. Get the ruling in seconds.',
  favicon: 'img/favicon.svg',

  url: 'https://tabletopfoundry.github.io',
  baseUrl: '/rules-genie/',

  organizationName: 'TabletopFoundry',
  projectName: 'rules-genie',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/TabletopFoundry/rules-genie/tree/main/website/',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/og-image.svg',
    metadata: [
      { name: 'keywords', content: 'board games, rules assistant, AI, tabletop, openai, rulebook, RulesGenie' },
      { name: 'description', content: 'AI-powered board game rules assistant with citation-backed answers, quick-start guides, and a personal dashboard.' },
      { property: 'og:title', content: 'RulesGenie — AI Rules Assistant for Board Games' },
      { property: 'og:description', content: 'Stop flipping through rulebooks. Get the ruling in seconds.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: false,
      disableSwitch: false,
    },
    navbar: {
      title: 'RulesGenie',
      logo: {
        alt: 'RulesGenie logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        { to: '/docs/getting-started/quick-start', label: 'Quick Start', position: 'left' },
        { to: '/docs/reference/api', label: 'API', position: 'left' },
        { to: '/docs/why', label: 'Why RulesGenie', position: 'left' },
        {
          href: 'https://github.com/TabletopFoundry/rules-genie',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Quick Start', to: '/docs/getting-started/quick-start' },
            { label: 'Core Concepts', to: '/docs/concepts/overview' },
            { label: 'API Reference', to: '/docs/reference/api' },
            { label: 'Troubleshooting', to: '/docs/troubleshooting' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'GitHub Discussions', href: 'https://github.com/TabletopFoundry/rules-genie/discussions' },
            { label: 'Issues', href: 'https://github.com/TabletopFoundry/rules-genie/issues' },
            { label: 'Contributing', to: '/docs/contributing' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'Changelog', to: '/docs/changelog' },
            { label: 'GitHub', href: 'https://github.com/TabletopFoundry/rules-genie' },
            { label: 'License (MIT)', href: 'https://github.com/TabletopFoundry/rules-genie/blob/main/LICENSE' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} RulesGenie. Built for fast mid-game rulings 🎲`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'tsx', 'docker'],
    },
    announcementBar: {
      id: 'demo-mode',
      content:
        'RulesGenie works in <strong>demo mode</strong> with zero API keys. Clone, <code>npm install</code>, <code>npm run dev</code>, done.',
      backgroundColor: '#7c3aed',
      textColor: '#ffffff',
      isCloseable: true,
    },
  } satisfies Preset.ThemeConfig,

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],
};

export default config;
