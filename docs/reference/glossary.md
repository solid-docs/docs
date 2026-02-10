---
sidebar_position: 1
title: Glossary
description: Key terms and concepts used in SolidOS and the Solid ecosystem
---

# Glossary

Quick reference for terms used throughout the SolidOS documentation.

## Solid Ecosystem

| Term | Definition |
|------|-----------|
| **Solid** | A set of open standards for decentralized data storage and access, created by Tim Berners-Lee |
| **Solid Protocol** | The specification defining how Solid servers and clients communicate |
| **Pod** | Personal Online Datastore — a user-controlled data store on the web |
| **WebID** | A URI that identifies a person (e.g. `https://alice.example/profile/card#me`) |
| **Identity Provider (IDP)** | Service that authenticates users via Solid-OIDC |
| **Solid-OIDC** | OpenID Connect-based authentication used by Solid |

## SolidOS

| Term | Definition |
|------|-----------|
| **SolidOS** | An open-source, modular data browser for interacting with Solid pods |
| **Data Browser** | Former name for SolidOS; the interactive UI for browsing pod data |
| **Data Kitchen** | Desktop application that wraps SolidOS using Electron |
| **Pane** | A modular UI component that renders a specific RDF data type |
| **Pane Registry** | System that manages pane registration and selects which pane renders a resource |
| **Pane Selection** | Process where the registry asks each pane "can you render this?" and picks the most specific match |
| **Singleton Store** | The single shared RDF store instance used across all SolidOS components |
| **Outliner** | Internal component that handles navigation and pane display |

## Libraries

| Term | Definition |
|------|-----------|
| **rdflib.js** | JavaScript library for RDF parsing, storage, fetching, and querying |
| **solid-logic** | Business logic layer: authentication, ACL management, type indexes |
| **solid-ui** | Reusable UI widgets, forms, and style utilities |
| **solid-panes** | Collection of built-in panes and the pane registration system |
| **pane-registry** | Shared package used by solid-panes and solid-ui for pane management |
| **mashlib** | Bundle that combines all SolidOS libraries into a single deployable package |

## rdflib.js Components

| Term | Definition |
|------|-----------|
| **Store** | In-memory RDF graph database (also called `IndexedFormula`) |
| **Fetcher** | Loads RDF data from URIs into the store via HTTP GET |
| **UpdateManager** | Writes changes back to pods via HTTP PATCH |
| **NamedNode** | An RDF node representing a URI — created with `sym()` |
| **Literal** | An RDF value: string, number, date, etc. — created with `lit()` |
| **Statement** | An RDF triple/quad (subject, predicate, object, graph) — created with `st()` |
| **Blank Node** | An anonymous RDF node without a URI |
| **Namespace** | A helper for creating URIs with a common prefix (e.g. `FOAF('name')`) |

## RDF & Linked Data

| Term | Definition |
|------|-----------|
| **RDF** | Resource Description Framework — the data model underlying Solid |
| **Triple** | The basic unit of RDF: subject → predicate → object |
| **Quad** | A triple with a fourth component: the named graph it belongs to |
| **Graph** | A collection of RDF triples; in rdflib, corresponds to a document |
| **Linked Data** | A method of publishing structured data so it can be interlinked across the web using URIs |
| **URI / IRI** | Uniform/Internationalized Resource Identifier — used to identify everything in RDF |
| **SPARQL** | Query language for RDF data |
| **Vocabulary** | A set of classes and properties for describing a domain (e.g. FOAF, vCard) |
| **Ontology** | A formal vocabulary with semantic relationships between terms |

## RDF Formats

| Term | Definition |
|------|-----------|
| **Turtle** (`.ttl`) | Human-readable text format for RDF — the most common format in Solid |
| **JSON-LD** | JSON-based RDF format, good for JavaScript integration |
| **N-Triples** | Simple one-triple-per-line format |
| **RDF/XML** | Legacy XML-based RDF format |
| **N3 Patch** | Format used in PATCH requests to update RDF resources on Solid servers |

