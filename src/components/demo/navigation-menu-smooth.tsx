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
    width: '100%',
    justifyContent: 'center',
}));

const NavigationMenuList = styled(Paper)(({ theme }) => ({
    margin: 0,
    display: 'flex',
    listStyle: 'none',
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1),
    // boxShadow: theme.shadows[4],
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
}));

const NavigationMenuTrigger = styled(Button)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(0.5),
    borderRadius: theme.spacing(0.75),
    padding: theme.spacing(1, 2),
    fontSize: '15px',
    fontWeight: 500,
    textTransform: 'none',
    color: theme.palette.text.primary,
    minHeight: 40,
    transition: 'background-color 0.2s',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
    '&.active': {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
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
    // boxShadow: theme.shadows[12],
    overflow: 'hidden',
    transformOrigin: 'top center',
    width: 'auto',  // 自动宽度
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

const FeaturedLink = styled(MuiLink)(({ theme }) => ({
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    borderRadius: theme.spacing(1.5),
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    padding: theme.spacing(3),
    textDecoration: 'none',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
        opacity: 0,
        transition: 'opacity 0.3s',
    },
    '&:hover': {
        transform: 'translateY(-2px)',
        // boxShadow: theme.shadows[8],
        '&::before': {
            opacity: 1,
        },
    },
    '&:focus-visible': {
        // boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
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
    '&:focus-visible': {
        // boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
    },
}));

interface ListItemProps {
    href: string;
    title: string;
    children: React.ReactNode;
}

const ListItem: React.FC<ListItemProps> = ({ href, title, children }) => (
    <Box component="li" sx={{ listStyle: 'none' }}>
        <ListItemLink href={href}>
            <Typography
                variant="subtitle2"
                sx={{
                    mb: 0.5,
                    fontWeight: 600,
                    lineHeight: 1.2,
                }}
            >
                {title}
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.4 }}
            >
                {children}
            </Typography>
        </ListItemLink>
    </Box>
);

interface MenuContent {
    id: string;
    content: React.ReactNode;
}

