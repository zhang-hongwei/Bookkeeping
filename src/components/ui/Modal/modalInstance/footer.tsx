import { Stack, Button, CircularProgress } from "@mui/material";
import type { ModalInstanceFooterProps } from '../type';

const Footer: React.FC<ModalInstanceFooterProps> = ({
    onOk,
    onClose,
    loading = false,
    okText = '确定',
    cancelText = '关闭',
    mode = 'light',
    sx = {},
}) => (
    <Stack
        spacing={0.7}
        direction="row"
        sx={{
            padding: '1.5rem',
            justifyContent: 'flex-end',
            ...sx,
        }}
    >
        <Button
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            variant="contained"
            onClick={onOk}
            aria-label={okText}
            disabled={loading}
        >
            {okText}
        </Button>
        <Button
            variant="outlined"
            onClick={onClose}
            aria-label={cancelText}
            sx={{
                border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.20)' : '1px solid rgba(0, 0, 0, 0.20)',
                color: mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                "&:hover": {
                    borderColor: "#6B4DFF",
                    color: '#6B4DFF'
                }
            }}
        >
            {cancelText}
        </Button>
    </Stack>
);

export default Footer;