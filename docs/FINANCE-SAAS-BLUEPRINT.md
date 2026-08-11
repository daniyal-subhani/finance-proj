# Finance SaaS Platform - Project Blueprint & Master Roadmap (Version 1)

## 1. System Design & Boundaries

- **Frontend Layer (Next.js App Router):** Handles UI rendering, state management via TanStack React Query, and styling with Tailwind CSS & Shadcn UI.
- **API / Server Layer (Next.js Route Handlers & Server Actions):** Validates user sessions via Clerk, processes business logic, and handles incoming/outgoing data payloads.
- **ORM & Database Layer (Drizzle + Neon PostgreSQL):** Provides type-safe queries and serverless relational data storage.
- **External Services Boundaries:**
  - **Clerk:** Authentication and session management.
  - **Plaid API:** Bank account connections and syncing.
  - **Lemon Squeezy:** Subscription and billing management.

---

## 2. Component & System Communication

1. **User Action:** The user interacts with UI components (filters, forms, tables).
2. **State Management:** **TanStack React Query** (`useQuery` / `useMutation`) dispatches asynchronous network requests.
3. **API Routing:** Requests hit Next.js Route Handlers (`app/api/...`).
4. **Auth Validation:** Clerk’s `auth()` middleware verifies the user token and fetches the `userId`.
5. **Database Interaction:** Drizzle ORM queries Neon PostgreSQL, enforcing user isolation (users can only access their own data).
6. **Response & Cache Update:** JSON data returns to the frontend, updating the TanStack Query cache seamlessly.

---

## 3. API Contracts (Endpoints & Methods)

| Endpoint                        | Method                           | Description                         | Request Body / Query Params             |
| :------------------------------ | :------------------------------- | :---------------------------------- | :-------------------------------------- |
| `/api/accounts`                 | `GET`                            | Fetch all user-linked accounts      | None                                    |
| `/api/accounts`                 | `POST`                           | Create a new account                | `{ name: string }`                      |
| `/api/accounts/:id`             | `PATCH` / `DELETE`               | Modify or remove a specific account | `{ name?: string }`                     |
| `/api/categories`               | `GET`, `POST`, `PATCH`, `DELETE` | Manage expense/income categories    | Category Name                           |
| `/api/transactions`             | `GET`                            | Fetch transactions with filters     | Query params: `from`, `to`, `accountId` |
| `/api/transactions`             | `POST`                           | Create a new transaction            | Amount, Date, CategoryId, AccountId     |
| `/api/transactions/bulk-delete` | `POST`                           | Delete multiple records at once     | `{ ids: string[] }`                     |
| `/api/transactions/bulk-create` | `POST`                           | Insert rows via CSV import          | Array of transaction objects            |
| `/api/summary`                  | `GET`                            | Aggregated analytics for dashboard  | Query params: `from`, `to`, `accountId` |

---

## 4. Folder Structure (Next.js App Router)

```text
finance-proj/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── accounts/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── transactions/page.tsx
│   │   └── page.tsx              # Main Financial Dashboard
│   ├── api/
│   │   ├── accounts/route.ts
│   │   ├── categories/route.ts
│   │   ├── transactions/route.ts
│   │   └── summary/route.ts
│   ├── layout.tsx
│   └── provider.tsx              # React Query & Clerk Providers
├── db/
│   ├── dsp.ts                    # Drizzle connection setup
│   └── schema.ts                 # Database tables schema
├── features/                     # Modular component and hooks organization
├── hooks/                        # Custom application hooks
└── types/                        # TypeScript interfaces
```
