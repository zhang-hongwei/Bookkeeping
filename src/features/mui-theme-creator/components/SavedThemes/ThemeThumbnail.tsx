import React, { useEffect, useState } from "react"
import {
  createTheme,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import AddIcon from "@mui/icons-material/Add"

interface ThemeThumbnailProps {
  themeOptions: any
  large?: boolean
}

const Root = styled("div")<{ large?: boolean }>(({ theme, large }) => ({
  height: 100,
  maxWidth: "85vw",
  width: 1600 / 9,
  position: "relative",
  ...(large && {
    height: 200,
    width: (1600 / 9) * 2,
    fontSize: 28,
    "& .fab": {
      height: 32,
      width: 32,
      bottom: 8,
      right: 8,
    },
    "& .fabIcon": {
      height: 36,
      width: 36,
    },
  }),
}))

const AppBar = styled("div")(({ theme }) => ({
  height: "15%",
  width: "100%",
  paddingLeft: 4,
  fontSize: "75%",
}))

const AppBarTitle = styled("span")(({ theme }) => ({}))

const ContentTitle = styled("span")(({ theme }) => ({
  fontSize: "60%",
  paddingLeft: 4,
}))

const Card = styled("div")(({ theme }) => ({
  height: "50%",
  margin: 4,
}))

const CardHeader = styled("div")(({ theme }) => ({
  fontSize: "55%",
}))

const CardSubheader = styled("div")(({ theme }) => ({
  fontSize: "45%",
}))

const Fab = styled("div")<{ large?: boolean }>(({ theme, large }) => ({
  height: large ? 32 : 16,
  width: large ? 32 : 16,
  borderRadius: "50%",
  position: "absolute",
  bottom: large ? 8 : 4,
  right: large ? 8 : 4,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}))

const FabIcon = styled(AddIcon)<{ large?: boolean }>(({ theme, large }) => ({
  height: large ? 36 : 18,
  width: large ? 36 : 18,
}))

function ThemeThumbnail({ themeOptions, large = false }: ThemeThumbnailProps) {
  const [themeObject, setThemeObject] = useState({})

  useEffect(() => setThemeObject(createTheme(themeOptions)), [themeOptions])

  const { background, primary, secondary, text } = themeObject?.palette || {}

  return (
    <Root
      large={large}
      style={{
        backgroundColor: background?.default,
        color: text?.primary,
      }}
    >
      <AppBar
        style={{ backgroundColor: primary?.main }}
      >
        <AppBarTitle
          style={{ color: primary?.contrastText }}
        >
          Title
        </AppBarTitle>
      </AppBar>
      <ContentTitle>Content</ContentTitle>
      <Card
        style={{ backgroundColor: background?.paper }}
      >
        <CardHeader>Card Header</CardHeader>
        <CardSubheader
          style={{ color: text?.secondary }}
        >
          Card Subheader
        </CardSubheader>
      </Card>
      <Fab
        large={large}
        style={{
          backgroundColor: secondary?.main,
          color: secondary?.contrastText,
        }}
      >
        <FabIcon large={large} />
      </Fab>
    </Root>
  )
}

export default ThemeThumbnail
