---
sidebar_position: 1
title: Panes Overview
description: What panes are, which ones SolidOS 3.1 registers, and how one is chosen
---

# Panes Overview

A pane is a view of one thing in a Solid pod: a folder, a profile, a chat, a Turtle file. SolidOS shows whatever you open by asking every registered pane whether it can show it, then rendering one of them. Panes are how SolidOS is extended: each one is a small object with a `label` function that answers "can you show this?" and a `render` function that builds the view.

The full definition of that object, and of what a pane is given, is on [The Pane Contract](./pane-anatomy.md).

## How a pane is chosen

When SolidOS 3.1 shows a subject (a `NamedNode`):

1. It loads the subject's document into the shared store. For a folder it loads the folder listing.
2. It calls `label(subject, context)` on every registered pane, in registration order. A pane that returns a string is relevant; `null` means it is not. Panes marked `global` are skipped, and so is the `sharing` pane.
3. If no pane is relevant, the `internal` pane ("Under The Hood") is used.
4. Panes with an `audience` are kept only if the user's preferences include every role listed (for example Power User or Developer). The first relevant pane is kept even if its audience does not match, so there is always something to show.
5. One relevant pane is shown:
   - the pane whose `mintClass` is the subject's `ui:mintClass`, if there is one;
   - otherwise the first pane whose `shouldGetFocus(subject)` returns `true`;
   - otherwise the first relevant pane.
6. The other relevant panes are offered in the pane menu, each with its `label` text and `icon`.

There is no priority number. The order of registration is the priority, and the built-in panes are registered most specific first. A pane added later with `panes.register` goes after all of them: it is offered in the menu, and is shown first only if its `shouldGetFocus` asks for it.

![The pane menu of a recipe document, offering About, Under The Hood, a registered Types pane, and Open in New Tab](/img/panes-dev/pane-menu.png)

## The panes SolidOS 3.1 registers

solid-panes 5.1.0 registers these panes in this order (`src/registerPanes.js`). The name is the one `panes.byName` takes; this list was read from `panes.list` in mashlib 3.1.0.

| Order | Name | Shows | Notes |
|---|---|---|---|
| 1 | `profile` | A person (`foaf:Person`, `schema:Person`, `vcard:Individual`) | From profile-pane. See [Profile Pane](./profile-pane.md). |
| 2 | `trustedApplications` | Apps the user trusts | Global; never offered for a subject |
| 3 | `basicPreferences` | The user's preferences | Its `label` always returns `null`; it is opened directly |
| 4 | `issue` | Issue trackers and issues | From issue-pane; creates trackers. See [Issue Pane](./issue-pane.md). |
| 5 | `contact` | Address books, groups, contacts | From contacts-pane; creates address books. See [Contacts Pane](./contacts-pane.md). |
| 6 | `activitystreams` | Activity Streams types | From activitystreams-pane |
| 7 | `pad` | Notepads | Power User; creates notepads |
| 8 | `transaction` | Financial transactions (`qif:Transaction`) | Power User |
| 9 | `period` | Financial periods (`qif:Period`) | Power User |
| 10 | `meeting` | Meetings | From meeting-pane; Power User; creates meetings. See [Meeting Pane](./meeting-pane.md). |
| 11 | `tabbed` | A `meeting:Cluster` as tabs | Power User |
| 12 | `long chat` | Chats | From chat-pane; creates chats. See [Chat Pane](./chat-pane.md). |
| 13 | `chat` | Short chats | From chat-pane; Power User |
| 14 | `schedule` | Scheduling polls | Power User; creates polls |
| 15 | `travel expenses` | Transactions by trip (`trip:Trip`) | Power User |
| 16 | `image` | Images | |
| 17 | `playlistSlot` | Playlist slots | Power User |
| 18 | `video` | Video files | |
| 19 | `audio` | Audio files | |
| 20 | `Dokieli` | Nothing: its `label` always returns `null` | Creates dokieli documents; `humanReadable` shows them |
| 21 | `folder` | Folders (containers) | From folder-pane; creates folders. See [Folder Pane](./folder-pane.md). |
| 22 | `slideshow` | A folder with more than one image, as a slideshow | Power User |
| 23 | `classInstance` | A class, as a list of its instances | Power User |
| 24 | `social` | A person's friends ("Friends") | |
| 25 | `humanReadable` | HTML, plain text, Markdown, JSON, PDF and MP4 files, rendered | |
| 26 | `dataContents` | The data in an RDF document | Developer |
| 27 | `source` | Any text file, as source code | From source-pane; creates text files; opens first for `.js` files. See [Source Pane](./source-pane.md). |
| 28 | `n3` | An RDF document as N3 | Developer |
| 29 | `RDFXML` | An RDF document as RDF/XML | Developer |
| 30 | `form` | A thing that has forms, through those forms | Power User |
| 31 | `tableOfClass` | A class, as a table of its instances | |
| 32 | `default` | Any thing, as property and value ("About") | Developer |
| 33 | `ui` | Creation forms for a class, and `ui:Form` editing | Power User |
| 34 | `sharing` | Who has access | Not offered in the pane menu |
| 35 | `internal` | Under The Hood: metadata, delete | The fallback |
| 36 | `home` | The user's home page | Global; Power User |

"Power User" and "Developer" are the `audience` roles (`solid:PowerUser`, `solid:Developer`). "Creates" means the pane has `mintNew`, so it is offered in the folder pane's new-item menu.

The panes from separate packages live in their own repositories ([folder-pane](https://github.com/SolidOS/folder-pane), [contacts-pane](https://github.com/SolidOS/contacts-pane), [profile-pane](https://github.com/SolidOS/profile-pane) and others); the rest are in [solid-panes](https://github.com/SolidOS/solid-panes).

## Adding a pane

You do not need to fork SolidOS or rebuild mashlib to add a pane. Write the pane as one ES module and load it at run time:

- on any page running SolidOS: `panes.register(pane)`;
- on a [JSS](https://jss.live/) pod: `jss start --mashlib-cdn --panes <url>`;
- by link: `https://solidos.org/docs/browser/?pane=<url>&uri=<resource>`.

[Dynamic Panes](./dynamic-panes.md) covers all three.

## Where to go next

- [Your First Pane](../getting-started/your-first-pane.md): a working pane in a few minutes
- [The Pane Contract](./pane-anatomy.md): every field, the context, and the render cycle
- [Creating Panes](./creating-panes.md): a fuller pane that reads, writes and is tested
- [Dynamic Panes](./dynamic-panes.md): loading a pane from a URL, and the trust model
- [Navigation](./navigation.md): moving between things from inside a pane
