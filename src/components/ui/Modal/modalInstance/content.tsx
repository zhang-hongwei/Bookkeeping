import { Box, Stack } from "@mui/material";
import type { ModalInstanceContentProps } from '../type';

const Content: React.FC<ModalInstanceContentProps> = ({ content }) => {
    return (
        <Stack direction="row" alignItems="center" spacing={1.2}>
            <Box>{content}</Box>
        </Stack>
    );
};

export default Content;