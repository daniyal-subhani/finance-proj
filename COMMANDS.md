# Project Commands

> A collection of useful commands for setting up, developing, testing, and maintaining the Finance Project.

---

# 🚀 Project Setup

## Create Next.js Project

```bash
bunx create-next-app@latest finance-proj
```

## Install Dependencies

```bash
bun install
```

## Start Development Server

```bash
bun run dev
```

## Production Build

```bash
bun run build
```

## Start Production Server

```bash
bun run start
```

---

# 🧹 Code Quality

## Run ESLint

```bash
bun run lint
```

## Format Project

```bash
bun run format
```

## Check Formatting

```bash
bun run format:check
```

## Type Check

```bash
bun run typecheck
```

## Run All Checks

```bash
bun run lint && bun run format:check && bun run typecheck
```

---

# 🪝 Git Hooks

## Initialize Husky

```bash
bunx husky init
```

## Install Git Hooks

```bash
bun run prepare
```

## Run lint-staged Manually

```bash
bunx lint-staged
```

---

# 🔐 Environment Variables

## Create `.env.example`

Do **not** copy real secrets from `.env` into `.env.example`.

Instead, create a template manually:

```env
DATABASE_URL=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
```

For secrets, use placeholders:

```env
DATABASE_PASSWORD=your_database_password
API_SECRET=your_api_secret
```

### Important

Never commit:

```text
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

Make sure they are included in `.gitignore`.

---

# Drizzle ORM

## Install pkgs - Dependencies

```bash
bun add drizzle-orm@rc pg dotenv
```

## Dev Dependencies

```bash
bun add -D drizzle-kit@rc tsx @types/pg
```

## Setup connection variables

```bash
DATABASE_URL=
```

## Initialization:

```bash
db/
  |--- index.ts ,
  |--- schema.ts
```

```bash
in-root: drizzle.config.ts
```

## Commands:

```bash
add in package.json: [
"db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push ",
    "db:studio": "drizzle-kit studio"
    ]
```

---

# 🗄️ Database

## Database Setup

```bash
npm install @neondatabase/serverless
```

## Generate Database Client

```bash
"db:generate": "drizzle-kit generate",
```

## Run Database Migration

```bash
    "db:migrate": "drizzle-kit migrate",
```

## Push Database

```bash
 "db:push": "drizzle-kit push ",
```

---

# 🔑 Authentication

## Authentication Setup

```bash
# Add authentication setup command here
```

## Generate Authentication Secret

```bash
# Add command here
```

---

# 🎨 shadcn/ui

## Initialize shadcn

```bash
bunx shadcn@latest init
```

## Add a Component

```bash
bunx shadcn@latest add button
```

## Add Multiple Components

```bash
bunx shadcn@latest add button card dialog input
```

---

# 🎨 Tailwind CSS

## Install Tailwind CSS

```bash
bun add -D tailwindcss @tailwindcss/postcss
```

---

# 📦 Dependencies

## Install Production Dependency

```bash
bun add <package>
```

Example:

```bash
bun add zod
```

## Install Development Dependency

```bash
bun add -d <package>
```

Example:

```bash
bun add -d prettier
```

## Remove Dependency

```bash
bun remove <package>
```

## Update Dependencies

```bash
bun update
```

---

# 🌿 Git

## Check Status

```bash
git status
```

## Create Branch

```bash
git switch -c feature/<feature-name>
```

## Switch Branch

```bash
git switch <branch-name>
```

## Stage Changes

```bash
git add .
```

## Commit

```bash
git commit -m "feat: add transaction management"
```

## Push Current Branch

```bash
git push
```

## Push New Branch

```bash
git push -u origin <branch-name>
```

## Pull Latest Changes

```bash
git pull
```

---

# 📝 Commit Convention

```text
feat      → new functionality
fix       → bug fix
refactor  → code restructuring
test      → tests
docs      → documentation
style     → formatting/style-only changes
chore     → maintenance/configuration
```

Examples:

```bash
git commit -m "feat: add transaction management"

git commit -m "fix: handle invalid transaction input"

git commit -m "refactor: extract transaction service"

git commit -m "test: add transaction service tests"

git commit -m "docs: update database setup"

git commit -m "chore: configure git hooks"
```

---

# 📌 Project-Specific Commands

Add new commands below as the project grows.

## Feature / Module

```bash
# Command
```

## Feature / Module

```bash
# Command
```

## Feature / Module

```bash
# Command
```

---

# 🧪 Testing

## Run Tests

```bash
# Add test command here
```

## Run Tests in Watch Mode

```bash
# Add command here
```

## Run Test Coverage

```bash
# Add command here
```

---

# 🏗️ Build & Production

## Build

```bash
bun run build
```

## Start Production

```bash
bun run start
```

---

## Setup clerk webhooks - events

```bash
Normal API Cycle - Browser  (POST /api/trancactions) --> Your Next.js API --> Database,
``bash
Tum Request bhejte hoo --> server response kerta hai
``
```

## Webhook

### |==> Web hook iska ulta concept hai:

```bash
"Jab mere system mein koi important event ho, main tumhare server ko HTTP request bhej dunga."
```

## Event - system mein koi important cheez hona.

```bash
user.created
user.updated
user.deleted
```

```bash
bun add svix
bun add @clerk/backend
```

```bash
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxx - get from clerk dashboard - webhook
app/api/webhooks/clerk/route.ts - create webhook
add url into webhook in clerk dashboard , and enable events

```

---

# 📚 Documentation

Project documentation:

```text
README.md
│
├── COMMANDS.md
├── docs/
│   ├── architecture.md
│   ├── authentication.md
│   ├── database.md
│   └── api.md
```

Add important project-specific documentation as the project grows.
