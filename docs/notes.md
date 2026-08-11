# Env commands

```bash
awk -F '=' '{if ($1 ~ /^#/ || NF < 2) print $0; else print $1"=******"}' .env.local > .env.example
```

## Run multiple commands once:

```bash
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "validate": "pnpm lint && pnpm typecheck"}
```

```bash
pnpm validate
```
