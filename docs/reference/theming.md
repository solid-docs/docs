---
sidebar_position: 5
title: Theming
description: Customizing the look and feel of SolidOS
---

# Theming

SolidOS and mashlib can be customized to match your application's design.

## CSS Custom Properties

The SolidOS UI uses CSS custom properties for theming:

```css
:root {
  /* Primary colors */
  --solid-primary: #7C3AED;
  --solid-primary-dark: #6D28D9;
  --solid-secondary: #2563EB;

  /* Background */
  --solid-bg: #ffffff;
  --solid-bg-secondary: #f8fafc;

  /* Text */
  --solid-text: #1e293b;
  --solid-text-muted: #64748b;

  /* Borders */
  --solid-border: #e2e8f0;
  --solid-border-focus: #7C3AED;

  /* Status colors */
  --solid-success: #22c55e;
  --solid-warning: #f59e0b;
  --solid-error: #ef4444;
}
```

## Overriding Styles

### In Your Application

```html
<style>
  /* Override mashlib styles */
  .mash-container {
    --solid-primary: #0066cc;
    font-family: 'Your Font', sans-serif;
  }

  /* Custom pane styling */
  .profilePane {
    background: var(--solid-bg-secondary);
    border-radius: 8px;
    padding: 1rem;
  }
</style>
```

### Dark Mode

```css
@media (prefers-color-scheme: dark) {
  :root {
    --solid-bg: #0f172a;
    --solid-bg-secondary: #1e293b;
    --solid-text: #e2e8f0;
    --solid-text-muted: #94a3b8;
    --solid-border: #334155;
  }
}
```

## Mashlib Configuration

When embedding mashlib, you can customize its appearance:

```javascript
const options = {
  // Custom CSS to inject
  customCss: `
    .header { background: linear-gradient(135deg, #7C3AED, #2563EB); }
    .tabulator { font-size: 14px; }
  `,

  // Hide certain UI elements
  hideHeader: false,
  hideFooter: true,

  // Custom logo
  logo: '/my-logo.svg'
}

panes.runDataBrowser(document, subject, options)
```

## Component Styling

### Buttons

```css
.solid-button {
  background: var(--solid-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.solid-button:hover {
  background: var(--solid-primary-dark);
}

.solid-button--secondary {
  background: transparent;
  border: 1px solid var(--solid-border);
  color: var(--solid-text);
}
```

### Cards

```css
.solid-card {
  background: var(--solid-bg);
  border: 1px solid var(--solid-border);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### Forms

```css
.solid-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--solid-border);
  border-radius: 4px;
  font-size: 1rem;
}

.solid-input:focus {
  outline: none;
  border-color: var(--solid-border-focus);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}
```

## Pane-Specific Styling

### Profile Pane

```css
.profilePane .avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.profilePane .name {
  font-size: 1.5rem;
  font-weight: 600;
}
```

### Chat Pane

```css
.chatPane .message {
  padding: 0.75rem;
  margin: 0.5rem 0;
  border-radius: 12px;
  max-width: 70%;
}

.chatPane .message--mine {
  background: var(--solid-primary);
  color: white;
  margin-left: auto;
}

.chatPane .message--theirs {
  background: var(--solid-bg-secondary);
}
```

### Folder Pane

```css
.folderPane .file-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
}

.folderPane .file-item:hover {
  background: var(--solid-bg-secondary);
}

.folderPane .file-icon {
  width: 20px;
  height: 20px;
  margin-right: 0.5rem;
}
```

## Icons

SolidOS uses icons from solid-ui. You can customize or add your own:

```javascript
import { icons } from 'solid-ui'

// Use built-in icons
const folderIcon = icons.iconBase + 'noun_973694.svg'

// Use custom icons
const myIcon = 'https://mysite.example/icons/custom.svg'
```

## Typography

```css
.solid-heading {
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 600;
  color: var(--solid-text);
}

.solid-heading--1 { font-size: 2rem; }
.solid-heading--2 { font-size: 1.5rem; }
.solid-heading--3 { font-size: 1.25rem; }

.solid-text {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--solid-text);
}

.solid-text--muted {
  color: var(--solid-text-muted);
}
```

## Responsive Design

```css
/* Mobile-first approach */
.pane-container {
  padding: 1rem;
}

@media (min-width: 768px) {
  .pane-container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .pane-container {
    max-width: 1200px;
  }
}
```

## See Also

- [mashlib Documentation](/libraries/mashlib)
- [solid-ui Widgets](/libraries/solid-ui)
- [Creating Panes](/panes/creating-panes)