## Common Vocabularies

| Prefix | Namespace | Used For |
|--------|-----------|----------|
| **foaf** | `http://xmlns.com/foaf/0.1/` | People: `Person`, `name`, `knows` |
| **vcard** | `http://www.w3.org/2006/vcard/ns#` | Contacts: `Individual`, `fn`, `AddressBook` |
| **schema** | `http://schema.org/` | General: `Event`, `Article`, `Note` |
| **dct** | `http://purl.org/dc/terms/` | Metadata: `created`, `modified`, `title` |
| **ldp** | `http://www.w3.org/ns/ldp#` | Containers: `Container`, `contains`, `Resource` |
| **acl** | `http://www.w3.org/ns/auth/acl#` | Permissions: `Read`, `Write`, `Control` |
| **solid** | `http://www.w3.org/ns/solid/terms#` | Solid-specific: `oidcIssuer`, `publicTypeIndex` |
| **pim** | `http://www.w3.org/ns/pim/space#` | Personal: `storage`, `preferencesFile` |
| **ui** | `http://www.w3.org/ns/ui#` | Forms: field definitions for solid-ui |
| **meeting** | `http://www.w3.org/ns/pim/meeting#` | Chat/meetings: `LongChat`, `Meeting` |
| **sioc** | `http://rdfs.org/sioc/ns#` | Social: `Post`, `content` |
| **xsd** | `http://www.w3.org/2001/XMLSchema#` | Data types: `dateTime`, `integer`, `string` |

## Access Control

| Term | Definition |
|------|-----------|
| **WAC** | Web Access Control — the original Solid permission system |
| **ACP** | Access Control Policy — newer alternative to WAC |
| **ACL file** | A `.acl` resource containing permission rules for a resource |
| **Access Modes** | Permission types: `Read`, `Write`, `Append`, `Control` |
| **acl:agent** | Grants access to a specific WebID |
| **acl:agentClass** | Grants access to a class (e.g. `foaf:Agent` = everyone) |
| **acl:default** | Sets default permissions inherited by container contents |
| **Trusted App** | An application authorized by the user with specific permissions |
| **Type Index** | Maps RDF types to storage locations in a pod (public or private) |

## Built-in Panes

| Pane | Renders | Data Type |
|------|---------|-----------|
| **Folder** | File browser | `ldp:Container` |
| **Contacts** | Contact cards | `vcard:Individual` |
| **Address Book** | Contact lists | `vcard:AddressBook` |
| **Chat** | Messaging | `meeting:LongChat` |
| **Meeting** | Agendas | `meeting:Meeting` |
| **Profile** | User profiles | WebID documents |
| **Source** | Raw RDF | Any text resource |
| **Issue** | Issue tracker | `wf:Issue` |

## Pane API

| Term | Definition |
|------|-----------|
| **label(subject)** | Function that returns a label if the pane can render this resource, or `null` |
| **render(subject, dom)** | Function that returns an `HTMLElement` displaying the resource |
| **mintClass** | The RDF class this pane can create new instances of |
| **mintNew(context)** | Function to create a new instance of the pane's data type |

## Solid Servers

| Term | Definition |
|------|-----------|
| **CSS** | Community Solid Server — Node.js reference implementation |
| **NSS** | Node Solid Server — the original Solid server |
| **ESS** | Enterprise Solid Server — Inrupt's commercial offering |

## HTTP in Solid

| Term | Definition |
|------|-----------|
| **LDP** | Linked Data Platform — the HTTP protocol Solid builds on |
| **GET** | Fetch a resource |
| **PUT** | Create or replace a resource |
| **POST** | Create a resource inside a container |
| **PATCH** | Update part of a resource (uses N3 Patch in Solid) |
| **DELETE** | Remove a resource |
| **CORS** | Cross-Origin Resource Sharing — required for browser-based Solid apps |
| **Slug** | HTTP header suggesting a name for a newly created resource |
