import React from "react"
import PropTypes from "prop-types"
import { styled } from "@mui/material/styles"
import Toolbar from "@mui/material/Toolbar"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import SearchIcon from "@mui/icons-material/Search"
import Typography from "@mui/material/Typography"
import Link from "@mui/material/Link"
import Tooltip from "@mui/material/Tooltip"

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
}))

const StyledToolbarTitle = styled(Typography)({
  flex: 1,
})

const StyledToolbarSecondary = styled(Toolbar)({
  justifyContent: "space-between",
  overflowX: "auto",
})

const StyledToolbarLink = styled(Link)(({ theme }) => ({
  padding: theme.spacing(1),
  flexShrink: 0,
}))

export default function BlogHeader(props) {
  const { sections, title } = props

  return (
    <React.Fragment>
      <StyledToolbar>
        <Tooltip title={`<Button color="default" size="small">`} arrow>
          <Button size="small">Subscribe</Button>
        </Tooltip>
        <Tooltip title={`<Typography color="inherit" variant="h5">`} arrow>
          <StyledToolbarTitle
            component="h2"
            variant="h5"
            color="inherit"
            align="center"
            noWrap
          >
            {title}
          </StyledToolbarTitle>
        </Tooltip>
        <Tooltip title={`<IconButton color="default">`} arrow>
          <IconButton>
            <SearchIcon />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={`<Button color="default" variant="outlined" size="small">`}
          arrow
        >
          <Button variant="outlined" size="small">
            Sign up
          </Button>
        </Tooltip>
      </StyledToolbar>
      <StyledToolbarSecondary
        component="nav"
        variant="dense"
      >
        {sections.map(section => (
          <Tooltip
            title={`<Link color="inherit" variant="body2">`}
            arrow
            key={section.title}
          >
            <StyledToolbarLink
              color="inherit"
              noWrap
              variant="body2"
              href={section.url}
            >
              {section.title}
            </StyledToolbarLink>
          </Tooltip>
        ))}
      </StyledToolbarSecondary>
    </React.Fragment>
  )
}

BlogHeader.propTypes = {
  sections: PropTypes.array,
  title: PropTypes.string,
}
