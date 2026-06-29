---
name: md-to-word-tech-style
description: 将 Markdown 文档转换为 Word（DOCX）格式，支持 Mermaid 图表渲染为清晰白底图片、网格型表格、自动生成目录。当用户提到"md转word"、"Markdown转Word"、"导出Word"、"生成Word文档"、"转换文档格式"或需要将技术文档导出为 Word 时使用。
---

# Markdown 转 Word 技能

## 角色
你是一位文档自动化工程师，负责将 Markdown 文档高质量地转换为 Word（DOCX）格式，确保 Mermaid 图表被渲染为**清晰白底**的图片，表格使用**网格型**样式，并自动生成**目录**。

## 工作流程

1. **确认源文件**：询问用户需要转换的 Markdown 文件路径。
2. **检查 Mermaid 图表**：扫描 Markdown 文件中的 Mermaid 代码块，统计数量。
3. **生成参考模板**：用 python-docx 生成一个带网格型表格样式和微软雅黑字体的 reference-doc 模板。
4. **渲染 Mermaid 图表**：用 mmdc 将每个 Mermaid 代码块渲染为清晰白底 PNG 图片。
5. **Pandoc 转换**：使用参考模板 + `--toc` 参数转换为 Word。
6. **后处理**：用 python-docx 遍历所有表格，强制设置为网格型样式。
7. **输出结果**：告知用户文件路径和目录更新方法。

## Mermaid 图表风格配置（清晰白底主题）

### 设计理念
- **基调**：白色背景，清晰明了，适合打印和屏幕阅读
- **配色**：柔和浅色填充（浅蓝、浅绿、浅紫），深色文字，中蓝连线
- **字体**：清晰可读，支持中文

### mmdc 命令行参数

```bash
mmdc -i input.mmd -o output.png \
  -b "#FFFFFF" \
  -w 1600 \
  -s 3 \
  -t default \
  -c mermaid_config.json
```

> **注意**：mmdc 参数使用短横线格式（`-b`、`-w`、`-s`、`-t`、`-c`），**不要使用** camelCase 格式（`--backgroundColor` 等不合法）。

### mermaid_config.json 配置文件

转换时生成此配置文件并传给 mmdc 的 `-c` 参数：

```json
{
  "theme": "default",
  "themeVariables": {
    "primaryColor": "#DBEAFE",
    "primaryBorderColor": "#3B82F6",
    "primaryTextColor": "#1E293B",
    "lineColor": "#3B82F6",
    "secondaryColor": "#DCFCE7",
    "tertiaryColor": "#EDE9FE",
    "clusterBkg": "#F8FAFC",
    "clusterBorder": "#CBD5E1",
    "titleColor": "#1E293B",
    "edgeLabelBackground": "#F1F5F9",
    "nodeTextColor": "#1E293B",
    "fontSize": "16px"
  }
}
```

### 主题变量说明

| 变量 | 颜色值 | 效果 |
| --- | --- | --- |
| `primaryColor` | #DBEAFE | 主节点填充（浅蓝） |
| `primaryBorderColor` | #3B82F6 | 主节点边框（中蓝） |
| `primaryTextColor` | #1E293B | 主文字色（深灰） |
| `lineColor` | #3B82F6 | 连线色（中蓝） |
| `secondaryColor` | #DCFCE7 | 次要节点（浅绿） |
| `tertiaryColor` | #EDE9FE | 第三级元素（浅紫） |
| `clusterBkg` | #F8FAFC | 子图背景（极浅灰） |
| `clusterBorder` | #CBD5E1 | 子图边框（中灰） |
| `edgeLabelBackground` | #F1F5F9 | 连线标签背景（浅灰） |

## 转换脚本模板

转换时将以下 Python 脚本写入临时文件（如 `_convert_tmp.py`）后执行，**不要用 `python -c` 内联执行**（脚本内含反引号，bash 引号会冲突）。

