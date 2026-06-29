---
description: Project overview and structure
alwaysApply: true
---

# Project Overview

⚡ Modern Next.js full-stack template with authentication, database integration, and comprehensive UI component system.

## Tech Stack

**Package Manager**: pnpm

### Core Framework
- **Next.js 16** - App Router architecture, Server Components
- **React 19** - Hooks, functional components, concurrent features
- **TypeScript 5** - Type safety

### UI & Styling
- **MUI v7** - Primary component framework (@mui/material, @mui/icons-material, @mui/x-date-pickers)
- **Tailwind CSS 4** - Utility-first styling
- **Styled Components** - CSS-in-JS
- **Emotion** - Styling (@emotion/react, @emotion/styled)
- **Framer Motion** - Animations and interactions

### State & Forms
- **Zustand** - Global state management
- **React Query** - Server state management
- **React Hook Form** + **Zod** - Form handling and validation

### Database
- **Drizzle ORM** - Database operations with PostgreSQL
- **PostgreSQL** - Database (@neondatabase/serverless)
- **Drizzle-Zod** - Schema-to-Zod integration

### Authentication
- **Supabase Auth** - Primary authentication
- **NextAuth** - Additional auth options
- **Supabase** - Backend services

### Utilities
- **dayjs** - Date manipulation
- **lodash-es** - Utility functions
- **react-use** - React hooks collection
- **clsx** - Conditional CSS classes
- **nanoid** - Unique ID generation

### UI Enhancements
- **@dnd-kit** - Drag and drop
- **React Resizable Panels** - Flexible layouts
- **TanStack React Table** - Advanced tables
- **ECharts** - Data visualization
- **XLSX** - Excel file handling

**Full dependencies**: See `package.json`

## Directory Structure

```
src/
├── app/                    # Next.js App Router (pages + API routes)
├── components/             # Reusable components
│   ├── ui/                 # Custom UI components (Modal, Select, etc.)
│   ├── layouts/            # Layout components
│   ├── features/           # Feature-specific components
│   └── common/             # Common utilities
├── features/               # Business domain modules (self-contained)
│   └── [feature]/
│       ├── components/     # Feature UI
│       ├── hooks/          # Feature hooks
│       ├── store/          # Feature state
│       └── types/          # Feature types
├── services/               # Backend business logic (for API routes)
├── store/                  # Global state (Zustand)
├── database/               # Database layer
│   ├── schema/             # Drizzle schemas
│   └── queries/            # Database queries
└── hooks/                  # Global hooks
```

## Architecture Principles

### Three-Layer Architecture

1. **Presentation Layer**
   - Pages (`app/page.tsx`)
   - Components (`components/`, `features/*/components/`)

2. **Business Layer**
   - Features (`features/`) - Frontend business logic
   - Services (`services/`) - Backend business logic

3. **Data Layer**
   - Database (`database/`)
   - API Routes (`app/api/`)

### Data Flow

**Frontend → Backend:**
```
Component → Zustand Store → API Call → API Route → Service → Database
```

**Backend Only (Server Components):**
```
Server Component → Service → Database
```

### Key Rules

1. **Features are self-contained** - Each feature module includes components, hooks, store, types
2. **Services for backend** - Only used in API routes and server components
3. **Store API calls for frontend** - Client components use store/*/api.ts
4. **No any type** - Use unknown or proper types
5. **MUI v7 + Tailwind** - See ui-frontend/ui-essentials.md for component rules

## File Naming

- Components: PascalCase (`UserCard.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Pages: lowercase (`page.tsx`, `layout.tsx`)
- Types: PascalCase (`UserProfile.ts`)

## Import Order

1. React/Next.js
2. Third-party libraries
3. MUI components
4. Custom components
5. Hooks and utilities
6. Types
7. Styles

See `typescript.md` for detailed style guide.
