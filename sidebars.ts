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
      label: 'Guides',
      collapsed: true,
      items: [
        {type: 'doc', id: 'guides/migrating-to-3.1', label: 'Migrating to 3.1'},
        {type: 'doc', id: 'guides/embedding-mashlib', label: 'Embedding mashlib'},
        {type: 'doc', id: 'guides/mashlib-com', label: 'mashlib.com and no-build'},
        {type: 'doc', id: 'guides/running-on-jss', label: 'Running on JSS'},
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      collapsed: true,
      items: [
        'architecture/overview',
        'architecture/data-flow',
      ],
    },
    {
      type: 'category',
      label: 'Panes',
      collapsed: true,
      items: [
        'panes/overview',
        'panes/pane-anatomy',
        'panes/creating-panes',
        'panes/dynamic-panes',
        'panes/navigation',
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
            'panes/human-readable-pane',
            'panes/media-panes',
            'panes/internal-pane',
            'panes/dashboard-and-preferences',
            'panes/other-panes',
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
        'libraries/pane-registry',
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
        'cookbook/access-control',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: true,
      items: [
        'reference/glossary',
        'reference/troubleshooting',
        'reference/theming',
        'reference/rdf-primer',
        'reference/faq',
        'reference/deployment',
        'reference/contributing',
      ],
    },
  ],
};

export default sidebars;
