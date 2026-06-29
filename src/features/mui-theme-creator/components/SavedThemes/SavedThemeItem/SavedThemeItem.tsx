import React, { useCallback } from "react"
import moment from "moment"
import { useThemeCreatorStore, useThemeCreatorActions } from "@/store/mui-theme-creator"

import {
  Button,
  Card,
  Typography,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import SwapHorizIcon from "@mui/icons-material/SwapHoriz"

import ThemeThumbnail from "../ThemeThumbnail"
import DeleteThemeButton from "./DeleteThemeButton"
import RenameThemeButton from "./RenameThemeButton"

const Root = styled("div")(({ theme }) => ({
  position: "relative",
  "&:hover .hoverArea": {
    display: "flex",
  },
}))

const SavedItemContent = styled("div")(({ theme }) => ({
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
}))

const StyledCard = styled(Card)<{ loaded?: boolean }>(({ theme, loaded }) => ({
  ...(loaded && {
    backgroundColor: "#9e9e9e",
    color: "#000",
  }),
}))

const HoverArea = styled("div")(({ theme }) => ({
  position: "absolute",
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
  backdropFilter: "blur(2px) saturate(30%) brightness(40%)",
  alignItems: "center",
  justifyContent: "center",
  display: "none",
}))

const HoverAreaActions = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "baseline",
}))

interface SavedThemeItemProps {
  name: string
  themeId: string
  lastUpdated: string
  themeOptions?: any
  large?: boolean
}

function SavedThemeItem({ name, themeId, lastUpdated, ...thumbnailProps }: SavedThemeItemProps) {
  const { loadSavedTheme, removeSavedTheme } = useThemeCreatorActions()

  const handleLoadTheme = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      loadSavedTheme(themeId)
    },
    [loadSavedTheme, themeId]
  )

  const handleRemoveTheme = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      removeSavedTheme(themeId)
    },
    [removeSavedTheme, themeId]
  )

  const loadedThemeId = useThemeCreatorStore((state) => state.themeId)

  return (
    <Root onClick={handleLoadTheme}>
      <StyledCard loaded={themeId === loadedThemeId}>
        <SavedItemContent>
          <Typography variant="subtitle1" align="center">
            {name}
          </Typography>
          <ThemeThumbnail {...thumbnailProps} />
          <Typography
            variant="caption"
            component="p"
            align="center"
          >{`Last Updated: ${moment(lastUpdated).fromNow()}`}</Typography>
        </SavedItemContent>
      </StyledCard>
      <HoverArea className="hoverArea">
        <HoverAreaActions>
          <Button
            size="large"
            disabled={themeId === loadedThemeId}
            startIcon={<SwapHorizIcon />}
            onClick={handleLoadTheme}
          >
            Load
          </Button>
          <RenameThemeButton themeId={themeId} defaultName={name} />
          <DeleteThemeButton
            themeId={themeId}
            themeName={name}
            disabled={themeId === loadedThemeId}
          />
        </HoverAreaActions>
      </HoverArea>
    </Root>
  )
}

export default SavedThemeItem
