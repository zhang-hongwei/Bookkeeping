import React from "react"

import { savedThemesTabId } from "@/features/mui-theme-creator/components/MainWindow"
import { addThemeButtonId } from "@/features/mui-theme-creator/components/SavedThemes/AddThemeButton"
import { defaultThemesId } from "@/features/mui-theme-creator/components/SavedThemes/DefaultThemes"
import { savedThemeListId } from "@/features/mui-theme-creator/components/SavedThemes/SavedThemeList"

import TutorialTooltip from "../TutorialTooltip"
import Typography from "@mui/material/Typography"

import { useSwitchToTab } from "./hooks"

const SavedThemesTabTutorialStep = () => {
  useSwitchToTab("saved")
  return (
    <TutorialTooltip anchorId={savedThemesTabId} placement="bottom">
      <Typography variant="h5">This is the Saved Themes Tab</Typography>
    </TutorialTooltip>
  )
}

const AddNewThemesTutorialStep = () => {
  // useSwitchToTab("saved")
  return (
    <>
      <TutorialTooltip anchorId={savedThemeListId} placement="right">
        <Typography>Switch between your saved themes here.</Typography>
        <Typography>You can rename, or delete them here too</Typography>
      </TutorialTooltip>
      <TutorialTooltip anchorId={defaultThemesId} placement="bottom">
        Add sample themes here to check them out
      </TutorialTooltip>
      <TutorialTooltip anchorId={addThemeButtonId} placement="top">
        Add a new blank theme here
      </TutorialTooltip>
    </>
  )
}

export default [SavedThemesTabTutorialStep, AddNewThemesTutorialStep]
