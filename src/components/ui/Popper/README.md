# Popper Component

A generic Popper component built with MUI, following the same pattern as the Popover component.

## Features

- **Context-based architecture**: Uses React Context for state management
- **ClickAwayListener**: Automatically closes when clicking outside
- **Customizable transitions**: Support for Fade, Grow, or custom transitions
- **Flexible positioning**: Full control over placement and offset
- **TypeScript support**: Fully typed with comprehensive interfaces

## Basic Usage

```tsx
import { useState } from 'react';
import { IconButton, Box, Typography } from '@mui/material';
import { NotificationsOutlined } from '@mui/icons-material';
import Popper from '@/components/ui/Popper';

function NotificationPopper() {
  const [open, setOpen] = useState(false);

  const handleToggle = () => setOpen(!open);
  const handleClose = () => setOpen(false);

  return (
    <Popper
      open={open}
      onClose={handleClose}
      placement="bottom-end"
      offset={[0, 20]}
      content={
        <Box sx={{ p: 2, minWidth: 300 }}>
          <Typography variant="h6">Notifications</Typography>
          <Typography variant="body2">You have 3 new messages</Typography>
        </Box>
      }
    >
      <IconButton onClick={handleToggle}>
        <NotificationsOutlined />
      </IconButton>
    </Popper>
  );
}
```

## Advanced Usage

### With Custom Transition

```tsx
import { Grow } from '@mui/material';

<Popper
  open={open}
  onClose={handleClose}
  TransitionComponent={Grow}
  transitionDuration={500}
  content={<YourContent />}
>
  <YourTrigger />
</Popper>
```

### With Custom Modifiers

```tsx
<Popper
  open={open}
  onClose={handleClose}
  modifiers={[
    {
      name: 'offset',
      options: {
        offset: [0, 20],
      },
    },
    {
      name: 'preventOverflow',
      options: {
        padding: 8,
      },
    },
  ]}
  content={<YourContent />}
>
  <YourTrigger />
</Popper>
```

### Responsive Design

```tsx
import { useMediaQuery, useTheme } from '@mui/material';

function ResponsivePopper() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Popper
      open={open}
      onClose={handleClose}
      placement={isMobile ? 'bottom' : 'bottom-end'}
      offset={[isMobile ? 5 : 0, 20]}
      content={<YourContent />}
    >
      <YourTrigger />
    </Popper>
  );
}
```

## Props

### PopperPropsType

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | **required** | Whether the popper is open |
| `onClose` | `() => void` | - | Callback fired when the popper should close |
| `content` | `React.ReactNode` | **required** | Content to display in the popper |
| `children` | `React.ReactNode` | **required** | Trigger element |
| `placement` | `PopperPlacementType` | `'bottom-end'` | Popper placement |
| `disablePortal` | `boolean` | `false` | Disable portal rendering |
| `transition` | `boolean` | `true` | Enable transition animation |
| `offset` | `[number, number]` | `[0, 8]` | Offset from anchor [horizontal, vertical] |
| `modifiers` | `Array` | - | Popper.js modifiers |
| `TransitionComponent` | `React.ComponentType` | `Fade` | Custom transition component |
| `transitionDuration` | `number` | `300` | Transition duration in ms |
| `elevation` | `number` | `16` | Paper elevation |
| `sx` | `SxProps` | - | Custom styles for Paper |

## Comparison: Original vs Refactored

### Original Code (Business Logic Mixed)

```tsx
<Popper
  placement={downMD ? 'bottom' : 'bottom-end'}
  open={open}
  anchorEl={anchorRef.current}
  role={undefined}
  transition
  disablePortal
  modifiers={[{ name: 'offset', options: { offset: [downMD ? 5 : 0, 20] } }]}
>
  {({ TransitionProps }) => (
    <ClickAwayListener onClickAway={handleClose}>
      <Transitions position={downMD ? 'top' : 'top-right'} in={open} {...TransitionProps}>
        <Paper>
          <MainCard>
            {/* Notification-specific UI */}
          </MainCard>
        </Paper>
      </Transitions>
    </ClickAwayListener>
  )}
</Popper>
```

### Refactored Code (Clean & Reusable)

```tsx
<Popper
  open={open}
  onClose={handleClose}
  placement={downMD ? 'bottom' : 'bottom-end'}
  offset={[downMD ? 5 : 0, 20]}
  content={
    <MainCard>
      {/* Notification-specific UI */}
    </MainCard>
  }
>
  <IconButton>
    <NotificationsOutlined />
  </IconButton>
</Popper>
```

## Architecture

The component follows a context-based pattern similar to the Popover component:

```
Popper (Main Component)
├── PopperContext.Provider
│   └── value: { open, anchorEl, onClose }
├── Trigger (children with ref injected)
└── PopperContent
    └── MUI Popper
        ├── Transition (Fade/Grow/Custom)
        │   └── ClickAwayListener
        │       └── Paper
        │           └── content
```

## Benefits

1. **Separation of Concerns**: Business logic separated from presentation
2. **Reusability**: Can be used across different features (notifications, menus, dropdowns)
3. **Consistency**: Same pattern as Popover component
4. **Type Safety**: Full TypeScript support
5. **Flexibility**: Easy to customize with props
6. **Maintainability**: Single source of truth for popper behavior

## Notes

- The component automatically manages the anchor element reference
- ClickAwayListener is built-in, no need to wrap manually
- Transitions are handled internally with sensible defaults
- Compatible with all MUI components
