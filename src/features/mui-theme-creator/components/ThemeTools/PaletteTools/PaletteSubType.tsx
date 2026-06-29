import React from "react"
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import PaletteInput from "./PaletteInput"
import { useThemeValue } from "@/store/mui-theme-creator"

const StyledTitle = styled(Typography)({
  textTransform: "capitalize",
})

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  flexDirection: "column",
  "& > *": {
    marginBottom: theme.spacing(2),
  },
}))

const ThumbnailContainer = styled("div")({
  display: "flex",
  alignSelf: "stretch",
})

const ColorThumbnail = styled("div")({
  height: "100%",
  width: 15,
  marginLeft: 4,
  border: "1px solid grey",
})

interface PaletteSubTypeProps {
  title: string
  path: string
  paletteValues: [string, string][] // [name, path]
}

export default function PaletteSubType({
  title,
  path,
  paletteValues,
}: PaletteSubTypeProps) {
  const themeValues = useThemeValue(path)

  return (
    <>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <StyledTitle variant="body2">
            {title}
          </StyledTitle>
          <ThumbnailContainer>
            {paletteValues.map(([name, subPath]) => (
              <ColorThumbnail
                key={name}
                style={{ backgroundColor: themeValues?.[subPath] }}
              />
            ))}
          </ThumbnailContainer>
        </AccordionSummary>
        <StyledAccordionDetails>
          {paletteValues.map(([name, subPath]) => (
            <PaletteInput
              key={`${title}-${name}`}
              label={name}
              path={`${path}.${subPath}`}
            />
          ))}
        </StyledAccordionDetails>
      </Accordion>
    </>
  )
}
