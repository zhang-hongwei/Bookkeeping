import React, { useCallback, FormEvent } from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import TextField from "@mui/material/TextField"
import DialogActions from "@mui/material/DialogActions"
import { useThemeCreatorActions } from "@/store/mui-theme-creator"
import EditIcon from "@mui/icons-material/Edit"

function RenameThemeButton({ themeId, defaultName }) {
  const { renameSavedTheme } = useThemeCreatorActions()
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = event => {
    event.stopPropagation()
    setOpen(true)
  }

  const handleClose = event => {
    setOpen(false)
  }

  const handleFocus = event => event.target.select()

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      renameSavedTheme(themeId, event.target.themeName.value)
      // handleClose(event)
    },
    [renameSavedTheme, themeId]
  )

  return (
    <>
      <Button size="large" startIcon={<EditIcon />} onClick={handleClickOpen}>
        Rename
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="rename-theme-dialog"
        onClick={event => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit} autoComplete="off">
          <DialogTitle id="rename-theme-dialog">Rename Theme</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              onFocus={handleFocus}
              defaultValue={defaultName}
              margin="dense"
              name="themeName"
              label="Theme Name"
              fullWidth
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary" onClick={handleClose}>
              Rename
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

export default RenameThemeButton
