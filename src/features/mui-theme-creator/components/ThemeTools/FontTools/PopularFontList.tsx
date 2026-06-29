import React, { useState, useCallback, useEffect } from "react"
import { Chip, Grid } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import { useThemeCreatorStore, useThemeCreatorActions } from "@/store/mui-theme-creator"

const defaultFonts = [
  "Lato",
  "Lora",
  "Montserrat",
  "Oswald",
  "PT Sans",
  "Raleway",
  "Slabo 27px",
  "Source Sans Pro",
]

function PopularFontList() {
  const loadedFonts = useThemeCreatorStore((state) => state.loadedFonts)
  const { addFonts } = useThemeCreatorActions()
  const [fontShortList, setFontShortList] = useState(defaultFonts)

  useEffect(() => {
    const fonts = [...defaultFonts]
    // reduce defaultFonts to only fonts not already loaded

    setFontShortList(
      fonts.reduce(
        (fontList: string[], font: string) =>
          loadedFonts.has(font) ? fontList : [...fontList, font],
        []
      )
    )
  }, [loadedFonts])

  const handleDefaultFontClick = useCallback(
    (fontName: string) => {
      addFonts([fontName])
      const index = fontShortList.indexOf(fontName)
      setFontShortList([
        ...fontShortList.slice(0, index),
        ...fontShortList.slice(index + 1),
      ])
    },
    [addFonts, fontShortList]
  )

  return fontShortList.length ? (
    <Grid container spacing={1}>
      {fontShortList.map(font => (
        <Grid item key={font}>
          <Chip
            label={font}
            icon={<AddIcon />}
            onClick={() => handleDefaultFontClick(font)}
          />
        </Grid>
      ))}
    </Grid>
  ) : null
}

export default PopularFontList
