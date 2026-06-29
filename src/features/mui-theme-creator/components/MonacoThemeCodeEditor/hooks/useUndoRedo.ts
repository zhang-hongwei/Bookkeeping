import { EditorRefType } from "../types"
import { useEffect, useCallback } from "react"
import { useThemeCreatorSelector, useThemeCreatorActions } from "@/store/mui-theme-creator/store"
import { verbose } from "@/features/mui-theme-creator/utils"

export default function useUndoRedo(editorRef: EditorRefType) {
  const { updateEditorState, updateVersionStates } = useThemeCreatorActions()

  // handle initial configuration of undo/redo state properties
  useEffect(() => {
    const initialVersionId = editorRef.current
      ?.getModel()
      ?.getAlternativeVersionId()

    // set initial versions
    updateEditorState({
      initialVersion: initialVersionId,
      currentVersion: initialVersionId,
      lastVersion: initialVersionId,
      savedVersion: initialVersionId,
    })
  }, [updateEditorState, editorRef])

  useTrackUndoRedoState(editorRef)
  return useUndoRedoHandlers(editorRef)
}

const useTrackUndoRedoState = (editorRef: EditorRefType) => {
  const { updateVersionStates } = useThemeCreatorActions()

  const handleContentChange = useCallback(() => {
    const nextVersionId =
      editorRef.current?.getModel()?.getAlternativeVersionId() || 0

    updateVersionStates(nextVersionId)
  }, [updateVersionStates, editorRef])

  useEffect(() => {
    // set up event handler for editor changes
    const modelContentChangeBinding = editorRef.current?.onDidChangeModelContent(
      handleContentChange
    )

    return () => {
      modelContentChangeBinding?.dispose()
    }
  }, [handleContentChange, editorRef])
}

const useUndoRedoHandlers = (editorRef: EditorRefType) => {
  const handleRedo = useCallback(() => {
    verbose(
      "MonacoThemeCodeEditor/hooks/useUndoRedo -> handleRedo: global redo listener fired"
    )
    editorRef.current?.trigger("MonacoThemeCodeEditor", "redo", null)
    editorRef.current?.focus()
  }, [editorRef])

  const handleUndo = useCallback(() => {
    verbose(
      "MonacoThemeCodeEditor/hooks/useUndoRedo -> handleUndo: global undo listener fired"
    )
    editorRef.current?.trigger("MonacoThemeCodeEditor", "undo", null)
    editorRef.current?.focus()
  }, [editorRef])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey) {
      if (event.code === "KeyZ") {
        handleUndo()
      }
      if (event.code === "KeyY") {
        handleRedo()
      }
    }
  }, [handleUndo, handleRedo])

  // set up event listener to handle Ctrl+Z or Ctrl+Y keydowns
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  // return the handlers to be used on undo/redo
  return { handleRedo, handleUndo }
}
