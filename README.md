# SolidOS Developer Docs

Developer documentation for SolidOS 3.1: mashlib, solid-panes, solid-ui, solid-logic, pane-registry and rdflib.

**Live site:** https://solidos.org/docs/

## Development

This site is built with [Docusaurus 3](https://docusaurus.io/) and npm.

### Prerequisites

- Node.js 20 or later

### Install

```bash
npm install
```

### Local development

```bash
npm start
```

This starts a development server at http://localhost:3000/docs/ and reloads pages as you edit them.

### Build

```bash
npm run build
```

This writes the static site to `build/`. The build fails on a broken internal link (`onBrokenLinks: 'throw'`), so fix any link it reports before you open a pull request.

To check the built site locally:

```bash
npm run serve
```

## Deployment

Pushing to the `gh-pages` branch runs `.github/workflows/deploy.yml`, which runs `npm ci` and `npm run build` on Node 20 and publishes `build/` to GitHub Pages. The `gh-pages` branch holds the site source, not built files.

## Contributing

Pages are Markdown (MDX) files in `docs/`:

- `docs/getting-started/` - what SolidOS is, running it, a first pane
- `docs/architecture/` - how the libraries fit together
- `docs/panes/` - the pane contract and the built-in panes
- `docs/libraries/` - one page per library
- `docs/cookbook/` - task-sized recipes
- `docs/reference/` - glossary, FAQ, troubleshooting, deployment, contributing

A new page needs an entry in `sidebars.ts`. MDX is strict: escape `{` and `<` in prose and close every tag.

## License

Code is AGPL-3.0 and documentation is CC BY-SA 4.0. See [LICENSE.md](LICENSE.md).
