"use client";

import React from "react";
import {
  // Inputs & Actions
  Autocomplete,
  Button,
  ButtonGroup,
  Checkbox,
  Fab,
  Radio,
  RadioGroup,
  Rating,
  Select,
  Slider,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  // Data Display
  Avatar,
  Badge,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  // Feedback
  Alert,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  LinearProgress,
  Snackbar,
  Tooltip,
  // Surface
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AppBar,
  Toolbar,
  Paper,
  // Navigation
  BottomNavigation,
  BottomNavigationAction,
  Breadcrumbs,
  Drawer,
  Menu,
  MenuItem,
  Pagination,
  SpeedDial,
  SpeedDialAction,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
  // Layout
  Box,
  Container,
  Grid,
  Stack,
  // Utils
  Modal,
  Popover,
  FormControlLabel,
  Link,
} from "@mui/material";
import {
  Home as HomeIcon,
  Favorite as FavoriteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Mail as MailIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

// Component rendering configuration
interface ComponentConfig {
  component: React.ComponentType<any>;
  defaultProps: Record<string, any>;
  wrapper?: (children: React.ReactNode) => React.ReactNode;
}

// Component mapping with default props
const componentMap: Record<string, ComponentConfig> = {
  // Inputs & Actions
  autocomplete: {
    component: Autocomplete,
    defaultProps: {
      options: ["Option 1", "Option 2", "Option 3"],
      renderInput: (params: any) => <TextField {...params} label="Autocomplete" />,
      sx: { width: 300 },
    },
  },
  buttons: {
    component: Button,
    defaultProps: {
      variant: "contained",
      children: "Button",
    },
  },
  "button-group": {
    component: ButtonGroup,
    defaultProps: {
      variant: "contained",
      children: [
        <Button key="1">One</Button>,
        <Button key="2">Two</Button>,
        <Button key="3">Three</Button>,
      ],
    },
  },
  checkbox: {
    component: FormControlLabel,
    defaultProps: {
      control: <Checkbox defaultChecked />,
      label: "Checkbox",
    },
  },
  "floating-action-button": {
    component: Fab,
    defaultProps: {
      color: "primary",
      children: <AddIcon />,
    },
  },
  "radio-button": {
    component: RadioGroup,
    defaultProps: {
      defaultValue: "option1",
      children: [
        <FormControlLabel key="1" value="option1" control={<Radio />} label="Option 1" />,
        <FormControlLabel key="2" value="option2" control={<Radio />} label="Option 2" />,
      ],
    },
  },
  rating: {
    component: Rating,
    defaultProps: {
      defaultValue: 3,
    },
  },
  select: {
    component: Select,
    defaultProps: {
      defaultValue: "option1",
      sx: { minWidth: 200 },
      children: [
        <MenuItem key="1" value="option1">Option 1</MenuItem>,
        <MenuItem key="2" value="option2">Option 2</MenuItem>,
        <MenuItem key="3" value="option3">Option 3</MenuItem>,
      ],
    },
  },
  slider: {
    component: Slider,
    defaultProps: {
      defaultValue: 50,
      sx: { width: 300 },
    },
  },
  switch: {
    component: FormControlLabel,
    defaultProps: {
      control: <Switch defaultChecked />,
      label: "Switch",
    },
  },
  textfield: {
    component: TextField,
    defaultProps: {
      label: "Text Field",
      variant: "outlined",
    },
  },
  "toggle-button": {
    component: ToggleButtonGroup,
    defaultProps: {
      exclusive: true,
      children: [
        <ToggleButton key="1" value="left">Left</ToggleButton>,
        <ToggleButton key="2" value="center">Center</ToggleButton>,
        <ToggleButton key="3" value="right">Right</ToggleButton>,
      ],
    },
  },

  // Data Display
  avatar: {
    component: Avatar,
    defaultProps: {
      children: "A",
      sx: { bgcolor: "primary.main" },
    },
  },
  badge: {
    component: Badge,
    defaultProps: {
      badgeContent: 4,
      color: "primary",
      children: <MailIcon />,
    },
  },
  card: {
    component: Card,
    defaultProps: {
      sx: { maxWidth: 345 },
      children: (
        <CardContent>
          <Typography variant="h5" component="div">
            Card Title
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This is a sample card with some content.
          </Typography>
        </CardContent>
      ),
    },
  },
  chip: {
    component: Chip,
    defaultProps: {
      label: "Chip",
      color: "primary",
    },
  },
  divider: {
    component: Divider,
    defaultProps: {
      sx: { width: "100%" },
    },
  },
  list: {
    component: List,
    defaultProps: {
      sx: { width: "100%", maxWidth: 360, bgcolor: "background.paper" },
      children: [
        <ListItem key="1">
          <ListItemText primary="Item 1" secondary="Description 1" />
        </ListItem>,
        <ListItem key="2">
          <ListItemText primary="Item 2" secondary="Description 2" />
        </ListItem>,
        <ListItem key="3">
          <ListItemText primary="Item 3" secondary="Description 3" />
        </ListItem>,
      ],
    },
  },
  skeleton: {
    component: Stack,
    defaultProps: {
      spacing: 1,
      children: [
        <Skeleton key="1" variant="text" sx={{ fontSize: "1rem" }} />,
        <Skeleton key="2" variant="circular" width={40} height={40} />,
        <Skeleton key="3" variant="rectangular" width={210} height={60} />,
      ],
    },
  },
  table: {
    component: TableContainer,
    defaultProps: {
      component: Paper,
      children: (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Item 1</TableCell>
              <TableCell>100</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Item 2</TableCell>
              <TableCell>200</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ),
    },
  },
  typography: {
    component: Typography,
    defaultProps: {
      variant: "h4",
      children: "Typography Sample",
    },
  },

  // Feedback
  alert: {
    component: Alert,
    defaultProps: {
      severity: "info",
      children: "This is an info alert",
    },
  },
  progress: {
    component: Stack,
    defaultProps: {
      spacing: 2,
      sx: { width: "100%" },
      children: [
        <CircularProgress key="1" />,
        <LinearProgress key="2" />,
      ],
    },
  },
  tooltip: {
    component: Tooltip,
    defaultProps: {
      title: "Tooltip text",
      children: <Button>Hover me</Button>,
    },
  },

  // Surface
  accordion: {
    component: Accordion,
    defaultProps: {
      children: [
        <AccordionSummary key="summary" expandIcon={<ExpandMoreIcon />}>
          <Typography>Accordion Header</Typography>
        </AccordionSummary>,
        <AccordionDetails key="details">
          <Typography>Accordion content goes here.</Typography>
        </AccordionDetails>,
      ],
    },
  },
  "app-bar": {
    component: AppBar,
    defaultProps: {
      position: "static",
      children: (
        <Toolbar>
          <Typography variant="h6">App Bar</Typography>
        </Toolbar>
      ),
    },
  },
  paper: {
    component: Paper,
    defaultProps: {
      elevation: 3,
      sx: { p: 2, minWidth: 200 },
      children: <Typography>Paper content</Typography>,
    },
  },

  // Navigation
  breadcrumbs: {
    component: Breadcrumbs,
    defaultProps: {
      children: [
        <Link key="1" underline="hover" color="inherit" href="/">
          Home
        </Link>,
        <Link key="2" underline="hover" color="inherit" href="/">
          Category
        </Link>,
        <Typography key="3" color="text.primary">
          Current
        </Typography>,
      ],
    },
  },
  pagination: {
    component: Pagination,
    defaultProps: {
      count: 10,
      color: "primary",
    },
  },
  stepper: {
    component: Stepper,
    defaultProps: {
      activeStep: 1,
      children: [
        <Step key="1">
          <StepLabel>Step 1</StepLabel>
        </Step>,
        <Step key="2">
          <StepLabel>Step 2</StepLabel>
        </Step>,
        <Step key="3">
          <StepLabel>Step 3</StepLabel>
        </Step>,
      ],
    },
  },
  tabs: {
    component: Tabs,
    defaultProps: {
      value: 0,
      children: [
        <Tab key="1" label="Tab 1" />,
        <Tab key="2" label="Tab 2" />,
        <Tab key="3" label="Tab 3" />,
      ],
    },
  },

  // Layout
  box: {
    component: Box,
    defaultProps: {
      sx: {
        width: 200,
        height: 100,
        bgcolor: "primary.main",
        color: "white",
        p: 2,
        borderRadius: 1,
      },
      children: "Box Component",
    },
  },
  container: {
    component: Container,
    defaultProps: {
      maxWidth: "sm",
      children: <Typography>Container content</Typography>,
    },
  },
  grid: {
    component: Grid,
    defaultProps: {
      container: true,
      spacing: 2,
      children: [
        <Grid key="1" item xs={4}>
          <Paper sx={{ p: 2 }}>Grid 1</Paper>
        </Grid>,
        <Grid key="2" item xs={4}>
          <Paper sx={{ p: 2 }}>Grid 2</Paper>
        </Grid>,
        <Grid key="3" item xs={4}>
          <Paper sx={{ p: 2 }}>Grid 3</Paper>
        </Grid>,
      ],
    },
  },
  stack: {
    component: Stack,
    defaultProps: {
      spacing: 2,
      children: [
        <Paper key="1" sx={{ p: 2 }}>Item 1</Paper>,
        <Paper key="2" sx={{ p: 2 }}>Item 2</Paper>,
        <Paper key="3" sx={{ p: 2 }}>Item 3</Paper>,
      ],
    },
  },
};

interface ComponentRendererProps {
  componentId: string;
  instanceId?: string;
}

/**
 * ComponentRenderer - Dynamically renders MUI components based on ID
 */
export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  componentId,
  instanceId,
}) => {
  const config = componentMap[componentId];

  if (!config) {
    return (
      <Paper sx={{ p: 2, bgcolor: "error.light" }}>
        <Typography color="error">
          Component "{componentId}" not found
        </Typography>
      </Paper>
    );
  }

  const Component = config.component;
  const props = { ...config.defaultProps };

  return <Component {...props} />;
};

export default ComponentRenderer;
