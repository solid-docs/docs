---
sidebar_position: 4
title: solid-ui
description: Web components and widgets for SolidOS 3.1 (solid-ui 5.1.0)
---

# solid-ui

solid-ui is the user interface library of SolidOS. SolidOS 3.1 (mashlib 3.1.0) uses **solid-ui 5.1.0**. It has two layers:

- **Web components** built with [Lit](https://lit.dev/), all named `solid-ui-…`. The 3.1 header, login dialog, file explorer and sharing dialog are made from them.
- **The older widget library**: functions that build DOM elements (`UI.widgets`, `UI.tabs`, `UI.table`, `UI.acl`, …). The built-in panes still use it.

Browse the components in the [solid-ui Storybook](https://solidos.github.io/solid-ui/examples/storybook/) and the functions in the [API reference](https://solidos.github.io/solid-ui/docs/api/).

## Loading it

### In a page that runs SolidOS

mashlib sets the global `UI` to the whole `solid-ui` module and registers most components. These are **not** registered by the mashlib 3.1 bundle: `solid-ui-guard`, `solid-ui-rdf-form`, `solid-ui-rdf-input`, `solid-ui-select` and `solid-ui-select-option`.

### From npm

```bash
npm install solid-ui@5.1.0 solid-logic@6.2.0 rdflib@2.4.1
```

| Import | What you get |
|---|---|
| `import * as UI from 'solid-ui'` | The functions and namespaces listed under [Exports](#exports) |
| `import 'solid-ui/components'` | Registers every component |
| `import 'solid-ui/components/button'` | Registers one component (any folder name from the table below) |
| `import 'solid-ui/theme.css'` | The design tokens (`--solid-ui-*` custom properties) and font |
| `import 'solid-ui/breakpoints.css'` | The `--solid-ui-mobile` custom media query (`max-width: 48rem`) |

### From a CDN, with no build step

The package also ships self-contained browser bundles: `dist/components.js` for every component and `dist/components/<name>.js` for one. This page uses no other script:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://unpkg.com/solid-ui@5.1.0/dist/theme.css">
  <script type="module" src="https://unpkg.com/solid-ui@5.1.0/dist/components.js"></script>
</head>
<body>
  <solid-ui-provider>
    <solid-ui-account></solid-ui-account>
    <solid-ui-guard>
      <span slot="initializing">Checking your session</span>
      <solid-ui-login-button slot="guest"></solid-ui-login-button>
      <p>You are logged in.</p>
    </solid-ui-guard>
    <solid-ui-button variant="secondary">Save</solid-ui-button>
    <solid-ui-select label="Role" name="role" id="role">
      <solid-ui-select-option value="viewer">Viewer</solid-ui-select-option>
      <solid-ui-select-option value="editor">Editor</solid-ui-select-option>
    </solid-ui-select>
    <solid-ui-combobox label="Identity provider" id="issuer">
      <solid-ui-combobox-option value="https://solidcommunity.net">Solid Community</solid-ui-combobox-option>
      <solid-ui-combobox-option value="https://solidweb.org">Solid Web</solid-ui-combobox-option>
    </solid-ui-combobox>
    <solid-ui-input label="Name" name="name" id="name"></solid-ui-input>
    <solid-ui-error-state title="Could not load" message="The server answered 404."></solid-ui-error-state>
  </solid-ui-provider>
  <script type="module">
    document.getElementById('role').addEventListener('change', e => console.log(e.detail.option))   // { value, label }
    document.getElementById('issuer').addEventListener('change', e => console.log(e.target.value))
    document.getElementById('name').addEventListener('input', e => console.log(e.target.value))
  </script>
</body>
</html>
```

![The page above in a browser while logged out: Log In and Sign Up from solid-ui-account, a Log In button from the guard, a Save button, Role and Identity provider dropdowns, a Name field and an error panel](/img/libraries/solid-ui-components-standalone.png)

## The provider

`<solid-ui-provider>` holds the login state for the components inside it, and renders the place where dialogs open. Put it around everything that uses the components below. In the SolidOS data browser it is already there, wrapping the whole page.

| Attribute | Property | Default | Meaning |
|---|---|---|---|
| `signupurl` | `signupUrl` | `https://solidproject.org/get_a_pod` | Where Sign Up sends the user (opened in a new tab) |

The provider reads the session from solid-logic (`authn.checkUser()`), so login state is the same as `SolidLogic.authSession`.

## Components

All tag names, attributes and events below are taken from `src/components/` in solid-ui 5.1.0. Lowercase or hyphenated names are HTML attributes. Names marked "property" are set from JavaScript (`element.menuItems = [...]`).

### Account and login

| Element | Attributes and properties | Events and slots |
|---|---|---|
| `solid-ui-account` | `menuItems` (property): array of `{ label, href?, selected?, onSelected? }` added to the account menu | Logged out: shows Log In and Sign Up. Logged in: the user's avatar opens a menu with your items and Sign out. Sets `data-state-initializing` and `data-state-loggedin` on itself. |
| `solid-ui-login-button` | none | Slot `trigger` replaces the button, or put text in the default slot. A click, or calling `.click()`, opens the login dialog. |
| `solid-ui-logout-button` | none | Same slots. Logs out with `authSession.logout()`. |
| `solid-ui-signup-button` | none | Same slots. Opens the provider's `signupUrl`. |
| `solid-ui-login-modal` | `issuerurl` / `issuerUrl` | The "Select an identity provider" dialog. The field starts with the last issuer used (localStorage `loginIssuer`), then `issuerUrl`, then the first of `getSuggestedIssuers()`. |
| `solid-ui-avatar` | none | The logged-in user's picture (from `sioc:avatar`, `foaf:img`, `vcard:logo`, `vcard:hasPhoto`, `vcard:photo` or `foaf:depiction`), or a person icon. Sets `data-state-fallback` when there is no picture. |
| `solid-ui-guard` | none | Slot `initializing` while the session is checked, slot `guest` when logged out, default slot when logged in. |

![The login dialog of SolidOS 3.1: "Select an identity provider", a "Solid Identity Provider" field, and Cancel and Login buttons](/img/libraries/login-modal.png)

### Form controls

`solid-ui-input`, `solid-ui-select`, `solid-ui-combobox` and `solid-ui-photo-capture` are form-associated: inside a `<form>` they submit under their `name`. They share these attributes:

| Attribute | Property | Meaning |
|---|---|---|
| `label` | `label` | Visible label |
| `sr-only-label` | `srOnlyLabel` | Keep the label for screen readers only |
| `name` | `name` | Form field name |
| | `value` | Current value |
| `placeholder` | `placeholder` | Placeholder text |
| `required` | `required` | Required field |
| `disabled` | `disabled` | Disabled |

Each fires `input` when its value changes.

| Element | Its own attributes and properties | Events |
|---|---|---|
| `solid-ui-button` | `variant`: `primary` (default), `secondary`, `tertiary`, `outline`, `ghost`; `type`: `button` (default), `submit`, `reset`; `disabled`; `loading` (shows a spinner and disables) | Native `click`. Slots `left-icon`, `icon`, `right-icon` and the default slot for the text. |
| `solid-ui-input` | `type` (default `text`), `readonly` | `input` |
| `solid-ui-select` | `options` (property): `[{ value, label }]`, or `solid-ui-select-option` children with a `value` attribute | `change`, with `event.detail.option` = `{ value, label }` |
| `solid-ui-combobox` | `select-only`, `readonly`; options from `solid-ui-combobox-option` children (`value` attribute), or loaded while typing: `async-options-url`, `async-options-results-field`, `async-options-label-field`, `async-options-value-field`, or `asyncOptionsProvider` (property, `query => Promise<options>`); `optionsFallback` (property) | `change`, with `event.detail.option` |
| `solid-ui-photo-capture` | `label`, `heading`, `capture-label`, `confirm-label`, `retake-label`, `cancel-label`, `facing-mode` (default `user`), `constraints`, `capture-format` (default `image/png`), `capture-quality`, `show-cancel-button`, `file-name-prefix`; `mediaConstraints` (property) | Opens a camera dialog. After a photo is accepted, `value` is a `File` and `input` fires. |

### Menus, dialogs and messages

| Element | Attributes and properties | Events and slots |
|---|---|---|
| `solid-ui-menu` | `placement` (default `bottom-start`), `distance` (default `5`) | Slot `trigger` for the opening control; `solid-ui-menu-item` children |
| `solid-ui-menu-item` | `href`, `selected` | Fires `solid-ui-select` when chosen |
| `solid-ui-dialog` | `title` | The frame of a dialog. Put `solid-ui-dialog-content` and `solid-ui-dialog-footer` inside (`solid-ui-dialog-header` is added from `title`). Used inside a dialog component opened with `showDialog`. |
| `solid-ui-error-state` | `title`, `message` | Default slot for more content. Fires `close` when its close button is pressed. |
| `solid-ui-solid-emblem` | none | The Solid logo |

### SolidOS parts

These are what the 3.1 data browser is built from. You meet them when you read the outline's DOM or write a pane that works inside the file explorer.

| Element | Attributes and properties | Notes |
|---|---|---|
| `solid-ui-access-control-modal` | `subjectUri`, `accessGrants` (properties) | The newer "Manage Access" dialog. In 3.1 no control opens it; the header's Manage Access controls open the Sharing pane. Open it with `showDialog`; see [Access control](../cookbook/access-control.md). |
| `solid-ui-file-explorer-provider` | `context`, `subjectUri`, `pane`, `relevantPanes`, `soloPane` (properties) | Wraps each pane the outline renders. Listens for the events below. |
| `solid-ui-file-explorer-header` | `menuItems`, `paneIcon` (properties), `showBack` | The header above a pane: name, back button, pane menu. Fires `solid-ui-file-explorer-back` and `solid-ui-file-explorer-open-pane`. |
| `solid-ui-resource-actions-menu` | `store`, `handleAccessClick`, `handleEditingClick`, `menuItems` (properties), `subjectUri`, `paneSupportsEditing`, `canEdit`, `canManageAccess`, `isMobile`, `show-access-in-menu` | The "more" menu of a resource |
| `solid-ui-rdf-form` | `formurl` / `formUrl`, `subjecturl` / `subjectUrl`; `passedInStore` (property) | Renders a `ui:Form` for a subject, field by field with `solid-ui-rdf-input`. Not registered by the mashlib 3.1 bundle. |
| `solid-ui-dialogs-root`, `solid-ui-dialog-provider` | | Rendered by the provider to host dialogs |

The file explorer event names are exported as `UI.FILE_EXPLORER_BACK_EVENT` (`solid-ui-file-explorer-back`), `UI.FILE_EXPLORER_OPEN_PANE_EVENT` (`solid-ui-file-explorer-open-pane`, detail `{ subjectUri, paneName }`) and `UI.FILE_EXPLORER_MANAGE_ACCESS_EVENT` (`solid-ui-file-explorer-manage-access`, detail `{ subjectUri }`). `UI.isExplorerEvent(event, provider)` tells whether an event came from that provider rather than a nested one.

## Opening a dialog from code

`UI.showDialog(DialogClass, { props, onClose })` creates the element, assigns `props` to it, and opens it in the `solid-ui-dialogs-root` that `solid-ui-provider` renders. It returns the element. In a running SolidOS page, get the class of a registered component with `customElements.get`:

```js
const LoginModal = customElements.get('solid-ui-login-modal')
UI.showDialog(LoginModal)
```

The same works for a login button added to the page:

```js
const button = document.createElement('solid-ui-login-button')
button.textContent = 'Log in to see your files'
document.querySelector('solid-ui-provider').appendChild(button)
```

To write your own dialog, extend `UI.DialogComponent` and call `this.close(result)`; `onClose(result)` then receives the result. The Dialogs story in the [Storybook](https://solidos.github.io/solid-ui/examples/storybook/) has a TypeScript example.

## Exports

`UI` (the default entry) exports:

| Name | What it is |
|---|---|
| `widgets` | DOM-building widgets: `button(dom, iconURI, text, handler, options)`, `linkButton`, `deleteButtonWithCheck`, `errorMessageBlock(dom, err)`, `setName(element, thing)`, `setImage(element, thing)`, `personTR`, `renderAsDiv`, `attachmentList`, `appendForm`, `editFormButton`, `field` (a map of form field renderers keyed by field class URI), `PeoplePicker`, `uploadFiles`, `makeDraggable`, `makeDropTarget`, and more |
| `tabs` | `tabWidget(options)` and `TabWidgetElement` |
| `table` | The table view renderer |
| `login` | Older login helpers: `ensureLoggedIn`, `ensureLoadedProfile`, `ensureLoadedPreferences`, `getUserRoles`, `filterAvailablePanes`, `loginStatusBox`, `selectWorkspace`, `newAppInstance`, `findAppInstances`, `registrationControl`, `registrationList`, … |
| `acl`, `aclControl` | Older ACL helpers (`getACL`, `readACL`, `putACLbyCombo`, …) and the `ACLControlBox5` editor used by the Sharing pane |
| `style` | Inline CSS strings used by the widgets (`style.primaryButton` is a string, not a function) |
| `icons` | `iconBase` and `originalIconBase`: the URL prefix of the icon set |
| `ns` | Namespace functions: `UI.ns.foaf('name')`, `UI.ns.vcard('fn')`, `UI.ns.ui('Form')`, … |
| `utils` | `label(thing)`, `shortName`, `escapeForXML`, `genUuid`, … |
| `log` | `msg`, `info`, `warn`, `error`, `success`, `debug`, `setLevel`, `LogLevel` |
| `create`, `createTypes`, `media`, `matrix`, `messageArea`, `infiniteMessageArea`, `pad`, `participation`, `preferences`, `language` | Larger widgets and helpers used by built-in panes |
| `initHeader`, `initFooter` | The older DOM header and footer |
| `dom` | `window.document` in a browser |
| `showDialog`, `Dialog`, `DialogComponent`, `ShowDialogEvent`, `CloseDialogEvent`, `dialogContext`, `DEFAULT_DIALOG_CONTEXT` | Dialog system |
| `SolidAuth`, `NoopAuth`, `Account`, `authContext`, `DEFAULT_AUTH_CONTEXT`, `DEFAULT_SIGNUP_URL` | The login state the provider shares with the components |
| `WebComponent`, `FormControlComponent`, `FormControlTrait`, `DialogTrait`, `customElement`, `generateId` | Base classes for writing components |
| `composeExplorer`, `fileExplorerContext`, `DEFAULT_FILE_EXPLORER_CONTEXT`, `getRelevantPanes`, `getPreferredPane`, `preparePaneMenuItems`, `isExplorerEvent`, `FILE_EXPLORER_*_EVENT` | File explorer helpers used by solid-panes and folder-pane |
| `CodeEditor` | The source editor used by the source pane |

### Using the widgets

The widget functions take the document as their first argument and return an element:

```js
const btn = UI.widgets.button(document, UI.icons.iconBase + 'noun_66617.svg', 'Meeting', () => console.log('clicked'))
const err = UI.widgets.errorMessageBlock(document, 'Could not load the file')

const me = $rdf.sym('https://testingsolidos.solidcommunity.net/profile/card#me')
await SolidLogic.store.fetcher.load(me.doc())
const span = document.createElement('span')
UI.widgets.setName(span, me)          // fills in the person's name
UI.utils.label(me)                    // 'Testing SolidOS Test'

const tabs = UI.tabs.tabWidget({
  dom: document,
  items: [$rdf.sym('https://example.org/a'), $rdf.sym('https://example.org/b')],
  renderMain: (main, subject) => { main.textContent = 'Body of ' + subject.uri }
})
```

These widgets style themselves with inline CSS from `UI.style`, so the theme tokens below do not change them.

## Design tokens

`theme.css` defines custom properties on `:root`. Override them to change the components:

```css
:root {
  --solid-ui-color-primary: #00695c;
}
```

| Group | Properties |
|---|---|
| Brand | `--solid-ui-color-primary` (`#7c4dff`), `--solid-ui-color-primary-hover`, `--solid-ui-color-primary-selected`, `--solid-ui-color-tertiary`, `--solid-ui-color-error`, `--solid-ui-color-white` |
| Palette | `--solid-ui-color-gray-50` … `-900`, `--solid-ui-color-slate-*`, `--solid-ui-color-zinc-*`, `--solid-ui-color-lavender-*`, `--solid-ui-color-pink-*`, `--solid-ui-color-red-*`, `--solid-ui-color-violet-50`, `--solid-ui-color-blue-900`, `--solid-ui-color-neutral-50`, `--solid-ui-color-body-grey` |
| Type | `--font-family-ui` (Atkinson Hyperlegible Next), `--solid-ui-font-size-xs` … `-2xl` |
| Size | `--solid-ui-clickable-area` (`42px`) |

The data browser's own colours, dark mode and mobile layout are covered in [Theming](../reference/theming.md).

## See also

- [solid-logic](./solid-logic.md): the session and store the components use
- [pane-registry](./pane-registry.md) and [Your first pane](../getting-started/your-first-pane.md)
- [Authentication](../cookbook/authentication.md) and [Access control](../cookbook/access-control.md)
- Source: [github.com/SolidOS/solid-ui](https://github.com/SolidOS/solid-ui), components in [src/components](https://github.com/SolidOS/solid-ui/tree/main/src/components)
