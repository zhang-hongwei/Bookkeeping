'use client';

import NavigationMenuDemo from '@/components/demo/navigation-menu-demo';
import NavigationMenuSmooth from '@/components/demo/navigation-menu-smooth';
import { Box, Container, Typography, Divider, Stack, Chip } from '@mui/material';

export default function DemoPage() {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
                MUI Navigation Menu Demo
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
                Navigation menu components built with Material-UI, inspired by Radix UI
            </Typography>

            {/* Smooth Version - Recommended */}
            <Box sx={{ mb: 8 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h5" component="h2">
                        Smooth Transition Version
                    </Typography>
                    <Chip label="Recommended" color="primary" size="small" />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    鼠标 hover 自动打开，平滑的内容滑动过渡效果，类似 Radix UI 官网
                </Typography>
                <NavigationMenuSmooth />
            </Box>
        </Container>
    );
}
