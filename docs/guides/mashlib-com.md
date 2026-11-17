---
sidebar_position: 3
title: mashlib.com and the no-build data browser
description: What mashlib.com and mashlib.com/dynamic serve, linking to a resource, and adding a pane by link with ?pane=
---

# mashlib.com and the no-build data browser

[mashlib.com](https://mashlib.com/) is a public SolidOS 3.1 data browser: paste the address of a pod, a folder, a profile or any document on a pod, and look at it. [mashlib.com/dynamic](https://mashlib.com/dynamic/) is the same data browser built without a build step, and it can load extra panes named in a link.

Both are static pages with no server side of their own. They run in your browser and read from, and write to, the pods you point them at.

![mashlib.com showing a profile from the public test pod](/img/mashlib/mashlib-com-profile.png)

## mashlib.com

What it serves:

- **The official bundle.** `mashlib.min.js`, `mash.css` and the extra files they fetch, exactly as SolidOS publishes mashlib 3.1.0 on npm. They are served from the site root, where the bundle looks for its extra files.
- **A browse page.** The front page is mashlib's own `browse.html` with the address bar moved into the header, beside the account buttons.
- **`databrowser.html`**, mashlib's own, unchanged.

The source is [mashlib/mashlib.github.io](https://github.com/mashlib/mashlib.github.io).

### Use it

1. Open https://mashlib.com/.
2. Paste an address into the bar and press Go, or pick one of the examples. An address without `https://` gets it added.
3. Press Log In to log in with your WebID's identity provider. After that you see what your WebID may see, and can edit what it may edit.

Each resource you open becomes a history entry, so Back and Forward move between them.

### Link to a resource

`?uri=` opens a resource straight away. Encode the address:

```
https://mashlib.com/?uri=https%3A%2F%2Ftestingsolidos.solidcommunity.net%2Fprofile%2Fcard%23me
```

The address in the browser follows you as you move around, so you can bookmark it or send it at any point.

## The no-build version

https://mashlib.com/dynamic/ looks and works like mashlib.com. Underneath, it is not the webpack bundle: it is SolidOS 3.1 (mashlib 3.1.0, solid-panes 5.1.0, solid-ui 5.1.0 and the panes) converted to plain ES modules, loaded through an import map. The source is [mashlib/dynamic](https://github.com/mashlib/dynamic).

Differences from the bundle that a user can notice:

- Parts that a page does not need are fetched when first used: the profile view, the folder view, the profile editor, the sharing dialog, the Markdown renderer, the code editor, the chat signature code.
- On a pod that accepts access control documents only as JSON-LD (JSS), a Turtle ACL write that is refused is retried once as JSON-LD.
- The activitystreams pane is not included.
- It can load panes named in the link (below).

It publishes two copies of the same code:

| Path | What it is |
|---|---|
| https://mashlib.com/dynamic/ | the browse page, joined copy |
| https://mashlib.com/dynamic/dist/browse.html | the browse page, joined copy, from the `dist/` folder |
| https://mashlib.com/dynamic/mashlib/browse.html | the browse page from the source files, one request per module |

`dist/boot.js` and `mashlib/boot.js` are the entry points a server uses; see [Running SolidOS on JSS](/docs/guides/running-on-jss).

## Pane by link

A pane is a view in the data browser. On mashlib.com/dynamic, a link can name extra panes to load:

```
https://mashlib.com/dynamic/?uri=<resource>&pane=<pane module URL>
```

For example, this link opens the SolidOS roadmap folder and offers a small pane from the [pane-loader examples](https://github.com/melvincarvalho/pane-loader) that counts the things in a folder:

```
https://mashlib.com/dynamic/?uri=https%3A%2F%2Fsolidos.solidcommunity.net%2Fpublic%2FRoadmap%2F&pane=https%3A%2F%2Fmelvincarvalho.github.io%2Fpane-loader%2Fexamples%2Fhello-pane.js
```

Rules:

- `pane=` may be repeated, up to 10 panes per link.
- Each value must be an `http:` or `https:` URL with no user name or password in it. Anything else is ignored.
- The URL must be an ES module whose default export has a `name`, a `label` function and a `render` function. A module that fails to load or is not a pane is skipped with a console warning.
- If a pane with the same `name` is already registered, the new one is not added.
- `?pane=` works on mashlib.com/dynamic only, not on mashlib.com.

### The permission prompt

A pane is code that runs as you: once you are logged in, it can read and change whatever you can on your pod. So a link cannot add one silently.

- A pane from **mashlib.com itself**, or from a site you have allowed before, is loaded before the first view. The page waits at most 5 seconds for it.
- A pane from **any other site** is asked about first. The resource is shown meanwhile, without the pane:

![The prompt mashlib.com/dynamic shows before loading a pane from another site](/img/mashlib/dynamic-pane-permission-prompt.png)

The prompt names the site and lists the files the link wants to load from it. There is one prompt per site, covering every pane the link names from that site.

- **Allow panes from this site** loads the panes, shows the resource again so they are offered, and remembers the site.
- **Not now** loads nothing from that site.

An added pane is offered beside the built-in ones. On a folder it appears in the menu of the folder header:

![The folder header menu on mashlib.com/dynamic, offering the pane added by the link](/img/mashlib/dynamic-pane-in-pane-menu.png)

Allowed sites are kept in this browser only, in `localStorage` under `mashlib.panes.allowed` (a JSON list of origins). There is no button to withdraw permission: remove the origin from that list, or clear the site's data in your browser settings. If the browser refuses to store it, the permission lasts for this visit only.

### For pane authors

Host the module anywhere a browser can fetch it as JavaScript from another site: GitHub Pages, your own pod, a static host. Then share the link. [Dynamic panes](/docs/panes/dynamic-panes) covers how to write the module; [pane-loader](https://github.com/melvincarvalho/pane-loader) has five examples, each one file with no imports.

## Run them yourself

Both are static sites. To run the no-build copy locally:

```bash
git clone https://github.com/mashlib/dynamic.git
cd dynamic
npx http-server -p 8731 -c-1
```

Then open http://localhost:8731/ for the browse page. Any static file server works.

## See also

- [Embedding mashlib](/docs/guides/embedding-mashlib): how the browse page works
- [Running SolidOS on JSS](/docs/guides/running-on-jss)
- [Dynamic panes](/docs/panes/dynamic-panes)
