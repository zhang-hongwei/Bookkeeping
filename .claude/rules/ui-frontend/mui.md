---
description: MUI documentation query tool - use MUI MCP server for official docs
globs: src/**/*.tsx
alwaysApply: false
---

# MUI Documentation Access

**For any MUI component questions, use the MUI MCP server instead of guessing:**

## Query Steps

1. Call `useMuiDocs` tool to fetch relevant package docs
2. Call `fetchDocs` tool for additional docs (use ONLY URLs from returned content)
3. Repeat steps 1-2 until all relevant docs are fetched
4. Use fetched content to answer the question

## When to Use

- Unsure about MUI component API
- Need to check latest MUI features
- Looking for MUI best practices
- Debugging MUI-related issues

## Important

- **Don't guess** MUI component props or behavior
- **Don't rely** on outdated documentation
- **Always query** official docs via MUI MCP server for accurate information

This project uses **MUI v7** - check docs for v7-specific changes (e.g., Grid `size` prop).
