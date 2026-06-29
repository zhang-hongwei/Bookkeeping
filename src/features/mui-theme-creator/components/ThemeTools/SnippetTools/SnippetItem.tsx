import React, { useCallback } from "react"
import { SnippetModification } from "./types"
import { useThemeCreatorStore, useThemeCreatorActions } from "@/store/mui-theme-creator"
import { getByPath } from "@/features/mui-theme-creator/utils"
import {
  Link,
  Tooltip,
  Accordion,
  AccordionSummary,
  Typography,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { ThemeValueChangeEvent } from "../events"

const SnippetTitle = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(),
  flexGrow: 1,
}))

/**
 * Simple check of if the SnippetModification.configs are
 * set on the current theme options
 * @param configs
 */
const useIsSnippetIncluded = (configs: SnippetModification["configs"]) => {
  const themeOptions = useThemeCreatorStore((state) => state.themeOptions)
  for (const c in configs) {
    if (getByPath(themeOptions, configs[c].path) == null) {
      return false
    }
  }
  return true
}

interface SnippetItemProps {
  snippet: SnippetModification
}

const SnippetItem = ({ snippet }: SnippetItemProps) => {
  const { setThemeOptions, removeThemeOptions } = useThemeCreatorActions()

  const handleAddSnippet = useCallback(() => {
    setThemeOptions(snippet.configs)
    document.dispatchEvent(ThemeValueChangeEvent())
  }, [setThemeOptions, snippet.configs])

  const handleRemoveSnippet = useCallback(() => {
    removeThemeOptions(snippet.configs)
    document.dispatchEvent(ThemeValueChangeEvent())
  }, [removeThemeOptions, snippet.configs])

  const isSnippetIncluded = useIsSnippetIncluded(snippet.configs)

  const { info, docs, title } = snippet
  const toolTipContent = info && (
    <div>
      <div>{info}</div>
      {docs && (
        <Link
          href={docs}
          target="_blank"
          rel="noreferrer"
        >{`Theme ${title} Docs`}</Link>
      )}
    </div>
  )
  return (
    <Accordion
      disabled={isSnippetIncluded}
      onClick={isSnippetIncluded ? handleRemoveSnippet : handleAddSnippet}
    >
      <AccordionSummary>
        {isSnippetIncluded ? <RemoveIcon /> : <AddIcon />}
        <SnippetTitle variant="body2">
          {title}
        </SnippetTitle>
        {info && (
          <Tooltip title={toolTipContent} interactive arrow>
            <InfoOutlinedIcon />
          </Tooltip>
        )}
      </AccordionSummary>
    </Accordion>
  )
}

export default SnippetItem
