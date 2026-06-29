"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { EditorState } from "lexical";
import { Box } from "@mui/material";

import { ToolbarPlugin } from "./plugins/ToolbarPlugin";

interface LexicalEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const theme = {
  paragraph: "editor-paragraph",
  heading: {
    h1: "editor-heading-h1",
    h2: "editor-heading-h2",
    h3: "editor-heading-h3",
  },
  list: {
    ol: "editor-list-ol",
    ul: "editor-list-ul",
    listitem: "editor-list-item",
  },
  text: {
    bold: "editor-text-bold",
    italic: "editor-text-italic",
    underline: "editor-text-underline",
    strikethrough: "editor-text-strikethrough",
    code: "editor-text-code",
  },
  link: "editor-link",
};

function onError(error: Error) {
  console.error(error);
}

export function LexicalEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
}: LexicalEditorProps) {
  const initialConfig = {
    namespace: "ProductEditor",
    theme,
    onError,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      LinkNode,
    ],
  };

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const json = JSON.stringify(editorState.toJSON());
      onChange(json);
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Box
        sx={{
          border: 1,
          borderColor: "grey.700",
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "grey.800",
        }}
      >
        <ToolbarPlugin />
        <Box
          sx={{
            position: "relative",
            bgcolor: "grey.800",
          }}
        >
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                style={{
                  minHeight: "200px",
                  padding: "16px",
                  outline: "none",
                  color: "#fff",
                  fontSize: "0.875rem",
                  lineHeight: "1.5",
                }}
              />
            }
            placeholder={
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  color: "grey.500",
                  fontSize: "0.875rem",
                  pointerEvents: "none",
                }}
              >
                {placeholder}
              </Box>
            }
            ErrorBoundary={() => <div>Error loading editor</div>}
          />
        </Box>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <OnChangePlugin onChange={handleChange} />
      </Box>
    </LexicalComposer>
  );
}
