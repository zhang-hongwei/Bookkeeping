"use client";

import { useMemo } from "react";
import {
  Drawer,
  Box,
  IconButton,
  Avatar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  Stack,
  Badge,
  Switch,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  Close,
  HomeOutlined,
  PersonOutlined,
  FolderOutlined,
  CreditCardOutlined,
  SecurityOutlined,
  SettingsOutlined,
  Add,
  LightModeOutlined,
  DarkModeOutlined,
  LanguageOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useLocale } from "@/hooks/useLocale";
import { localeOptions } from "@/const/locale";
import { useTranslation } from "react-i18next";

// Get random avatar image from public/assets/images/avatar
const getRandomAvatar = () => {
  const avatarCount = 25;
  const randomIndex = Math.floor(Math.random() * avatarCount) + 1;
  return `/assets/images/avatar/avatar-${randomIndex}.webp`;
};

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const UserInfoDrawer = ({
  open,
  onClose,
  user = {
    name: "Jaydon Frankie",
    email: "demo@test.cc",
  },
}: SettingsDrawerProps) => {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation("settings");

  // Generate random avatars once per component mount
  const randomAvatar = useMemo(() => getRandomAvatar(), []);
  const mockAccounts = useMemo(
    () => [
      { id: 1, avatar: getRandomAvatar(), name: "Account 1" },
      { id: 2, avatar: getRandomAvatar(), name: "Account 2" },
      { id: 3, avatar: getRandomAvatar(), name: "Account 3" },
    ],
    []
  );

  const menuItems = [
    { icon: <HomeOutlined />, label: t("menu.home"), path: "/" },
    { icon: <PersonOutlined />, label: t("menu.profile"), path: "/profile" },
    {
      icon: <FolderOutlined />,
      label: t("menu.projects"),
      path: "/projects",
      badge: 3,
    },
    {
      icon: <CreditCardOutlined />,
      label: t("menu.subscription"),
      path: "/subscription",
    },
    {
      icon: <SecurityOutlined />,
      label: t("menu.security"),
      path: "/security",
    },
    {
      icon: <SettingsOutlined />,
      label: t("menu.accountSettings"),
      path: "/settings",
    },
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log("Logout clicked");
    router.push("/login");
    onClose();
  };

  return (
    <Drawer
      hideBackdrop
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: 360,
          boxSizing: "border-box",
        },
      }}
    >
      {/* Header with Close Button */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "flex-end",
          background: "transparent",
        }}
      >
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      {/* User Profile Section */}
      <Box
        sx={{
          px: 3,
          pb: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "transparent",
        }}
      >
        {/* Main Avatar */}
        <Avatar
          src={user.avatar || randomAvatar}
          alt={user.name}
          sx={{
            width: 80,
            height: 80,
            mb: 2,
            border: "4px solid",
            borderColor: "primary.lighter",
          }}
        >
          {user.name.charAt(0)}
        </Avatar>

        {/* User Info */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          {user.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {user.email}
        </Typography>

        {/* Multiple Accounts */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {mockAccounts.map((account) => (
            <IconButton
              key={account.id}
              sx={{
                p: 0,
                "&:hover": {
                  transform: "scale(1.1)",
                  transition: "transform 0.2s",
                },
              }}
            >
              <Avatar
                src={account.avatar}
                alt={account.name}
                sx={{
                  width: 36,
                  height: 36,
                }}
              >
                {account.name.charAt(0)}
              </Avatar>
            </IconButton>
          ))}
          {/* Add Account Button */}
          <IconButton
            sx={{
              p: 0,
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "grey.200",
                color: "text.secondary",
              }}
            >
              <Add />
            </Avatar>
          </IconButton>
        </Stack>
      </Box>

      <Divider sx={{ borderStyle: "dashed" }} />

      {/* Language & Theme Settings */}
      {/* <Box sx={{ px: 3, py: 2 }}> */}
      {/* Language Selector */}
      {/* <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <LanguageOutlined
              sx={{ fontSize: 20, color: "text.secondary", mr: 1 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {t("language")}
            </Typography>
          </Box>
          <FormControl fullWidth >
            <Select
              value={locale}
              onChange={(e) => setLocale(e.target.value as typeof locale)}
              sx={{
                borderRadius: 1,
                "& .MuiSelect-select": {
                  py: 1,
                  display: "flex",
                  alignItems: "center",
                },
              }}
            >
              {localeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span style={{ fontSize: "18px" }}>{option.emoji}</span>
                    <span>{option.label}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box> */}

      {/* Theme Toggle */}
      {/* <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {mode === "dark" ? (
                <DarkModeOutlined
                  sx={{ fontSize: 20, color: "text.secondary", mr: 1 }}
                />
              ) : (
                <LightModeOutlined
                  sx={{ fontSize: 20, color: "text.secondary", mr: 1 }}
                />
              )}
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t("darkMode")}
              </Typography>
            </Box>
            <Switch
              checked={mode === "dark"}
              onChange={(e) => setMode(e.target.checked ? "dark" : "light")}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#FF9500",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#FF9500",
                },
              }}
            />
          </Box>
        </Box> */}
      {/* </Box> */}

      {/* <Divider /> */}

      {/* Menu Items */}
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              sx={{
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: "text.secondary",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    fontSize: "14px",
                    fontWeight: 500,
                  },
                }}
              />
              {item.badge && (
                <Badge
                  badgeContent={item.badge}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "10px",
                      height: 18,
                      minWidth: 18,
                    },
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Upgrade Card */}
      <Box sx={{ px: 3, py: 2, mt: "auto" }}>
        <Box
          sx={{
            background: "linear-gradient(135deg, #FFB88C 0%, #DE5499 100%)",
            borderRadius: 2,
            p: 2.5,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Rocket Emoji */}
          <Box
            sx={{
              position: "absolute",
              right: 16,
              bottom: 16,
              fontSize: "48px",
              opacity: 0.9,
            }}
          >
            🚀
          </Box>

          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            {t("upgrade.discount")}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "white",
              mb: 2,
              opacity: 0.95,
            }}
          >
            {t("upgrade.title")}
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#FFD700",
              color: "#000",
              fontWeight: 700,
              textTransform: "none",
              boxShadow: 2,
              "&:hover": {
                bgcolor: "#FFC700",
              },
            }}
          >
            {t("upgrade.button")}
          </Button>
        </Box>
      </Box>

      {/* Logout Button */}
      <Box sx={{ p: 3, pt: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          onClick={handleLogout}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 1,
            py: 1.5,
          }}
        >
          {t("logout")}
        </Button>
      </Box>
    </Drawer>
  );
}



export default UserInfoDrawer