---
sidebar_position: 7
title: Source Pane
description: View and edit the text of a file in a CodeMirror editor
---

# Source Pane

The source pane shows the text of a file in a code editor with line numbers and syntax highlighting. The pencil button in the header switches it to editing; **Save Changes** writes the file back, **Cancel** drops the edit. For Turtle, N3 and JSON-LD files a **Prettify** button reformats the text.

![The source pane in SolidOS 3.1 showing a Turtle file, with the Prettify button](/img/builtin-panes/source-pane.png)

| | |
|---|---|
| Package | [source-pane](https://github.com/SolidOS/source-pane) 4.1.0 |
| Pane name | `source` |
| Registered by | solid-panes 5.1.0, after `dataContents` and before `n3` |
| Creates | text files (**New File** in the folder pane) |

## When it applies

`label(subject, context)` returns:

| Condition | Label |
|---|---|
| the path ends in `.js`, `.mjs` or `.cjs` | `Javascript Source` |
| a type of the subject is a `text/*` media type | `Source` |
| a type contains `xml` | `XML Source` |
| a type contains `json` (for example `application/ld+json`) | `JSON Source` |
| a type contains `javascript` | `Javascript Source` |
| anything else | `null` |

The types checked are the media-type classes rdflib records from the response's `Content-Type`. The `.js` test comes first because some servers send no media type for scripts, or report them as containers.

`shouldGetFocus(subject)` is true for `.js`, `.mjs` and `.cjs` files, so those open in the source pane straight away. Other text files open in their own pane (a Turtle file in the data view, a Markdown file rendered) and offer **Source** in the pane menu.

## What you see

- **The editor**: solid-ui's `CodeEditor` (CodeMirror 6), loaded only when the pane is shown. It is read-only until you select **Edit** (the pencil in the header).
- **Save Changes** checks the syntax first. Turtle, N3, RDF/XML, JSON-LD, XHTML and HTML data islands are parsed with rdflib; JSON is parsed with `JSON.parse`; other types are not checked. Only if the check passes is the file sent with `PUT`, with `If-Match` set to the ETag it was loaded with, so a file changed by someone else in the meantime is not overwritten (the server answers 412).
- **Prettify** (not while editing) parses the text and writes it back serialized by rdflib, for `text/turtle`, `text/n3` and `application/ld+json`.
- If the editor fails to load, the pane shows an error with **Try again**. The file is not changed.

The pane returns a headless `source-pane-source-provider` element and adds the `source-pane-source-editor-card` component inside it. It sits under solid-ui's `solid-ui-file-explorer-provider`, which supplies the store, the resource address and the header's edit button.

## Data

The pane reads and writes the whole file as text; it saves with HTTP `PUT`. **New File** (`mintNew`) asks for a name with an extension that has a text media type (`.txt`, `.ttl`, `.json` and so on) and creates the file with `PUT`. A new JSON file starts as `{}`, a new RDF/XML file as an empty `rdf:RDF` element, anything else as an empty line.

The file in the screenshot, as uploaded:

```turtle
@prefix schema: <http://schema.org/> .
@prefix dct: <http://purl.org/dc/terms/> .

<#recipe> a schema:Recipe ;
    schema:name "Pancakes" ;
    schema:recipeYield "4 servings" ;
    schema:recipeIngredient "200 g flour", "2 eggs", "300 ml milk" ;
    dct:created "2026-11-17"^^<http://www.w3.org/2001/XMLSchema#date> .
```

The screenshot shows it as the test server returns it: with its own prefixes and full addresses.

## Source

[github.com/SolidOS/source-pane](https://github.com/SolidOS/source-pane): `src/sourcePane.ts` is the pane object; `src/components/source-editor-card/SourceEditorCard.ts` is the editor, save and Prettify; `src/helpers.ts` has the syntax check.

## See also

- [Folder Pane](./folder-pane.md): **New File** and **Upload**
- [Human-Readable Pane](./human-readable-pane.md): rendered Markdown and HTML
