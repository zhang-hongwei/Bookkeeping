import React from "react"
import { useThemeCreatorStore } from "@/store/mui-theme-creator"
import Typography from "@mui/material/Typography"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

import { Chip } from "@mui/material"
import { styled } from "@mui/material/styles"
import AddFontInput from "./AddFontInput"
import PopularFontList from "./PopularFontList"

const LoadedFontContent = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  "& > *": {
    margin: theme.spacing(0.5),
  },
  maxHeight: 200,
  overflowY: "auto",
}))

function FontTools() {
  const loadedFonts = useThemeCreatorStore((state) => state.loadedFonts)
  const currentFonts = useThemeCreatorStore(
    (state) => state.savedThemes[state.themeId]?.fonts || []
  )

  return (
    <>
      <Accordion>
        <AccordionSummary>
          <AddFontInput />
        </AccordionSummary>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">Popular Fonts</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <PopularFontList />
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded={currentFonts.length < 5}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          {`Fonts used in current theme (${currentFonts.length})`}
        </AccordionSummary>
        <AccordionDetails>
          <LoadedFontContent>
            {currentFonts.map(font => (
              <Chip
                label={font}
                key={font}
                size="small"
                style={{ fontFamily: font }}
              />
            ))}
          </LoadedFontContent>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          {`Loaded and Available Fonts (${loadedFonts.size})`}
        </AccordionSummary>
        <AccordionDetails>
          <LoadedFontContent>
            {[...loadedFonts].map(font => (
              <Chip
                label={font}
                key={font}
                size="small"
                style={{ fontFamily: font }}
              />
            ))}
          </LoadedFontContent>
        </AccordionDetails>
      </Accordion>
    </>
  )
}

export default FontTools