```python
import re, subprocess, shutil, tempfile
from pathlib import Path
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BLACK = RGBColor(0x00, 0x00, 0x00)
FONT_NAME = 'Microsoft YaHei'

def create_reference_doc(output_path: str):
    """生成参考模板：微软雅黑 + 标题统一黑色，覆盖主题字体"""
    doc = Document()
    
    # 覆盖 docDefaults 中的主题字体引用，改为显式微软雅黑
    styles_elem = doc.styles.element
    docDefaults = styles_elem.find(qn('w:docDefaults'))
    if docDefaults is not None:
        rPrDefault = docDefaults.find(qn('w:rPrDefault'))
        if rPrDefault is not None:
            rPr = rPrDefault.find(qn('w:rPr'))
            if rPr is not None:
                rFonts = rPr.find(qn('w:rFonts'))
                if rFonts is not None:
                    # 移除主题引用，替换为显式字体
                    for attr in list(rFonts.attrib):
                        if 'Theme' in attr:
                            del rFonts.attrib[attr]
                    rFonts.set(qn('w:ascii'), FONT_NAME)
                    rFonts.set(qn('w:eastAsia'), FONT_NAME)
                    rFonts.set(qn('w:hAnsi'), FONT_NAME)
    
    # Normal 样式
    style = doc.styles['Normal']
    font = style.font
    font.name = FONT_NAME
    font.size = Pt(11)
    font.color.rgb = BLACK
    style.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_NAME)
    
    # Heading 1-4 样式：统一黑色、微软雅黑、加粗
    heading_sizes = {1: 18, 2: 16, 3: 15, 4: 14}
    for lv, sz in heading_sizes.items():
        hs = doc.styles[f'Heading {lv}']
        hf = hs.font
        hf.name = FONT_NAME
        hf.size = Pt(sz)
        hf.bold = True
        hf.color.rgb = BLACK
        hf.italic = False
        hs.element.rPr.rFonts.set(qn('w:eastAsia'), FONT_NAME)
        # 清除主题色覆盖
        rPr = hs.element.find(qn('w:rPr'))
        if rPr is not None:
            for color_elem in rPr.findall(qn('w:color')):
                color_elem.set(qn('w:val'), '000000')
                for attr in list(color_elem.attrib):
                    if 'theme' in attr.lower():
                        del color_elem.attrib[attr]
    
    doc.save(output_path)


def convert_md_to_docx(md_path: str, output_path: str):
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    img_dir = Path(md_path).parent / '_mermaid_imgs'
    img_dir.mkdir(exist_ok=True)

    # 生成 mermaid 配置文件（清晰白底主题）
    config = '{"theme":"default","themeVariables":{"primaryColor":"#DBEAFE","primaryBorderColor":"#3B82F6","primaryTextColor":"#1E293B","lineColor":"#3B82F6","secondaryColor":"#DCFCE7","tertiaryColor":"#EDE9FE","clusterBkg":"#F8FAFC","clusterBorder":"#CBD5E1","titleColor":"#1E293B","edgeLabelBackground":"#F1F5F9","nodeTextColor":"#1E293B","fontSize":"16px"}}'
    config_path = img_dir / 'mermaid_config.json'
    config_path.write_text(config, encoding='utf-8')

    # 渲染 Mermaid 图表（用 chr(96) 避免反引号在 bash 中转义问题）
    BT = chr(96) * 3
    mermaid_pattern = BT + r'mermaid\n(.*?)' + BT
    mermaid_blocks = re.findall(mermaid_pattern, content, re.DOTALL)
    print(f"发现 {len(mermaid_blocks)} 个 Mermaid 图表")

    for idx, block in enumerate(mermaid_blocks):
        mmd_path = img_dir / f'diagram_{idx}.mmd'
        img_path = img_dir / f'diagram_{idx}.png'
        mmd_path.write_text(block, encoding='utf-8')

        print(f"  [{idx+1}/{len(mermaid_blocks)}] ", end='', flush=True)
        result = subprocess.run([
            'mmdc', '-i', str(mmd_path), '-o', str(img_path),
            '-b', '#FFFFFF', '-w', '1600', '-s', '3',
            '-t', 'default', '-c', str(config_path)
        ], capture_output=True, text=True, timeout=120)

        if result.returncode != 0:
            # 降级重试
            subprocess.run([
                'mmdc', '-i', str(mmd_path), '-o', str(img_path),
                '-b', '#FFFFFF', '-w', '1600', '-s', '2', '-t', 'default'
            ], capture_output=True, text=True, timeout=120)

        if img_path.exists():
            content = content.replace(
                f'{BT}mermaid\n{block}{BT}',
                f'![图 {idx+1}]({img_path.name})', 1
            )
            print("OK")
        else:
            print("SKIP")

    # 写入临时 Markdown
    temp_md = img_dir / '_temp.md'
    temp_md.write_text(content, encoding='utf-8')

    # 生成参考模板
    ref_doc_path = img_dir / 'reference.docx'
    create_reference_doc(str(ref_doc_path))

    # Pandoc 转换（不使用 --toc，改用 python-docx 后处理插入目录）
    print("Pandoc 转换...")
    subprocess.run([
        'pandoc', str(temp_md), '-o', output_path,
        '--reference-doc', str(ref_doc_path),
        '--quiet', '--wrap=preserve',
        '--resource-path', str(img_dir)
    ], check=True, timeout=120)

    # 后处理：表格网格型 + 插入目录 + 禁用域更新提示
    print("设置表格为网格型...")
    set_tables_grid_style(output_path)

    print("插入目录...")
    insert_toc(output_path)

    print("禁用域更新提示...")
    disable_field_update_prompt(output_path)

    print("标题颜色统一黑色...")
    fix_heading_styles(output_path)

    # 清理临时文件
    shutil.rmtree(img_dir, ignore_errors=True)

    print(f"\n转换完成: {output_path}")


def set_tables_grid_style(docx_path: str):
    """用 python-docx 遍历所有表格，设置网格型边框"""
    from docx.oxml import OxmlElement
    
    doc = Document(docx_path)
    
    for table in doc.tables:
        tbl = table._tbl
        tblPr = tbl.tblPr if tbl.tblPr is not None else OxmlElement('w:tblPr')
        
        # 移除已有表格样式
        for child in tblPr:
            if child.tag.endswith('tblStyle'):
                tblPr.remove(child)
        
        # 设置 Table Grid 样式
        tblStyle = OxmlElement('w:tblStyle')
        tblStyle.set(qn('w:val'), 'TableGrid')
        tblPr.insert(0, tblStyle)
        
        # 确保有边框
        borders = tblPr.find(qn('w:tblBorders'))
        if borders is None:
            borders = OxmlElement('w:tblBorders')
            for border_name in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']:
                border = OxmlElement(f'w:{border_name}')
                border.set(qn('w:val'), 'single')
                border.set(qn('w:sz'), '4')
                border.set(qn('w:space'), '0')
                border.set(qn('w:color'), '000000')
                borders.append(border)
            tblPr.append(borders)
        
        # 表头行加粗
        if table.rows:
            for cell in table.rows[0].cells:
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        run.bold = True
    
    doc.save(docx_path)


def insert_toc(docx_path: str):
    """在文档开头插入目录页"""
    doc = Document(docx_path)
    body = doc.element.body

    # 创建目录标题段落（Heading 1 样式）
    toc_title = OxmlElement('w:p')
    pPr = OxmlElement('w:pPr')
    pStyle = OxmlElement('w:pStyle')
    pStyle.set(qn('w:val'), 'Heading1')
    pPr.append(pStyle)
    toc_title.append(pPr)
    run = OxmlElement('w:r')
    t = OxmlElement('w:t')
    t.text = '\u76ee\u5f55'  # "目录"
    run.append(t)
    toc_title.append(run)

    # 创建 TOC 域代码
    toc_field_para = OxmlElement('w:p')
    # begin
    run1 = OxmlElement('w:r')
    fldChar_begin = OxmlElement('w:fldChar')
    fldChar_begin.set(qn('w:fldCharType'), 'begin')
    run1.append(fldChar_begin)
    toc_field_para.append(run1)
    # instrText
    run2 = OxmlElement('w:r')
    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = ' TOC \\o "1-3" \\h \\z \\u '
    run2.append(instrText)
    toc_field_para.append(run2)
    # separate + placeholder text
    run3 = OxmlElement('w:r')
    fldChar_sep = OxmlElement('w:fldChar')
    fldChar_sep.set(qn('w:fldCharType'), 'separate')
    run3.append(fldChar_sep)
    toc_field_para.append(run3)
    run4 = OxmlElement('w:r')
    t4 = OxmlElement('w:t')
    t4.text = '\u8bf7\u6309 Ctrl+A \u5168\u9009\uff0c\u518d\u6309 F9 \u66f4\u65b0\u76ee\u5f55'
    run4.append(t4)
    toc_field_para.append(run4)
    # end
    run5 = OxmlElement('w:r')
    fldChar_end = OxmlElement('w:fldChar')
    fldChar_end.set(qn('w:fldCharType'), 'end')
    run5.append(fldChar_end)
    toc_field_para.append(run5)

    # 空行分隔
    blank_para = OxmlElement('w:p')

    # 插入到文档最开头
    body.insert(0, blank_para)
    body.insert(0, toc_field_para)
    body.insert(0, toc_title)

    doc.save(docx_path)


def disable_field_update_prompt(docx_path: str):
    """在 document.xml 中设置 updateFields=false，阻止 Word 打开时提示更新域"""
    doc = Document(docx_path)
    settings = doc.settings.element
    
    # 移除已有的 updateFields 设置
    for elem in settings.findall(qn('w:updateFields')):
        settings.remove(elem)
    
    # 显式设置 updateFields = false
    update_fields = OxmlElement('w:updateFields')
    update_fields.set(qn('w:val'), 'false')
    settings.append(update_fields)
    
    doc.save(docx_path)


def fix_heading_styles(docx_path: str):
    """遍历所有 Heading 段落，将 inline 颜色强制设为黑色、字体设为微软雅黑"""
    doc = Document(docx_path)
    for para in doc.paragraphs:
        if para.style.name.startswith('Heading'):
            for run in para.runs:
                run.font.color.rgb = BLACK
                run.font.name = FONT_NAME
                # 确保 eastAsia 字体也是微软雅黑
                rPr = run._element.find(qn('w:rPr'))
                if rPr is not None:
                    rFonts = rPr.find(qn('w:rFonts'))
                    if rFonts is None:
                        rFonts = OxmlElement('w:rFonts')
                        rPr.insert(0, rFonts)
                    rFonts.set(qn('w:ascii'), FONT_NAME)
                    rFonts.set(qn('w:eastAsia'), FONT_NAME)
                    rFonts.set(qn('w:hAnsi'), FONT_NAME)
                    # 移除主题字体引用
                    for attr in list(rFonts.attrib):
                        if 'Theme' in attr or 'theme' in attr.lower():
                            del rFonts.attrib[attr]
    doc.save(docx_path)
```

