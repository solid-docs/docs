---
sidebar_position: 4
title: Running SolidOS on JSS
description: Serve the SolidOS data browser from a JavaScript Solid Server pod, choose the mashlib build, and add panes with --panes
---

# Running SolidOS on JSS

[JavaScript Solid Server](https://jss.live/) (JSS) can serve SolidOS as the face of a pod: when a browser opens a resource on the pod, JSS answers with a page that loads the data browser, and the data browser then fetches the resource as data and draws it. JSS can also load extra panes into that page at start-up.

Everything here is for JSS 0.0.231.

## Install

```bash
npm install -g javascript-solid-server
jss start --help
```

The command is `jss`. Without options, `jss start` listens on port 4443.

## Choose the data browser

JSS has two ways to serve SolidOS. Both serve SolidOS 3.1.

| Flag | What the page loads | SolidOS version |
|---|---|---|
| `--mashlib-module <url>` | an ES module entry point from any URL | whatever the module is; SolidOS 3.1 with the URLs below |
| `--mashlib-cdn` | `mashlib.min.js` and `mash.css` from unpkg | `--mashlib-version`, default `3.1.0` (`2.0.0` before JSS 0.0.231) |

Either flag turns on content negotiation (`--conneg`) as well, so the data browser can ask for Turtle.

### Module mode: SolidOS 3.1

```bash
jss start --mashlib-module https://mashlib.com/dynamic/dist/boot.js
```

For every resource a browser navigates to, JSS returns a small page: a `<div id="mashlib">`, a `<script type="module">` for the URL you gave, and a stylesheet at the same URL with `.js` replaced by `.css`. The module does the rest.

`https://mashlib.com/dynamic/dist/boot.js` is the no-build SolidOS 3.1 (mashlib 3.1.0, solid-panes 5.1.0, solid-ui 5.1.0 and the panes as ES modules), described in [mashlib.com](/docs/guides/mashlib-com#the-no-build-version). Two entry points are published:

| URL | What it is |
|---|---|
| `https://mashlib.com/dynamic/dist/boot.js` | the joined copy: fewer, larger files |
| `https://mashlib.com/dynamic/mashlib/boot.js` | the source files, one request per module |

Both change when the [mashlib/dynamic](https://github.com/mashlib/dynamic) repository changes. For an address that only changes when you change it, load the same file from jsDelivr at a tag or commit of that repository, for example the tag `v3.1.1`:

```bash
jss start --mashlib-module https://cdn.jsdelivr.net/gh/mashlib/dynamic@v3.1.1/dist/boot.js
```

You can also host the entry point on the pod itself and give its URL.

### CDN mode

```bash
jss start --mashlib-cdn
jss start --mashlib-cdn --mashlib-version 2.0.0
```

From JSS 0.0.231 the default version is 3.1.0, and the page JSS writes matches the version: 3 or later gets the 3.x page (`<solid-ui-provider>` around an `#OutlineView`), an earlier version gets the 2.x page (`<table id="outline">`).

Before JSS 0.0.231 the default was 2.0.0 and the page always had the 2.x markup. mashlib 3.1 does not use that markup, so with `--mashlib-version 3.1.0` on those versions the profile heading and navigation bar are missing: upgrade JSS, or use module mode.

JSS redirects the numbered parts the bundle fetches from the server root (`/841.js`, `/410.js`) to unpkg.

## Add panes: `--panes`

```bash
B=https://melvincarvalho.github.io/pane-loader/examples
jss start --mashlib-module https://mashlib.com/dynamic/dist/boot.js \
          --panes $B/meetings-pane.js,$B/notes-pane.js
```

`--panes` takes a comma-separated list of pane module URLs. Each is an ES module whose default export is a SolidOS pane (`name`, `label`, `render`). It needs JSS 0.0.227 or later with `--mashlib-cdn`, and 0.0.230 or later with `--mashlib-module`.

| Set it with | Form |
|---|---|
| `--panes <urls>` | comma-separated |
| `JSS_PANES` | comma-separated |
| `panes` in the config file | an array of strings; use this for a URL that contains a comma |

What happens:

- Each entry is an `http(s)` URL or an absolute path on this server (`/public/panes/my-pane.js`). Anything else is dropped, and JSS lists the dropped entries at start-up.
- The page fetches all listed modules at once and registers each pane in the order listed, after the built-in panes. A loaded pane is offered alongside them and does not replace the default view.
- In CDN mode the page waits at most 5 seconds for the panes before starting SolidOS. A slower pane is registered when it arrives and is offered from the next view drawn.
- In module mode the entry point starts SolidOS itself. The panes are added once it has put `panes.register` on the page, and the view on show is drawn again so they are offered. If the entry point never provides the registry, there is one console warning after 30 seconds.
- A pane that fails to load, or is not a pane, is skipped with a console warning; the data browser still starts. Look for lines starting `[jss] pane` in the browser console.
- With no `--panes`, the page is exactly as without it.

JSS loads the panes with [pane-loader](https://github.com/melvincarvalho/pane-loader), served at `/.well-known/jss/pane-loader.js` when panes are configured. That copy leaves out pane-loader's `?pane=` shortcut, so the only panes loaded are the ones in the list.

To write a pane, see [Dynamic panes](/docs/panes/dynamic-panes) and the JSS guide [Dynamic Panes](https://jss.live/docs/guides/dynamic-panes).

**Trust.** A pane runs in the page with the logged-in session and can do whatever the person can. The list is set by whoever runs the server, so add only panes you would install for every user.

## A local pod with logins

To try logging in and editing, run a single-user pod with the built-in identity provider:

```bash
jss start --port 8732 --host 127.0.0.1 --root ./jss-data \
  --idp --single-user --single-user-name me \
  --mashlib-module https://mashlib.com/dynamic/dist/boot.js
```

- `--single-user-name me` puts the pod at `/me/`. Open `http://127.0.0.1:8732/me/` and log in with Log In.
- `--single-user-password <pw>` (or `JSS_SINGLE_USER_PASSWORD`) sets the password when the pod is first created.
- Use `127.0.0.1`, not `localhost`: the identity provider's issuer is the address JSS binds to.

## JSON-LD and ACLs

JSS accepts access control documents only as JSON-LD. A Turtle write to an ACL is answered with `415` and an `Accept-Put` header. SolidOS writes ACLs as Turtle (the sharing editor, new address books, long chats and schedules), so with the official mashlib bundle those writes fail on JSS. The no-build SolidOS retries such a write once as JSON-LD, which is one reason to use it on JSS.

## See also

- [JSS: Mashlib Data Browser](https://github.com/JavaScriptSolidServer/JavaScriptSolidServer/blob/gh-pages/docs/mashlib.md), the reference for these flags
- [mashlib.com and the no-build data browser](/docs/guides/mashlib-com)
- [Dynamic panes](/docs/panes/dynamic-panes)
- [Deployment](/docs/reference/deployment)
