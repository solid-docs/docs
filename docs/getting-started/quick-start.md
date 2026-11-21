---
sidebar_position: 3
title: Quick Start
description: Ways to run SolidOS 3.1, from a link to your own server
---

# Quick Start

Four ways to run SolidOS 3.1, shortest first.

## 1. In the browser: the SolidOS Browser

Open the SolidOS Browser at **[https://solidos.org/docs/browser/](https://solidos.org/docs/browser/)**, paste the address of a pod, folder, profile or document, and press **Go**. Add `?uri=<address>` to the link to open one straight away, for example [the public test profile](https://solidos.org/docs/browser/?uri=https%3A%2F%2Ftestingsolidos.solidcommunity.net%2Fprofile%2Fcard%23me).

This is SolidOS 3.1 (mashlib 3.1.0) as plain ES modules, with no build step. In the browser console you can check:

```javascript
mashlib.versionInfo.npmInfo.mashlib   // "3.1.0"
```

The SolidOS Browser also takes `?pane=<module URL>` to load an extra pane, which [Your First Pane](./your-first-pane.md) uses.

## 2. On your machine, with no build

The no-build tree runs from any static file server. You need `git` and Node.js.

```bash
git clone https://github.com/mashlib/dynamic.git
cd dynamic
npx http-server -p 8000 -c-1
```

Open http://localhost:8000/mashlib/browse.html?uri=https://testingsolidos.solidcommunity.net/profile/card%23me

You see the same profile as in the SolidOS Browser. Every file under `mashlib/`, `src/` and `panes/` is loaded as it is, so you can edit one and reload. The libraries it imports (rdflib, solid-logic, lit and others) come from a CDN through `src/importmap.js`, so the page needs internet access.

`mashlib/databrowser.html?uri=<address>` is the same without the address bar. See [No-build SolidOS](../guides/mashlib-com.md) for what is in the tree.

## 3. On a pod server

A Solid server can answer a browser that opens a resource with the data browser itself. The [JavaScript Solid Server](https://jss.live/) (JSS) does this with one flag. To serve the no-build data browser:

```bash
npm install -g javascript-solid-server
jss start --conneg --mashlib-module https://mashlib.com/dynamic/mashlib/boot.js
```

`--mashlib-cdn` serves the webpack bundle from unpkg instead (mashlib 3.1.0 from JSS 0.0.231; `--mashlib-version` picks another), and `--panes <module URL>` adds panes for every visitor. Ports, login, versions and the other options are in [Running SolidOS on JSS](../guides/running-on-jss.md).

## 4. In your own page

mashlib can be loaded into a page of your own and pointed at a resource. The page structure that 3.1 expects (`<solid-ui-provider>`, `#MainContent`, `#OutlineView`) and the start-up calls are in [Embedding mashlib](../guides/embedding-mashlib.md).

## Working on SolidOS itself

To change SolidOS's own packages, use the [SolidOS/solidos](https://github.com/SolidOS/solidos) monorepo. It keeps the packages under `workspaces/`, uses Node 22 (its `.nvmrc` says 22.22.0) and is set up with `npm run setup`. Its `npm start` script starts a local Node Solid Server on https port 8443 and the `css-mashlib` workspace, using the workspace builds. See [Contributing](../reference/contributing.md).

## Get a pod

To log in and edit, you need a pod. [Get a Pod](https://solidproject.org/users/get-a-pod) lists providers. The login dialog in SolidOS 3.1 suggests solidcommunity.net, solidweb.org, solidweb.me and login.inrupt.com as identity providers.

## Common problems

**A page on `https://` cannot load files from `http://localhost`.** Browsers block a public site from importing from your machine. Run the data browser locally too (option 2), or put the file on a public host.

**Files from another site do not load.** A module or data file loaded from another origin needs a cross-origin header (`Access-Control-Allow-Origin`). Solid pods and GitHub Pages send one. A plain static file server may not, so serve such files from the same server as the page.

**Nothing changes after editing a file.** The browser may be using a cached copy. Reload with the cache disabled (developer tools, Network, Disable cache).

## Next steps

- [Your First Pane](./your-first-pane.md): write a pane and load it into the running data browser
- [Architecture Overview](../architecture/overview.md): how the packages fit together
- [Migrating to 3.1](../guides/migrating-to-3.1.md): what changed from 2.x
