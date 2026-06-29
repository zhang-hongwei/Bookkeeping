# RichTextEditor 无法输入问题排查指南

## 🔍 快速诊断清单

如果 RichTextEditor 无法输入，请按以下步骤逐一排查：

---

## ✅ 第一步：确认代码修复已应用

### 1.1 检查 `index.tsx`

**文件**：`src/components/ui/RichTextEditor/index.tsx`

**第 117 行应该是：**
```tsx
// ✅ 正确
<LexicalExtensionComposer extension={app}>

// ❌ 错误
<LexicalExtensionComposer extension={app} contentEditable={null}>
```

### 1.2 检查 `DetailsSection.tsx`

**文件**：`src/app/(example)/product/create/components/DetailsSection.tsx`

**应该有 Box 包装器：**
```tsx
// ✅ 正确
<Controller
  name="content"
  control={control}
  render={({ field }) => (
    <Box sx={{ display: 'block' }}>
      <RichTextEditor
        value={field.value}
        onChange={field.onChange}
        placeholder="Write your content here..."
        emptyEditor={!field.value}
      />
    </Box>
  )}
/>
```

---

## 🔄 第二步：强制刷新浏览器

### 2.1 清除缓存并硬刷新

**方法 1：快捷键**
- Windows/Linux: `Ctrl + Shift + R` 或 `Ctrl + F5`
- macOS: `Cmd + Shift + R`

**方法 2：DevTools**
1. 打开 Chrome DevTools (F12)
2. 右键点击刷新按钮
3. 选择 "清空缓存并硬性重新加载"

### 2.2 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
pnpm dev
```

---

## 🧪 第三步：浏览器检查

### 3.1 打开 DevTools Console

访问 `http://localhost:3000/product/create` 并打开控制台 (F12)

### 3.2 检查错误信息

**如果看到这些错误，说明还有问题：**

❌ **错误 1：Flex 警告**
```
When using "display: flex" on an element containing content editable...
```
**解决**：检查是否添加了 Box 包装器

❌ **错误 2：React Hook 错误**
```
Rendered fewer hooks than expected...
```
**解决**：清除浏览器缓存，重启开发服务器

❌ **错误 3：Lexical 错误**
```
Unable to find an active editor state...
```
**解决**：检查 LexicalExtensionComposer 配置

### 3.3 检查元素状态

1. 在 DevTools 中选择 Elements 标签
2. 找到编辑器的 contentEditable 元素
3. 检查属性：

```html
<!-- ✅ 正确 -->
<div contenteditable="true" class="ContentEditable__root">

<!-- ❌ 错误 -->
<div contenteditable="false" class="ContentEditable__root">
```

---

## 🎯 第四步：手动验证

### 4.1 在浏览器控制台运行以下代码

```javascript
// 检查编辑器元素是否存在
const editable = document.querySelector('[contenteditable="true"]');
console.log('Editor element:', editable);
console.log('Is editable:', editable?.isContentEditable);
console.log('contentEditable attr:', editable?.getAttribute('contenteditable'));
```

**预期输出：**
```
Editor element: <div contenteditable="true" ...>
Is editable: true
contentEditable attr: "true"
```

### 4.2 手动测试焦点

```javascript
// 手动聚焦编辑器
const editable = document.querySelector('[contenteditable="true"]');
if (editable) {
  editable.focus();
  console.log('Focused:', document.activeElement === editable);
}
```

---

## 🔧 第五步：常见问题修复

### 问题 1：contentEditable="false"

**症状**：元素的 contenteditable 属性为 false

**原因**：LexicalExtensionComposer 配置错误

**解决方案**：
```tsx
// 移除 contentEditable prop
<LexicalExtensionComposer extension={app}>
  {/* 不要添加 contentEditable={null} */}
</LexicalExtensionComposer>
```

### 问题 2：点击后无法输入

**症状**：可以点击但无法输入文字

**原因 A**：CSS 样式问题
```css
/* 检查是否有这样的样式 */
.ContentEditable__root {
  pointer-events: none; /* ❌ 这会阻止输入 */
}
```

