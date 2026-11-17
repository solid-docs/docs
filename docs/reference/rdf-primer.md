---
sidebar_position: 1
title: RDF Primer
description: Understanding RDF for Solid development
---

# RDF Primer

Resource Description Framework (RDF) is the data model underlying Solid. Understanding RDF is essential for building SolidOS panes.

## Core Concepts

### Triples

RDF data consists of **triples**: subject-predicate-object statements.

```
<subject> <predicate> <object> .
```

Example:
```turtle
<https://alice.example/profile/card#me> <http://xmlns.com/foaf/0.1/name> "Alice Smith" .
```

This says that the thing named `https://alice.example/profile/card#me`, Alice, has the name "Alice Smith".

### URIs

Resources are identified by URIs (Uniform Resource Identifiers):

```text
<https://alice.example/profile/card#me>   # A person
<http://xmlns.com/foaf/0.1/name>          # The "name" property
<https://alice.example/photo.jpg>          # An image
```

### Literals

Values like strings, numbers, and dates:

```text
"Alice Smith"                              # Plain string
"Alice Smith"@en                           # String with language tag
"42"^^<http://www.w3.org/2001/XMLSchema#integer>  # Typed literal
```

### Blank Nodes

Anonymous nodes without URIs:

```turtle
<#me> foaf:knows [
    foaf:name "Bob" ;
    foaf:mbox <mailto:bob@example.org>
] .
```

## Turtle Syntax

Turtle is the most common RDF serialization in Solid.

### Prefixes

```turtle
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix solid: <http://www.w3.org/ns/solid/terms#> .

<#me> a foaf:Person ;
    foaf:name "Alice" .
```

### Multiple Properties

Use semicolon to add properties to same subject:

```turtle
<#me>
    foaf:name "Alice" ;
    foaf:mbox <mailto:alice@example.org> ;
    foaf:knows <https://bob.example/profile/card#me> .
```

### Multiple Values

Use comma for multiple values of same property:

```turtle
<#me> foaf:knows
    <https://bob.example/profile/card#me>,
    <https://carol.example/profile/card#me>,
    <https://dave.example/profile/card#me> .
```

## Common Vocabularies

### FOAF (Friend of a Friend)

```turtle
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

<#me> a foaf:Person ;
    foaf:name "Alice" ;
    foaf:nick "alice" ;
    foaf:mbox <mailto:alice@example.org> ;
    foaf:img <photo.jpg> ;
    foaf:knows <https://bob.example/profile/card#me> .
```

### vCard

```turtle
@prefix vcard: <http://www.w3.org/2006/vcard/ns#> .

<#me>
    vcard:fn "Alice Smith" ;
    vcard:hasEmail <mailto:alice@example.org> ;
    vcard:hasTelephone <tel:+1-555-1234> ;
    vcard:hasAddress [
        vcard:street-address "123 Main St" ;
        vcard:locality "San Francisco" ;
        vcard:region "CA"
    ] .
```

### Solid Terms

```turtle
@prefix solid: <http://www.w3.org/ns/solid/terms#> .
@prefix space: <http://www.w3.org/ns/pim/space#> .
@prefix ldp: <http://www.w3.org/ns/ldp#> .

<#me>
    solid:oidcIssuer <https://solidcommunity.net> ;
    solid:publicTypeIndex </settings/publicTypeIndex.ttl> ;
    solid:privateTypeIndex </settings/privateTypeIndex.ttl> ;
    space:preferencesFile </settings/prefs.ttl> ;
    space:storage </> ;
    ldp:inbox </inbox/> .
```

### Schema.org

```turtle
@prefix schema: <http://schema.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<#event> a schema:Event ;
    schema:name "Team Meeting" ;
    schema:startDate "2024-01-15T10:00:00Z"^^xsd:dateTime ;
    schema:location "Conference Room A" .
```

## JSON-LD

The same data can be written as JSON-LD. A server can offer one document in several formats: a JavaScript Solid Server, for example, keeps profiles as JSON-LD (`/profile/card.jsonld`) and returns Turtle to a client that asks for Turtle, as rdflib does. In code you work with the triples and rarely see the format.

```json
{
  "@context": { "foaf": "http://xmlns.com/foaf/0.1/" },
  "@id": "https://alice.example/profile/card#me",
  "@type": "foaf:Person",
  "foaf:name": "Alice"
}
```

## Working with RDF in JavaScript

SolidOS uses [rdflib.js](../libraries/rdflib.md). In a pane it is the global `$rdf`, and the shared store is `context.session.store`.

```javascript
const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/')

const kb = $rdf.graph()
const alice = $rdf.sym('https://alice.example/profile/card#me')
kb.add(alice, FOAF('name'), $rdf.lit('Alice Smith'), alice.doc())   // the 4th term is the document
kb.any(alice, FOAF('name')).value                                   // 'Alice Smith'
kb.any(alice, FOAF('name'), null, alice.doc()).value                // the same, only from that document
```

The fourth term of each statement is the graph: in Solid, the document the statement is stored in. Passing it to a query limits the answer to that document.

### Documents and the things in them

A document can describe several things, each named by a fragment:

```
https://alice.example/profile/card      # the document
https://alice.example/profile/card#me   # Alice
https://alice.example/profile/card#key  # her public key
```

You fetch the document and then ask about the thing:

```javascript
const me = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card#me')
await store.fetcher.load(me.doc())                    // fetch the document ...
store.anyValue(me, FOAF('name'), null, me.doc())       // ... then ask about the thing in it
```

Here `store` is `context.session.store`. More in [Reading Data](../cookbook/reading-data.md).

## See Also

- [rdflib.js](../libraries/rdflib.md)
- [W3C RDF Primer](https://www.w3.org/TR/rdf11-primer/)
- [Turtle Specification](https://www.w3.org/TR/turtle/)
