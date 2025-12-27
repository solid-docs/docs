---
sidebar_position: 4
title: Contributing
description: How to contribute to SolidOS
---

# Contributing to SolidOS

We welcome contributions to SolidOS! This guide explains how to get started.

## Ways to Contribute

- **Bug reports** — Found a bug? Open an issue
- **Feature requests** — Have an idea? Start a discussion
- **Documentation** — Improve or add docs
- **Code** — Fix bugs or add features
- **Panes** — Create new panes for data types
- **Testing** — Add tests or improve coverage
- **Reviews** — Review pull requests

## Getting Started

### 1. Fork and Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/solidos.git
cd solidos
```

### 2. Install Dependencies

```bash
npm install
npm run setup
```

This bootstraps the monorepo with Lerna.

### 3. Build

```bash
npm run build
```

### 4. Run Development Server

```bash
npm start
```

Visit `http://localhost:8080` to see SolidOS running.

## Project Structure

```
solidos/
├── packages/
│   ├── mashlib/         # Main bundle
│   ├── solid-panes/     # Pane collection
│   ├── solid-ui/        # UI components
│   ├── solid-logic/     # Business logic
│   └── pane-registry/   # Pane management
├── documentation/       # Developer guides
├── lerna.json          # Monorepo config
└── package.json
```

## Development Workflow

### Creating a Branch

```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/issue-123
```

### Making Changes

1. Make your changes
2. Write/update tests
3. Run tests: `npm test`
4. Build: `npm run build`
5. Test manually in the browser

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new contacts export feature
fix: resolve login redirect issue
docs: update pane creation guide
refactor: simplify store initialization
test: add tests for ACL handling
chore: update dependencies
```

### Submitting a Pull Request

1. Push your branch:
   ```bash
   git push origin feature/my-feature
   ```

2. Open a PR on GitHub

3. Fill in the PR template:
   - Description of changes
   - Related issues
   - Testing done
   - Screenshots (for UI changes)

4. Wait for review

## Code Style

### TypeScript/JavaScript

```typescript
// Use TypeScript when possible
// Prefer functional patterns
// Document public APIs

/**
 * Fetches a resource and returns its label
 * @param uri - The resource URI
 * @returns The label or null if not found
 */
export async function getLabel(uri: string): Promise<string | null> {
  const subject = sym(uri)
  await store.fetcher.load(subject.doc())
  return store.any(subject, RDFS('label'), null, null)?.value ?? null
}
```

### Formatting

The project uses ESLint and Prettier:

```bash
# Check formatting
npm run lint

# Fix formatting
npm run lint:fix
```

### Testing

Write tests for new functionality:

```typescript
// __tests__/myFeature.test.ts
import { myFunction } from '../myFeature'

describe('myFunction', () => {
  test('handles basic case', () => {
    expect(myFunction('input')).toBe('expected')
  })

  test('handles edge case', () => {
    expect(myFunction(null)).toBeNull()
  })
})
```

Run tests:

```bash
npm test                    # All tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage
```

## Creating a Pane

See [Creating Panes](/docs/panes/creating-panes) for the full guide.

Quick checklist:
1. Create pane file in `solid-panes/src/`
2. Implement `name`, `label`, `render`
3. Register in `registerPanes.ts`
4. Add tests
5. Document the pane

## Documentation

Documentation lives in this site. To contribute:

1. Fork the docs repo
2. Edit Markdown files
3. Submit a PR

### Running Docs Locally

```bash
cd docs
npm install
npm start
```

### Writing Style

- Use clear, simple language
- Include code examples
- Add screenshots for UI features
- Link to related docs

## Review Process

### What We Look For

- **Code quality** — Clean, readable, maintainable
- **Tests** — New code should have tests
- **Documentation** — Update docs as needed
- **Performance** — Avoid regressions
- **Accessibility** — UI should be accessible
- **Security** — No vulnerabilities introduced

### Review Timeline

- Small PRs: 1-3 days
- Large PRs: 1-2 weeks
- Be patient — maintainers are volunteers

### Addressing Feedback

- Respond to all comments
- Push additional commits (don't force push)
- Mark resolved conversations

## Issue Guidelines

### Bug Reports

Include:
- SolidOS version
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/console errors

### Feature Requests

Include:
- Use case description
- Proposed solution
- Alternatives considered

## Community

### Getting Help

- [GitHub Discussions](https://github.com/SolidOS/solidos/discussions)
- [Solid Forum](https://forum.solidproject.org/)
- [Matrix Chat](https://matrix.to/#/#solid_solidos:gitter.im)

### Code of Conduct

Be respectful and inclusive. See the [Solid Code of Conduct](https://github.com/solid/process/blob/main/code-of-conduct.md).

## License

SolidOS is MIT licensed. By contributing, you agree that your contributions will be licensed under MIT.

## Recognition

Contributors are listed in the repository. Significant contributions may be highlighted in release notes.

## See Also

- [SolidOS GitHub](https://github.com/SolidOS)
- [Solid Project](https://solidproject.org/)
- [Architecture Overview](/docs/architecture/overview)
