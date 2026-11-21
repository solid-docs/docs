---
sidebar_position: 3
title: Deployment
description: Ways to serve the SolidOS 3.1 data browser - a static site, a CDN, a JSS pod, or nothing at all
---

# Deployment

The SolidOS data browser runs entirely in the browser. Deploying it means serving a page that loads mashlib, and making sure the files mashlib loads later are where it looks for them.

## Choose a way

| Way | What you host | SolidOS version | Read |
|---|---|---|---|
| Use the SolidOS Browser | nothing | 3.1 | [the no-build data browser](/docs/guides/mashlib-com) |
| Static site, files at the root | `mashlib/dist/` | the one you copy | [below](#static-site) |
| Your page, mashlib from a CDN | one HTML page and two small files | the one you pin | [below](#a-page-with-mashlib-from-a-cdn) |
| JavaScript Solid Server pod | the server | 3.1 with `--mashlib-module` | [Running SolidOS on JSS](/docs/guides/running-on-jss) |
| Node Solid Server pod | the server | 2.x (solid-server 6.0.0 depends on mashlib `^2.0.0`) | [Node Solid Server](https://github.com/nodeSolidServer/node-solid-server) |
| Desktop | nothing | | [Data Kitchen](https://github.com/SolidOS/data-kitchen) |

## Static site

Copy all of `dist/` to the root of a site.

```bash
npm install mashlib@3.1.0
cp -r node_modules/mashlib/dist/* /path/to/site/
```

Then `https://your.site/browse.html?uri=<address>` shows any resource, and `databrowser.html` is there for a server to send.

All of `dist/` matters, not only `mashlib.min.js` and `mash.css`. The bundle loads `841.js` (the JSON-LD parser), `410.js` (the source editor) and a worker file with a hashed name (`5fb2ef310e691f59285b.js` for 3.1.0) from the root of the site. When you upgrade, replace the whole folder: the worker's file name is a hash of its content, so it can change between releases.

`browse.html` loads the unminified `mashlib.js`. For a smaller page, change it to `mashlib.min.js`.

## A page with mashlib from a CDN

If your page lives in a sub-folder, or on a site whose root you do not control, load mashlib from a CDN, pinned:

```html
<script src="mashlib-files.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mashlib@3.1.0/dist/mash.css">
<script src="https://cdn.jsdelivr.net/npm/mashlib@3.1.0/dist/mashlib.min.js"></script>
```

The first line is a short script that sends mashlib's requests for its extra files to jsDelivr, and the worker to a copy beside your page (a worker must come from the page's own origin). Take [mashlib-files.js](pathname:///docs/browser/mashlib-files.js) and [5fb2ef310e691f59285b.js](pathname:///docs/browser/5fb2ef310e691f59285b.js) from this site's demo, or the worker from `node_modules/mashlib/dist/`. [Embedding mashlib](/docs/guides/embedding-mashlib) has the rest of the page.

The demos on this site are deployed this way: [Data island](https://solidos.org/docs/data-island/), [Custom pane](https://solidos.org/docs/pane-demo/).

## On a pod server

A Solid server can send the data browser page when a browser opens an RDF resource, so every resource on the pod opens in SolidOS.

- **JavaScript Solid Server**: `jss start --mashlib-module <url>` serves an ES module data browser; `--panes` adds panes. For SolidOS 3.1 use `https://mashlib.com/dynamic/dist/boot.js`. See [Running SolidOS on JSS](/docs/guides/running-on-jss).
- **Node Solid Server** serves mashlib's `databrowser.html`. Its current release ships mashlib 2.x.

## Pin the version

An unpinned URL such as `https://cdn.jsdelivr.net/npm/mashlib/dist/mashlib.min.js` follows the latest release, so a new major version can change your page without warning. Name the version:

```html
<script src="https://cdn.jsdelivr.net/npm/mashlib@3.1.0/dist/mashlib.min.js"></script>
```

From npm, install an exact version: `npm install mashlib@3.1.0`.

## HTTPS

Serve the page over HTTPS. The login client uses the browser's Web Crypto API, which browsers provide only on secure pages: `https://` and `http://localhost` (or `127.0.0.1`). Plain `http://` on any other host cannot log in.

## Upgrading

1. Read the release notes on [SolidOS/mashlib releases](https://github.com/SolidOS/mashlib/releases), and [Migrating to 3.1](/docs/guides/migrating-to-3.1) when coming from 2.x.
2. Change the pinned version, or replace the whole `dist/` folder.
3. Open the page and check `mashlib.versionInfo.npmInfo.mashlib` in the console.

## See also

- [mashlib](/docs/libraries/mashlib)
- [Embedding mashlib](/docs/guides/embedding-mashlib)
- [The no-build data browser](/docs/guides/mashlib-com)
