import React from "react"
import AppBar from "@mui/material/AppBar"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import CardHeader from "@mui/material/CardHeader"
import Grid from "@mui/material/Grid"
import StarIcon from "@mui/icons-material/StarBorder"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import Link from "@mui/material/Link"
import { styled } from "@mui/material/styles"
import Container from "@mui/material/Container"
import { darken, lighten } from "@mui/material/styles/colorManipulator"
import Tooltip from "@mui/material/Tooltip"

const StyledUl = styled("ul")({
  margin: 0,
  padding: 0,
  listStyle: "none",
})

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
}))

const StyledToolbar = styled(Toolbar)({
  flexWrap: "wrap",
})

const StyledToolbarTitle = styled(Typography)({
  flexGrow: 1,
})

const StyledLink = styled(Link)(({ theme }) => ({
  margin: theme.spacing(1, 1.5),
}))

const StyledHeroContent = styled(Container)(({ theme }) => ({
  padding: theme.spacing(8, 0, 6),
}))

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  color: theme.palette.secondary.contrastText,
  "&.main": {
    backgroundColor: theme.palette.secondary.main,
  },
  "&.light": {
    backgroundColor: theme.palette.secondary.light,
  },
  "&.dark": {
    backgroundColor: theme.palette.secondary.dark,
  },
}))

const StyledCardPricing = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "baseline",
  marginBottom: theme.spacing(2),
}))

const StyledFooter = styled(Container)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  marginTop: theme.spacing(8),
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  [theme.breakpoints.up("sm")]: {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
  },
}))

const tiers = [
  {
    title: "Free",
    price: "0",
    description: [
      "10 users included",
      "2 GB of storage",
      "Help center access",
      "Email support",
    ],
    buttonText: "Sign up for free",
    buttonVariant: "outlined",
    color: "dark",
  },
  {
    title: "Pro",
    subheader: "Most popular",
    price: "15",
    description: [
      "20 users included",
      "10 GB of storage",
      "Help center access",
      "Priority email support",
    ],
    buttonText: "Get started",
    buttonVariant: "contained",
    color: "main",
  },
  {
    title: "Enterprise",
    price: "30",
    description: [
      "50 users included",
      "30 GB of storage",
      "Help center access",
      "Phone & email support",
    ],
    buttonText: "Contact us",
    buttonVariant: "outlined",
    color: "light",
  },
]
const footers = [
  {
    title: "Company",
    description: ["Team", "History", "Contact us", "Locations"],
  },
  {
    title: "Features",
    description: [
      "Cool stuff",
      "Random feature",
      "Team feature",
      "Developer stuff",
      "Another one",
    ],
  },
  {
    title: "Resources",
    description: [
      "Resource",
      "Resource name",
      "Another resource",
      "Final resource",
    ],
  },
  {
    title: "Legal",
    description: ["Privacy policy", "Terms of use"],
  },
]

