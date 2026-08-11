# Git Commit Convention

This project follows the **Conventional Commits** style for writing clear, consistent, and meaningful Git commit messages.

## Commit Structure

```text
<type>: <short description>
```

Example:

```bash
git commit -m "feat: add transaction management"
```

---

## Example Commit History

A typical development history might look like this:

```text
chore: initialize Next.js project
chore: configure code formatting and linting
chore: configure git hooks

feat: add database configuration
feat: add authentication
feat: add user dashboard
feat: add transaction management
feat: add expense tracking

fix: handle invalid transaction input

refactor: extract transaction service

test: add transaction service tests
```

---

# Commit Types

| Type       | Purpose                                                                      |
| ---------- | ---------------------------------------------------------------------------- |
| `feat`     | Adds new functionality                                                       |
| `fix`      | Fixes a bug or incorrect behavior                                            |
| `refactor` | Restructures existing code without changing its behavior                     |
| `test`     | Adds or modifies tests                                                       |
| `docs`     | Adds or updates documentation                                                |
| `style`    | Formatting or style-only changes that don't affect application logic         |
| `chore`    | Maintenance, configuration, dependencies, tooling, or other non-feature work |

---

## `feat`

Use `feat` when adding **new functionality**.

```bash
git commit -m "feat: add transaction management"
```

```bash
git commit -m "feat: add authentication"
```

```bash
git commit -m "feat: add expense tracking"
```

---

## `fix`

Use `fix` when correcting a **bug or incorrect behavior**.

```bash
git commit -m "fix: handle invalid transaction input"
```

Another example:

```bash
git commit -m "fix: prevent duplicate transactions"
```

---

## `refactor`

Use `refactor` when restructuring code **without changing its external behavior**.

```bash
git commit -m "refactor: extract transaction service"
```

Another example:

```bash
git commit -m "refactor: simplify authentication middleware"
```

---

## `test`

Use `test` when adding, modifying, or improving tests.

```bash
git commit -m "test: add transaction service tests"
```

Another example:

```bash
git commit -m "test: add authentication integration tests"
```

---

## `docs`

Use `docs` for documentation changes.

```bash
git commit -m "docs: add API documentation"
```

```bash
git commit -m "docs: update authentication setup"
```

---

## `style`

Use `style` for changes that only affect formatting or code style and **do not change application behavior**.

```bash
git commit -m "style: format transaction components"
```

```bash
git commit -m "style: fix code formatting"
```

> Note: With Prettier handling formatting automatically, `style` commits may be relatively uncommon.

---

## `chore`

Use `chore` for project maintenance, configuration, tooling, and dependency-related changes that aren't application features or bug fixes.

```bash
git commit -m "chore: initialize Next.js project"
```

```bash
git commit -m "chore: configure code formatting and linting"
```

```bash
git commit -m "chore: configure git hooks"
```

Other examples:

```bash
git commit -m "chore: update dependencies"
```

```bash
git commit -m "chore: configure environment variables"
```

---

# Quick Reference

```text
feat      → new functionality
fix       → bug fix
refactor  → code restructuring
test      → tests
docs      → documentation
style     → formatting/style-only changes
chore     → maintenance/configuration
```

## Good Commit Message

```bash
git commit -m "feat: add transaction management"
```

### Why?

- `feat` → identifies the type of change
- `add transaction management` → clearly describes what changed
- Short and specific
- Easy to understand from Git history

## Avoid

```bash
git commit -m "update"
git commit -m "changes"
git commit -m "fix stuff"
git commit -m "new things"
git commit -m "final"
```

These messages provide little useful information when reviewing Git history.

---

# Recommended Rule

A commit should represent **one logical change**.

For example, instead of:

```text
add ESLint
add Prettier
add VS Code settings
add Husky
```

as four unrelated commits, if they were introduced as one tooling setup, use:

```bash
git commit -m "chore: configure code quality tooling"
```

Keep commits **small, logical, and atomic** whenever practical.
