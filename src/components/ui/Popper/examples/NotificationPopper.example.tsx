/**
 * Example: Notification Popper
 *
 * This example demonstrates how to refactor the original notification popper
 * from a complex, tightly-coupled implementation to a clean, reusable component.
 */

import { useState } from 'react';
import {
  IconButton,
  Badge,
  Box,
  Stack,
  Typography,
  Chip,
  TextField,
  Divider,
  Button,
  CardActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { NotificationsOutlined } from '@mui/icons-material';
import Popper from '@/components/ui/Popper';
import MainCard from '@/components/cards/MainCard';

// Mock notification list component
const NotificationList = () => (
  <Stack spacing={1} sx={{ p: 2 }}>
    <Typography variant="body2">New message from John</Typography>
    <Typography variant="body2">Your order has been shipped</Typography>
    <Typography variant="body2">Meeting reminder: 3:00 PM</Typography>
  </Stack>
);

export default function NotificationPopper() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('all');

  const handleToggle = () => setOpen(!open);
  const handleClose = () => setOpen(false);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const status = [
    { value: 'all', label: 'All Notification' },
    { value: 'unread', label: 'Unread' },
    { value: 'archived', label: 'Archived' },
  ];

  return (
    <Popper
      open={open}
      onClose={handleClose}
      placement={downMD ? 'bottom' : 'bottom-end'}
      offset={[downMD ? 5 : 0, 20]}
      content={
        <MainCard
          border={false}
          elevation={16}
          content={false}
          boxShadow
          shadow={theme.shadows[16]}
          sx={{ maxWidth: 330 }}
        >
          <Stack sx={{ gap: 2 }}>
            {/* Header */}
            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between', pt: 2, px: 2 }}
            >
              <Stack direction="row" sx={{ gap: 2 }}>
                <Typography variant="subtitle1">All Notification</Typography>
                <Chip
                  size="small"
                  label="01"
                  variant="filled"
                  sx={{ color: 'background.default', bgcolor: 'warning.dark' }}
                />
              </Stack>
              <Typography
                component="a"
                href="#"
                variant="subtitle2"
                sx={{ color: 'primary.main', cursor: 'pointer' }}
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Mark all as read');
                }}
              >
                Mark as all read
              </Typography>
            </Stack>

            {/* Content */}
            <Box
              sx={{
                height: 1,
                maxHeight: 'calc(100vh - 205px)',
                overflowX: 'hidden',
                '&::-webkit-scrollbar': { width: 5 },
              }}
            >
              <Box sx={{ px: 2, pt: 0.25 }}>
                <TextField
                  id="notification-status-filter"
                  select
                  fullWidth
                  value={value}
                  onChange={handleChange}
                  slotProps={{ select: { native: true } }}
                >
                  {status.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>
              </Box>
              <Divider sx={{ mt: 2 }} />
              <NotificationList />
            </Box>
          </Stack>

          {/* Footer */}
          <CardActions sx={{ p: 1.25, justifyContent: 'center' }}>
            <Button size="small" disableElevation>
              View All
            </Button>
          </CardActions>
        </MainCard>
      }
    >
      <IconButton onClick={handleToggle} sx={{ color: 'text.primary' }}>
        <Badge badgeContent={1} color="error">
          <NotificationsOutlined />
        </Badge>
      </IconButton>
    </Popper>
  );
}

/**
 * Key improvements:
 *
 * 1. **Simplified structure**: All Popper boilerplate is abstracted away
 * 2. **Clear separation**: Business logic (notification UI) is cleanly separated from Popper logic
 * 3. **Reusability**: The Popper component can now be reused for menus, dropdowns, etc.
 * 4. **Maintainability**: Changes to Popper behavior only need to be made in one place
 * 5. **Readability**: The component hierarchy is immediately clear
 *
 * Original code required:
 * - Manual anchorRef management
 * - Nested Popper > Transitions > ClickAwayListener > Paper structure
 * - TransitionProps handling
 * - Role and transition props configuration
 *
 * Refactored code only needs:
 * - open/onClose state
 * - content prop with your UI
 * - Optional placement/offset customization
 */
