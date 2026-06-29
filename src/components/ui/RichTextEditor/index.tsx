"use client";

/**
 * RichTextEditor - A powerful rich text editor based on Lexical Playground
 *
 * This component wraps the Lexical playground editor for use in Next.js applications.
 * It provides a full-featured rich text editing experience with support for:
 * - Rich text formatting (bold, italic, underline, etc.)
 * - Lists, tables, and code blocks
 * - Images and media embeds
 * - Markdown shortcuts
 * - And much more!
 */

import { useEffect, useState, useMemo } from 'react';
import { LexicalCollaboration } from '@lexical/react/LexicalCollaborationContext';
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { defineExtension } from 'lexical';
import type { EditorState, LexicalEditor as LexicalEditorType } from 'lexical';

import { buildHTMLConfig } from './buildHTMLConfig';
import { FlashMessageContext } from './context/FlashMessageContext';
import { SettingsContext, useSettings } from './context/SettingsContext';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import { ToolbarContext } from './context/ToolbarContext';
import Editor from './Editor';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import { TableContext } from './plugins/TablePlugin';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';

import './index.css';

export interface RichTextEditorProps {
  /**
   * The current editor content as a JSON string (serialized EditorState)
   */
  value?: string;

  /**
   * Callback fired when the editor content changes
   */
  onChange?: (value: string) => void;

  /**
   * Placeholder text to display when editor is empty
   */
  placeholder?: string;

  /**
   * Whether to start with an empty editor (default: true)
   */
  emptyEditor?: boolean;

  /**
   * Custom namespace for the editor instance
   */
  namespace?: string;
}

// Plugin to handle onChange events
function OnChangePlugin({ onChange }: { onChange?: (value: string) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!onChange) return;

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const json = JSON.stringify(editorState.toJSON());
        onChange(json);
      });
    });
  }, [editor, onChange]);

  return null;
}

function RichTextEditorInner({
  value,
  onChange,
  placeholder,
  namespace = 'RichTextEditor'
}: RichTextEditorProps) {
  const {
    settings: { isCollab, emptyEditor },
  } = useSettings();

  const app = useMemo(
    () =>
      defineExtension({
        $initialEditorState: isCollab
          ? null
          : emptyEditor
            ? undefined
            : value
              ? (editor: LexicalEditorType) => {
                  try {
                    const state = editor.parseEditorState(value);
                    editor.setEditorState(state);
                  } catch (error) {
                    console.error('Failed to parse editor state:', error);
                  }
                }
              : undefined,
        html: buildHTMLConfig(),
        name: namespace,
        namespace,
        nodes: PlaygroundNodes,
        theme: PlaygroundEditorTheme,
      }),
    [emptyEditor, isCollab, value, namespace],
  );

  return (
    <LexicalCollaboration>
      <LexicalExtensionComposer extension={app}>
        <SharedHistoryContext>
          <TableContext>
            <ToolbarContext>
              <div className="editor-shell" style={{ margin: 0 }}>
                <Editor />
                <OnChangePlugin onChange={onChange} />
              </div>
            </ToolbarContext>
          </TableContext>
        </SharedHistoryContext>
      </LexicalExtensionComposer>
    </LexicalCollaboration>
  );
}

/**
 * RichTextEditor Component
 *
 * A full-featured rich text editor built on Lexical.
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const [content, setContent] = useState('');
 *
 *   return (
 *     <RichTextEditor
 *       value={content}
 *       onChange={setContent}
 *       placeholder="Start typing..."
 *     />
 *   );
 * }
 * ```
 */
export function RichTextEditor(props: RichTextEditorProps) {
  return (
    <SettingsContext>
      <FlashMessageContext>
        <RichTextEditorInner {...props} />
      </FlashMessageContext>
    </SettingsContext>
  );
}

export default RichTextEditor;
