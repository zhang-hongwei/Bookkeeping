import React from "react"
import Tooltip from "@mui/material/Tooltip"
import IconButton from "@mui/material/IconButton"
import SettingsIcon from "@mui/icons-material/Settings"
import Popover from "@mui/material/Popover"
import { useThemeCreatorSelector, useThemeCreatorActions } from "@/store/mui-theme-creator/store"
import Checkbox from "@mui/material/Checkbox"
import {
  List,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  ListSubheader,
} from "@mui/material"
import { styled } from "@mui/material/styles"

const FormControl = styled("div")(({ theme }) => ({
  margin: theme.spacing(3),
}))

const StyledPopover = styled(Popover)(({ theme }) => ({
  '& .MuiPopover-paper': {
    // backgroundColor: theme.palette.background.default,
  },
}))

const SettingsList = styled(List)(({ theme }) => ({
  minWidth: 320,
}))

const EditorButton = () => {
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)

  const handleOpen = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }
  const open = Boolean(anchorEl)

  return (
    <>
      <Tooltip title="Editor Settings">
        <IconButton onClick={handleOpen}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      <StyledPopover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <EditorSettings />
      </StyledPopover>
    </>
  )
}
export default EditorButton

const EditorSettings = () => {
  const formatOnSave = useThemeCreatorSelector(
    (state) => state.editor.formatOnSave
  )
  const outputTypescript = useThemeCreatorSelector(
    (state) => state.editor.outputTypescript
  )
  const { updateEditorState } = useThemeCreatorActions()
  const toggleFormatOnSave = () => updateEditorState({ formatOnSave: !formatOnSave })
  const toggleOutputTypescript = () =>
    updateEditorState({ outputTypescript: !outputTypescript })

  return (
    <SettingsList dense>
      <ListSubheader>Editor Settings</ListSubheader>
      <ListItemButton onClick={toggleFormatOnSave}>
        <ListItemText
          id="format-document-label"
          primary="Format Document on Save (Prettier)"
        />
        <ListItemSecondaryAction>
          <Checkbox
            checked={formatOnSave}
            onChange={toggleFormatOnSave}
            name="formatOnSave"
            inputProps={{ "aria-labelledby": "format-document-label" }}
          />
        </ListItemSecondaryAction>
      </ListItemButton>
      <ListItemButton onClick={toggleOutputTypescript}>
        <ListItemText
          id="output-typescript-label"
          primary="Copy Button Outputs Typescript"
        />
        <ListItemSecondaryAction>
          <Checkbox
            checked={outputTypescript}
            onChange={toggleOutputTypescript}
            name="outputTypescript"
            inputProps={{ "aria-labelledby": "output-typescript-label" }}
          />
        </ListItemSecondaryAction>
      </ListItemButton>
    </SettingsList>
  )
}
