import React from "react"

import { componentsTabId } from "@/features/mui-theme-creator/components/MainWindow"
import { componentNavDrawerId } from "@/features/mui-theme-creator/components/ComponentNavDrawer"

import TutorialTooltip from "../TutorialTooltip"
import Typography from "@mui/material/Typography"

import { useSwitchToTab } from "./hooks"

const ComponentsTabTutorialStep = () => {
  useSwitchToTab("components")
  return (
    <>
      <TutorialTooltip anchorId={componentsTabId} placement="bottom">
        <Typography variant="h5">This is the Components Tab</Typography>
        <Typography>View your theme on the Material-UI components</Typography>
      </TutorialTooltip>
      <TutorialTooltip anchorId={componentNavDrawerId} placement="right">
        Click a component name to navigate to it
      </TutorialTooltip>
    </>
  )
}

export default [ComponentsTabTutorialStep]
