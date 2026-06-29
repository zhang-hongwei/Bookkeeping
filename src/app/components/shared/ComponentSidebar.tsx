import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Widgets as WidgetsIcon,
  Star as StarIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import type { ComponentInfo } from '../constants/componentData';
import { ComponentTreeItem } from './ComponentTreeItem';

interface ComponentSidebarProps {
  components: ComponentInfo[];
  filteredComponents: ComponentInfo[];
  selectedComponent: string | null;
  searchQuery: string;
  expandedPanels: string[];
  onSearchChange: (query: string) => void;
  onComponentSelect: (componentId: string) => void;
  onPanelChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
}

export const ComponentSidebar = ({
  components,
  filteredComponents,
  selectedComponent,
  searchQuery,
  expandedPanels,
  onSearchChange,
  onComponentSelect,
  onPanelChange,
}: ComponentSidebarProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: 300,
        height: '100vh',
        borderRight: 1,
        borderColor: 'divider',
        p: 3,
        overflow: 'auto',
      }}
    >
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Components
      </Typography>

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search components..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 2 }}
      />

      <List component="nav" disablePadding>
        {/* All Components - clickable link */}
        <ListItemButton
          component={Link}
          href="/components/all"
          sx={{
            py: 1,
            px: 2,
            borderRadius: 1,
            mb: 0.5,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          <WidgetsIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
          <ListItemText
            primary="All"
            slotProps={{ primary: { fontWeight: 500, fontSize: '0.875rem' } }}
          />
          <Chip
            label={components.length}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          />
        </ListItemButton>

        {/* MUI Category */}
        <ListItemButton
          onClick={(e) => {
            const isExpanded = expandedPanels.includes('mui-core');
            onPanelChange('mui-core')(e, !isExpanded);
          }}
          sx={{
            py: 1,
            px: 2,
            borderRadius: 1,
            mb: 0.5,
          }}
        >
          <CategoryIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
          <ListItemText
            primary="MUI"
            slotProps={{ primary: { fontWeight: 500, fontSize: '0.875rem' } }}
          />
          <Chip
            label={components.filter(c => c.category === 'mui').length}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.75rem',
              fontWeight: 600,
              mr: 1,
            }}
          />
          {expandedPanels.includes('mui-core') ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={expandedPanels.includes('mui-core')} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {filteredComponents
              .filter(component => component.category === 'mui')
              .map((component) => (
                <ComponentTreeItem
                  key={component.id}
                  component={component}
                  selected={selectedComponent === component.id}
                  onClick={() => onComponentSelect(component.id)}
                />
              ))}
          </List>
        </Collapse>

        {/* Extra (MUI X) Category */}
        <ListItemButton
          onClick={(e) => {
            const isExpanded = expandedPanels.includes('mui-x');
            onPanelChange('mui-x')(e, !isExpanded);
          }}
          sx={{
            py: 1,
            px: 2,
            borderRadius: 1,
            mb: 0.5,
          }}
        >
          <StarIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
          <ListItemText
            primary="Extra"
            slotProps={{ primary: { fontWeight: 500, fontSize: '0.875rem' } }}
          />
          <Chip
            label={components.filter(c => c.category === 'mui-x').length}
            size="small"
            color="primary"
            sx={{
              height: 20,
              fontSize: '0.75rem',
              fontWeight: 600,
              mr: 1,
            }}
          />
          {expandedPanels.includes('mui-x') ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={expandedPanels.includes('mui-x')} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {filteredComponents
              .filter(component => component.category === 'mui-x')
              .map((component) => (
                <ComponentTreeItem
                  key={component.id}
                  component={component}
                  selected={selectedComponent === component.id}
                  onClick={() => onComponentSelect(component.id)}
                />
              ))}
          </List>
        </Collapse>
      </List>
    </Box>
  );
};
