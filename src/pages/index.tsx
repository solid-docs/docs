import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';

import styles from './index.module.css';

const codeExample = `import { store, authn } from 'solid-logic';
import { icons, buttons } from 'solid-ui';

// Register your custom pane
const myPane = {
  icon: icons.iconBase + 'noun_Document.svg',
  name: 'myCustomPane',

  label: (subject) => {
    if (store.holds(subject, RDF('type'), SCHEMA('Article'))) {
      return 'View Article';
    }
    return null;
  },

  render: (subject, dom) => {
    const div = dom.createElement('div');
    // Your rendering logic here
    return div;
  }
};`;

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <Heading as="h1" className={styles.heroTitle}>
              Build Data Browsers for the Decentralized Web
            </Heading>
            <p className={styles.heroSubtitle}>
              SolidOS is an open-source framework for building linked data applications
              on the Solid platform. Create custom panes, leverage RDF, and give users
              control of their data.
            </p>
            <div className={styles.buttons}>
              <a
                className="button button--secondary button--lg"
                href="/docs/browser/">
                Try Live Demo
              </a>
              <Link
                className="button button--outline button--lg"
                style={{color: 'white', borderColor: 'white'}}
                to="/getting-started/what-is-solidos">
                Get Started
              </Link>
            </div>
          </div>
          <div className={styles.heroCode}>
            <CodeBlock language="typescript" title="Create a Custom Pane">
              {codeExample}
            </CodeBlock>
          </div>
        </div>
      </div>
    </header>
  );
}

const features = [
  {
    icon: '🧩',
    title: 'Modular Pane System',
    description: 'Build self-contained UI components that render specific RDF data types. Panes automatically activate based on the data they encounter.',
    link: '/panes/overview',
  },
  {
    icon: '🔗',
    title: 'Linked Data Native',
    description: 'Built on rdflib.js with first-class support for RDF, SPARQL, and the Solid protocol. Work with semantic data naturally.',
    link: '/libraries/rdflib',
  },
  {
    icon: '🔐',
    title: 'Authentication Built-in',
    description: 'Solid authentication and access control handled for you. Focus on your UI while solid-logic manages identity and permissions.',
    link: '/libraries/solid-logic',
  },
  {
    icon: '🎨',
    title: 'Rich UI Components',
    description: 'solid-ui provides battle-tested widgets for forms, tables, access control, and more. Build consistent interfaces faster.',
    link: '/libraries/solid-ui',
  },
  {
    icon: '📦',
    title: 'Zero Config Bundling',
    description: 'Use mashlib to bundle SolidOS into any web application. Drop in a single script and get a full data browser.',
    link: '/libraries/mashlib',
  },
  {
    icon: '🌐',
    title: 'Decentralized by Design',
    description: 'Users own their data in Solid Pods. Your app reads and writes to user-controlled storage, not your servers.',
    link: '/architecture/overview',
  },
];

function Feature({icon, title, description, link}: {icon: string; title: string; description: string; link: string}) {
  return (
    <div className={clsx('col col--4', styles.featureCol)}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
        <p className={styles.featureDescription}>{description}</p>
        <Link to={link} className={styles.featureLink}>Learn more →</Link>
      </div>
    </div>
  );
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Everything You Need</Heading>
          <p>A complete toolkit for building Solid applications</p>
        </div>
        <div className="row">
          {features.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

const libraries = [
  { name: 'rdflib.js', desc: 'RDF/JS library', href: 'https://github.com/linkeddata/rdflib.js' },
  { name: 'solid-logic', desc: 'Business logic', href: 'https://github.com/SolidOS/solid-logic' },
  { name: 'solid-ui', desc: 'UI components', href: 'https://github.com/SolidOS/solid-ui' },
  { name: 'solid-panes', desc: 'Pane registry', href: 'https://github.com/SolidOS/solid-panes' },
  { name: 'mashlib', desc: 'Bundled browser', href: 'https://github.com/SolidOS/mashlib' },
];

function Ecosystem() {
  return (
    <section className={styles.ecosystem}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">The SolidOS Ecosystem</Heading>
          <p>Built on proven open-source libraries</p>
        </div>
        <div className={styles.libraryGrid}>
          {libraries.map((lib) => (
            <a key={lib.name} href={lib.href} className={styles.libraryCard} target="_blank" rel="noopener noreferrer">
              <span className={styles.libraryName}>{lib.name}</span>
              <span className={styles.libraryDesc}>{lib.desc}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className={styles.cta}>
      <div className="container">
        <Heading as="h2">Ready to Build?</Heading>
        <p>Start creating your first pane in minutes</p>
        <div className={styles.ctaButtons}>
          <Link className="button button--primary button--lg" to="/getting-started/your-first-pane">
            Build Your First Pane
          </Link>
          <a className="button button--secondary button--lg" href="https://github.com/SolidOS" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="SolidOS Developer Documentation"
      description="Build data browsers and panes for the Solid ecosystem. Documentation for mashlib, solid-panes, solid-ui, and solid-logic.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <Ecosystem />
        <CallToAction />
      </main>
    </Layout>
  );
}
