---
sidebar_position: 5
title: Theming
description: Colours, dark mode and the mobile layout in SolidOS 3.1
---

# Theming

This page describes how SolidOS 3.1 (mashlib 3.1.0) handles colours, the light and dark theme, and the desktop and mobile layouts, and what a pane can read from them. Everything here was checked in the 3.1 data browser.

## Two sets of CSS custom properties

| Set | Defined in | Used by |
|---|---|---|
| `--solid-ui-color-*`, `--solid-ui-font-size-*`, `--font-family-ui`, `--solid-ui-clickable-area` | solid-ui `theme.css` | The `solid-ui-…` web components: header buttons, login dialog, menus, the sharing dialog |
| `--color-background`, `--color-text-*`, `--color-border-*`, `--color-surface-*`, `--color-header-*`, `--color-primary`, `--gray-*`, `--slate-*`, `--font-size-*`, `--border-radius-*`, `--spacing-*` and others | mashlib's stylesheet (`mash.css`, from `src/styles/themes/light.css`) | The data browser page and the built-in panes |

Both are set on `:root`. The full lists are in [solid-ui's theme.css](https://github.com/SolidOS/solid-ui/blob/main/src/styles/theme.css) and in mashlib's `src/styles/themes/light.css`. The solid-ui tokens are listed on the [solid-ui](../libraries/solid-ui.md#design-tokens) page.

## Changing colours

Override the properties in a stylesheet that loads after mashlib's, or on `:root` from script:

```css
:root {
  --solid-ui-color-primary: #00695c;   /* web components: buttons, focus, selection */
  --color-background: #fffbea;         /* the data browser page */
}
```

Run in the 3.1 data browser, this turned the primary `solid-ui-button` from `rgb(124, 77, 255)` to `rgb(0, 105, 92)` and the page background from `rgb(248, 249, 251)` to `rgb(255, 251, 234)`.

The web components use shadow DOM, so ordinary CSS selectors do not reach inside them; custom properties do. The older widgets from `UI.widgets` style themselves with inline CSS from `UI.style`, so neither set of properties changes them.

## Light and dark

mashlib keeps the theme as an attribute on `<html>`:

- `data-theme="dark"` for dark; no `data-theme` attribute for light.
- At start-up the theme comes from localStorage key `mashlib-theme` (`light` or `dark`). Without it, the browser's `prefers-color-scheme` decides.
- Each change fires `mashlib:themechange` on `window`, with `event.detail.theme`.

**In 3.1 the dark palette is not in the shipped stylesheet.** mashlib's `themes.css` imports `light.css` only (the import of `dark.css` is commented out). So `data-theme="dark"` is set, and passed to panes, but the data browser itself keeps its light colours. This includes browsers whose system setting is dark: they get `data-theme="dark"` and a light page.

3.1 has no menu item to switch theme. From the console, this does what mashlib's own switch does:

```js
localStorage.setItem('mashlib-theme', 'dark')
document.documentElement.setAttribute('data-theme', 'dark')
window.dispatchEvent(new CustomEvent('mashlib:themechange', { detail: { theme: 'dark' } }))
```

To go back, set `light` and remove the attribute (`document.documentElement.removeAttribute('data-theme')`).

## Desktop and mobile layout

mashlib sets these on `<html>` and keeps them up to date when the window is resized or the pointer type changes:

| Attribute or property | Values |
|---|---|
| `data-layout` | `desktop` or `mobile` |
| `data-layout-preference` | `auto`, `desktop` or `mobile` |
| `data-input-mode` | `pointer`, or `touch` when the primary pointer is coarse |
| `--app-height` | The window's inner height, in pixels |
| `--app-header-height` | Height of the header, set by the data browser page |

With the preference `auto` (the default), the layout is `mobile` when the window is 768 px wide or less. Store `mobile` or `desktop` in localStorage key `mashlib-layout` to fix it; remove the key to go back to `auto`. As with the theme, 3.1 has no menu item for this.

Each change fires `mashlib:layoutchange` on `window`:

```js
window.addEventListener('mashlib:layoutchange', e => console.log(e.detail))
// { inputMode: 'pointer', layout: 'mobile', preference: 'mobile', viewport: { height: 900, width: 1200 } }
```

In CSS, select on the attribute, as mashlib's own stylesheet does:

```css
html[data-layout="mobile"] .my-pane {
  padding: 0.5rem;
}
```

solid-ui also ships `solid-ui/breakpoints.css`, which defines the custom media query `--solid-ui-mobile` as `(max-width: 48rem)`. Custom media queries need a build step (for example PostCSS) to work in today's browsers.

## What a pane receives

`panes.runDataBrowser()` passes the theme and layout to every pane as `context.environment`:

```js
{
  layout: 'desktop',            // or 'mobile'
  layoutPreference: 'auto',     // or 'desktop', 'mobile'
  inputMode: 'pointer',         // or 'touch'
  theme: 'light',               // or 'dark'
  viewport: { width: 1300, height: 900 }
}
```

When the layout or theme changes, mashlib updates the environment (`panes.updateEnvironment`) and re-renders the open panes (`panes.refreshUI`). A folder view is not rebuilt when only the layout changes; it adapts through CSS.

This pane shows its environment, and was re-rendered with `theme dark` after the console switch above:

```js
const envPane = {
  name: 'envDemo',
  icon: UI.icons.iconBase + 'noun_66617.svg',
  label: (subject) => subject.uri.endsWith('/') ? 'Environment' : null,
  render: (subject, context) => {
    const div = context.dom.createElement('div')
    const env = context.environment
    div.textContent = env
      ? `layout ${env.layout}, theme ${env.theme}, input ${env.inputMode}`
      : 'no environment'
    return div
  }
}
panes.register(envPane)
```

Read `context.environment` with a fallback (`context.environment?.theme ?? 'light'`), as the built-in panes do: a page that renders panes without `runDataBrowser` may leave it out. Several built-in panes copy the values onto their own element, for example `element.dataset.layout = environment.layout`, and the profile pane and social pane set `data-theme` from `environment.theme`. A pane can do the same and style itself from those attributes.

## Icons

The web components draw [Lucide](https://lucide.dev/) icons as elements named `icon-lucide-…`. The older widgets and many panes use image files under `UI.icons.iconBase` (`https://solidos.github.io/solid-ui/src/icons/`).

## See also

- [solid-ui](../libraries/solid-ui.md): components and design tokens
- [pane-registry](../libraries/pane-registry.md): the `RenderEnvironment` type
- [mashlib](../libraries/mashlib.md): the data browser page and `runDataBrowser`
