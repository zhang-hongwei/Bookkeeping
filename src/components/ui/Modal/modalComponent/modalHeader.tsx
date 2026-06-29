import React from 'react';
import { Stack, Typography, IconButton } from '@mui/material';
import { HiXMark } from 'react-icons/hi2';
import type { ModalHeaderProps } from '../type';

const ModalHeader: React.FC<ModalHeaderProps> = ({ onClose, title, sx = {} }) => {
  return (
    <Stack
      direction="row"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...sx,
      }}
      className="modal-header-container"
    >
      <Typography
        variant="h6"
        sx={{ color: 'text.primary' }}
        className="modal-header-title"
        id="modal-title"
      >
        {title}
      </Typography>
      <IconButton
        aria-label="关闭弹窗"
        sx={{
          transition: '0.3s',
          borderRadius: '4px',
          padding: 0,
          '&:hover': {
            background: 'action.hover',
          },
        }}
        onClick={onClose}
      >
        <HiXMark className="modal-header-close-icon" />
      </IconButton>
    </Stack>
  );
};

export default ModalHeader;
