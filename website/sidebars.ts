import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Introduction',
      collapsed: false,
      items: ['intro', 'why'],
    },
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/quick-start',
        'getting-started/installation',
        'getting-started/first-question',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: [
        'concepts/overview',
        'concepts/architecture',
        'concepts/demo-vs-live',
        'concepts/sessions-and-citations',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/use-openai',
        'guides/add-a-game',
        'guides/deploy-with-docker',
        'guides/persist-data',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/api',
        'reference/configuration',
        'reference/cli-scripts',
        'reference/database-schema',
      ],
    },
    'troubleshooting',
    'contributing',
    'changelog',
  ],
};

export default sidebars;
