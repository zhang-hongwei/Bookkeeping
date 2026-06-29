import React from "react"
import Button from "@mui/material/Button"
import { styled } from "@mui/material/styles"
import SnackbarContent from "@mui/material/SnackbarContent"
import { IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"

const action = (
  <Button color="secondary" size="small">
    lorem ipsum dolorem
  </Button>
)

const SnackbarRoot = styled("div")(({ theme }) => ({
  maxWidth: 600,
  "& > * + *": {
    marginTop: theme.spacing(2),
  },
}))

export default function SnackbarExample() {
  return (
    <SnackbarRoot>
      <SnackbarContent message="I love snacks." action={action} />
      <SnackbarContent
        message={
          "I love candy. I love cookies. I love cupcakes. \
          I love cheesecake. I love chocolate."
        }
        action={
          <IconButton size="small" aria-label="close" color="inherit">
            <CloseIcon />
          </IconButton>
        }
      />
      <SnackbarContent
        message="I love candy. I love cookies. I love cupcakes."
        action={action}
      />
      <SnackbarContent
        message={
          "I love candy. I love cookies. I love cupcakes. \
          I love cheesecake. I love chocolate."
        }
        action={action}
      />
    </SnackbarRoot>
  )
}
