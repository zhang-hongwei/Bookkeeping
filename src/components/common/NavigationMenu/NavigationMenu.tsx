'use client';

import * as React from 'react';
import {
    Box,
    Button,
    Paper,
    styled,
    alpha,
    Stack,
    Link as MuiLink,
    Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const NavigationMenuRoot = styled(Box)(({ theme }) => ({
    position: 'relative',
    zIndex: 10,
    display: 'flex',
}));

const NavigationMenuList = styled(Box)(({ theme }) => ({
    margin: 0,
    display: 'flex',
    listStyle: 'none',
    position: 'relative',
}));

const NavigationMenuTrigger = styled(Button)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(0.5),
    borderRadius: theme.spacing(0.75),
    padding: theme.spacing(1, 2),
    fontSize: '0.95rem',
    fontWeight: 500,
    textTransform: 'none',
    color: theme.palette.text.secondary,
    minHeight: 40,
    transition: 'all 0.2s',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        color: theme.palette.primary.main,
    },
    '&.active': {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        color: theme.palette.primary.main,
    },
}));

const ViewportWrapper = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'contentWidth' && prop !== 'contentHeight',
})<{ contentWidth: number; contentHeight: number }>(({ theme, contentWidth, contentHeight }) => ({
    position: 'absolute',
    left: '50%',
    top: '100%',
    transform: 'translateX(-50%)',
    width: 'auto',
    height: 'auto',
    maxWidth: contentWidth,
    maxHeight: contentHeight,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    perspective: '2000px',
    transition: 'max-width 300ms cubic-bezier(0.87, 0, 0.13, 1), max-height 300ms cubic-bezier(0.87, 0, 0.13, 1)',
}));

const Viewport = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'isOpen',
})<{ isOpen: boolean }>(({ theme, isOpen }) => ({
    position: 'relative',
    marginTop: theme.spacing(1.25),
    borderRadius: theme.spacing(1.5),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[12],
    overflow: 'hidden',
    transformOrigin: 'top center',
    width: 'auto',
    transition: 'transform 300ms cubic-bezier(0.87, 0, 0.13, 1), opacity 300ms',
    transform: isOpen ? 'scale(1)' : 'scale(0.95)',
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
}));

const ContentSlider = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'activeIndex',
})<{ activeIndex: number }>(({ theme, activeIndex }) => ({
    display: 'flex',
    height: '100%',
    transition: 'transform 300ms cubic-bezier(0.87, 0, 0.13, 1)',
    transform: `translateX(-${activeIndex * 100}%)`,
    backgroundColor: 'transparent',
}));

const ContentPanel = styled(Box)(({ theme }) => ({
    minWidth: '100%',
    height: '100%',
    flexShrink: 0,
    backgroundColor: theme.palette.background.paper,
}));

const ListItemLink = styled(MuiLink)(({ theme }) => ({
    display: 'block',
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1.5),
    textDecoration: 'none',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    color: theme.palette.text.primary,
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 3,
        height: 0,
        backgroundColor: theme.palette.primary.main,
        borderRadius: 3,
        transition: 'height 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        paddingLeft: theme.spacing(2),
        '&::before': {
            height: '60%',
        },
    },
}));

interface MenuItem {
    label: string;
    href: string;
    description?: string;
}

interface MenuGroup {
    id: string;
    label: string;
    items: MenuItem[];
}

interface NavigationMenuProps {
    menuGroups: MenuGroup[];
    minWidth?: number;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ menuGroups, minWidth = 500 }) => {
    const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
    const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
    const contentRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [contentSize, setContentSize] = React.useState({ width: 9999, height: 9999 });
    const [isMeasuring, setIsMeasuring] = React.useState(false);

    const handleMouseEnter = (menuId: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // 如果是切换到不同的菜单,先重置尺寸以避免显示旧内容
        if (activeMenu && activeMenu !== menuId) {
            setContentSize({ width: 9999, height: 9999 });
            setIsMeasuring(true);
        }

        setActiveMenu(menuId);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveMenu(null);
            // 先设置为 0 触发关闭动画,然后在动画完成后重置为 9999
            setContentSize({ width: 0, height: 0 });
            setTimeout(() => {
                setContentSize({ width: 9999, height: 9999 });
            }, 300); // 等待动画完成(300ms)
        }, 150);
    };

    const handleContentMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    // 测量内容尺寸
    React.useEffect(() => {
        if (activeMenu) {
            const contentRef = contentRefs.current[activeMenu];
            if (contentRef) {
                requestAnimationFrame(() => {
                    const rect = contentRef.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        setContentSize({ width: rect.width, height: rect.height });
                        setIsMeasuring(false);
                    } else {
                        // 如果测量失败，使用默认尺寸
                        setContentSize({ width: minWidth, height: 300 });
                        setIsMeasuring(false);
                    }
                });
            }
        }
    }, [activeMenu, minWidth]);

    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const activeIndex = menuGroups.findIndex((m) => m.id === activeMenu);

    return (
        <NavigationMenuRoot>
            <NavigationMenuList>
                <Stack direction="row" spacing={1} component="nav">
                    {menuGroups.map((group) => (
                        <Box
                            key={group.id}
                            onMouseEnter={() => handleMouseEnter(group.id)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <NavigationMenuTrigger
                                className={activeMenu === group.id ? 'active' : ''}
                                endIcon={
                                    <KeyboardArrowDownIcon
                                        sx={{
                                            transform: activeMenu === group.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s cubic-bezier(0.87, 0, 0.13, 1)',
                                        }}
                                    />
                                }
                            >
                                {group.label}
                            </NavigationMenuTrigger>
                        </Box>
                    ))}
                </Stack>

                {/* Shared Viewport with Sliding Content */}
                <ViewportWrapper
                    contentWidth={contentSize.width}
                    contentHeight={contentSize.height}
                >
                    <Viewport
                        isOpen={activeMenu !== null}
                        onMouseEnter={handleContentMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <ContentSlider
                            activeIndex={activeIndex === -1 ? 0 : activeIndex}
                            sx={{
                                opacity: isMeasuring ? 0 : 1,
                                transition: 'transform 300ms cubic-bezier(0.87, 0, 0.13, 1), opacity 100ms',
                            }}
                        >
                            {menuGroups.map((group) => (
                                <ContentPanel
                                    key={group.id}
                                    ref={(el: HTMLDivElement | null) => {
                                        contentRefs.current[group.id] = el;
                                    }}
                                >
                                    <Box
                                        component="ul"
                                        sx={{
                                            m: 0,
                                            p: 2.75,
                                            display: 'grid',
                                            gap: 1.25,
                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                            minWidth: minWidth,
                                        }}
                                    >
                                        {group.items.map((item) => (
                                            <Box component="li" key={item.label} sx={{ listStyle: 'none' }}>
                                                <ListItemLink href={item.href}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            mb: item.description ? 0.5 : 0,
                                                            fontWeight: 600,
                                                            lineHeight: 1.2,
                                                        }}
                                                    >
                                                        {item.label}
                                                    </Typography>
                                                    {item.description && (
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{ lineHeight: 1.4 }}
                                                        >
                                                            {item.description}
                                                        </Typography>
                                                    )}
                                                </ListItemLink>
                                            </Box>
                                        ))}
                                    </Box>
                                </ContentPanel>
                            ))}
                        </ContentSlider>
                    </Viewport>
                </ViewportWrapper>
            </NavigationMenuList>
        </NavigationMenuRoot>
    );
};

export default NavigationMenu;
