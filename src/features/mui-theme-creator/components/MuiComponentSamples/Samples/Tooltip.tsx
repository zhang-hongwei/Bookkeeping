import React from "react"
import { styled } from "@mui/material/styles"
import AddIcon from "@mui/icons-material/Add"
import Fab from "@mui/material/Fab"
import DeleteIcon from "@mui/icons-material/Delete"
import IconButton from "@mui/material/IconButton"
import Tooltip from "@mui/material/Tooltip"

const StyledFab = styled(Fab)(({ theme }) => ({
  margin: theme.spacing(2),
}))

export default function TooltipExample() {
  return (
    <div>
      <Tooltip title="Delete">
        <IconButton aria-label="delete">
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Add" aria-label="add">
        <StyledFab color="primary">
          <AddIcon />
        </StyledFab>
      </Tooltip>
      <Tooltip title="Add" aria-label="add">
        <Fab color="secondary">
          <AddIcon />
        </Fab>
      </Tooltip>
    </div>
  )
}
