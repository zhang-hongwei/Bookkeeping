import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import { useThemeCreatorStore } from '@/store/mui-theme-creator';
import MUIButtonEditor from './MUIButtonEditor';

// 组件属性映射
const componentPropertyEditors: Record<string, React.ComponentType<any>> = {
  'Buttons': MUIButtonEditor,
  'Button': MUIButtonEditor,
  'BasicButtons': MUIButtonEditor,
  'ContainedButtons': MUIButtonEditor,
  'OutlinedButtons': MUIButtonEditor,
  'TextButtons': MUIButtonEditor,
  // TODO: 添加更多组件的属性编辑器
  // 'TextField': TextFieldProperties,
  // 'Checkbox': CheckboxProperties,
  // 'Select': SelectProperties,
  // 等等...
};

interface ComponentPropertiesEditorProps {}

const ComponentPropertiesEditor: React.FC<ComponentPropertiesEditorProps> = () => {
  const selectedComponentId = useThemeCreatorStore((state) => state.selectedComponentId);

  // 使用 store 中的 selectedComponentId
  const currentComponentId = selectedComponentId;

  if (!currentComponentId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Component Properties
        </Typography>
        <Paper
          elevation={1}
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: 'grey.50',
            border: '2px dashed',
            borderColor: 'grey.300',
          }}
        >
          <Typography variant="body1" color="text.secondary" gutterBottom>
            📱 Select a component from the left navigation
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Choose a component to edit its theme properties and styles
          </Typography>
        </Paper>
      </Box>
    );
  }

  // 根据组件ID找到对应的属性编辑器
  const PropertyEditor = componentPropertyEditors[currentComponentId] ||
                          componentPropertyEditors[currentComponentId.toLowerCase()] ||
                          findPropertyEditorByComponentType(currentComponentId);

  if (PropertyEditor === MUIButtonEditor) {
    // 如果是 Button 组件，使用专门的 MUIButtonEditor
    return (
      <Box sx={{ p: 3 }}>
        <PropertyEditor />
      </Box>
    );
  }

  if (!PropertyEditor) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Component Properties
        </Typography>
        <Paper
          elevation={1}
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: 'warning.light',
            border: '1px solid',
            borderColor: 'warning.main',
          }}
        >
          <Typography variant="h6" color="warning.dark" gutterBottom>
            🚧 Component Editor Coming Soon
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No property editor available for component: <strong>{currentComponentId}</strong>
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              ✅ Currently Available Editors:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              <Chip label="🔘 Buttons (All Variants)" color="primary" size="small" />
            </Stack>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              🔄 Coming Soon:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              <Chip label="Text Fields" variant="outlined" size="small" />
              <Chip label="Checkboxes" variant="outlined" size="small" />
              <Chip label="Select" variant="outlined" size="small" />
              <Chip label="Cards" variant="outlined" size="small" />
              <Chip label="Dialog" variant="outlined" size="small" />
              <Chip label="And many more..." variant="outlined" size="small" />
            </Stack>
          </Box>
        </Paper>
      </Box>
    );
  }

  // 其他组件的通用属性编辑器（未来扩展）
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Component Properties
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {currentComponentId} - Edit component properties below
      </Typography>

      <PropertyEditor />
    </Box>
  );
};

// 根据组件类型推断属性编辑器
function findPropertyEditorByComponentType(componentId: string): React.ComponentType<any> | null {
  const lowerId = componentId.toLowerCase();

  if (lowerId.includes('button')) {
    return MUIButtonEditor;
  }

  // TODO: 添加更多组件类型的推断
  // if (lowerId.includes('textfield') || lowerId.includes('input')) {
  //   return TextFieldProperties;
  // }

  return null;
}

export default ComponentPropertiesEditor;