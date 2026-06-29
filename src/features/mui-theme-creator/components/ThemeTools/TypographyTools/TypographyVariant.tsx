import React, { useState } from "react"
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

const StyledAccordionSummary = styled(AccordionSummary, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})(({ theme }) => ({
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

const defaultVariantProperties = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
]

interface TypographyVariantProps {
  variant: string
  text: string
  smallPreview?: boolean
}

function TypographyVariant({ variant, text, smallPreview = false }: TypographyVariantProps) {
  const [expanded, setExpanded] = useState(false)

  const variantPath = `typography.${variant}`

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
        <TypographySampleArea
          variant={variant}
          bgText={`${variant}.`}
          paperText={text}
          smallPreview={smallPreview && !expanded}
        />
      </StyledAccordionSummary>
      <StyledAccordionDetails>
        {defaultVariantProperties.map(property => (
          <div key={`${variant}-${property}`}>
            <TypographyInput
              label={property}
              variantPath={variantPath}
              property={property}
            />
            <Divider />
          </div>
        ))}
      </StyledAccordionDetails>
    </Accordion>
  )
}

export default TypographyVariant
