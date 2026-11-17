---
sidebar_position: 4
title: Contributing
description: How to work on the SolidOS libraries and these docs
---

# Contributing to SolidOS

SolidOS is developed in separate repositories under [github.com/SolidOS](https://github.com/SolidOS): mashlib, solid-panes, solid-ui, solid-logic, pane-registry and one repository per pane (folder-pane, contacts-pane, profile-pane and others). rdflib.js lives at [linkeddata/rdflib.js](https://github.com/linkeddata/rdflib.js). Changes are made as pull requests to those repositories.

The SolidOS project's own guide is [CONTRIBUTING.md](https://github.com/SolidOS/solidos/blob/main/CONTRIBUTING.md) in the SolidOS/solidos repository. This page summarises the parts a developer needs first.

## Ways to contribute

- Report bugs in the repository they belong to, or in [SolidOS/solidos](https://github.com/SolidOS/solidos/issues) if you do not know which one
- Fix bugs or add features in a library or pane
- Write a pane. A pane does not have to live in SolidOS: it can be one ES module that anyone loads by URL (see [Creating panes](../panes/creating-panes.md))
- Improve these docs or the [user guide](https://solidos.org/userguide/)
- Review pull requests

Issues suitable for newcomers are in the [Newcomer view of the project board](https://github.com/orgs/SolidOS/projects/1/views/3).

## Working on one library

For a change in one library, clone that repository and use its own scripts. All of them use Node 22.22.0 (their `.nvmrc`):

```bash
git clone https://github.com/SolidOS/solid-panes.git
cd solid-panes
nvm install          # reads .nvmrc
npm install
npm run build
npm test
```

Most repositories have `build`, `watch`, `lint`, `lint-fix`, `typecheck` and `test` scripts; check each `package.json`. solid-ui also has `npm run storybook` for working on components in isolation.

## The SolidOS workspace

To work on several libraries together and see the result in a running data browser, use the [SolidOS/solidos](https://github.com/SolidOS/solidos) repository. It clones the libraries into `workspaces/` and links them with Lerna.

### Setup

You need [nvm](https://github.com/nvm-sh/nvm), npm and bash; the npm scripts are bash scripts.

```bash
git clone https://github.com/SolidOS/solidos.git
cd solidos
npm run setup
```

`npm run setup` installs the root dependencies, then clones pivot, mashlib, profile-pane, contacts-pane, solid-panes, solid-ui, pane-registry and solid-logic into `workspaces/`, checks out their `staging` branch where there is one, and installs and builds each one.

### Layout

```
solidos/
├── workspaces/          # one clone per repository, created by npm run setup
│   ├── mashlib/
│   ├── solid-panes/
│   ├── solid-ui/
│   ├── solid-logic/
│   ├── pane-registry/
│   ├── profile-pane/
│   ├── contacts-pane/
│   └── pivot/           # Community Solid Server setup used for testing
├── scripts/             # the bash scripts behind the npm scripts
├── documentation/       # guidelines
├── lerna.json           # packages: workspaces/*
└── package.json
```

### Root scripts

| Script | What it does |
|--------|--------------|
| `npm run setup` | Clones, installs and builds the workspaces (see above) |
| `npm run start-pivot` | Links the local packages and starts pivot (Community Solid Server) at http://localhost:3100 |
| `npm run watch-pivot` | Starts watchers for solid-logic, solid-ui, contacts-pane, profile-pane, solid-panes and mashlib, then pivot |
| `npm start` | Starts Node Solid Server on https port 8443 and css-mashlib. css-mashlib must be added first (`npm run add css`) |
| `npm run start-css`, `npm run start-nss` | Other server setups |
| `npm run add <name>` | Clones another repository into `workspaces/`, for example `npm run add folder` |
| `npm run addPanes` | Adds the activitystreams, chat, contacts, folder, issue, meeting, profile and source panes |
| `npm run reset` | Deletes and recreates `workspaces/` |
| `npm run release` | The release script used by maintainers |

There are no root `build`, `test` or `lint` scripts; run those inside each workspace.

### Running SolidOS locally

```bash
npm run start-pivot
```

Open http://localhost:3100/.account/ and register a user. Your pod is then at http://localhost:3100/ followed by the pod name you chose. When you log in again, enter `http://localhost:3100/` as the identity provider so that you stay on the local server.

### Seeing your change

The libraries depend on each other: a pane is used by solid-panes, which is bundled by mashlib, which the server serves. A change has to be rebuilt at each step to reach the page. Either:

- run `npm run watch-pivot`, which rebuilds each package as you edit it, or
- run `npm run build` in the package you changed and in each package above it, then `npx lerna bootstrap --force-local` at the root.

Run `npx lerna bootstrap --force-local` again whenever you run `npm install` inside a workspace.

## Pull requests

1. Fork the repository you want to change and create a branch.
2. Make the change, with tests where the repository has them (usually in `test/`).
3. Run that repository's `lint` and `test` scripts.
4. Open a pull request against the repository's default branch and describe what changed and how you tested it. Add screenshots for UI changes.

Before you start, read the project's [coding guidelines](https://github.com/SolidOS/solidos/blob/main/documentation/guidelines/coding_guidelines.md), [testing guidelines](https://github.com/SolidOS/solidos/blob/main/documentation/guidelines/testing_guidelines.md), [dependency and release guidelines](https://github.com/SolidOS/solidos/blob/main/documentation/guidelines/dependencies_and_release_guidelines.md) and [AI guidelines](https://github.com/SolidOS/solidos/blob/main/documentation/guidelines/AI_guidelines.md).

## These docs

The developer docs and the user guide are Docusaurus sites built with npm:

| Site | Repository | Source branch |
|------|------------|---------------|
| https://solidos.org/docs/ | [solid-docs/docs](https://github.com/solid-docs/docs) | `gh-pages` |
| https://solidos.org/userguide/ | [solid-docs/userguide](https://github.com/solid-docs/userguide) | `main` |

```bash
git clone https://github.com/solid-docs/docs.git
cd docs
npm install
npm start          # http://localhost:3000/docs/
npm run build      # fails on any broken internal link
```

Pages are Markdown (MDX) in `docs/`; a new page also needs an entry in `sidebars.ts`. Code examples should run against the current SolidOS release; try them in the browser console at [mashlib.com](https://mashlib.com/).

## Code of conduct

Follow the [Solid Code of Conduct](https://github.com/solid/process/blob/main/code-of-conduct.md).

## Getting help

- [Matrix chat](https://matrix.to/#/#solid_solidos:gitter.im)
- [Solid Forum](https://forum.solidproject.org/)
- [GitHub Discussions](https://github.com/SolidOS/solidos/discussions)

## License

The SolidOS libraries are MIT licensed; contributions to them are under the same licence. These docs are licensed CC BY-SA 4.0 for text and AGPL-3.0 for code (see the repository's LICENSE.md).

## See also

- [Architecture overview](../architecture/overview.md)
- [FAQ](./faq.md)
- [Troubleshooting](./troubleshooting.md)
