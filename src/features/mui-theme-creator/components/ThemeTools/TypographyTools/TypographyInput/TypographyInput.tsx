import React, { useCallback } from "react"
import { Grid, Button } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useThemeCreatorActions, useThemeValueInfo } from "@/store/mui-theme-creator"
import FontWeightInput from "./FontWeightInput"
import FontSizeInput from "./FontSizeInput"
import FontFamilyInput from "./FontFamilyInput"
import LineHeightInput from "./LineHeightInput"
import LetterSpacingInput from "./LetterSpacingInput"
import { ThemeValueChangeEvent } from "../../events"

const StyledButton = styled(Button)({
  textTransform: "capitalize",
  "&.Mui-disabled": {
    fontStyle: "italic",
  },
})

const InputContainer = styled(Grid)({
  flex: 1,
})

interface TypographyInputProps {
  label: string
  variantPath: string
  property: string
}

export default function TypographyInput({ label, variantPath, property }: TypographyInputProps) {
  const path = `${variantPath}.${property}`
  const themeValueInfo = useThemeValueInfo(path)
  const { setThemeOption, removeThemeOption } = useThemeCreatorActions()

  const handleValueChange = useCallback(
    (event: any, value: any) => {
      setThemeOption(path, value)
      document.dispatchEvent(ThemeValueChangeEvent())
    },
    [setThemeOption, path]
  )

  const handleReset = useCallback(() => removeThemeOption(path), [
    removeThemeOption,
    path,
  ])

  return (
    <Grid container justifyContent="space-between" alignItems="baseline">
      <InputContainer item>
        <TypographyPropertyInput
          property={property}
          value={themeValueInfo.value}
          onChange={handleValueChange}
        />
      </InputContainer>
      <Grid>
        <StyledButton
          size="small"
          disabled={!themeValueInfo.modifiedByUser}
          onClick={handleReset}
        >
          {themeValueInfo.modifiedByUser ? "Reset" : "auto"}
        </StyledButton>
      </Grid>
    </Grid>
  )
}

function TypographyPropertyInput({ property, ...props }) {
  switch (property) {
    case "fontFamily":
      return <FontFamilyInput {...props} />
    case "htmlFontSize":
    case "fontSize":
      return <FontSizeInput {...props} property={property} />
    case "fontWeight":
    case "fontWeightLight":
    case "fontWeightMedium":
    case "fontWeightRegular":
    case "fontWeightBold":
      return <FontWeightInput {...props} property={property} />
    case "letterSpacing":
      return <LetterSpacingInput {...props} />
    case "lineHeight":
      return <LineHeightInput {...props} />
    default:
      return <div></div>
  }
}
