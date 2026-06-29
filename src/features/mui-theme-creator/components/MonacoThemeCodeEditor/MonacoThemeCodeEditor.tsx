"use client";

import React, { useEffect, useRef } from "react"

import useEditor from "./hooks/useEditor"
import useEditorStateSync from "./hooks/useEditorStateSync"
import useReadOnlyLines from "./hooks/useReadOnlyLines"
import useSave from "./hooks/useSave"
import useUndoRedo from "./hooks/useUndoRedo"

import "./editor.css"
import * as monaco from "monaco-editor"
import EditorControls from "./EditorControls"
import EditorErrors from "./EditorErrors"
import { styled } from "@mui/material/styles"
import { verbose } from "@/features/mui-theme-creator/utils"

const MonacoThemeEditorRoot = styled("div")(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
}))

const Container = styled("div")(({ theme }) => ({
  height: "calc(100% - 48px)",
  width: "100%",
}))

export const codeEditorId = "code-editor"

const MonacoThemeCodeEditor = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  // set up editor and configure options
  useEditor(editorRef)
  useEditorStateSync(editorRef)
  useReadOnlyLines(editorRef)

  // set Save and Undo/Redo listeners, and get handlers
  const handleSave = useSave(editorRef)
  const { handleRedo, handleUndo } = useUndoRedo(editorRef)

  useEffect(() => {
    return () => {
      verbose("MonacoThemeCodeEditor unmounted")
    }
  }, [])

  return (
    <MonacoThemeEditorRoot id="code-editor">
      <EditorControls
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
      />
      <Container id="container" />
      <EditorErrors editorRef={editorRef} />
    </MonacoThemeEditorRoot>
  )
}

export default MonacoThemeCodeEditor
