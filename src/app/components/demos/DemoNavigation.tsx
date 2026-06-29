"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";

interface DemoNavItem {
  id: string;
  title: string;
}

interface DemoNavigationProps {
  items: DemoNavItem[];
}

/**
 * DemoNavigation 组件
 * 右侧导航，支持点击滚动到指定演示
 */
const DemoNavigation = ({ items }: DemoNavigationProps) => {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || "");

  // 监听滚动，高亮当前可见的演示
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // 添加偏移量

      // 找到当前可见的section
      for (let i = items.length - 1; i >= 0; i--) {
        const element = document.getElementById(items[i].id);
        if (element) {
          const { offsetTop } = element;
          if (scrollPosition >= offsetTop) {
            setActiveId(items[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  const handleClick = (id: string) => {
    console.log("Clicking navigation item:", id);

    // 立即更新激活状态
    setActiveId(id);

    const element = document.getElementById(id);
    console.log("Found element:", element);

    if (element) {
      // 使用 scrollIntoView，更可靠的滚动方法
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // 微调位置，留出顶部空间
      setTimeout(() => {
        const offset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const currentScroll = window.scrollY;
        const targetScroll = currentScroll + elementPosition - offset;

        window.scrollTo({
          top: targetScroll,
          behavior: "smooth",
        });
      }, 100);
    } else {
      console.error("Element not found with id:", id);
    }
  };

  return (
    <Paper
      sx={{
        position: "fixed",
        right: 24,
        top: "50%",
        transform: "translateY(-50%)",
        width: 280,
        maxHeight: "calc(100vh - 160px)",
        overflow: "auto",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        zIndex: 1000,
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="subtitle2" fontWeight={600}>
          导航
        </Typography>
      </Box>
      <List sx={{ py: 1 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.id}
            selected={activeId === item.id}
            onClick={() => handleClick(item.id)}
            sx={{
              py: 1,
              px: 2,
              "&.Mui-selected": {
                bgcolor: "action.selected",
                borderLeft: 3,
                borderColor: "primary.main",
              },
            }}
          >
            <ListItemText
              primary={item.title}
              slotProps={{
                primary: {
                  variant: "body2",
                  fontSize: "0.875rem",
                  fontWeight: activeId === item.id ? 600 : 400,
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
};

export default DemoNavigation;
