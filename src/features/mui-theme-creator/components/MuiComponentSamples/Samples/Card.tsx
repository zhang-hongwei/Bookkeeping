import React from "react"
import { styled } from "@mui/material/styles"
import clsx from "clsx"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import {
  Grid,
  CardHeader,
  Avatar,
  IconButton,
  CardMedia,
  Collapse,
} from "@mui/material"
import { red } from "@mui/material/colors"
import FavoriteIcon from "@mui/icons-material/Favorite"
import ShareIcon from "@mui/icons-material/Share"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import MoreVertIcon from "@mui/icons-material/MoreVert"

const SimpleCard = styled(Card)({
  minWidth: 275,
})

const BulletSpan = styled("span")({
  display: "inline-block",
  margin: "0 2px",
  transform: "scale(0.8)",
})

const TitleTypography = styled(Typography)({
  fontSize: 14,
})

const PosTypography = styled(Typography)({
  marginBottom: 12,
})

const ComplexCard = styled(Card)({
  maxWidth: 345,
})

const StyledCardMedia = styled(CardMedia)({
  height: 0,
  paddingTop: "56.25%", // 16:9
})

interface ExpandMoreProps {
  expand: boolean
}

const ExpandMore = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "expand",
})<ExpandMoreProps>(({ theme, expand }) => ({
  transform: expand ? "rotate(180deg)" : "rotate(0deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}))

const StyledAvatar = styled(Avatar)({
  backgroundColor: red[500],
})

export default function CardExample() {
  const bull = <BulletSpan>•</BulletSpan>
  const [expanded, setExpanded] = React.useState(false)

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

  return (
    <Grid container spacing={2}>
      <Grid>
        <Typography variant="h6">Simple</Typography>
        <SimpleCard>
          <CardContent>
            <TitleTypography
              color="textSecondary"
              gutterBottom
            >
              Word of the Day
            </TitleTypography>
            <Typography variant="h5" component="h2">
              be{bull}nev{bull}o{bull}lent
            </Typography>
            <PosTypography color="textSecondary">
              adjective
            </PosTypography>
            <Typography variant="body2" component="p">
              well meaning and kindly.
              <br />
              {'"a benevolent smile"'}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Learn More</Button>
            <Button size="small" color="primary">
              Save
            </Button>
            <Button size="small" color="secondary">
              Dismiss
            </Button>
          </CardActions>
        </SimpleCard>
      </Grid>
      <Grid>
        <Typography variant="h6">Outlined</Typography>
        <SimpleCard variant="outlined">
          <CardContent>
            <TitleTypography
              color="textSecondary"
              gutterBottom
            >
              Word of the Day
            </TitleTypography>
            <Typography variant="h5" component="h2">
              be{bull}nev{bull}o{bull}lent
            </Typography>
            <PosTypography color="textSecondary">
              adjective
            </PosTypography>
            <Typography variant="body2" component="p">
              well meaning and kindly.
              <br />
              {'"a benevolent smile"'}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Learn More</Button>
            <Button size="small" color="primary">
              Save
            </Button>
            <Button size="small" color="secondary">
              Dismiss
            </Button>
          </CardActions>
        </SimpleCard>
      </Grid>
      <Grid>
        <Typography variant="h6">Complex</Typography>
        <ComplexCard>
          <CardHeader
            avatar={
              <StyledAvatar aria-label="recipe">
                R
              </StyledAvatar>
            }
            action={
              <IconButton aria-label="settings">
                <MoreVertIcon />
              </IconButton>
            }
            title="Shrimp and Chorizo Paella"
            subheader="September 14, 2016"
          />
          <StyledCardMedia
            image="https://material-ui.com/static/images/cards/paella.jpg"
            title="Paella dish"
          />
          <CardContent>
            <Typography variant="body2" color="textSecondary" component="p">
              This impressive paella is a perfect party dish and a fun meal to
              cook together with your guests. Add 1 cup of frozen peas along
              with the mussels, if you like.
            </Typography>
          </CardContent>
          <CardActions disableSpacing>
            <IconButton aria-label="add to favorites">
              <FavoriteIcon />
            </IconButton>
            <IconButton aria-label="share">
              <ShareIcon />
            </IconButton>
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </CardActions>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
              <Typography paragraph>Method:</Typography>
              <Typography paragraph>
                Heat 1/2 cup of the broth in a pot until simmering, add saffron
                and set aside for 10 minutes.
              </Typography>
              <Typography paragraph>
                Heat oil in a (14- to 16-inch) paella pan or a large, deep
                skillet over medium-high heat. Add chicken, shrimp and chorizo,
                and cook, stirring occasionally until lightly browned, 6 to 8
                minutes. Transfer shrimp to a large plate and set aside, leaving
                chicken and chorizo in the pan. Add pimentón, bay leaves,
                garlic, tomatoes, onion, salt and pepper, and cook, stirring
                often until thickened and fragrant, about 10 minutes. Add
                saffron broth and remaining 4 1/2 cups chicken broth; bring to a
                boil.
              </Typography>
              <Typography paragraph>
                Add rice and stir very gently to distribute. Top with artichokes
                and peppers, and cook without stirring, until most of the liquid
                is absorbed, 15 to 18 minutes. Reduce heat to medium-low, add
                reserved shrimp and mussels, tucking them down into the rice,
                and cook again without stirring, until mussels have opened and
                rice is just tender, 5 to 7 minutes more. (Discard any mussels
                that don't open.)
              </Typography>
              <Typography>
                Set aside off of the heat to let rest for 10 minutes, and then
                serve.
              </Typography>
            </CardContent>
          </Collapse>
        </ComplexCard>
      </Grid>
    </Grid>
  )
}
