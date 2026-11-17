---
sidebar_position: 1
title: What is SolidOS?
description: What SolidOS is, the packages it is made of, and where it runs
---

# What is SolidOS?

SolidOS is a data browser for [Solid](https://solidproject.org/) pods. Give it the web address of anything on a pod (a profile, a folder, an address book, a chat, a Turtle file) and it loads the data, picks a view for it, and lets you edit it if you are allowed to. These docs describe SolidOS 3.1 (mashlib 3.1.0, November 2026).

## What you see

![SolidOS 3.1 at mashlib.com showing a public profile](/img/getting-started/mashlib-com-profile.png)

You can try it now at **[mashlib.com](https://mashlib.com/)**, which serves the official mashlib 3.1.0 bundle. Paste an address into the bar and press **Go**.

## The packages

SolidOS is a set of JavaScript packages. Their versions in the 3.1 release:

| Package | Version | What it does |
|---------|---------|--------------|
| [mashlib](https://github.com/SolidOS/mashlib) | 3.1.0 | The bundle: puts everything on the page, starts the data browser, keeps the layout and theme |
| [solid-panes](https://github.com/SolidOS/solid-panes) | 5.1.0 | The outline (the part that shows a resource), the header, navigation, and the built-in panes |
| [pane-registry](https://github.com/SolidOS/pane-registry) | 5.1.1 | The list of registered panes, and the types that describe a pane and its context |
| [solid-ui](https://github.com/SolidOS/solid-ui) | 5.1.0 | Web components (login, account menu, dialogs, file explorer, forms) and the older widget library |
| [solid-logic](https://github.com/SolidOS/solid-logic) | 6.2.0 | The shared store, the login session, and logic for access control, type indexes, profiles and folders |
| [rdflib](https://github.com/linkeddata/rdflib.js) | 2.4.1 | The RDF store, parsers, the fetcher that loads documents and the updater that writes them |

The larger views are packages of their own, which solid-panes pulls in: folder-pane, profile-pane, contacts-pane, issue-pane, meeting-pane and source-pane (4.1.0), chat-pane (4.0.0) and activitystreams-pane (2.1.0).

## Panes

A **pane** is a view for one kind of thing. Every pane answers two questions: "can you show this?" (its `label` function) and "show it" (its `render` function). When you open an address, SolidOS asks every registered pane in turn, keeps the ones that say yes, and shows one of them. For a file or folder, the others are listed in the **⋮** menu at the top right of the view. (A person's WebID is shown without that header, so it has no menu.)

You can add panes of your own without rebuilding SolidOS: a pane is one ES module, and it can be loaded into a running data browser. [Your First Pane](./your-first-pane.md) does this.

## Where SolidOS runs

- **mashlib.com.** [mashlib.com](https://mashlib.com/) is the official bundle with an address bar. [mashlib.com/dynamic](https://mashlib.com/dynamic/) is the same data browser built from plain ES modules with no build step, and it can load extra panes from a link. See [mashlib.com and no-build SolidOS](../guides/mashlib-com.md).
- **On a pod server.** A Solid server can answer a browser's request for a resource with the data browser, so the pod shows itself in SolidOS. solidcommunity.net does this. The JavaScript Solid Server (JSS) does it with one flag. See [Running SolidOS on JSS](../guides/running-on-jss.md).
- **In your own page.** Load mashlib in a page and point it at a resource. See [Embedding mashlib](../guides/embedding-mashlib.md).
- **On the desktop.** [Data Kitchen](https://github.com/SolidOS/data-kitchen) wraps mashlib in Electron.

## Next steps

- [Core Concepts](./core-concepts.md): pods, RDF, WebIDs, panes, the store and login
- [Quick Start](./quick-start.md): run SolidOS
- [Your First Pane](./your-first-pane.md): write a view
- [Architecture Overview](../architecture/overview.md): how the packages fit together

## Resources

- [SolidOS on GitHub](https://github.com/SolidOS)
- [Solid Project](https://solidproject.org/)
- [What changed in 3.1](../guides/migrating-to-3.1.md)
