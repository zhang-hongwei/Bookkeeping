import React from "react"
import { styled } from "@mui/material/styles"
import Avatar from "@mui/material/Avatar"
import { deepOrange, deepPurple, pink, green } from "@mui/material/colors"
import FolderIcon from "@mui/icons-material/Folder"
import PageviewIcon from "@mui/icons-material/Pageview"
import AssignmentIcon from "@mui/icons-material/Assignment"
import AvatarGroup from "@mui/material/AvatarGroup"

const Root = styled("div")({
  display: "flex",
  justifyContent: "space-between",
})

const AvatarSet = styled("div")(({ theme }) => ({
  display: "flex",
  margin: theme.spacing(2),
  "& > *": {
    margin: theme.spacing(1),
  },
}))

const OrangeAvatar = styled(Avatar)(({ theme }) => ({
  color: theme.palette.getContrastText(deepOrange[500]),
  backgroundColor: deepOrange[500],
}))

const PurpleAvatar = styled(Avatar)(({ theme }) => ({
  color: theme.palette.getContrastText(deepPurple[500]),
  backgroundColor: deepPurple[500],
}))

const PinkAvatar = styled(Avatar)(({ theme }) => ({
  color: theme.palette.getContrastText(pink[500]),
  backgroundColor: pink[500],
}))

const GreenAvatar = styled(Avatar)({
  color: "#fff",
  backgroundColor: green[500],
})

const SmallAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(3),
  height: theme.spacing(3),
}))

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(7),
  height: theme.spacing(7),
}))

export default function AvatarExample() {
  return (
    <Root>
      <AvatarSet>
        <Avatar
          alt="Remy Sharp"
          src="https://material-ui.com/static/images/avatar/1.jpg"
        />
        <Avatar
          alt="Travis Howard"
          src="https://material-ui.com/static/images/avatar/2.jpg"
        />
        <Avatar
          alt="Cindy Baker"
          src="https://material-ui.com/static/images/avatar/3.jpg"
        />
      </AvatarSet>
      <AvatarSet>
        <Avatar>H</Avatar>
        <OrangeAvatar>N</OrangeAvatar>
        <PurpleAvatar>OP</PurpleAvatar>
      </AvatarSet>
      <AvatarSet>
        <SmallAvatar
          alt="Remy Sharp"
          src="https://material-ui.com/static/images/avatar/1.jpg"
        />
        <Avatar
          alt="Remy Sharp"
          src="https://material-ui.com/static/images/avatar/1.jpg"
        />
        <LargeAvatar
          alt="Remy Sharp"
          src="https://material-ui.com/static/images/avatar/1.jpg"
        />
      </AvatarSet>
      <AvatarSet>
        <Avatar>
          <FolderIcon />
        </Avatar>
        <PinkAvatar>
          <PageviewIcon />
        </PinkAvatar>
        <GreenAvatar>
          <AssignmentIcon />
        </GreenAvatar>
      </AvatarSet>
      <AvatarSet>
        <AvatarGroup max={4}>
          <Avatar
            alt="Remy Sharp"
            src="https://material-ui.com/static/images/avatar/1.jpg"
          />
          <Avatar
            alt="Travis Howard"
            src="https://material-ui.com/static/images/avatar/2.jpg"
          />
          <Avatar
            alt="Cindy Baker"
            src="https://material-ui.com/static/images/avatar/3.jpg"
          />
          <Avatar
            alt="Agnes Walker"
            src="https://material-ui.com/static/images/avatar/4.jpg"
          />
          <Avatar
            alt="Trevor Henderson"
            src="https://material-ui.com/static/images/avatar/5.jpg"
          />
        </AvatarGroup>
      </AvatarSet>
    </Root>
  )
}
