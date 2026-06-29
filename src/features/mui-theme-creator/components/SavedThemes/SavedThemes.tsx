import React from "react"
import {
  Typography,
  Grid,
  Divider,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { useThemeCreatorStore } from "@/store/mui-theme-creator"
import DefaultThemes from "./DefaultThemes"
import SavedThemeItem from "./SavedThemeItem/SavedThemeItem"
import SavedThemeList from "./SavedThemeList"
import AddThemeButton from "./AddThemeButton"

const SavedThemesRoot = styled("div")(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingLeft: theme.spacing(2),
}))

const SavedThemesContainer = styled(Grid)(({ theme }) => ({
  flex: 1,
}))

const StyledDivider = styled(Divider)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}))

const ThemeActions = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  marginBottom: theme.spacing(2),
  "& > *": {
    marginTop: theme.spacing(),
  },
}))

function SavedThemes() {
  return (
    <SavedThemesRoot>
      <Grid container justifyContent="center">
        <Grid>
          <Typography variant="h4">Current Theme</Typography>
          <CurrentTheme />
          <ThemeActions>
            <AddThemeButton />
            <DefaultThemes />
          </ThemeActions>
        </Grid>
        <StyledDivider orientation="vertical" flexItem />

        <SavedThemesContainer item>
          <Typography variant="h4" gutterBottom>
            Saved Themes
          </Typography>
          <SavedThemeList />
        </SavedThemesContainer>
      </Grid>
    </SavedThemesRoot>
  )
}

export default SavedThemes

export const currentThemeThumbnailId = "current-theme-thumbnail"

function CurrentTheme() {
  const themeOptions = useThemeCreatorStore((state) => state.themeOptions)
  const themeId = useThemeCreatorStore((state) => state.themeId)
  const themeName = useThemeCreatorStore(
    (state) => state.savedThemes[state.themeId]?.name || ""
  )
  const lastUpdated = useThemeCreatorStore(
    (state) => state.savedThemes[state.themeId]?.lastUpdated || new Date().toISOString()
  )
  return (
    <div id={currentThemeThumbnailId}>
      <SavedThemeItem
        name={themeName}
        themeOptions={themeOptions}
        themeId={themeId}
        lastUpdated={lastUpdated}
        large
      />
    </div>
  )
}
