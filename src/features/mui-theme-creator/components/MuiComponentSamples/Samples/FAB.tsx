import React from "react"
import { styled } from "@mui/material/styles"
import Fab from "@mui/material/Fab"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import FavoriteIcon from "@mui/icons-material/Favorite"
import NavigationIcon from "@mui/icons-material/Navigation"

const Root = styled("div")(({ theme }) => ({
  "& > *": {
    margin: theme.spacing(1),
  },
}))

const ExtendedIcon = styled(NavigationIcon)(({ theme }) => ({
  marginRight: theme.spacing(1),
}))

export default function FabExample() {
  return (
    <Root>
      <Fab color="primary" aria-label="add">
        <AddIcon />
      </Fab>
      <Fab color="secondary" aria-label="edit">
        <EditIcon />
      </Fab>
      <Fab variant="extended">
        <ExtendedIcon />
        Navigate
      </Fab>
      <Fab disabled aria-label="like">
        <FavoriteIcon />
      </Fab>
    </Root>
  )
}
