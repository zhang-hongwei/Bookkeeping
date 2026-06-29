import {
  ListItemButton,
  ListItemText,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import type { ComponentInfo } from '../constants/componentData';

interface ComponentTreeItemProps {
  component: ComponentInfo;
  selected: boolean;
  onClick: () => void;
  level?: number;
}

export const ComponentTreeItem = ({
  component,
  selected,
  onClick,
  level = 0
}: ComponentTreeItemProps) => {
  const theme = useTheme();

  return (
    <ListItemButton
      selected={selected}
      onClick={onClick}
      sx={{
        pl: 3 + level * 2,
        borderRadius: 1,
        mb: 0.5,
        '&.Mui-selected': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          },
        },
      }}
    >
      <ListItemText
        primary={component.name}
        secondary={component.badge}
        slotProps={{
          primary: {
            fontSize: '0.875rem',
            fontWeight: selected ? 600 : 400
          },
          secondary: { fontSize: '0.75rem' }
        }}
      />
      {component.badge && (
        <Chip
          label={component.badge}
          size="small"
          color="primary"
          sx={{ ml: 1 }}
        />
      )}
    </ListItemButton>
  );
};
