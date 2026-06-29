import React from "react"
import Link from "@mui/material/Link"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import Tooltip from "@mui/material/Tooltip"

function preventDefault(event) {
  event.preventDefault()
}

const StyledDepositContext = styled(Typography)({
  flex: 1,
})

export default function Deposits() {
  return (
    <React.Fragment>
      <Tooltip
        title={`<Typography color="primary" variant="h6">`}
        placement="left"
        arrow
      >
        <Typography variant="h6" color="primary" gutterBottom>
          Recent Deposits
        </Typography>
      </Tooltip>
      <Tooltip
        title={`<Typography color="textPrimary" variant="h4">`}
        placement="left"
        arrow
      >
        <Typography component="p" variant="h4">
          $3,024.00
        </Typography>
      </Tooltip>
      <Tooltip
        title={`<Typography color="textSecondary">`}
        placement="left"
        arrow
      >
        <StyledDepositContext color="textSecondary">
          on 15 March, 2019
        </StyledDepositContext>
      </Tooltip>
      <div>
        <Tooltip title={`<Link color="primary">`} placement="left" arrow>
          <Link color="primary" href="#" onClick={preventDefault}>
            View balance
          </Link>
        </Tooltip>
      </div>
    </React.Fragment>
  )
}
