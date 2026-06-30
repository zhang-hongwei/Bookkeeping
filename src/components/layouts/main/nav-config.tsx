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
      title: "记账",
      path: "/finance",
      icon: <ReceiptOutlined />,
      children: [
        { title: "概览", path: "/finance", icon: <BarChartOutlined /> },
        { title: "净资产", path: "/finance#net-worth", icon: <ShowChartOutlined /> },
        { title: "账户", path: "/finance#accounts", icon: <AccountBalanceWalletOutlined /> },
        { title: "记一笔", path: "/finance#record", icon: <AddOutlined /> },
        { title: "交易明细", path: "/finance#transactions", icon: <ListAltOutlined /> },
        { title: "批量导入", path: "/finance#import", icon: <FolderOutlined /> },
        { title: "月报", path: "/finance#report", icon: <ArticleOutlined /> },
      ],
    },
    /* ── 以下为模板自带的演示菜单（App/Banking/Course/User/Booking/Analytics/
       File Manager/Blog/Invoice/Product/i18n/Theme），与记账 App 无关，暂时注释。
       恢复方法：删掉本段外层的 /* 和 *​/ 即可。────────────────────────────
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
    ──────────────────────────────────────────────────────────────────── */
  ];
};