**原因 B**：z-index 问题
```css
/* 检查是否有其他元素覆盖 */
.editor {
  position: relative;
  z-index: 1; /* 确保编辑器在上层 */
}
```

**解决方案**：检查并修复 CSS

### 问题 3：编辑器显示但立即失焦

**症状**：点击后有光标但立即消失

**原因**：React 重新渲染导致失焦

**解决方案**：
```tsx
// 确保使用 useMemo 缓存配置
const app = useMemo(
  () => defineExtension({
    // ...配置
  }),
  [emptyEditor, isCollab, value, namespace], // 依赖项
);
```

### 问题 4：在 MUI Dialog/Modal 中无法输入

**症状**：在对话框中打开编辑器时无法输入

**解决方案**：
```tsx
<Dialog
  disableEnforceFocus  // ✅ 添加这个
  disableRestoreFocus  // ✅ 添加这个
>
  <RichTextEditor />
</Dialog>
```

---

## 📋 第六步：完整验证步骤

按顺序执行：

1. ✅ **停止开发服务器** (`Ctrl+C`)
2. ✅ **删除 .next 目录**
   ```bash
   rm -rf .next
   ```
3. ✅ **重新启动**
   ```bash
   pnpm dev
   ```
4. ✅ **清除浏览器缓存** (`Cmd+Shift+R`)
5. ✅ **访问页面** `http://localhost:3000/product/create`
6. ✅ **打开 DevTools Console** (F12)
7. ✅ **检查控制台错误**
8. ✅ **点击编辑器区域**
9. ✅ **尝试输入**

---

## 🐛 第七步：如果还是不行

### 7.1 收集诊断信息

在浏览器控制台运行：

```javascript
// 完整诊断脚本
const diagnose = () => {
  console.log('=== RichTextEditor 诊断 ===');

  // 1. 检查编辑器元素
  const editable = document.querySelector('[contenteditable="true"]');
  console.log('1. Editable element:', editable);

  // 2. 检查 contentEditable 属性
  console.log('2. contentEditable:', editable?.getAttribute('contenteditable'));
  console.log('3. isContentEditable:', editable?.isContentEditable);

  // 4. 检查父容器
  console.log('4. Parent display:', editable?.parentElement?.style.display);

  // 5. 检查焦点
  console.log('5. Active element:', document.activeElement);
  console.log('6. Has focus:', document.activeElement === editable);

  // 6. 检查样式
  const styles = editable ? window.getComputedStyle(editable) : null;
  console.log('7. Pointer events:', styles?.pointerEvents);
  console.log('8. User select:', styles?.userSelect);
  console.log('9. Z-index:', styles?.zIndex);

  // 7. 检查 Lexical 编辑器
  const editorContainer = document.querySelector('.editor-container');
  console.log('10. Editor container:', editorContainer);

  console.log('=== 诊断完成 ===');
};

diagnose();
```

### 7.2 复制输出信息

将控制台输出复制并提供给开发团队。

### 7.3 临时测试方案

创建一个简单的测试页面：

```tsx
// src/app/test-editor/page.tsx
"use client";

import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { useState } from 'react';
import { Box } from '@mui/material';

export default function TestEditorPage() {
  const [content, setContent] = useState('');

  return (
    <Box sx={{ p: 4 }}>
      <h1>RichTextEditor 测试页面</h1>
      <Box sx={{ display: 'block', mt: 2 }}>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="测试输入..."
          emptyEditor={true}
        />
      </Box>
      <pre style={{ marginTop: 20 }}>
        内容：{content}
      </pre>
    </Box>
  );
}
```

访问 `http://localhost:3000/test-editor` 测试。

---

## 📞 获取帮助

如果以上步骤都无法解决问题，请提供：

1. ✅ 浏览器版本和操作系统
2. ✅ 控制台完整错误信息
3. ✅ 诊断脚本的输出
4. ✅ 是否在 Dialog/Modal 中使用
5. ✅ 代码修改的截图

---

## ✅ 成功标志

当一切正常时，你应该能够：

- ✅ 点击编辑器区域
- ✅ 看到光标闪烁
- ✅ 输入文字
- ✅ 使用工具栏格式化
- ✅ 控制台没有错误或警告

---

**最后更新**：2025-10-30