const NavigationMenuSmooth = () => {
    const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
    const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
    const contentRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [contentSize, setContentSize] = React.useState({ width: 9999, height: 9999 });
    const [isMeasuring, setIsMeasuring] = React.useState(false);

    const menuContents: MenuContent[] = [
        {
            id: 'learn',
            content: (
                <Box
                    component="ul"
                    sx={{
                        m: 0,
                        p: 2.75,
                        display: 'grid',
                        gap: 1.25,
                        gridTemplateColumns: '0.75fr 1fr',
                        minWidth: 500,
                    }}
                >
                    <Box component="li" sx={{ gridRow: 'span 3', display: 'grid', listStyle: 'none' }}>
                        <FeaturedLink href="/">
                            <Box component="svg" width="38" height="38" viewBox="0 0 25 25" fill="white">
                                <path d="M12 25C7.58173 25 4 21.4183 4 17C4 12.5817 7.58173 9 12 9V25Z" />
                                <path d="M12 0H4V8H12V0Z" />
                                <path d="M17 8C19.2091 8 21 6.20914 21 4C21 1.79086 19.2091 0 17 0C14.7909 0 13 1.79086 13 4C13 6.20914 14.7909 8 17 8Z" />
                            </Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 0.875,
                                    mt: 2,
                                    fontSize: '18px',
                                    fontWeight: 500,
                                    lineHeight: 1.2,
                                    color: 'white',
                                }}
                            >
                                Dev Tools
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: '14px',
                                    lineHeight: 1.3,
                                    color: 'rgba(255, 255, 255, 0.9)',
                                }}
                            >
                                Enterprise-grade Next.js template with MUI v7.
                            </Typography>
                        </FeaturedLink>
                    </Box>
                    <ListItem href="/docs/mui" title="Material-UI">
                        Modern React UI framework with comprehensive components.
                    </ListItem>
                    <ListItem href="/docs/theme" title="Theme System">
                        Beautiful, customizable themes with token-based design.
                    </ListItem>
                    <ListItem href="/docs/icons" title="Icons">
                        Thousands of Material icons, crisp and consistent.
                    </ListItem>
                </Box>
            ),
        },
        {
            id: 'overview',
            content: (
                <Box
                    component="ul"
                    sx={{
                        m: 0,
                        p: 2.75,
                        display: 'grid',
                        gap: 1.25,
                        gridAutoFlow: 'column',
                        gridTemplateRows: 'repeat(3, 1fr)',
                        minWidth: 600,
                    }}
                >
                    <ListItem title="Introduction" href="/docs/overview/introduction">
                        Build high-quality, accessible design systems and web apps.
                    </ListItem>
                    <ListItem title="Getting started" href="/docs/overview/getting-started">
                        A quick tutorial to get you up and running with Dev Tools.
                    </ListItem>
                    <ListItem title="Styling" href="/docs/guides/styling">
                        Powerful theming with MUI and customizable tokens.
                    </ListItem>
                    <ListItem title="Animation" href="/docs/guides/animation">
                        Use MUI transitions or any animation library of your choice.
                    </ListItem>
                    <ListItem title="Accessibility" href="/docs/overview/accessibility">
                        Tested in a range of browsers and assistive technologies.
                    </ListItem>
                    <ListItem title="Releases" href="/docs/overview/releases">
                        Dev Tools releases and their changelogs.
                    </ListItem>
                </Box>
            ),
        },
    ];

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
                    console.log('Measured size for', activeMenu, ':', { width: rect.width, height: rect.height });
                    if (rect.width > 0 && rect.height > 0) {
                        setContentSize({ width: rect.width, height: rect.height });
                        setIsMeasuring(false);
                    } else {
                        // 如果测量失败，使用默认尺寸
                        setContentSize({ width: 600, height: 300 });
                        setIsMeasuring(false);
                    }
                });
            }
        }
    }, [activeMenu]);

    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const activeIndex = menuContents.findIndex((m) => m.id === activeMenu);

    return (
        <NavigationMenuRoot>
            <NavigationMenuList>
                <Stack direction="row" spacing={1} component="nav">
                    {/* Learn Menu */}
                    <Box onMouseEnter={() => handleMouseEnter('learn')} onMouseLeave={handleMouseLeave}>
                        <NavigationMenuTrigger
                            className={activeMenu === 'learn' ? 'active' : ''}
                            endIcon={
                                <KeyboardArrowDownIcon
                                    sx={{
                                        transform: activeMenu === 'learn' ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s cubic-bezier(0.87, 0, 0.13, 1)',
                                    }}
                                />
                            }
                        >
                            Learn
                        </NavigationMenuTrigger>
                    </Box>

                    {/* Overview Menu */}
                    <Box onMouseEnter={() => handleMouseEnter('overview')} onMouseLeave={handleMouseLeave}>
                        <NavigationMenuTrigger
                            className={activeMenu === 'overview' ? 'active' : ''}
                            endIcon={
                                <KeyboardArrowDownIcon
                                    sx={{
                                        transform: activeMenu === 'overview' ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s cubic-bezier(0.87, 0, 0.13, 1)',
                                    }}
                                />
                            }
                        >
                            Overview
                        </NavigationMenuTrigger>
                    </Box>

                    {/* Github Link */}
                    <MuiLink href="https://github.com" sx={{ textDecoration: 'none' }}>
                        <NavigationMenuTrigger>Github</NavigationMenuTrigger>
                    </MuiLink>
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
                                // border: '1px solid red'
                            }}
                        >
                            {menuContents.map((menu) => (
                                <ContentPanel
                                    key={menu.id}
                                    ref={(el: HTMLDivElement | null) => {
                                        contentRefs.current[menu.id] = el;
                                    }}
                                >
                                    {menu.content}
                                </ContentPanel>
                            ))}
                        </ContentSlider>
                    </Viewport>
                </ViewportWrapper>
            </NavigationMenuList>
        </NavigationMenuRoot>
    );
};

export default NavigationMenuSmooth;
