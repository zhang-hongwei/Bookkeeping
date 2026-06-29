import React from "react"
import PropTypes from "prop-types"
import { styled } from "@mui/material/styles"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import Link from "@mui/material/Link"
import Tooltip from "@mui/material/Tooltip"

const StyledSidebarAboutBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
}))

const StyledSidebarSection = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(3),
}))

export default function BlogSidebar(props) {
  const { archives, description, social, title } = props

  return (
    <Grid size={{ xs: 12, md: 4 }}>
      <StyledSidebarAboutBox elevation={0}>
        <Tooltip title={`<Typography variant="h6">`} placement="left" arrow>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        </Tooltip>
        <Tooltip title={`<Typography variant="body1">`} placement="left" arrow>
          <Typography>{description}</Typography>
        </Tooltip>
      </StyledSidebarAboutBox>
      <Tooltip title={`<Typography variant="h6">`} placement="left" arrow>
        <StyledSidebarSection
          variant="h6"
          gutterBottom
        >
          Archives
        </StyledSidebarSection>
      </Tooltip>
      {archives.map(archive => (
        <Tooltip
          key={archive.title}
          title={`<Link color="primary" variant="body1">`}
          placement="left"
          arrow
        >
          <Link display="block" variant="body1" href={archive.url}>
            {archive.title}
          </Link>
        </Tooltip>
      ))}
      <Tooltip title={`<Typography variant="h6">`} placement="left" arrow>
        <StyledSidebarSection
          variant="h6"
          gutterBottom
        >
          Social
        </StyledSidebarSection>
      </Tooltip>
      {social.map(network => (
        <Tooltip
          key={network.name}
          title={`<Link color="primary" variant="body1">`}
          placement="left"
          arrow
        >
          <Link display="block" variant="body1" href="#">
            <Grid container direction="row" spacing={1} alignItems="center">
              <Grid>
                <network.icon />
              </Grid>
              <Grid>{network.name}</Grid>
            </Grid>
          </Link>
        </Tooltip>
      ))}
    </Grid>
  )
}

BlogSidebar.propTypes = {
  archives: PropTypes.array,
  description: PropTypes.string,
  social: PropTypes.array,
  title: PropTypes.string,
}
