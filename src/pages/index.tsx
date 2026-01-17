import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/getting-started/what-is-solidos">
            Get Started
          </Link>
          <a
            className="button button--primary button--lg"
            href="/docs/browser/">
            Try Live Demo →
          </a>
        </div>
      </div>
    </header>
  );
}

function Feature({title, description, link}: {title: string; description: string; link: string}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="padding-horiz--md padding-vert--lg">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
        <Link to={link}>Learn more →</Link>
      </div>
    </div>
  );
}

function HomepageFeatures() {
  return (
    <section className="padding-vert--xl">
      <div className="container">
        <div className="row">
          <Feature
            title="Pane System"
            description="Build modular UI components that render specific RDF data types. Each pane is a self-contained module."
            link="/panes/overview"
          />
          <Feature
            title="RDF Foundation"
            description="Built on rdflib.js, SolidOS provides powerful tools for working with linked data and the Solid ecosystem."
            link="/libraries/overview"
          />
          <Feature
            title="Extensible"
            description="Add custom panes for your data types, integrate with the authentication system, and build on solid-ui widgets."
            link="/getting-started/your-first-pane"
          />
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="SolidOS Developer Documentation"
      description="Build data browsers and panes for the Solid ecosystem. Documentation for mashlib, solid-panes, solid-ui, and solid-logic.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
