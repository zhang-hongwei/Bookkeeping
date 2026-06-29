"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import "highlight.js/styles/atom-one-light.css";
import "highlight.js/styles/atom-one-dark.css";
import { CodeBlockRenderer, InlineCode } from "./CodeBlockRenderer";
import { fixMarkdownEmphasis } from "@/lib/markdown";

// Memoize markdown rendering — prevents re-parse on every streaming chunk
const MarkdownContentInner = memo(function MarkdownContentInner({
  content,
}: {
  content: string;
}) {
  const processed = fixMarkdownEmphasis(content);

  return (
    <Box
      className="markdown-body"
      sx={{
        fontSize: 13,
        lineHeight: 1.65,
        color: "text.primary",
        "& strong, & b": { fontWeight: 600 },
        "& em, & i": { color: "text.secondary" },
        "& hr": { borderColor: "divider", my: 1.5 },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          pre({ children }) {
            return <>{children}</>;
          },
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || "");
            const code = String(children).replace(/\n$/, "");

            if (!match) {
              return <InlineCode>{children}</InlineCode>;
            }
            return (
              <CodeBlockRenderer language={match[1]} code={code} className={className}>
                {children}
              </CodeBlockRenderer>
            );
          },
          a({ href, children }) {
            return (
              <Box
                component="a"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "info.main", textDecoration: "underline", "&:hover": { color: "info.light" } }}
              >
                {children}
              </Box>
            );
          },
          table({ children }) {
            return (
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ my: 1, bgcolor: "transparent", borderColor: "divider" }}
              >
                <Table size="small">{children}</Table>
              </TableContainer>
            );
          },
          thead({ children }) {
            return <TableHead>{children}</TableHead>;
          },
          tbody({ children }) {
            return <TableBody>{children}</TableBody>;
          },
          tr({ children }) {
            return <TableRow>{children}</TableRow>;
          },
          th({ children }) {
            return <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>{children}</TableCell>;
          },
          td({ children }) {
            return <TableCell sx={{ fontSize: 13 }}>{children}</TableCell>;
          },
          p({ children }) {
            return <Box component="p" sx={{ mb: 1, "&:last-child": { mb: 0 } }}>{children}</Box>;
          },
          ul({ children }) {
            return <Box component="ul" sx={{ pl: 2, mb: 1, listStyleType: "disc", "& > li": { mt: 0.25 } }}>{children}</Box>;
          },
          ol({ children }) {
            return <Box component="ol" sx={{ pl: 2, mb: 1, listStyleType: "decimal", "& > li": { mt: 0.25 } }}>{children}</Box>;
          },
          blockquote({ children }) {
            return (
              <Box
                sx={{
                  borderLeft: 3,
                  borderColor: "divider",
                  pl: 1.5,
                  color: "text.secondary",
                  fontStyle: "italic",
                  my: 1,
                }}
              >
                {children}
              </Box>
            );
          },
          h1({ children }) {
            return <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1.5, mb: 0.75, fontSize: 16 }}>{children}</Typography>;
          },
          h2({ children }) {
            return <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 1.25, mb: 0.5, fontSize: 14 }}>{children}</Typography>;
          },
          h3({ children }) {
            return <Typography fontWeight="bold" sx={{ mt: 1, mb: 0.5, fontSize: 13 }}>{children}</Typography>;
          },
        }}
      >
        {processed}
      </ReactMarkdown>
    </Box>
  );
});

export default MarkdownContentInner;