### mmdc 参数格式
mmdc 使用**短横线**格式参数，不要用 camelCase：
- 正确：`-b`、`-w`、`-s`、`-t`、`-c`、`-i`、`-o`
- 错误：`--backgroundColor`、`--width`、`--scale`、`--theme`、`--themeVariables`

### 目录更新
脚本会自动在文档开头插入目录域并设置 `updateFields=false` 防止打开时弹出域更新提示。首次打开后需手动更新目录页码：

> **目录更新提示**：打开 Word 后按 `Ctrl+A` 全选，按 `F9` 更新目录页码。

## 交互提示

- 用户未提供输出路径时，默认在原文件同目录生成，文件名替换扩展名为 `.docx`
- 生成完成后提示用户更新目录和域

## 常见问题

| 问题 | 解决方案 |
| --- | --- |
| `mmdc` 命令找不到 | 关闭终端重开；检查 `%APPDATA%\npm` 是否在 PATH |
| Pandoc 报错 | 检查 `C:\Program Files\Pandoc\` 是否在 PATH，重启终端 |
| 中文显示为方框 | 确认 mermaid_config.json 中 fontSize 设置正确 |
| 图片不够清晰 | 增大 `-s` 参数值（如 `-s 4`） |
| 表格没有网格线 | 确认 `set_tables_grid_style` 后处理已执行 |
| 目录页码为空 | 打开 Word 后 `Ctrl+A` → `F9` 更新 |
| python-docx 未安装 | `pip install python-docx` |

## 输出格式

交付一个 `.docx` 文件，包含：
1. 自动生成的三级目录
2. 清晰白底的 Mermaid 图表
3. 网格型边框的表格
4. 微软雅黑字体的正文
