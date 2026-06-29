#!/bin/bash

# 自动为组件目录生成 index.ts 文件
# 用法: ./generate-index.sh <component-dir>

COMPONENT_DIR=$1

if [ -z "$COMPONENT_DIR" ]; then
  echo "用法: $0 <component-dir>"
  exit 1
fi

cd "$COMPONENT_DIR" || exit 1

# 获取所有 .tsx 文件（排除 index.tsx）
FILES=$(ls *.tsx 2>/dev/null | grep -v "^index.tsx$" | sed 's/\.tsx$//')

if [ -z "$FILES" ]; then
  echo "No .tsx files found in $COMPONENT_DIR"
  exit 1
fi

# 生成 index.ts
{
  echo "/**"
  echo " * $(basename "$COMPONENT_DIR") component demos"
  echo " * Exported from MUI official examples"
  echo " */"
  echo ""

  # 导出语句
  for file in $FILES; do
    echo "export { default as $file } from './$file';"
  done

  echo ""
  echo "/**"
  echo " * Demo metadata for display"
  echo " */"
  echo "export const demoMeta = {"

  # 元数据
  for file in $FILES; do
    # 将驼峰命名转换为带空格的标题
    title=$(echo "$file" | sed 's/\([A-Z]\)/ \1/g' | sed 's/^ //')
    echo "  $file: { title: '$title', description: 'Demo: $title' },"
  done

  echo "};"
} > index.ts

echo "Generated index.ts for $(basename "$COMPONENT_DIR")"
