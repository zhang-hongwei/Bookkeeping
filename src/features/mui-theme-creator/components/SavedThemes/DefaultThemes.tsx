import React, { useCallback } from "react"

import {
  Button,
  ButtonBase,
  Grid,
  Popover,
  Typography,
} from "@mui/material"
import { styled } from "@mui/material/styles"

import { useThemeCreatorActions } from "@/store/mui-theme-creator"
import { NewSavedTheme } from "@/store/mui-theme-creator/types"
import defaultThemes from "./defaultThemes"
import ThemeThumbnail from "./ThemeThumbnail"

const ButtonRoot = styled(ButtonBase)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
}))

const ThumbnailContainer = styled("div")(({ theme }) => ({
  position: "relative",
  "&:hover .hoverArea": {
    display: "flex",
  },
}))

const HoverArea = styled("div")(({ theme }) => ({
  position: "absolute",
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
  backdropFilter: "blur(2px) saturate(30%) brightness(40%)",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  display: "none",
}))

const TemplatePopover = styled(Popover)(({ theme }) => ({
  '& .MuiPopover-paper': {
    padding: theme.spacing(2),
  },
}))

const TemplateContainer = styled(Grid)(({ theme }) => ({
  flex: 1,
  flexGrow: 1,
  overflowX: "auto",
}))

export const defaultThemesId = "default-themes"

function DefaultThemes() {
  const { addNewDefaultTheme } = useThemeCreatorActions()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)

  const handleClickButton = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleClickTheme = useCallback(
    (newTheme: NewSavedTheme) => {
      addNewDefaultTheme(newTheme)
    },
    [addNewDefaultTheme]
  )

  const open = Boolean(anchorEl)
  const popoverId = open ? "default-themes-popover" : undefined

  return (
    <>
      <Button
        id={defaultThemesId}
        variant="outlined"
        onClick={handleClickButton}
      >
        Example Templates
      </Button>
      <TemplatePopover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <TemplateContainer
          container
          spacing={2}
          wrap="nowrap"
        >
          {defaultThemes.map(t => (
            <Grid item key={t.name} onClick={() => handleClickTheme(t)}>
              <ButtonRoot>
                <ThumbnailContainer>
                  <ThemeThumbnail themeOptions={t.themeOptions} />
                  <HoverArea className="hoverArea">
                    <Typography>Click to add</Typography>
                  </HoverArea>
                </ThumbnailContainer>

                <Typography variant="subtitle1">{t.name}</Typography>
              </ButtonRoot>
            </Grid>
          ))}
        </TemplateContainer>
      </TemplatePopover>
    </>
  )
}

export default DefaultThemes
