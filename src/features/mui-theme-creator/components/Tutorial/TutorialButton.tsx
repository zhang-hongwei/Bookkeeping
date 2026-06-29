import React, { useCallback } from "react"
import Button from "@mui/material/Button"
import { useThemeCreatorActions } from "@/store/mui-theme-creator/store"
import { Link } from "@mui/material"

const TutorialButton = () => {
  const { toggleTutorial } = useThemeCreatorActions()
  const handleToggle = useCallback(() => toggleTutorial(), [toggleTutorial])

  return <Button onClick={handleToggle}>Tutorial</Button>
}

export default TutorialButton

export const TutorialLink = ({ children }) => {
  const { toggleTutorial } = useThemeCreatorActions()
  const handleToggle = useCallback(() => toggleTutorial(), [toggleTutorial])

  return <Link onClick={handleToggle}>{children}</Link>
}
