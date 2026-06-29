import React, { useState, useEffect } from "react"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import Slider from "@mui/material/Slider"
import { styled } from "@mui/material/styles"

const DisabledText = styled(Typography)({
  fontStyle: "italic",
})

const getLetterSpacingValue = (letterSpacing: string): number | undefined => {
  if (
    letterSpacing == null ||
    letterSpacing.endsWith("rem") ||
    !letterSpacing.endsWith("em")
  ) {
    return undefined
  }
  return parseFloat(letterSpacing.slice(0, -2))
}

interface LetterSpacingInputProps {
  value: string
  onChange: (event: any, value: string) => void
  property?: string
}

function LetterSpacingInput({ value, onChange, property }: LetterSpacingInputProps) {
  const [displayValue, setDisplayValue] = useState<number | undefined>(
    undefined
  )

  useEffect(() => setDisplayValue(getLetterSpacingValue(value)), [value])

  const disabled = displayValue == undefined

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="baseline">
        <Grid>
          <Typography variant="caption" color="textSecondary">
            Letter Spacing:
          </Typography>
        </Grid>
        <Grid>
          {!disabled && (
            <Typography display="inline">{`${displayValue}em`}</Typography>
          )}
        </Grid>
      </Grid>
      <Slider
        value={disabled ? 0 : displayValue!}
        disabled={disabled}
        min={-0.1}
        max={1.5}
        step={0.01}
        onChange={(event, newDisplayValue) => setDisplayValue(newDisplayValue as number)}
        onChangeCommitted={(event, newValue) =>
          onChange(event, `${newValue}em`)
        }
      />
      {disabled && (
        <DisabledText
          color="textSecondary"
          variant="caption"
        >
          Only em units supported. Use the code editor to configure other types.
        </DisabledText>
      )}
    </>
  )
}

export default LetterSpacingInput
