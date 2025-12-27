import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/what-is-solidos',
        'getting-started/core-concepts',
        'getting-started/quick-start',
        'getting-started/your-first-pane',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      collapsed: false,
      items: [
        'architecture/overview',
      ],
    },
    {
      type: 'category',
      label: 'Panes',
      collapsed: false,
      items: [
        'panes/overview',
      ],
    },
    {
      type: 'category',
      label: 'Libraries',
      collapsed: false,
      items: [
        'libraries/overview',
      ],
    },
  ],
};

export default sidebars;
