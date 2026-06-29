"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useState } from "react";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode, HeadingTagType } from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { Box, Stack, IconButton, Select, MenuItem, Divider } from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatStrikethrough,
  FormatListBulleted,
  FormatListNumbered,
  Undo,
  Redo,
  Code,
  FormatQuote,
} from "@mui/icons-material";

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState("paragraph");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
    }
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatBlockType = (type: string) => {
    if (type === "paragraph") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode("h1"));
        }
      });
    } else if (type === "h1" || type === "h2" || type === "h3") {
      formatHeading(type as HeadingTagType);
    } else if (type === "quote") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
    setBlockType(type);
  };

  return (
    <Box
      sx={{
        display: "flex",
        p: 1,
        gap: 0.5,
        borderBottom: 1,
        borderColor: "grey.700",
        bgcolor: "grey.900",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {/* Block Type Selector */}
      <Select
        value={blockType}
        onChange={(e) => formatBlockType(e.target.value)}
        size="small"
        sx={{
          minWidth: 120,
          height: 32,
          color: "white",
          bgcolor: "grey.800",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "grey.700",
          },
          "& .MuiSvgIcon-root": {
            color: "white",
          },
        }}
      >
        <MenuItem value="paragraph">Paragraph</MenuItem>
        <MenuItem value="h1">Heading 1</MenuItem>
        <MenuItem value="h2">Heading 2</MenuItem>
        <MenuItem value="h3">Heading 3</MenuItem>
        <MenuItem value="quote">Quote</MenuItem>
      </Select>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ mx: 0.5, bgcolor: "grey.700" }}
      />

      {/* Text Formatting */}
      <IconButton
        size="small"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        sx={{
          width: 32,
          height: 32,
          color: isBold ? "primary.main" : "grey.400",
          "&:hover": { bgcolor: "grey.700" },
        }}
      >
        <FormatBold fontSize="small" />
      </IconButton>

      <IconButton
        size="small"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        sx={{
          width: 32,
          height: 32,
          color: isItalic ? "primary.main" : "grey.400",
          "&:hover": { bgcolor: "grey.700" },
        }}
      >
        <FormatItalic fontSize="small" />
      </IconButton>

      <IconButton
        size="small"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        sx={{
          width: 32,
          height: 32,
          color: isUnderline ? "primary.main" : "grey.400",
          "&:hover": { bgcolor: "grey.700" },
        }}
      >
        <FormatUnderlined fontSize="small" />
      </IconButton>

      <IconButton
        size="small"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        sx={{
          width: 32,
          height: 32,
          color: isStrikethrough ? "primary.main" : "grey.400",
          "&:hover": { bgcolor: "grey.700" },
        }}
      >
        <FormatStrikethrough fontSize="small" />
      </IconButton>

      <IconButton
        size="small"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
        }}
        sx={{
          width: 32,
          height: 32,
          color: "grey.400",
          "&:hover": { bgcolor: "grey.700" },
        }}
      >
        <Code fontSize="small" />
      </IconButton>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ mx: 0.5, bgcolor: "grey.700" }}
      />

      {/* Lists */}
      <IconButton
        size="small"
        onClick={() => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        }}
        sx={{
          width: 32,
          height: 32,
          color: "grey.400",
          "&:hover": { bgcolor: "grey.700" },
        }}
      >
        <FormatListBulleted fontSize="small" />
      </IconButton>

      <IconButton
        size="small"
        onClick={() => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        }}
        sx={{
          width: 32,
          height: 32,
          color: "grey.400",
          "&:hover": { bgcolor: "grey.700" },
        }}
      >
        <FormatListNumbered fontSize="small" />
      </IconButton>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ mx: 0.5, bgcolor: "grey.700" }}
      />

      {/* Undo/Redo */}
      <IconButton
        size="small"
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        sx={{
          width: 32,
          height: 32,
          color: "grey.400",
          "&:hover": { bgcolor: "grey.700" },
        }}
      >
        <Undo fontSize="small" />
      </IconButton>

      <IconButton
        size="small"
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        sx={{
          width: 32,
          height: 32,
          color: "grey.400",
          "&:hover": { bgcolor: "grey.700" },
        }}
      >
        <Redo fontSize="small" />
      </IconButton>
    </Box>
  );
}
