---
sidebar_position: 10
title: Human-Readable Pane
description: Markdown, HTML, plain text, JSON and PDF files shown as documents
---

# Human-Readable Pane

The human-readable pane shows a document the way a person would read it: Markdown rendered as formatted text, an HTML page as a page, plain text and JSON as text, and a PDF in the browser's viewer. It is the default view for these files.

![The human-readable pane in SolidOS 3.1 rendering a Markdown file](/img/builtin-panes/human-readable-pane.png)

| | |
|---|---|
| Package | [solid-panes](https://github.com/SolidOS/solid-panes) 5.1.0, `src/humanReadablePane.ts` |
| Pane name | `humanReadable` |
| Registered by | solid-panes 5.1.0, after `social` and before `dataContents` |

## When it applies

`label(subject, context)` returns:

| Condition | Label |
|---|---|
| subject is a `link:WebPage` | `Webpage` |
| the path ends in `.md`, `.markdown`, `.mdown`, `.mkd` or `.mkdn` | `View` |
| the `Content-Type` (or an LDP media-type class from the folder listing) is `text/plain`, `text/html`, `text/markdown`, `application/json`, `application/xhtml+xml`, `application/pdf` or `video/mp4` | `View` |
| anything else, or a blank node | `null` |

Because it is registered before `source`, a Markdown or HTML file opens rendered, and **Source** is in the pane menu for editing it. An MP4 file matches too, but the `video` pane is registered earlier and is shown first.

## How each type is shown

| File | Shown as |
|---|---|
| Markdown | Fetched as text, converted with [marked](https://marked.js.org/), cleaned with DOMPurify, and inserted into the page |
| Plain text, JSON | Fetched as text and shown in a `<pre>` block |
| HTML, XHTML | Fetched with the logged-in session and shown in an `<iframe>` through `srcdoc`, with a `<base>` set to the file's address, sandboxed with `allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals` (no same-origin access) |
| HTML that loads dokieli | Shown in the frame with a bridge that lets dokieli save back to the pod through the logged-in session |
| PDF, other types | Fetched with the logged-in session and shown in an `<iframe>` from a `blob:` URL |

Files are fetched through the store's authenticated fetch, so private files render for someone who may read them; the frame's own request would carry no Solid credentials.

The pane reads only; it never writes. Use the [source pane](./source-pane.md) to edit the text.

## Data

There is no RDF data shape: the pane works from the file's address and `Content-Type`. The Markdown file in the screenshot was uploaded as `text/markdown`:

```markdown
# Project notes

These notes live on a Solid pod as a plain Markdown file.

## This week

- Write the pane pages
- Take screenshots on SolidOS 3.1
- Check every link
```

## Source

[humanReadablePane.ts in solid-panes](https://github.com/SolidOS/solid-panes/blob/main/src/humanReadablePane.ts)

## See also

- [Source Pane](./source-pane.md)
- [Media Panes](./media-panes.md): images, audio and video
