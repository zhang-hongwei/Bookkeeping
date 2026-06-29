# Debug Package Usage Guide

This project uses the [debug](mdc:https:/github.com/debug-js/debug) package for debug logging. Use this guide to ensure team members follow a consistent debug log format.

## Basic Usage

1. Import the debug package:

```typescript
import debug from 'debug';
```

2. Create a namespaced logger:

```typescript
// Format: product-pilot:[module]:[submodule]
const log = debug('product-pilot-[module-name]:[submodule-name]');
```

3. Use the logger:

```typescript
log('Simple message');
log('Message with variable: %O', object);
log('Formatted number: %d', number);
```

## Namespace Conventions

- Desktop app related: `product-pilot-desktop:[module]`
- Server related: `product-pilot-server:[module]`
- Client related: `product-pilot-client:[module]`
- Router related: `product-pilot-[type]-router:[module]`

## Format Specifiers

- `%O` - Object expansion (recommended for complex objects)
- `%o` - Object
- `%s` - String
- `%d` - Number

## Examples

See usage examples in [market/index.ts](mdc:src/server/routers/edge/market/index.ts):

```typescript
import debug from 'debug';

const log = debug('product-pilot-edge-router:market');

log('getAgent input: %O', input);
```

## Enabling Debug

To enable debug output during development, set environment variables:

### In Browser

Execute in console:
```javascript
localStorage.debug = 'product-pilot-*'
```

### In Node.js Environment

```bash
DEBUG=product-pilot-* npm run dev
# or
DEBUG=product-pilot-* pnpm dev
```

### In Electron Applications

Set environment variables before starting main and renderer processes:

```typescript
process.env.DEBUG = 'product-pilot-*';
```
