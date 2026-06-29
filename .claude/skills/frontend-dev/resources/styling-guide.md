# Styling Guide

Modern styling patterns: Using MUI v7 sx prop, inline styles, and theme integration.

---

## Inline vs Separated Styles

### Decision Threshold

**<100 lines: Inline styles at component top**

```typescript
import type { SxProps, Theme } from '@mui/material';

const componentStyles: Record<string, SxProps<Theme>> = {
  container: {
    p: 2,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    mb: 2,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
  // ... more styles
};

export const MyComponent: React.FC = () => {
  return (
    <Box sx={componentStyles.container}>
      <Box sx={componentStyles.header}>
        <h2>Title</h2>
      </Box>
    </Box>
  );
};
```

**>100 lines: Separate to `.styles.ts` file**

```typescript
// MyComponent.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const componentStyles: Record<string, SxProps<Theme>> = {
  container: { ... },
  header: { ... },
  // ... 100+ lines of styles
};

// MyComponent.tsx
import { componentStyles } from './MyComponent.styles';

export const MyComponent: React.FC = () => {
  return <Box sx={componentStyles.container}>...</Box>;
};
```

### Practical Example

**~80 lines of inline styles (acceptable)**

```typescript
const formStyles: Record<string, SxProps<Theme>> = {
  gridContainer: {
    height: '100%',
    maxHeight: 'calc(100vh - 220px)',
  },
  section: {
    height: '100%',
    maxHeight: 'calc(100vh - 220px)',
    overflow: 'auto',
    p: 4,
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  // ... more style objects
};
```

**Guideline**: Use ~100 lines as the threshold, adjust based on actual situation.

---

## sx Prop Patterns

### Basic Usage

```typescript
<Box sx={{ p: 2, mb: 3, display: 'flex' }}>
  Content
</Box>
```

### Accessing Theme

```typescript
<Box
  sx={{
    p: 2,
    backgroundColor: (theme) => theme.palette.primary.main,
    color: (theme) => theme.palette.primary.contrastText,
    borderRadius: (theme) => theme.shape.borderRadius,
  }}
>
  Themed Box
</Box>
```

### Responsive Styles

```typescript
<Box
  sx={{
    p: { xs: 1, sm: 2, md: 3 },
    width: { xs: '100%', md: '50%' },
    flexDirection: { xs: 'column', md: 'row' },
  }}
>
  Responsive Layout
</Box>
```

**Breakpoints:**
- `xs`: 0px+ (mobile)
- `sm`: 600px+ (tablet portrait)
- `md`: 900px+ (tablet landscape)
- `lg`: 1200px+ (desktop)
- `xl`: 1536px+ (large screens)

### Pseudo Selectors

```typescript
<Box
  sx={{
    p: 2,
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.05)',
    },
    '&:active': {
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
    '& .child-class': {
      color: 'primary.main',
    },
  }}
>
  Interactive Box
</Box>
```

### Conditional Styles

```typescript
interface CardProps {
  variant: 'default' | 'highlighted';
}

export const Card: React.FC<CardProps> = ({ variant }) => {
  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        ...(variant === 'highlighted' && {
          backgroundColor: 'primary.light',
          borderColor: 'primary.main',
        }),
      }}
    >
      Content
    </Box>
  );
};
```

---

## MUI v7 Patterns

### Grid Component (v7 syntax)

```typescript
import { Grid } from '@mui/material';

// ✅ Correct - v7 syntax uses size prop
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}>
    Left column
  </Grid>
  <Grid size={{ xs: 12, md: 6 }}>
    Right column
  </Grid>
</Grid>

// ❌ Wrong - old v6 syntax
<Grid container spacing={2}>
  <Grid xs={12} md={6}>  {/* Old syntax - don't use */}
    Content
  </Grid>
</Grid>
```

**Key change**: Use `size={{ xs: 12, md: 6 }}` instead of `xs={12} md={6}`

### Responsive Grid

```typescript
<Grid container spacing={3}>
  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
    Responsive column
  </Grid>
  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
    Responsive column
  </Grid>
  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
    Responsive column
  </Grid>
</Grid>
```

### Nested Grid

