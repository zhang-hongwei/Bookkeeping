---
description:
globs:
alwaysApply: true
---

# 📋 Rules & Skills Index

> ⚠️ **Important**: The project is migrating from Rules to Skills system. Prioritize using Skills, see [DEPRECATED.md](./DEPRECATED.md) for details

## 🎯 Skills System (Recommended)

Skills automatically activate based on file types and keywords. See [.claude/skills/](../skills/) directory:

| Skill | Description | Trigger Scenarios | Status |
|-------|-------------|-------------------|---------|
| **frontend-dev** | React/MUI/Tailwind frontend development | `.tsx` files, UI keywords | ✅ Migrated |
| **backend-dev** | Next.js API and service layer | `api/`, `services/` files | ✅ Migrated |
| **database-dev** | Drizzle ORM database development | `database/` files, SQL | ✅ Migrated |
| **nextjs** | Server/Client Components | `app/` files, Next.js keywords | ✅ Added |
| **testing** | Test development | `.test.ts` files | ✅ Migrated |
| **refactoring** | Code refactoring | "refactor" keywords | ✅ Migrated |
| **state-management** | Zustand state management | `store/` files | ✅ Migrated |

---

## 📚 Retained Rules (Still Effective)

### System-level Configuration

- **[system-role.md](./system-role.md)** - AI assistant role definition and problem-solving methodology
- **[code-review.md](./code-review.md)** - Code review process and standards

### General Style Guides

- **[typescript.md](./typescript.md)** - TypeScript code style and optimization guide

### Tool Configuration

- **[debug-usage.md](./debug-usage.md)** - Debug package usage guide and namespace conventions
- **[proxy-server.md](./proxy-server.md)** - Development proxy server configuration and usage
- **[ui-frontend/mui.md](./ui-frontend/mui.md)** - MUI MCP Server usage guide

### Reference Documentation

- **[drizzle-schema-style-guide.md](./drizzle-schema-style-guide.md)** - Drizzle ORM advanced schema reference (product-pilot-chat project)

### Meta Documentation

- **[rules-attach.md](./rules-attach.md)** - This index file
- **[DEPRECATED.md](./DEPRECATED.md)** - Migration notice and progress

---

## ⚠️ Migrated to Skills (Use New Version)

The following rules have been migrated to the Skills system, please use the new versions:

| Old Rule | New Skill | Migration Status |
|----------|-----------|------------------|
| `backend-architecture.md` | `skills/backend-dev/SKILL.md` | ✅ Fully migrated |
| `define-database-model.md` | `skills/database-dev/SKILL.md` | ✅ Fully migrated |
| `nextjs-hybrid-dev.md` | `skills/nextjs/SKILL.md` | ✅ Fully migrated |
| `ui-frontend/ui-essentials.md` | `skills/frontend-dev/SKILL.md` | ✅ Fully migrated |
| `ui-frontend/styling.md` | `skills/frontend-dev/SKILL.md` | ✅ Fully migrated |
| `ui-frontend/forms.md` | `skills/frontend-dev/SKILL.md` | ✅ Fully migrated |
| `ui-frontend/i18n-simple.md` | `skills/frontend-dev/resources/i18n.md` | ✅ Fully migrated |

---

## 🚀 How to Use

### Using Skills (Recommended)

Skills automatically activate without manual invocation:

```bash
# When editing .tsx files
# frontend-dev skill automatically activates

# When user inputs "create a server component"
# nextjs skill automatically activates and suggests best practices
```

### Using Rules (Traditional Way)

Rules automatically load through file path matching:

- Automatically load when editing files that match `globs`
- Or always apply through `alwaysApply: true`

---

## 📖 Learn More

- **Skills Usage Guide**: [.claude/skills/README.md](../skills/README.md)
- **Migration Progress**: [DEPRECATED.md](./DEPRECATED.md)
- **Project Guidelines**: [../CLAUDE.md](../../CLAUDE.md)

---

**Last Updated**: 2025-10-31
**Migration Progress**: Phase B Complete (7 rules migrated)
**Status**: Skills System Production Ready ✅

