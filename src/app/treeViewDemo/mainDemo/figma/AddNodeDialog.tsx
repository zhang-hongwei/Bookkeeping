import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { ItemType } from './items';

export type NodeTypeOption = 'Box' | 'Stack' | 'Grid' | 'Typography';

const nodeTypeToItemType: Record<NodeTypeOption, ItemType> = {
  Box: 'frame',
  Stack: 'vertical_center',
  Grid: 'frame',
  Typography: 'text',
};

export interface AddNodeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (nodeType: ItemType, label: string) => void;
}

export default function AddNodeDialog({ open, onClose, onConfirm }: AddNodeDialogProps) {
  const [nodeType, setNodeType] = React.useState<NodeTypeOption>('Box');
  const [label, setLabel] = React.useState('');

  const handleNodeTypeChange = (event: SelectChangeEvent) => {
    setNodeType(event.target.value as NodeTypeOption);
  };

  const handleConfirm = () => {
    if (label.trim()) {
      onConfirm(nodeTypeToItemType[nodeType], label.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    setNodeType('Box');
    setLabel('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>添加新节点</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="node-type-label">节点类型</InputLabel>
            <Select
              labelId="node-type-label"
              id="node-type-select"
              value={nodeType}
              label="节点类型"
              onChange={handleNodeTypeChange}
            >
              <MenuItem value="Box">Box</MenuItem>
              <MenuItem value="Stack">Stack</MenuItem>
              <MenuItem value="Grid">Grid</MenuItem>
              <MenuItem value="Typography">Typography</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="节点名称"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="请输入节点名称"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button onClick={handleConfirm} variant="contained" disabled={!label.trim()}>
          确认
        </Button>
      </DialogActions>
    </Dialog>
  );
}
