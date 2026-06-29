/**
 * CodeOutput Component - Replicates original AppCode.vue
 * Generates CSS and HTML code with toggle and copy functionality
 */

import React, { useState } from 'react';
import { Box, Button, ToggleButtonGroup, ToggleButton, styled } from '@mui/material';
import Modal from '@/components/ui/Modal';
import { useGridGeneratorStore } from '../../store/gridGeneratorStore';

const CodeContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  background: 'linear-gradient(to bottom, #131321 0%, #1f1c2c 100%)',
  boxShadow: '0 2px 20px 0 rgba(0, 0, 0, 0.54)',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: '1px solid #08ffbd',
  fontSize: '15px',
  fontFamily: '"Roboto Mono", Courier, monospace',
  maxHeight: '50vh',
  overflowY: 'auto',
}));

const CodeBlock = styled('pre')({
  margin: 0,
  padding: 0,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  color: '#fff',
});

interface CodeOutputProps {
  open: boolean;
  onClose: () => void;
}

type CodeMode = 'css' | 'html' | 'mui';

export default function CodeOutput({ open, onClose }: CodeOutputProps) {
  const [mode, setMode] = useState<CodeMode>('mui');
  const [copied, setCopied] = useState(false);

  const {
    columnGap,
    rowGap,
    childArea,
    getColTemplate,
    getRowTemplate,
  } = useGridGeneratorStore();

  const handleCopy = () => {
    const codeElement = document.getElementById('code-output');
    if (codeElement) {
      const text = codeElement.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const generateCSSCode = () => {
    const colTemplate = getColTemplate();
    const rowTemplate = getRowTemplate();

    let css = `.parent {
  display: grid;
  grid-template-columns: ${colTemplate};
  grid-template-rows: ${rowTemplate};
  grid-column-gap: ${columnGap}px;
  grid-row-gap: ${rowGap}px;
}`;

    childArea.forEach((area, i) => {
      css += `
.div${i + 1} { grid-area: ${area}; }`;
    });

    return css;
  };

  const generateHTMLCode = () => {
    let html = `<div class="parent">`;

    childArea.forEach((_, i) => {
      html += `\n  <div class="div${i + 1}"></div>`;
    });

    html += '\n</div>';
    return html;
  };

  const generateMUICode = () => {
    const colTemplate = getColTemplate();
    const rowTemplate = getRowTemplate();

    let code = `<Box\n  sx={{\n    display: "grid",\n    gridTemplateColumns: "${colTemplate}",\n    gridTemplateRows: "${rowTemplate}",\n    columnGap: ${columnGap},\n    rowGap: ${rowGap},\n  }}\n>`;

    childArea.forEach((area) => {
      code += `\n  <Box sx={{ gridArea: "${area}" }} />`;
    });

    code += '\n</Box>';
    return code;
  };

  const codeGenerators: Record<CodeMode, () => string> = {
    css: generateCSSCode,
    html: generateHTMLCode,
    mui: generateMUICode,
  };

  const modeTitles: Record<CodeMode, string> = {
    css: 'CSS Code',
    html: 'HTML Code',
    mui: 'MUI Code',
  };

  const code = codeGenerators[mode]();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modeTitles[mode]}
      showOk={false}
      width={800}
      height={'500px'}
      footer={null}
    >
      <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between', minHeight: '60px' }}>
        <ToggleButtonGroup
          size="small"
          value={mode}
          exclusive
          onChange={(_, value: CodeMode | null) => {
            if (value) setMode(value);
          }}
        >
          <ToggleButton value="mui">MUI</ToggleButton>
          <ToggleButton value="css">CSS</ToggleButton>
          <ToggleButton value="html">HTML</ToggleButton>
        </ToggleButtonGroup>
        <Button size="small" variant="outlined" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </Button>
      </Box>

      <CodeContainer>
        <CodeBlock id="code-output">{code}</CodeBlock>
      </CodeContainer>
    </Modal>
  );
}
