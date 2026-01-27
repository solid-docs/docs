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

This says: "Alice's profile has the name 'Alice Smith'"

### URIs

Resources are identified by URIs (Uniform Resource Identifiers):

```turtle
<https://alice.example/profile/card#me>   # A person
<http://xmlns.com/foaf/0.1/name>          # The "name" property
<https://alice.example/photo.jpg>          # An image
```

### Literals

Values like strings, numbers, and dates:

```turtle
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

<#event> a schema:Event ;
    schema:name "Team Meeting" ;
    schema:startDate "2024-01-15T10:00:00Z"^^xsd:dateTime ;
    schema:location "Conference Room A" .
```

## Working with RDF in JavaScript

### Using rdflib.js

```javascript
import { graph, sym, lit, Namespace, parse } from 'rdflib'

// Create a store
const store = graph()

// Define namespaces
const FOAF = Namespace('http://xmlns.com/foaf/0.1/')
const RDF = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')

// Create nodes
const alice = sym('https://alice.example/profile/card#me')
const name = lit('Alice Smith')

// Add triple
store.add(alice, FOAF('name'), name, alice.doc())

// Query
const aliceName = store.any(alice, FOAF('name'))
console.log(aliceName.value)  // "Alice Smith"
```

### Parsing Turtle

```javascript
const turtle = `
  @prefix foaf: <http://xmlns.com/foaf/0.1/> .
  <#me> a foaf:Person ; foaf:name "Alice" .
`

const store = graph()
parse(turtle, store, 'https://alice.example/profile/card', 'text/turtle')
```

### Querying

```javascript
// Single value
const name = store.any(subject, FOAF('name'), null, doc)

// All values
const friends = store.each(subject, FOAF('knows'), null, doc)

// Check existence
const isPerson = store.holds(subject, RDF('type'), FOAF('Person'))

// Match patterns
const statements = store.match(subject, null, null, doc)
```

## Named Graphs

RDF statements can be organized into named graphs:

```javascript
// Fourth element is the graph (document)
store.add(alice, FOAF('name'), lit('Alice'), alice.doc())

// Query within a specific graph
const name = store.any(alice, FOAF('name'), null, alice.doc())
```

## Document vs Fragment

In Solid, a document can contain multiple subjects:

```
https://alice.example/profile/card      # The document
https://alice.example/profile/card#me   # Alice (fragment)
https://alice.example/profile/card#key  # Her public key (fragment)
```

```javascript
const doc = sym('https://alice.example/profile/card')
const alice = sym('https://alice.example/profile/card#me')

// Load the document
await store.fetcher.load(doc)

// Query Alice's data
const name = store.any(alice, FOAF('name'), null, doc)
```

## See Also

- [rdflib.js Documentation](/libraries/rdflib)
- [W3C RDF Primer](https://www.w3.org/TR/rdf11-primer/)
- [Turtle Specification](https://www.w3.org/TR/turtle/)
