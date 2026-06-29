import { useEffect, useCallback } from "react"
import * as monaco from "monaco-editor"
import { EditorRefType } from "../types"
// custom theme config
import { useThemeCreatorStore, useThemeCreatorActions } from "@/store/mui-theme-creator"
import { verbose } from "@/features/mui-theme-creator/utils"

/**
 * Transpile the editor and return any semantic or syntactic
 * errors as well as the emitted code
 * @param editorRef - ref of the monaco-editor
 * @returns [semanticDiagnostics: Diagnostic[], syntacticDiagnostics: Diagnostic[], emittedOutput: any]
 */
async function validateInput(editorRef: EditorRefType) {
  // get the JS output of the typescript inside the code editor
  const model = editorRef.current?.getModel()
  if (!model) return [null, null, null]
  const worker = await monaco.languages.typescript.getTypeScriptWorker()
  const proxy = await worker(model.uri)

  // get the current semantic errors, and the emitted output
  return await Promise.all([
    proxy.getSemanticDiagnostics(model.uri.toString()),
    proxy.getSyntacticDiagnostics(model.uri.toString()),
    proxy.getEmitOutput(model.uri.toString()),
  ])
}

/**
 * Run the formatDocument action on the monaco editor
 * @param editorRef - ref of the monaco-editor
 * @returns true if document was formatted, false otherwise
 */
async function formatInput(editorRef: EditorRefType) {
  try {
    await editorRef.current?.getAction("editor.action.formatDocument").run()
    return true
  } catch (err) {
    verbose(
      "MonacoThemeCodeEditor/hooks/useSave -> formatInput: Error formatting document",
      err
    )
  }
  return false
}

/**
 * Create a handler for saving the code editor contents to the theme options,
 * create an event listener for the Ctrl + S key combo, and return the
 * handler for saving code editor contents
 * @param editorRef
 * @returns Function that handles saving code editor contents
 */
export default function useSave(editorRef: EditorRefType) {
  const formatOnSave = useThemeCreatorStore(
    (state) => state.editor.formatOnSave
  )
  const { updateEditorState, saveEditorToTheme } = useThemeCreatorActions()
  const handleSave = useCallback(async () => {
    // clear existing errors first
    updateEditorState({ errors: [] })

    // format document if required
    if (formatOnSave) await formatInput(editorRef)

    const [
      semanticDiagnostics,
      syntacticDiagnostics,
      emittedOutput,
    ] = await validateInput(editorRef)

    // if there are semantic errors, prevent saving, else save to zustand store
    const errors = [...syntacticDiagnostics, ...semanticDiagnostics]
    if (errors.length > 0) {
      // handle errors
      updateEditorState({
        errors,
      })
    } else {
      saveEditorToTheme(emittedOutput.outputFiles[0].text)
      // update the saved version
      updateEditorState({
        savedVersion: editorRef.current
          ?.getModel()
          ?.getAlternativeVersionId(),
      })
    }
  }, [updateEditorState, saveEditorToTheme, formatOnSave, editorRef])

  useSaveKey(editorRef, handleSave)

  return handleSave
}

/**
 * Add an event listener for the Ctrl + S key combo that saves the editor contents
 * to the saved theme options
 * @param editorRef
 * @param onSave
 */
export const useSaveKey = (editorRef: EditorRefType, onSave: Function) => {
  useEffect(() => {
    // save key action in the monaco editor
    const actionBinding = editorRef.current?.addAction({
      id: "save-editor-contents",
      label: "Save Editor Theme Contents",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1,
      run: () => onSave(),
    })

    // global save key listener
    const handleGlobalSave = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.code == "KeyS") {
        event.preventDefault()
        onSave()
      }
    }
    window.addEventListener("keydown", handleGlobalSave)

    return () => {
      actionBinding?.dispose()
      window.removeEventListener("keydown", handleGlobalSave)
    }
  }, [onSave])
}
