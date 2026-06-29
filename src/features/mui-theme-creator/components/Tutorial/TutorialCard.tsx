import React from "react"
import clsx from "clsx"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"
import Divider from "@mui/material/Divider"
import Typography from "@mui/material/Typography"
import { styled } from "@mui/material/styles"
import TutorialStepButton from "./TutorialStepButton"

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 750,
}))

const StyledCardActions = styled(CardActions)(({ theme }) => ({
  justifyContent: "space-between",
}))

interface TutorialCardProps {
  title: string
  children?: React.ReactNode
  className?: string
}

const TutorialCard = ({ title, ...props }: TutorialCardProps) => {
  return (
    <StyledCard {...props} className={clsx(props.className)}>
      <CardContent>
        <Typography variant="h4">{title}</Typography>
      </CardContent>
      <CardContent>{props.children}</CardContent>
      <Divider />
      <StyledCardActions>
        <TutorialStepButton variant="prev" />
        <TutorialStepButton variant="next" />
      </StyledCardActions>
    </StyledCard>
  )
}

export default TutorialCard
