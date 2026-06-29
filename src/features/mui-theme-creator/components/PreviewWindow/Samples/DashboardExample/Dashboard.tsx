import React from "react"
import clsx from "clsx"
import { styled } from "@mui/material/styles"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import Divider from "@mui/material/Divider"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Box from "@mui/material/Box"
import { mainListItems, secondaryListItems } from "./listItems"
import Chart from "./Chart"
import Deposits from "./Deposits"
import Orders from "./Orders"

const drawerWidth = 240

const StyledRoot = styled("div")({
  display: "flex",
})

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    position: "static",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}))

const StyledContent = styled("div")({
  flexGrow: 1,
  overflow: "auto",
})

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}))

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  overflow: "auto",
  flexDirection: "column",
}))

const StyledFixedHeightPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  overflow: "auto",
  flexDirection: "column",
  height: 240,
}))

export default function Dashboard() {
  return (
    <StyledRoot>
      <Box sx={{ display: { xs: "none", sm: "block" } }}>
        <StyledDrawer
          variant="permanent"
          open
        >
          <List>{mainListItems}</List>
          <Divider />
          <List>{secondaryListItems}</List>
        </StyledDrawer>
      </Box>
      <StyledContent>
        <StyledContainer maxWidth="lg">
          <Grid container spacing={3}>
            {/* Chart */}
            <Grid item xs={12} md={8}>
              <StyledFixedHeightPaper>
                <Chart />
              </StyledFixedHeightPaper>
            </Grid>
            {/* Recent Deposits */}
            <Grid item xs={12} md={4}>
              <StyledFixedHeightPaper>
                <Deposits />
              </StyledFixedHeightPaper>
            </Grid>
            {/* Recent Orders */}
            <Grid item xs={12}>
              <StyledPaper>
                <Orders />
              </StyledPaper>
            </Grid>
          </Grid>
        </StyledContainer>
      </StyledContent>
    </StyledRoot>
  )
}