export default function PricingExample() {
  return (
    <React.Fragment>
      <Tooltip title={`<AppBar color="default">`} placement="bottom" arrow>
        <StyledAppBar
          position="static"
          color="default"
          elevation={0}
        >
          <StyledToolbar>
            <Tooltip
              title={`<Typography color="textPrimary" variant="h6">`}
              placement="left"
              arrow
            >
              <StyledToolbarTitle
                variant="h6"
                color="inherit"
                noWrap
              >
                Company name
              </StyledToolbarTitle>
            </Tooltip>
            <nav>
              <Tooltip
                title={`<Link color="textPrimary" variant="button">`}
                arrow
              >
                <StyledLink
                  variant="button"
                  color="textPrimary"
                  href="#"
                >
                  Features
                </StyledLink>
              </Tooltip>
              <Tooltip
                title={`<Link color="textPrimary" variant="button">`}
                arrow
              >
                <StyledLink
                  variant="button"
                  color="textPrimary"
                  href="#"
                >
                  Enterprise
                </StyledLink>
              </Tooltip>
              <Tooltip
                title={`<Link color="textPrimary" variant="button">`}
                arrow
              >
                <StyledLink
                  variant="button"
                  color="textPrimary"
                  href="#"
                >
                  Support
                </StyledLink>
              </Tooltip>
            </nav>
            <Tooltip
              title={`<Button color="primary" variant="outlined">`}
              arrow
            >
              <StyledLink
                component={Button}
                href="#"
                color="primary"
                variant="outlined"
              >
                Login
              </StyledLink>
            </Tooltip>
          </StyledToolbar>
        </StyledAppBar>
      </Tooltip>
      {/* Hero unit */}
      <StyledHeroContent maxWidth="sm" component="main">
        <Tooltip
          title={`<Typography color="textPrimary" variant="h2">`}
          placement="top"
          arrow
        >
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="textPrimary"
            gutterBottom
          >
            Pricing
          </Typography>
        </Tooltip>
        <Tooltip
          title={`<Typography color="textSecondary" variant="h5">`}
          arrow
        >
          <Typography
            variant="h5"
            align="center"
            color="textSecondary"
            component="p"
          >
            Quickly build an effective pricing table for your potential
            customers with this layout. It&apos;s built with default Material-UI
            components with little customization.
          </Typography>
        </Tooltip>
      </StyledHeroContent>
      {/* End hero unit */}
      <Container maxWidth="md" component="main">
        <Grid container spacing={5} alignItems="flex-end">
          {tiers.map(tier => (
            // Enterprise card is full width at sm breakpoint
            <Grid
              item
              key={tier.title}
              xs={12}
              sm={tier.title === "Enterprise" ? 12 : 6}
              md={4}
            >
              <Card>
                <Tooltip title={`<CardHeader>`} arrow placement="top">
                  <div>
                    <StyledCardHeader
                      title={tier.title}
                      subheader={tier.subheader}
                      titleTypographyProps={{ align: "center" }}
                      subheaderTypographyProps={{
                        align: "center",
                      }}
                      action={tier.title === "Pro" ? <StarIcon /> : null}
                      className={tier.color}
                    />
                  </div>
                </Tooltip>
                <CardContent>
                  <StyledCardPricing>
                    <Tooltip
                      title={`<Typography color="textPrimary" variant="h3">`}
                      placement="left"
                      arrow
                    >
                      <Typography
                        component="h2"
                        variant="h3"
                        color="textPrimary"
                      >
                        ${tier.price}
                      </Typography>
                    </Tooltip>
                    <Tooltip
                      title={`<Typography color="textSecondary" variant="h6">`}
                      placement="right"
                      arrow
                    >
                      <Typography variant="h6" color="textSecondary">
                        /mo
                      </Typography>
                    </Tooltip>
                  </StyledCardPricing>
                  <StyledUl>
                    {tier.description.map(line => (
                      <Tooltip
                        key={line}
                        title={`<Typography color="textPrimary" variant="subtitle1" component="li">`}
                        placement="left"
                        arrow
                      >
                        <Typography
                          component="li"
                          variant="subtitle1"
                          align="center"
                        >
                          {line}
                        </Typography>
                      </Tooltip>
                    ))}
                  </StyledUl>
                </CardContent>
                <CardActions>
                  <Tooltip
                    title={`<Button color="primary" variant="${tier.buttonVariant}">`}
                    arrow
                  >
                    <Button
                      fullWidth
                      variant={tier.buttonVariant}
                      color="primary"
                    >
                      {tier.buttonText}
                    </Button>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      {/* Footer */}
      <StyledFooter maxWidth="md" component="footer">
        <Grid container spacing={4} justifyContent="space-evenly">
          {footers.map(footer => (
            <Grid item xs={6} sm={3} key={footer.title}>
              <Tooltip
                title={`<Typography color="textPrimary" variant="h6">`}
                placement="left"
                arrow
              >
                <Typography variant="h6" color="textPrimary" gutterBottom>
                  {footer.title}
                </Typography>
              </Tooltip>
              <StyledUl>
                {footer.description.map(item => (
                  <li key={item}>
                    <Tooltip
                      title={`<Link color="textSecondary" variant="subtitle1">`}
                      placement="left"
                      arrow
                    >
                      <Link href="#" variant="subtitle1" color="textSecondary">
                        {item}
                      </Link>
                    </Tooltip>
                  </li>
                ))}
              </StyledUl>
            </Grid>
          ))}
        </Grid>
      </StyledFooter>
      {/* End footer */}
    </React.Fragment>
  )
}
