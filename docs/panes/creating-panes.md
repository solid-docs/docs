---
sidebar_position: 3
title: Creating Panes
description: Build a pane that reads and writes pod data, try it in a running SolidOS, and test it
---

# Creating Panes

This guide builds a recipe pane for SolidOS 3.1. It shows a `schema:Recipe`, opens first for one, and lets a person who may write to the recipe add ingredients. It is one ES module with no build step and no imports. If you have not made a pane before, [Your First Pane](../getting-started/your-first-pane.md) is shorter; the full reference is [The Pane Contract](./pane-anatomy.md).

![The recipe pane in SolidOS 3.1, logged in: the recipe's name, how much it makes, four ingredients and a form to add one](/img/panes-dev/recipe-pane.png)

## 1. The data

A recipe in Turtle, saved on a pod as `recipe.ttl`:

```turtle title="recipe.ttl"
@prefix schema: <http://schema.org/> .

<#this> a schema:Recipe ;
    schema:name "Pancakes" ;
    schema:recipeYield "8 pancakes" ;
    schema:recipeIngredient "200 g flour", "2 eggs", "300 ml milk" .
```

The thing the pane shows is `recipe.ttl#this`.

## 2. The pane

```javascript title="recipe-pane.js"
// recipe-pane.js: shows a schema:Recipe and lets someone who can write to it add ingredients.
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
const SCHEMA = 'http://schema.org/'

export default {
  name: 'recipe',
  icon: new URL('recipe.svg', import.meta.url).href,

  label (subject, context) {
    const store = context.session.store
    const isRecipe = store.holds(subject, store.sym(RDF_TYPE), store.sym(SCHEMA + 'Recipe'), subject.doc())
    return isRecipe ? 'Recipe' : null
  },

  // Asked only when label() has accepted the subject: open first, rather than only in the menu.
  shouldGetFocus (subject) {
    return true
  },

  render (subject, context) {
    const { dom } = context
    const store = context.session.store
    const doc = subject.doc()
    const term = name => store.sym(SCHEMA + name)

    const root = dom.createElement('article')
    root.className = 'recipe-pane'
    const title = dom.createElement('h2')
    const makes = dom.createElement('p')
    const list = dom.createElement('ul')
    root.append(title, makes, list)

    function show () {
      title.textContent = store.anyValue(subject, term('name'), null, doc) || 'Untitled recipe'
      makes.textContent = 'Makes ' + (store.anyValue(subject, term('recipeYield'), null, doc) || '?')
      list.replaceChildren(...store.each(subject, term('recipeIngredient'), null, doc).map(ingredient => {
        const item = dom.createElement('li')
        item.textContent = ingredient.value
        return item
      }))
    }
    show()

    // Offer the form only when the server said this person may write the document.
    if (store.updater.editable(doc.uri)) {
      const form = dom.createElement('form')
      const input = dom.createElement('input')
      input.placeholder = 'Add an ingredient'
      const button = dom.createElement('button')
      button.textContent = 'Add'
      const status = dom.createElement('p')
      form.append(input, button, status)
      form.addEventListener('submit', async event => {
        event.preventDefault()
        const text = input.value.trim()
        if (!text) return
        button.disabled = true
        try {
          // $rdf is the rdflib the page already runs; the store is shared with every pane.
          await store.updater.update([], [$rdf.st(subject, term('recipeIngredient'), $rdf.lit(text), doc)])
          input.value = ''
          status.textContent = ''
          show()
        } catch (err) {
          status.textContent = 'Not saved: ' + err.message
        } finally {
          button.disabled = false
        }
      })
      root.appendChild(form)
    }
    return root
  }
}
```

Put an icon beside it as `recipe.svg`. `new URL('recipe.svg', import.meta.url)` finds it next to the module wherever the module is served from.

## 3. What each part does

**`label`** decides whether the pane is offered. It is called for every pane on every view, so it only looks in the store, which already holds the recipe's document. `store.holds(s, p, o, doc)` checks for one statement; the fourth argument limits the check to that document.

**`shouldGetFocus`** makes this pane the one shown for a recipe. Without it the pane is still offered in the pane menu, but the first relevant built-in pane would be shown. It is only asked of panes whose `label` accepted the subject, so returning `true` here means "for every recipe". See [how a pane is chosen](./overview.md#how-a-pane-is-chosen).

**`render`** builds the view from the store. `context.dom` is the document to create elements in; `context.session.store` is the rdflib store the whole page shares. `store.anyValue` returns the first matching value as a string, `store.each` all matching objects.

**Writing.** `store.updater.editable(uri)` returns a truthy value when the last response for the document said the current user may write it (on a Solid server, the `WAC-Allow` header). Logged out, it is false here and no form is shown. `store.updater.update(deletions, insertions)` sends the change to the server as a patch and, when it succeeds, applies it to the store; it returns a promise. Statements are made with `$rdf.st(subject, predicate, object, document)` and literals with `$rdf.lit(text)`, using the `$rdf` global described below.

After a successful update the pane calls `show()` again, which reads the new ingredient back from the store.

## 4. What a pane can use without importing

Take the store, the user and the document from `context`. Do not import `solid-logic`, `rdflib` or `solid-ui` into a pane you load at run time: on the official mashlib bundle a bare import such as `import('rdflib')` fails to resolve, and a second copy of a library would not share the page's store or login.

On a page running mashlib 3.1 these globals are also set:

| Global | What it is |
|---|---|
| `$rdf` | rdflib |
| `SolidLogic` | solid-logic (`SolidLogic.solidLogicSingleton`, `SolidLogic.authn`, …) |
| `UI` | solid-ui (`UI.widgets`, `UI.icons`, …). See [solid-ui](../libraries/solid-ui.md). |
| `panes` | solid-panes, plus mashlib's `runDataBrowser`. See [solid-panes](../libraries/solid-panes.md). |
| `mashlib` | `{ versionInfo }` |

From `context.session.logic` (solid-logic) a pane can also read who is logged in, with `context.session.logic.authn.currentUser()`, which returns the WebID as a `NamedNode` or `null`.

## 5. Try it in a running SolidOS

Serve `recipe-pane.js`, `recipe.svg` and `recipe.ttl` from anywhere the browser can fetch them as JavaScript with cross-origin access allowed, such as a folder on your pod or GitHub Pages ([details](./dynamic-panes.md#serving-a-pane-module)). Open SolidOS 3.1, for example the [SolidOS Browser](https://solidos.org/docs/browser/) or your pod's own data browser, and in the browser console run:

```javascript
const pane = (await import('https://alice.example/public/panes/recipe-pane.js')).default
panes.register(pane)
panes.getOutliner(document).GotoSubject($rdf.sym('https://alice.example/public/recipes/recipe.ttl#this'), true, undefined, true)
```

`panes.register` adds the pane to the registry, and `GotoSubject` shows the recipe again so that the new pane is considered. Because of `shouldGetFocus`, the recipe pane is now the view shown. Log in to see the form; the ingredient you add is written to `recipe.ttl`.

## 6. Test `label` without a browser

`label` reads only `context.session.store`, so a store of your own is enough to test it. With rdflib installed (`npm install rdflib`) and `"type": "module"` in your `package.json`, Node's built-in test runner runs this with `node --test`:

```javascript title="recipe-pane.test.js"
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { graph, sym, lit } from 'rdflib'
import recipePane from './recipe-pane.js'

const RDF_TYPE = sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
const SCHEMA = 'http://schema.org/'

// label() reads only context.session.store, so a store of your own is enough.
function contextWith (store) {
  return { session: { store } }
}

test('offers itself for a recipe', () => {
  const store = graph()
  const pancakes = sym('https://alice.example/recipes/pancakes.ttl#this')
  store.add(pancakes, RDF_TYPE, sym(SCHEMA + 'Recipe'), pancakes.doc())
  store.add(pancakes, sym(SCHEMA + 'name'), lit('Pancakes'), pancakes.doc())
  assert.equal(recipePane.label(pancakes, contextWith(store)), 'Recipe')
})

test('stays out of the way for anything else', () => {
  const store = graph()
  const note = sym('https://alice.example/notes/today.ttl#this')
  store.add(note, RDF_TYPE, sym(SCHEMA + 'NoteDigitalDocument'), note.doc())
  assert.equal(recipePane.label(note, contextWith(store)), null)
})
```

`render` needs a DOM and the page's globals; test it in the browser as in step 5.

## 7. Ship it

- **As a dynamic pane** (no fork, no rebuild): publish the module and load it with `panes.register`, JSS `--panes`, or a `?pane=` link to the SolidOS Browser. See [Dynamic Panes](./dynamic-panes.md).
- **As a built-in pane**: built-in panes are imported and registered in solid-panes' [`src/registerPanes.js`](https://github.com/SolidOS/solid-panes/blob/main/src/registerPanes.js), where the order of the `register` calls is the order of preference. That needs a solid-panes release and a mashlib build. Larger panes are published as their own npm packages (folder-pane, contacts-pane and others) and imported there.

## Style the pane

The pane's element is placed in the page's own DOM, so page styles reach it and its styles reach the page. Give the root element a class of its own (`recipe-pane` here) and start every rule with it. [Dynamic Panes](./dynamic-panes.md#styling) shows a pane with its own stylesheet that follows the light and dark themes.

## See also

- [The Pane Contract](./pane-anatomy.md): every pane field and the context
- [Navigation](./navigation.md): linking from a pane to other things
- [Writing Data](../cookbook/writing-data.md): more on updating pod data
- [rdflib](../libraries/rdflib.md): the store, fetcher and updater
