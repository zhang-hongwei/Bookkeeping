import React from "react"
import { Grid } from "@mui/material"
import { styled } from "@mui/material/styles"

import { useThemeCreatorStore } from "@/store/mui-theme-creator"
import SavedThemeItem from "./SavedThemeItem/SavedThemeItem"

const SavedThemeContainer = styled(Grid)(({ theme }) => ({
  margin: theme.spacing(2),
  marginTop: 0,
}))

export const savedThemeListId = "saved-theme-list"

function SavedThemeList() {
  const savedThemes = useThemeCreatorStore((state) => state.savedThemes)
  const sortedThemes = Object.values(savedThemes).sort((a, b) =>
    a.lastUpdated > b.lastUpdated ? -1 : a.lastUpdated < b.lastUpdated ? 1 : 0
  )

  return (
    <Grid id={savedThemeListId} container wrap="wrap" justifyContent="center">
      {sortedThemes.map(t => (
        <SavedThemeContainer
          item
          key={`${t.name}-${t.id}`}
        >
          <SavedThemeItem
            name={t.name}
            themeOptions={t.themeOptions}
            themeId={t.id}
            lastUpdated={t.lastUpdated}
          />
        </SavedThemeContainer>
      ))}
    </Grid>
  )
}

export default SavedThemeList
