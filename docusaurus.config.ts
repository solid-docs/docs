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
          routeBasePath: '/',
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
        src: 'img/logo.png',
        width: 32,
        height: 32,
      },
      items: [
        {
          to: '/getting-started/what-is-solidos',
          label: 'Getting Started',
          position: 'left',
        },
        {
          to: '/architecture/overview',
          label: 'Architecture',
          position: 'left',
        },
        {
          to: '/panes/overview',
          label: 'Panes',
          position: 'left',
        },
        {
          to: '/libraries/overview',
          label: 'Libraries',
          position: 'left',
        },
        {
          to: '/cookbook/overview',
          label: 'Cookbook',
          position: 'left',
        },
        {
          to: '/reference/faq',
          label: 'Reference',
          position: 'left',
        },
        {
          type: 'dropdown',
          label: 'Ecosystem',
          position: 'left',
          items: [
            {
              label: 'SolidOS Monorepo',
              href: 'https://github.com/SolidOS/solidos',
            },
            {
              label: 'mashlib',
              href: 'https://github.com/SolidOS/mashlib',
            },
            {
              label: 'solid-panes',
              href: 'https://github.com/SolidOS/solid-panes',
            },
            {
              label: 'solid-ui',
              href: 'https://github.com/SolidOS/solid-ui',
            },
            {
              label: 'solid-logic',
              href: 'https://github.com/SolidOS/solid-logic',
            },
            {
              label: 'rdflib.js',
              href: 'https://github.com/linkeddata/rdflib.js',
            },
            {
              type: 'html',
              value: '<hr style="margin: 0.5rem 0;">',
            },
            {
              label: 'Solid Project',
              href: 'https://solidproject.org/',
            },
            {
              label: 'Community Solid Server',
              href: 'https://github.com/CommunitySolidServer/CommunitySolidServer',
            },
            {
              label: 'Data Kitchen (Desktop)',
              href: 'https://github.com/SolidOS/data-kitchen',
            },
          ],
        },
        {
          href: 'https://github.com/SolidOS',
          label: 'GitHub',
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
            {label: 'Getting Started', to: '/getting-started/what-is-solidos'},
            {label: 'Architecture', to: '/architecture/overview'},
            {label: 'Building Panes', to: '/panes/creating-panes'},
            {label: 'Cookbook', to: '/cookbook/overview'},
          ],
        },
        {
          title: 'Libraries',
          items: [
            {label: 'rdflib.js', to: '/libraries/rdflib'},
            {label: 'solid-logic', to: '/libraries/solid-logic'},
            {label: 'solid-ui', to: '/libraries/solid-ui'},
            {label: 'mashlib', to: '/libraries/mashlib'},
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
            {label: 'Contribute', href: 'https://github.com/solid-docs/docs'},
            {label: 'FAQ', to: '/reference/faq'},
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
