import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    'start-here',
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
      collapsed: true,
      items: [
        'architecture/overview',
      ],
    },
    {
      type: 'category',
      label: 'Panes',
      collapsed: true,
      items: [
        'panes/overview',
        'panes/creating-panes',
        {
          type: 'category',
          label: 'Built-in Panes',
          collapsed: true,
          items: [
            'panes/folder-pane',
            'panes/contacts-pane',
            'panes/chat-pane',
            'panes/profile-pane',
            'panes/meeting-pane',
            'panes/issue-pane',
            'panes/source-pane',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Libraries',
      collapsed: true,
      items: [
        'libraries/overview',
        'libraries/rdflib',
        'libraries/solid-logic',
        'libraries/solid-ui',
        'libraries/solid-panes',
        'libraries/mashlib',
      ],
    },
    {
      type: 'category',
      label: 'Cookbook',
      collapsed: true,
      items: [
        'cookbook/overview',
        'cookbook/authentication',
        'cookbook/reading-data',
        'cookbook/writing-data',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: true,
      items: [
        'reference/glossary',
        'reference/troubleshooting',
        'reference/faq',
        'reference/deployment',
        'reference/contributing',
      ],
    },
  ],
};

export default sidebars;
