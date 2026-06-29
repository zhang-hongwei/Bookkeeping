import React, { useState } from "react"
import { styled } from "@mui/material/styles"
import {
  Drawer,
  Stack,
  Box,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import {
  Tune as TuneIcon,
  Settings as SettingsIcon,
  Code as CodeIcon,
} from "@mui/icons-material"
import { useThemeCreatorStore, useThemeCreatorActions } from "@/store/mui-theme-creator"
import ThemeTools from "./ThemeTools/ThemeTools"
import MonacoThemeCodeEditor from "@/features/mui-theme-creator/components/MonacoThemeCodeEditor"
import ComponentPropertiesEditor from "./ComponentProperties"

interface ThemeConfigDrawerProps {}

const drawerWidth: React.CSSProperties["width"] = 400

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  height: "100vh",
  maxWidth: "90vw",
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    overflowY: "visible",
    zIndex: theme.zIndex.drawer + 2,
    maxWidth: "90vw",
  },
}))

const DrawerContainer = styled(Stack)({
  height: "100vh",
})

const TabsContainer = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}))

const TabPanel = styled(Box)({
  flexGrow: 1,
  overflow: "auto",
  height: "100%",
})

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const CustomTabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <TabPanel
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
    >
      {value === index && <Box sx={{ height: "100%" }}>{children}</Box>}
    </TabPanel>
  )
}

const ThemeConfigDrawer: React.FC<ThemeConfigDrawerProps> = () => {
  const themeId = useThemeCreatorStore((state) => state.themeId)
  const open = useThemeCreatorStore((state) => state.themeConfigOpen)
  const { toggleThemeConfig } = useThemeCreatorActions()

  const theme = useTheme()
  const permanent = useMediaQuery(theme.breakpoints.up("sm"))
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  return (
    <StyledDrawer
      variant={permanent ? "permanent" : "temporary"}
      anchor="right"
      open={open}
      onClose={() => toggleThemeConfig()}
    >
      <DrawerContainer direction="column" spacing={0}>
        {/* Tab Navigation */}
        <TabsContainer>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            aria-label="theme config tabs"
          >
            <Tab
              icon={<TuneIcon />}
              label="Global"
              id="config-tab-0"
              aria-controls="config-tabpanel-0"
            />
            <Tab
              icon={<SettingsIcon />}
              label="Component"
              id="config-tab-1"
              aria-controls="config-tabpanel-1"
            />
            <Tab
              icon={<CodeIcon />}
              label="Code"
              id="config-tab-2"
              aria-controls="config-tabpanel-2"
            />
          </Tabs>
        </TabsContainer>

        {/* Tab Panels */}
        <CustomTabPanel value={activeTab} index={0}>
          {/* Global Theme Properties */}
          <ThemeTools />
        </CustomTabPanel>

        <CustomTabPanel value={activeTab} index={1}>
          {/* Component Properties */}
          <ComponentPropertiesEditor />
        </CustomTabPanel>

        <CustomTabPanel value={activeTab} index={2}>
          {/* Code Editor */}
          <Box sx={{ height: "100%" }}>
            {/* Use themeId as key so that editor is torn down and rebuilt with new theme */}
            <MonacoThemeCodeEditor key={themeId} />
          </Box>
        </CustomTabPanel>
      </DrawerContainer>
    </StyledDrawer>
  )
}

export default ThemeConfigDrawer
