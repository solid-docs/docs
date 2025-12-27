import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'SolidOS Docs',
  tagline: 'Build data browsers and panes for the Solid ecosystem',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://solid-docs.github.io',
  baseUrl: '/docs/',

  organizationName: 'solid-docs',
  projectName: 'docs',

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
          editUrl: 'https://github.com/solid-docs/docs/tree/gh-pages/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/solidos-social-card.png',
    metadata: [
      {name: 'keywords', content: 'SolidOS, Solid, mashlib, panes, data browser, linked data, RDF, decentralized web'},
      {name: 'twitter:card', content: 'summary_large_image'},
    ],
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: 'contribute',
      content: 'Help build the SolidOS developer resource! <a href="https://github.com/solid-docs/docs">Contribute on GitHub</a>',
      backgroundColor: '#7C4DFF',
      textColor: '#fff',
      isCloseable: true,
    },
    navbar: {
      title: 'SolidOS Docs',
      logo: {
        alt: 'SolidOS Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/SolidOS',
          label: 'SolidOS GitHub',
          position: 'right',
        },
        {
          href: 'https://github.com/solid-docs/docs',
          label: 'Contribute',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            {label: 'Getting Started', to: '/docs/getting-started/what-is-solidos'},
            {label: 'Architecture', to: '/docs/architecture/overview'},
            {label: 'Panes', to: '/docs/panes/overview'},
          ],
        },
        {
          title: 'Libraries',
          items: [
            {label: 'Libraries Overview', to: '/docs/libraries/overview'},
            {label: 'SolidOS Monorepo', href: 'https://github.com/SolidOS/solidos'},
            {label: 'rdflib.js', href: 'https://github.com/linkeddata/rdflib.js'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'Solid Project', href: 'https://solidproject.org/'},
            {label: 'Solid Forum', href: 'https://forum.solidproject.org/'},
            {label: 'Matrix Chat', href: 'https://matrix.to/#/#solid_solidos:gitter.im'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'SolidOS GitHub', href: 'https://github.com/SolidOS'},
            {label: 'This Docs Repo', href: 'https://github.com/solid-docs/docs'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} SolidOS Docs Contributors. Licensed under MIT. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'turtle'],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
