import React from "react"
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import TypographySampleArea from "./TypographySampleArea"
import TypographyInput from "./TypographyInput/TypographyInput"

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  position: "sticky",
  top: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: theme.zIndex.drawer + 3,
  borderBottom: "1px solid",
  borderBottomColor: theme.palette.divider,
  "& .MuiAccordionSummary-content": {
    maxWidth: "100%",
    overflow: "auto",
  },
}))

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  flexDirection: "column",
  "& > *": {
    marginBottom: theme.spacing(2),
  },
}))

const defaultGlobalProperties = [
  "fontFamily",
  "fontSize",
  "fontWeightLight",
  "fontWeightRegular",
  "fontWeightMedium",
  "fontWeightBold",
  "htmlFontSize",
]

function TypographyGlobals() {
  return (
    <Accordion>
      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
        <TypographySampleArea
          variant="body1"
          bgText="Base Typography"
          paperText="Styles"
        />
      </StyledAccordionSummary>
      <StyledAccordionDetails>
        {defaultGlobalProperties.map(property => (
          <div key={`base-text-${property}`}>
            <TypographyInput
              label={property}
              variantPath="typography"
              property={property}
            />
            <Divider />
          </div>
        ))}
      </StyledAccordionDetails>
    </Accordion>
  )
}

export default TypographyGlobals
