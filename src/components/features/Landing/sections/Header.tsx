"use client";

import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Link as MuiLink,
  Stack,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Menu as MenuIcon, Close, Login, GitHub } from "@mui/icons-material";
import { useState } from "react";
import Link from "next/link";
import NPLink from "@/components/common/NPLink";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import NavigationMenu from "@/components/common/NavigationMenu";

interface NavItem {
  label: string;
  href: string;
}

export const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: "Components", href: "/components" },
    { label: "Docs", href: "https://product-pilot-docs.vercel.app/docs" },
  ];

  const pagesMenuItems = [
    { label: "App", href: "/app" },
    { label: "Banking", href: "/banking" },
    { label: "Course", href: "/course" },
    { label: "Analytics", href: "/analytics" },
    { label: "File Manager", href: "/file-manager" },
    { label: "Blog", href: "/blog" },
    { label: "Invoice", href: "/invoice" },
    { label: "Product", href: "/product" },
  ];

  // 为 NavigationMenu 组件准备菜单数据
  const menuGroups = [
    {
      id: 'pages',
      label: 'Pages',
      items: pagesMenuItems,
    },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // 处理平滑滚动
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    // 如果是锚点链接，使用平滑滚动
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      // 移动端关闭菜单
      if (isMobile && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: (theme) => {
            if (theme.palette.mode === "dark") {
              return "linear-gradient(135deg, rgba(25, 25, 25, 0.95) 0%, rgba(35, 35, 35, 0.95) 100%)";
            }
            return "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 248, 255, 0.95) 100%)";
          },
          backdropFilter: "blur(10px)",
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 2px 8px rgba(0, 0, 0, 0.3)"
              : "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
        elevation={0}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0, sm: 2 } }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: "none" }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    opacity: 0.8,
                  },
                  transition: "opacity 0.2s",
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                  }}
                >
                  C
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  Dev Tools
                </Typography>
              </Stack>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ ml: 6, flex: 1 }}
                alignItems="center"
              >
                {navItems.map((item) => {
                  const isExternal = item.href.startsWith("http");

                  if (isExternal) {
                    return (
                      <MuiLink
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          px: 2,
                          py: 1,
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          color: (theme) => theme.palette.text.secondary,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          borderRadius: 1,
                          textDecoration: "none",
                          "&:hover": {
                            color: (theme) => theme.palette.primary.main,
                            background: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(0, 0, 0, 0.05)",
                          },
                        }}
                      >
                        {item.label}
                      </MuiLink>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                    >
                      <MuiLink
                        component="div"
                        sx={{
                          px: 2,
                          py: 1,
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          color: (theme) => theme.palette.text.secondary,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          borderRadius: 1,
                          "&:hover": {
                            color: (theme) => theme.palette.primary.main,
                            background: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(0, 0, 0, 0.05)",
                          },
                        }}
                      >
                        {item.label}
                      </MuiLink>
                    </Link>
                  );
                })}

                {/* Pages Dropdown with NavigationMenu */}
                <NavigationMenu menuGroups={menuGroups} minWidth={400} />
              </Stack>
            )}

            {/* Right Side Actions */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ ml: "auto" }}
            >
              {/* GitHub Link */}
              {/* <IconButton
                component="a"
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                
                sx={{
                  color: (theme) => theme.palette.text.secondary,
                  transition: "all 0.2s",
                  "&:hover": {
                    color: (theme) => theme.palette.primary.main,
                  },
                }}
              >
                <GitHub />
              </IconButton> */}

              {/* Language Selector */}
              <LanguageSelector showTooltip={false} />

              {/* Theme Toggle */}
              <ThemeToggle showTooltip={false} />

              {/* Login Button */}
              <Button
                variant="contained"
                startIcon={<Login />}
                href="/login"
                component={NPLink}
                sx={{
                  ml: 1,
                  borderRadius: 1,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Sign In
              </Button>

              {/* Mobile Menu Toggle */}
              {isMobile && (
                <IconButton
                  onClick={toggleMobileMenu}
                  sx={{
                    ml: 1,
                    color: (theme) => theme.palette.text.secondary,
                  }}
                >
                  {mobileMenuOpen ? <Close /> : <MenuIcon />}
                </IconButton>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Menu Drawer */}
      {isMobile && (
        <Drawer
          anchor="top"
          open={mobileMenuOpen}
          onClose={toggleMobileMenu}
          sx={{
            "& .MuiDrawer-paper": {
              mt: "64px",
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          <Box
            sx={{
              p: 2,
            }}
          >
            <Stack spacing={1}>
              {navItems.map((item) => {
                const isExternal = item.href.startsWith("http");

                if (isExternal) {
                  return (
                    <MuiLink
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={toggleMobileMenu}
                      sx={{
                        px: 2,
                        py: 1.5,
                        fontSize: "1rem",
                        fontWeight: 500,
                        color: (theme) => theme.palette.text.primary,
                        cursor: "pointer",
                        borderRadius: 1,
                        textDecoration: "none",
                        transition: "all 0.2s",
                        "&:hover": {
                          color: (theme) => theme.palette.primary.main,
                          background: (theme) =>
                            theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.05)"
                              : "rgba(0, 0, 0, 0.05)",
                        },
                      }}
                    >
                      {item.label}
                    </MuiLink>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                  >
                    <MuiLink
                      component="div"
                      sx={{
                        px: 2,
                        py: 1.5,
                        fontSize: "1rem",
                        fontWeight: 500,
                        color: (theme) => theme.palette.text.primary,
                        cursor: "pointer",
                        borderRadius: 1,
                        transition: "all 0.2s",
                        "&:hover": {
                          color: (theme) => theme.palette.primary.main,
                          background: (theme) =>
                            theme.palette.mode === "dark"
                              ? "rgba(255, 255, 255, 0.05)"
                              : "rgba(0, 0, 0, 0.05)",
                        },
                      }}
                    >
                      {item.label}
                    </MuiLink>
                  </Link>
                );
              })}

              {/* Pages Submenu for Mobile */}
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: (theme) => theme.palette.text.secondary,
                    mb: 1,
                  }}
                >
                  Pages
                </Typography>
                <Stack spacing={0.5} sx={{ ml: 2 }}>
                  {pagesMenuItems.map((item) => (
                    <Link key={item.label} href={item.href}>
                      <MuiLink
                        component="div"
                        onClick={toggleMobileMenu}
                        sx={{
                          py: 0.75,
                          fontSize: "0.9rem",
                          color: (theme) => theme.palette.text.secondary,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            color: (theme) => theme.palette.primary.main,
                          },
                        }}
                      >
                        {item.label}
                      </MuiLink>
                    </Link>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Drawer>
      )}
    </>
  );
};
