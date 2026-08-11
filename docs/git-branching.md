# Git Workflow Summary: Finance Project

This document tracks the Git operations, branching strategy, and commit history for the Finance Project.

## 1. Branching Strategy

We are following a feature-branch workflow:

- `main`: The stable production branch.
- `feature/<feature-name>`: Dedicated branches for specific development tasks.

## 2. Project History & Commits

### Initial Setup & Authentication

- `00ea48b` Initial commit from Create Next App
- `8932aee` Creating a finance app with next...
- `ed1f6db` Working on authentication with clerk
- `9280f45` feat: setup next.js, tailwind, and clerk authentication

### Database & Drizzle Schema Development

- `5c70c7e` chore: initialize Next.js Finance Project (Initial DB Schema branch)

### Cleanup & Merge

- `d11db72` chore: remove db files from auth branch
  - _Note: Merged `feature/auth-setup` into `main`._
  - _Cleanup: Removed `db/` folder and `drizzle.config.ts` from the auth branch before merging to maintain clean separation._

## 3. Operations Performed

- **Branch Cleanup:** Successfully merged `feature/auth-setup` into `main` and deleted the local feature branch to keep the repository clean.
- **Database Restoration Strategy:** After cleaning the `main` branch, we decided to recreate the database setup files cleanly within the `feature/db-schema` branch to avoid merge conflicts and history clutter.

## 4. Current Workflow Guidelines

1. **Always commit work:** `git add .` then `git commit -m "..."`.
2. **Push to remote:** `git push origin <branch-name>`.
3. **Switching tasks:** Always checkout `main` before starting a new feature branch:
   - `git checkout main`
   - `git checkout -b feature/<new-feature-name>`
4. **Resuming work:** Switch back to your feature branch: `git checkout feature/<branch-name>`.
