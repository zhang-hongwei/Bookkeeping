# RichTextEditor

A powerful rich text editor component based on Lexical Playground, integrated for use in Next.js applications.

## Features

- **Rich Text Formatting**: Bold, italic, underline, strikethrough, code, and more
- **Headings**: H1, H2, H3 support
- **Lists**: Ordered and unordered lists with nested support
- **Tables**: Create and edit tables with merge cells support
- **Code Blocks**: Syntax highlighting for code blocks
- **Images**: Insert and manage images
- **Links**: Create and edit hyperlinks
- **Quotes**: Block quotes
- **Markdown Shortcuts**: Write faster with markdown-style shortcuts
- **Drag and Drop**: Drag and drop support for reordering content
- **Excalidraw Integration**: Draw diagrams directly in the editor
- **Media Embeds**: Embed YouTube, Twitter, Figma, and more
- **Equations**: LaTeX math equation support
- **And much more!**

## Usage

### Basic Example

```tsx
"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

export default function MyPage() {
  const [content, setContent] = useState("");

  const handleSave = () => {
    console.log("Saved content:", content);
    // Save to backend
  };

  return (
    <div>
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Start typing..."
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

### With React Hook Form

```tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

export default function MyForm() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = (data) => {
    console.log("Form data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="content"
        control={control}
        render={({ field }) => (
          <RichTextEditor
            value={field.value}
            onChange={field.onChange}
            placeholder="Write your content here..."
            emptyEditor={!field.value}
          />
        )}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Props

### `RichTextEditorProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| undefined` | `undefined` | The current editor content as a JSON string (serialized EditorState) |
| `onChange` | `(value: string) => void \| undefined` | `undefined` | Callback fired when the editor content changes |
| `placeholder` | `string \| undefined` | `undefined` | Placeholder text to display when editor is empty |
| `emptyEditor` | `boolean \| undefined` | `true` | Whether to start with an empty editor |
| `namespace` | `string \| undefined` | `'RichTextEditor'` | Custom namespace for the editor instance |

## Data Format

The editor content is stored as a serialized JSON string representing the Lexical EditorState. This format preserves all formatting, structure, and metadata.

### Example EditorState JSON

```json
{
  "root": {
    "children": [
      {
        "children": [
          {
            "detail": 0,
            "format": 1,
            "mode": "normal",
            "style": "",
            "text": "Hello World",
            "type": "text",
            "version": 1
          }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "type": "paragraph",
        "version": 1
      }
    ],
    "direction": "ltr",
    "format": "",
    "indent": 0,
    "type": "root",
    "version": 1
  }
}
```

## Converting to HTML

If you need to display the editor content as HTML (e.g., on a public-facing page), you can use Lexical's HTML utilities:

```tsx
import { $generateHtmlFromNodes } from '@lexical/html';
import { createEditor } from 'lexical';

function convertToHtml(editorStateJson: string): string {
  const editor = createEditor({
    // ... same config as RichTextEditor
  });

  const editorState = editor.parseEditorState(editorStateJson);

  return editorState.read(() => {
    return $generateHtmlFromNodes(editor);
  });
}
```

## Styling

The editor comes with built-in styles from the Lexical playground. The styles are imported via `index.css`.

### Customizing Styles

You can customize the editor appearance by overriding CSS classes. The main classes include:

- `.editor-shell` - The outer container
- `.editor-container` - The editor content area
- `.editor-scroller` - The scrollable area
- `.editor` - The main editor element

Example:

```css
.editor-shell {
  border: 1px solid #ccc;
  border-radius: 8px;
}

.editor {
  padding: 16px;
  font-size: 14px;
}
```

## Toolbar Features

The editor includes a comprehensive toolbar with:

- Text formatting (bold, italic, underline, etc.)
- Heading levels
- Lists (ordered, unordered, checklist)
- Text alignment
- Indent/outdent
- Insert link
- Insert image
- Insert table
- Code block
- Quote
- Horizontal rule
- And more...

## Keyboard Shortcuts

- **Bold**: `Ctrl/Cmd + B`
- **Italic**: `Ctrl/Cmd + I`
- **Underline**: `Ctrl/Cmd + U`
- **Undo**: `Ctrl/Cmd + Z`
- **Redo**: `Ctrl/Cmd + Shift + Z`
- **Select All**: `Ctrl/Cmd + A`
- **Copy**: `Ctrl/Cmd + C`
- **Cut**: `Ctrl/Cmd + X`
- **Paste**: `Ctrl/Cmd + V`
- **Insert Link**: `Ctrl/Cmd + K`

## Notes

- This component must be used in a Client Component (with `"use client"` directive)
- The editor content is serialized as JSON, not HTML
- The component includes all plugins from the Lexical playground
- Some features (like collaboration mode) are disabled by default

## Credits

Based on the [Lexical Playground](https://github.com/facebook/lexical/tree/main/packages/lexical-playground) by Meta.
