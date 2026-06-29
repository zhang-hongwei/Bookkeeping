"use client";

import {
  GroupOutlined,
  BarChartOutlined,
  CalendarTodayOutlined,
  ShowChartOutlined,
  FolderOutlined,
  ArticleOutlined,
  ReceiptOutlined,
  Inventory2Outlined,
  TranslateOutlined,
  AccountBalanceWalletOutlined,
  SchoolOutlined,
  PersonOutlined,
  ListAltOutlined,
  InfoOutlined,
  AddOutlined,
  EditOutlined,
  BrushOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

// ----------------------------------------------------------------------

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactElement;
  info?: React.ReactNode;
  children?: NavItem[];
};

export const useNavData = (): NavItem[] => {
  const { t } = useTranslation("common");

  return [
    {
      title: "App",
      path: "/app",
      icon: <BarChartOutlined />,
    },
    {
      title: "Banking",
      path: "/banking",
      icon: <AccountBalanceWalletOutlined />,
    },
    {
      title: "记账",
      path: "/finance",
      icon: <ReceiptOutlined />,
    },
    {
      title: "Course",
      path: "/course",
      icon: <SchoolOutlined />,
    },
    {
      title: "User",
      path: "/user",
      icon: <PersonOutlined />,
      children: [
        {
          title: "Profile",
          path: "/user/profile",
          icon: <PersonOutlined />,
        },
        {
          title: "User List",
          path: "/user/user-list",
          icon: <GroupOutlined />,
        },
      ],
    },
    {
      title: "Booking",
      path: "/booking",
      icon: <CalendarTodayOutlined />,
    },
    {
      title: "Analytics",
      path: "/analytics",
      icon: <ShowChartOutlined />,
    },
    {
      title: "File Manager",
      path: "/file-manager",
      icon: <FolderOutlined />,
    },
    {
      title: "Blog",
      path: "/blog",
      icon: <ArticleOutlined />,
    },
    {
      title: "Invoice",
      path: "/invoice",
      icon: <ReceiptOutlined />,
    },
    {
      title: "Product",
      path: "/product",
      icon: <Inventory2Outlined />,
      children: [
        {
          title: "List",
          path: "/product",
          icon: <ListAltOutlined />,
        },
        {
          title: "Details",
          path: "/product/details",
          icon: <InfoOutlined />,
        },
        {
          title: "Create",
          path: "/product/create",
          icon: <AddOutlined />,
        },
        {
          title: "Edit",
          path: "/product/edit",
          icon: <EditOutlined />,
        },
      ],
    },
    {
      title: t("nav.i18nDemo"),
      path: "/i18n-demo",
      icon: <TranslateOutlined />,
    },
    {
      title: "Theme",
      path: "/theme",
      icon: <BrushOutlined />,
      info: "MUI v7",
    },
  ];
};