```typescript
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 8 }}>
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, sm: 6 }}>
        Nested 1
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        Nested 2
      </Grid>
    </Grid>
  </Grid>

  <Grid size={{ xs: 12, md: 4 }}>
    Sidebar
  </Grid>
</Grid>
```

### Grid Alignment

```typescript
<Grid container spacing={2} alignItems="center" justifyContent="space-between">
  <Grid size={{ xs: 12, md: 'auto' }}>
    Left content
  </Grid>
  <Grid size={{ xs: 12, md: 'auto' }}>
    Right content
  </Grid>
</Grid>
```

---

## Type-safe Styles

### Style Object Types

```typescript
import type { SxProps, Theme } from '@mui/material';

// Type-safe styles
const styles: Record<string, SxProps<Theme>> = {
  container: {
    p: 2,
    // Autocomplete and type checking work here
  },
};

// Or individual style
const containerStyle: SxProps<Theme> = {
  p: 2,
  display: 'flex',
};
```

### Theme-aware Styles

```typescript
const styles: Record<string, SxProps<Theme>> = {
  primary: {
    color: (theme) => theme.palette.primary.main,
    backgroundColor: (theme) => theme.palette.primary.light,
    '&:hover': {
      backgroundColor: (theme) => theme.palette.primary.dark,
    },
  },
  customSpacing: {
    padding: (theme) => theme.spacing(2),
    margin: (theme) => theme.spacing(1, 2), // top/bottom: 1, left/right: 2
  },
};
```

---

## Patterns to Avoid

### ❌ makeStyles (MUI v4 pattern)

```typescript
// ❌ Avoid - old Material-UI v4 pattern
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));
```

**Why avoid**: Deprecated, not supported in v7

### ❌ styled() Components

```typescript
// ❌ Avoid - styled-components pattern
import { styled } from '@mui/material/styles';

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));
```

**Why avoid**: sx prop is more flexible and doesn't create new components

### ✅ Use sx Prop

```typescript
// ✅ Recommended
<Box
  sx={{
    p: 2,
    backgroundColor: 'primary.main',
  }}
>
  Content
</Box>
```

---

## Code Style Standards

### Indentation

**4 spaces** (not 2, not tabs)

```typescript
const styles: Record<string, SxProps<Theme>> = {
    container: {
        p: 2,
        display: 'flex',
        flexDirection: 'column',
    },
};
```

### Quotes

**Single quotes** for strings (project standard)

```typescript
// ✅ Correct
const color = 'primary.main';
import { Box } from '@mui/material';

// ❌ Wrong
const color = "primary.main";
import { Box } from "@mui/material";
```

### Trailing Commas

**Always use trailing commas** in objects and arrays

```typescript
// ✅ Correct
const styles = {
  container: { p: 2 },
  header: { mb: 1 },  // Trailing comma
};

const items = [
  'item1',
  'item2',  // Trailing comma
];

// ❌ Wrong - missing trailing commas
const styles = {
  container: { p: 2 },
  header: { mb: 1 }  // Missing comma
};
```

---

## Common Style Patterns

### Flexbox Layout

```typescript
const styles = {
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};
```

### Spacing

```typescript
// Padding
p: 2           // All sides
px: 2          // Horizontal (left + right)
py: 2          // Vertical (top + bottom)
pt: 2, pr: 1   // Specific sides

// Margin
m: 2, mx: 2, my: 2, mt: 2, mr: 1

// Units: 1 = 8px (theme.spacing(1))
p: 2    // = 16px
p: 0.5  // = 4px
p: 3    // = 24px
```

### Positioning

```typescript
const styles = {
  relative: {
    position: 'relative',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  fixed: {
    position: 'fixed',
    bottom: 16,
    right: 16,
    zIndex: 1000,
  },
  sticky: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: 'background.paper',
  },
};
```

### Overflow and Scrolling

```typescript
const styles = {
  scrollable: {
    overflow: 'auto',
    maxHeight: 400,
  },
  hidden: {
    overflow: 'hidden',
  },
  ellipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};
```

---

## Theme Palette

### Using Theme Colors

