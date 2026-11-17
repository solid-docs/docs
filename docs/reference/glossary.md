---
sidebar_position: 1
title: Glossary
description: Key terms used in SolidOS 3.1 and the Solid ecosystem
---

# Glossary

Terms used throughout the SolidOS documentation. Versions are those shipped in mashlib 3.1.0.

## Solid

| Term | Definition |
|------|-----------|
| **Solid** | A set of open specifications for storing data in pods and reading and writing it over HTTP |
| **Solid Protocol** | The specification for how Solid servers and clients communicate ([solidproject.org/TR/protocol](https://solidproject.org/TR/protocol)) |
| **Pod** | A personal data store on the web that its owner controls |
| **WebID** | A URI that identifies a person or agent, for example `https://alice.example/profile/card#me` |
| **Identity provider (issuer)** | The server a user logs in with. Its URL is the OIDC issuer |
| **Solid-OIDC** | The OpenID Connect profile Solid uses for login ([solidproject.org/TR/oidc](https://solidproject.org/TR/oidc)) |

## SolidOS

| Term | Definition |
|------|-----------|
| **SolidOS** | An open-source data browser for Solid pods, built from mashlib, solid-panes, solid-ui, solid-logic, pane-registry and rdflib |
| **Data browser** | The page that runs SolidOS: it shows any resource on the web with the panes that can render it. In mashlib it is `databrowser.html` |
| **mashlib.com** | A site that serves the official mashlib 3.1.0 bundle with a page to browse any pod. [mashlib.com/dynamic/](https://mashlib.com/dynamic/) serves the same data browser as plain ES modules, with no build step |
| **Data Kitchen** | A desktop application that wraps SolidOS in Electron |
| **Pane** | A view for one kind of resource. It is an object with `name`, `icon`, `label(subject, context)` and `render(subject, context)` |
| **Pane registry** | The list of registered panes, kept by the pane-registry package. Panes are added with `panes.register(pane)` |
| **Relevant panes** | The panes whose `label()` returns a string for the subject on show, in registration order. The user's roles (the `audience` field) can narrow the list |
| **Default pane** | The pane shown first: the one matching the resource's `ui:mintClass`, otherwise the first relevant pane whose `shouldGetFocus(subject)` returns true, otherwise the first relevant pane |
| **Dynamic pane** | A pane loaded at run time from a URL as an ES module, instead of being compiled into mashlib. It can be loaded with `panes.register`, the JSS `--panes` option, or `?pane=` on mashlib.com/dynamic |
| **pane-loader** | A small script that fetches pane modules from URLs and registers them before SolidOS starts ([github.com/melvincarvalho/pane-loader](https://github.com/melvincarvalho/pane-loader)). JSS ships a copy |
| **Outliner** | The object that draws a subject and its panes and handles navigation. Get it with `panes.getOutliner(document)`; `GotoSubject()` on it shows a resource |
| **Context** | The second argument to `label` and `render`: `{ dom, getOutliner, session: { store, logic, paneRegistry }, environment }` (`DataBrowserContext` in pane-registry) |
| **Render environment** | `context.environment`: `layout` (`desktop` or `mobile`), `layoutPreference`, `inputMode` (`touch` or `pointer`), `theme` (`light` or `dark`) and `viewport` |
| **Store** | The single shared rdflib store, `SolidLogic.store` on the page and `context.session.store` in a pane |
| **User roles** | Types such as Power User or Developer saved in the user's preferences file. A pane with an `audience` is only offered to users with those roles |

## Libraries

| Term | Definition |
|------|-----------|
| **rdflib.js** | RDF parsing, store, fetcher, update manager and serializers (2.4.1) |
| **solid-logic** | Login (`authSession`, `authn`), access control, type indexes, profiles, inboxes, chat, resources and directory search (6.2.0) |
| **solid-ui** | Lit web components (`solid-ui/components/<name>`), the theme stylesheet and the older DOM widgets (`widgets`, `login`, `aclControl`, `tabs`, `table`) (5.1.0) |
| **pane-registry** | The pane list and the `register`, `byName`, `list`, `paneForIcon` and `paneForPredicate` functions, plus the TypeScript types `PaneDefinition`, `DataBrowserContext` and `RenderEnvironment` (5.1.1) |
| **solid-panes** | The built-in panes, the outliner, the header and navigation (5.1.0) |
| **mashlib** | The bundle that puts all of the above on one page and starts the data browser with `panes.runDataBrowser(uri?)` (3.1.0) |

## User interface (3.1)

| Term | Definition |
|------|-----------|
| **Web component** | A custom HTML element. solid-ui 5 provides its newer UI as Lit web components named `solid-ui-*` |
| **`<solid-ui-provider>`** | The element that holds login state for the components inside it. Components such as `<solid-ui-account>` must be placed inside it, and it must be registered first |
| **`<solid-ui-account>`** | The account control in the header: the login button when logged out, the user's menu when logged in |
| **Login modal** | The dialog titled "Select an identity provider" (`<solid-ui-login-modal>`). Login then redirects to that provider and back |
| **File explorer** | The 3.1 view of a folder or storage: a header, a sidebar tree, and grid or list views (folder-pane with `solid-ui-file-explorer-provider` and `solid-ui-file-explorer-header`) |
| **Manage access** | The sharing dialog (`<solid-ui-access-control-modal>`): Private, Public or Shared with, plus Advanced sharing |
| **Theme** | Light or dark, set by `data-theme="dark"` on `<html>` and saved in localStorage under `mashlib-theme`. Changes fire `mashlib:themechange` |
| **Layout** | Desktop or mobile, set by `data-layout` and saved under `mashlib-layout`. Changes fire `mashlib:layoutchange` |

## rdflib.js terms

| Term | Definition |
|------|-----------|
| **Store** | An in-memory RDF graph (`IndexedFormula`). In SolidOS it is a `LiveStore` with a fetcher and an updater |
| **Fetcher** | Loads documents into the store over HTTP: `store.fetcher.load(doc)` |
| **UpdateManager** | Writes changes back to the server: `store.updater.update(deletions, insertions)`. It sends SPARQL Update when the server's `Accept-Patch` header offers it, otherwise N3 Patch |
| **NamedNode** | A node for a URI, made with `$rdf.sym(uri)` |
| **Literal** | A value such as a string, number or date, made with `$rdf.lit(value, lang?, datatype?)` |
| **Statement** | A triple plus the document it is in, made with `$rdf.st(subject, predicate, object, doc)` |
| **Blank node** | A node with no URI. Its identifier is not stable across loads |
| **Namespace** | A helper that builds URIs with a common prefix, for example `$rdf.Namespace('http://xmlns.com/foaf/0.1/')('name')` |

## RDF and Linked Data

| Term | Definition |
|------|-----------|
| **RDF** | Resource Description Framework, the data model Solid uses |
| **Triple** | Subject, predicate, object |
| **Quad** | A triple plus the graph (document) it belongs to |
| **Graph** | A set of triples. In rdflib a graph usually corresponds to one document |
| **Linked Data** | Data published on the web with URIs that link to other data |
| **URI / IRI** | The identifiers used for everything in RDF |
| **SPARQL** | The query language for RDF. Solid servers accept SPARQL Update in PATCH requests |
| **Vocabulary** | A set of classes and properties for one domain, for example FOAF or vCard |

See the [RDF primer](./rdf-primer.md) for an introduction.

## RDF formats

| Term | Definition |
|------|-----------|
| **Turtle** (`.ttl`) | The text format most Solid servers use |
| **JSON-LD** | RDF as JSON. JSS stores ACL documents only as JSON-LD |
| **N-Triples** | One triple per line |
| **RDF/XML** | The older XML format |
| **N3 Patch** | A patch format for PATCH requests on Solid servers |

## Common vocabularies

| Prefix | Namespace | Used for |
|--------|-----------|----------|
| **foaf** | `http://xmlns.com/foaf/0.1/` | People: `Person`, `name`, `knows` |
| **vcard** | `http://www.w3.org/2006/vcard/ns#` | Contacts: `AddressBook`, `Individual`, `fn` |
| **schema** | `http://schema.org/` | General terms: `Event`, `Person` |
| **dct** | `http://purl.org/dc/terms/` | Metadata: `created`, `modified`, `title` |
| **ldp** | `http://www.w3.org/ns/ldp#` | Containers: `Container`, `contains` |
| **acl** | `http://www.w3.org/ns/auth/acl#` | Permissions: `Read`, `Write`, `Append`, `Control` |
| **solid** | `http://www.w3.org/ns/solid/terms#` | Solid terms: `oidcIssuer`, `publicTypeIndex` |
| **pim** | `http://www.w3.org/ns/pim/space#` | Storage and settings: `storage`, `preferencesFile` |
| **ui** | `http://www.w3.org/ns/ui#` | Forms and panes: field definitions, `mintClass` |
| **meeting** | `http://www.w3.org/ns/pim/meeting#` | Chats and meetings: `LongChat`, `Meeting` |
| **wf** | `http://www.w3.org/2005/01/wf/flow#` | Issue trackers: `Tracker`, `Task` |
| **sioc** | `http://rdfs.org/sioc/ns#` | Messages: `content` |
| **xsd** | `http://www.w3.org/2001/XMLSchema#` | Data types: `dateTime`, `integer`, `string` |

## Access control

| Term | Definition |
|------|-----------|
| **WAC** | Web Access Control: permissions in ACL documents linked from each resource |
| **ACP** | Access Control Policy, another access control system some servers use |
| **ACL document** | The resource that holds the WAC rules for a resource or container, found from the `Link: rel="acl"` header |
| **Access modes** | `Read`, `Write`, `Append`, `Control` |
| **acl:agent** | Gives access to one WebID |
| **acl:agentClass** | Gives access to a class; `foaf:Agent` means everyone |
| **acl:default** | Rules that apply to the contents of a container |
| **Trusted app** | An origin the user allows to act for them. Node Solid Server checks it; other servers may not |
| **Type index** | A document that maps RDF classes to where instances are stored, public or private |

## Built-in panes

A selection. The [panes overview](../panes/overview.md) lists them all.

| Pane (`name`) | Shows | Offered for |
|---------------|-------|-------------|
| `folder` | The file explorer | Containers (`ldp:Container`) |
| `contact` | Address books | `vcard:AddressBook`, `vcard:Organization` |
| `profile` | A person's profile | `vcard:Individual`, `foaf:Person`, `schema:Person` |
| `long chat` | Chat channels | `meeting:LongChat`, `sioc:Thread` |
| `meeting` | Meetings | `meeting:Meeting` |
| `issue` | Issue trackers and issues | `wf:Tracker`, `wf:Task` |
| `source` | The raw text of a document, in an editor | Text, XML, JSON and JavaScript documents |

## Pane fields

| Field | Definition |
|-------|-----------|
| **`name`** | Unique name, used by `panes.byName(name)` |
| **`icon`** | URL of the pane's icon (required) |
| **`label(subject, context)`** | Returns a short title if the pane can show the subject, otherwise `null` |
| **`render(subject, context)`** | Returns an `HTMLElement` that shows the subject. Use `context.dom` to create elements |
| **`shouldGetFocus(subject)`** | Optional. Returns true to ask to be the default pane |
| **`audience`** | Optional. User roles the pane is meant for |
| **`mintClass`** | Optional. The RDF class this pane can create new instances of |
| **`mintNew(context, options)`** | Optional. Creates a new instance of `mintClass` |
| **`global`** | Optional. A global pane is never among the relevant panes for a resource |

## Solid servers

| Term | Definition |
|------|-----------|
| **CSS** | Community Solid Server, a modular Node.js server |
| **NSS** | Node Solid Server, the first Solid server |
| **JSS** | JavaScript Solid Server ([jss.live](https://jss.live/)). It serves SolidOS with `--mashlib-cdn`, `--mashlib` or `--mashlib-module`, and loads extra panes with `--panes` |
| **ESS** | Enterprise Solid Server, Inrupt's commercial server |

## HTTP in Solid

| Term | Definition |
|------|-----------|
| **LDP** | Linked Data Platform, the container model Solid builds on |
| **GET** | Read a resource |
| **PUT** | Create or replace a resource |
| **POST** | Create a resource inside a container |
| **PATCH** | Change part of an RDF resource, with SPARQL Update or N3 Patch |
| **DELETE** | Remove a resource |
| **CORS** | Cross-Origin Resource Sharing. The server must allow it for a data browser on another origin |
| **Slug** | A header that suggests a name for a resource created with POST |
