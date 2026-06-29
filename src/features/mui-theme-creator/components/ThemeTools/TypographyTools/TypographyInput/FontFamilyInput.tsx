import React, { useState, useEffect } from "react"
import { useThemeCreatorStore } from "@/store/mui-theme-creator"
import {
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"

interface FontFamilyInputProps {
  value: string
  onChange: (event: any, value: string) => void
}

function FontFamilyInput({ value, onChange }: FontFamilyInputProps) {
  const loadedFonts = useThemeCreatorStore((state) => state.loadedFonts)
  const [input, setInput] = useState(value)

  useEffect(() => setInput(value), [value])
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onChange(event, input)
  }

  const handleFontSelected = (fontName: string) => {
    onChange(null, fontName)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="caption" color="textSecondary">
        Font Family
      </Typography>
      <TextField
        name="fontfamily"
        value={input}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setInput(event.target.value)
        }
        fullWidth
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <FontSelector onSelectFont={handleFontSelected} />
            </InputAdornment>
          ),
        }}
      />
    </form>
  )
}

export default FontFamilyInput

interface FontSelectorProps {
  onSelectFont: (fontName: string) => void
}

function FontSelector({ onSelectFont }: FontSelectorProps) {
  const loadedFonts = useThemeCreatorStore((state) => state.loadedFonts)

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false)

  const handleClick = (fontName: string) => {
    setAnchorEl(null)
    onSelectFont(fontName)
  }

  return (
    <Tooltip
      title="Replace with Downloaded Font"
      placement="top"
      open={tooltipOpen}
    >
      <div
        onMouseEnter={() => setTooltipOpen(true)}
        onMouseLeave={() => setTooltipOpen(false)}
        onClick={() => setTooltipOpen(false)}
      >
        <IconButton
          onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
            setAnchorEl(event.currentTarget)
          }
          aria-haspopup="true"
        >
          <AddIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          {[...loadedFonts].map(f => (
            <MenuItem
              key={f}
              onClick={() => handleClick(f)}
              style={{ fontFamily: f }}
            >
              {f}
            </MenuItem>
          ))}
        </Menu>
      </div>
    </Tooltip>
  )
}
