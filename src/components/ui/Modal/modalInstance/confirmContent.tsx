import { Box, Stack } from "@mui/material";
import { HiInformationCircle } from 'react-icons/hi2';
import type { ConfirmContentProps } from '../type';

const ConfirmContent: React.FC<ConfirmContentProps> = ({ content, mode = 'light', icon }) => {
    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={1.2}
        >
            {icon ?? <HiInformationCircle size={20} />}
            <Box
                sx={{
                    color: mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#000',
                    fontSize: 14,
                }}
            >
                {content}
            </Box>
        </Stack>
    );
};

export default ConfirmContent;