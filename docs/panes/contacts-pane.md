---
sidebar_position: 4
title: Contacts Pane
description: Contact cards and address books
---

# Contacts Pane

The contacts pane renders vCard data — individual contacts and address books.

## What It Renders

- `vcard:Individual` — Single contact
- `vcard:AddressBook` — Collection of contacts
- `vcard:Group` — Contact groups

## Features

- Contact card display
- Photo/avatar support
- Multiple phone/email
- Address formatting
- Organization info
- Social links
- Add/edit contacts
- Import/export vCards

## Screenshot

![Contacts Pane Mockup](/img/panes/contacts-pane-mockup.svg)

Individual contacts display with avatar, contact details, and action buttons.

## RDF Structure

### Individual Contact

```turtle
@prefix vcard: <http://www.w3.org/2006/vcard/ns#> .

<#me>
    a vcard:Individual ;
    vcard:fn "Alice Smith" ;
    vcard:hasName [
        vcard:given-name "Alice" ;
        vcard:family-name "Smith"
    ] ;
    vcard:hasEmail <mailto:alice@example.org> ;
    vcard:hasTelephone [
        a vcard:Cell ;
        vcard:value <tel:+1-555-123-4567>
    ] ;
    vcard:hasAddress [
        vcard:street-address "123 Main St" ;
        vcard:locality "City" ;
        vcard:country-name "Country"
    ] ;
    vcard:hasPhoto <photo.jpg> ;
    vcard:organization-name "Acme Corp" ;
    vcard:role "Software Engineer" ;
    vcard:url <https://alice.example> .
```

### Address Book

```turtle
@prefix vcard: <http://www.w3.org/2006/vcard/ns#> .

<#addressbook>
    a vcard:AddressBook ;
    vcard:fn "My Contacts" ;
    vcard:hasMember
        <alice.ttl#me>,
        <bob.ttl#me>,
        <carol.ttl#me> .
```

## Usage

```javascript
// Navigate to a contact
panes.runDataBrowser(document, sym('https://alice.example/contacts/alice.ttl#me'))

// Get the pane directly
const contactsPane = paneRegistry.byName('contacts')
```

## Creating Contacts

### Programmatically

```javascript
import { store, sym, lit, st } from 'solid-logic'

const VCARD = Namespace('http://www.w3.org/2006/vcard/ns#')

const contact = sym('https://alice.example/contacts/bob.ttl#me')
const doc = contact.doc()

// Create the contact
const statements = [
  st(contact, RDF('type'), VCARD('Individual'), doc),
  st(contact, VCARD('fn'), lit('Bob Jones'), doc),
  st(contact, VCARD('hasEmail'), sym('mailto:bob@example.org'), doc),
]

await store.updater.update([], statements)
```

### Via UI

The contacts pane provides an "Add Contact" form:

1. Navigate to an address book
2. Click "Add Contact"
3. Fill in the form
4. Click "Save"

## Address Book Operations

### List Contacts

```javascript
const addressBook = sym('https://alice.example/contacts/index.ttl#addressbook')
await store.fetcher.load(addressBook)

const contacts = store.each(addressBook, VCARD('hasMember'), null, null)
for (const contact of contacts) {
  await store.fetcher.load(contact.doc())
  const name = store.any(contact, VCARD('fn'), null, null)
  console.log(name?.value)
}
```

### Add to Address Book

```javascript
const newContact = sym('https://alice.example/contacts/new.ttl#me')

await store.updater.update(
  [],
  [st(addressBook, VCARD('hasMember'), newContact, addressBook.doc())]
)
```

## vCard Import/Export

### Export to vCard

```javascript
// The pane provides export functionality
// Export format: .vcf file
```

Example vCard output:

```
BEGIN:VCARD
VERSION:4.0
FN:Alice Smith
EMAIL:alice@example.org
TEL:+1-555-123-4567
END:VCARD
```

### Import from vCard

The pane can import .vcf files:

1. Click "Import"
2. Select .vcf file
3. Review contacts
4. Confirm import

## Type Index Integration

Contacts are typically registered in the Type Index:

```turtle
# In private type index
<#contacts>
    a solid:TypeRegistration ;
    solid:forClass vcard:AddressBook ;
    solid:instance </contacts/index.ttl#addressbook> .
```

### Finding Address Books

```javascript
import { typeIndex } from 'solid-logic'

const addressBooks = await typeIndex.findByType(VCARD('AddressBook').uri)
// Returns array of address book URIs
```

## Groups

Organize contacts into groups:

```turtle
<#family>
    a vcard:Group ;
    vcard:fn "Family" ;
    vcard:hasMember
        <mom.ttl#me>,
        <dad.ttl#me>,
        <sister.ttl#me> .
```

## Photos

Contact photos can be:

- Linked: `vcard:hasPhoto <photo.jpg>`
- Embedded: Base64 in the RDF (not recommended)

```javascript
// Get photo URL
const photo = store.any(contact, VCARD('hasPhoto'), null, null)
if (photo) {
  const img = document.createElement('img')
  img.src = photo.uri
}
```

## Customization

### Custom Fields

Add custom properties using vcard extensions:

```turtle
<#me>
    a vcard:Individual ;
    vcard:fn "Alice" ;
    # Custom field
    ex:mastodon "@alice@mastodon.social" .
```

### Styling

Override default styles:

```css
.contact-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.contact-card .avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}
```

## Source

- [contactPane.js in solid-panes](https://github.com/SolidOS/solid-panes/tree/main/src/contact)

## See Also

- [vCard Ontology](https://www.w3.org/TR/vcard-rdf/) — W3C specification
- [Type Index](/docs/libraries/solid-logic#type-index) — finding address books