```typescript
const styles = {
  // Primary colors
  primary: {
    color: 'primary.main',
    backgroundColor: 'primary.light',
    borderColor: 'primary.dark',
  },

  // Secondary colors
  secondary: {
    color: 'secondary.main',
    backgroundColor: 'secondary.light',
  },

  // Error, warning, info, success
  error: { color: 'error.main' },
  warning: { color: 'warning.main' },
  info: { color: 'info.main' },
  success: { color: 'success.main' },

  // Text colors
  textPrimary: { color: 'text.primary' },
  textSecondary: { color: 'text.secondary' },
  textDisabled: { color: 'text.disabled' },

  // Background colors
  bgPaper: { backgroundColor: 'background.paper' },
  bgDefault: { backgroundColor: 'background.default' },

  // Divider
  divider: { borderColor: 'divider' },
};
```

---

## Complete Style Examples

### Card Component Styles

```typescript
import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

const cardStyles: Record<string, SxProps<Theme>> = {
  container: {
    p: 3,
    borderRadius: 2,
    boxShadow: 1,
    '&:hover': {
      boxShadow: 3,
      transform: 'translateY(-2px)',
    },
    transition: 'all 0.2s ease-in-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2,
    pb: 2,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
  title: {
    fontWeight: 600,
    color: 'text.primary',
  },
  content: {
    color: 'text.secondary',
    lineHeight: 1.6,
  },
};

export const StyledCard: React.FC = () => {
  return (
    <Paper sx={cardStyles.container}>
      <Box sx={cardStyles.header}>
        <Typography variant="h6" sx={cardStyles.title}>
          Card Title
        </Typography>
      </Box>
      <Typography variant="body1" sx={cardStyles.content}>
        Card content
      </Typography>
    </Paper>
  );
};
```

### Form Styles

```typescript
const formStyles: Record<string, SxProps<Theme>> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    p: 3,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  row: {
    display: 'flex',
    gap: 2,
    flexDirection: { xs: 'column', md: 'row' },
  },
  field: {
    flex: 1,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2,
    pt: 2,
    borderTop: '1px solid',
    borderColor: 'divider',
  },
};
```

### Data Table Styles

```typescript
const tableStyles: Record<string, SxProps<Theme>> = {
  container: {
    width: '100%',
    overflow: 'auto',
  },
  header: {
    backgroundColor: 'grey.100',
    fontWeight: 600,
  },
  row: {
    '&:hover': {
      backgroundColor: 'action.hover',
    },
    '&:last-child td': {
      borderBottom: 0,
    },
  },
  cell: {
    py: 2,
    px: 3,
  },
  actions: {
    display: 'flex',
    gap: 1,
    justifyContent: 'flex-end',
  },
};
```

---

## Performance Optimization

### Avoid Inline Objects

```typescript
// ❌ Avoid - creates new object on every render
{items.map(item => (
  <Box key={item.id} sx={{ p: 2, mb: 1 }}>
    {item.name}
  </Box>
))}

// ✅ Recommended - reuse style object
const itemStyle: SxProps<Theme> = { p: 2, mb: 1 };

{items.map(item => (
  <Box key={item.id} sx={itemStyle}>
    {item.name}
  </Box>
))}
```

### Conditional Styles Best Practices

```typescript
// ✅ Recommended - use spread operator
<Box
  sx={{
    p: 2,
    ...(isActive && {
      backgroundColor: 'primary.light',
    }),
  }}
>
  Content
</Box>

// ✅ Also good - ternary operator for simple cases
<Box
  sx={{
    p: 2,
    color: isActive ? 'primary.main' : 'text.primary',
  }}
>
  Content
</Box>
```

---

## Summary

**Style Checklist:**
- ✅ Use `sx` prop for MUI styling
- ✅ Type-safe with `SxProps<Theme>`
- ✅ <100 lines: inline; >100 lines: separate file
- ✅ MUI v7 Grid: `size={{ xs: 12 }}`
- ✅ 4-space indentation
- ✅ Single quotes
- ✅ Trailing commas
- ✅ Responsive design: `{ xs: '100%', md: '50%' }`
- ✅ Theme colors: `'primary.main'`, `'text.secondary'`
- ❌ Don't use makeStyles or styled()

**References:**
- [component-patterns.md](component-patterns.md) - Component structure
- [complete-examples.md](complete-examples.md) - Complete style examples
- [file-organization.md](file-organization.md) - File organization