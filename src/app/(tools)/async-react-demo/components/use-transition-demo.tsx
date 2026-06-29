"use client";

import { useEffect, useState, useTransition } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import { SectionHeader } from "./shared";

// ── 模拟数据 ──────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
}

const ALL_PRODUCTS: Product[] = [
  { id: 1, name: "机械键盘", category: "电子产品", price: 129 },
  { id: 2, name: "无线鼠标", category: "电子产品", price: 49 },
  { id: 3, name: "USB-C 扩展坞", category: "电子产品", price: 39 },
  { id: 4, name: "显示器支架", category: "家具", price: 89 },
  { id: 5, name: "台灯", category: "家具", price: 45 },
  { id: 6, name: "人体工学椅", category: "家具", price: 299 },
  { id: 7, name: "笔记本套装", category: "文具", price: 15 },
  { id: 8, name: "钢笔礼盒", category: "文具", price: 25 },
  { id: 9, name: "桌面收纳盒", category: "文具", price: 35 },
  { id: 10, name: "高清摄像头", category: "电子产品", price: 79 },
  { id: 11, name: "智能手表", category: "电子产品", price: 399 },
  { id: 12, name: "无线耳机", category: "电子产品", price: 249 },
];

// 模拟 API 调用，随机延迟 300-1500ms
function fetchFilteredProducts(term: string): Promise<Product[]> {
  return new Promise((resolve) => {
    const delay = 300 + Math.random() * 1200;
    setTimeout(() => {
      const lower = term.toLowerCase();
      resolve(
        ALL_PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes(lower) ||
            p.category.toLowerCase().includes(lower)
        )
      );
    }, delay);
  });
}

// ── useTransition 演示 ────────────────────────────────────

export function UseTransitionDemo() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(ALL_PRODUCTS);
  const [isPending, startTrans] = useTransition();
  const [requestCount, setRequestCount] = useState(0);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredProducts(ALL_PRODUCTS);
      return;
    }
    startTrans(async () => {
      setRequestCount((c) => c + 1);
      const data = await fetchFilteredProducts(value);
      setFilteredProducts(data);
    });
  };

  useEffect(() => {
    console.log('log=isPending=>>', isPending)
  }, [isPending])

  return (
    <Box overflow={'auto'} sx={{ border: '1px solid red', maxHeight: '600px' }}>
      <SectionHeader title="useTransition" badge="并行执行" />

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>工作原理：</strong>快速输入可以看到并行执行效果。
          React 同时发起多个请求 — <code>isPending</code> 在所有请求完成前保持{" "}
          <code>true</code>。但结果可能乱序到达（旧数据可能覆盖新数据）。
        </Typography>
      </Alert>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <SearchIcon color="action" />
          <TextField
            fullWidth
            size="small"
            placeholder="搜索商品...（试试快速输入！）"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            slotProps={{
              input: {
                endAdornment: isPending ? <CircularProgress size={20} /> : null,
              },
            }}
          />
        </Box>

        {isPending && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Chip
            label={isPending ? "搜索中..." : "空闲"}
            color={isPending ? "warning" : "default"}
            size="small"
          />
          <Chip label={`已发起请求：${requestCount}`} variant="outlined" size="small" />
          <Chip label={`${filteredProducts.length} 条结果`} variant="outlined" size="small" color="success" />
        </Box>

        <List dense>
          {filteredProducts.map((product) => (
            <ListItem key={product.id} sx={{ borderRadius: 1, "&:hover": { bgcolor: "action.hover" } }}>
              <ListItemText
                primary={product.name}
                secondary={`${product.category} — ¥${product.price}`}
              />
            </ListItem>
          ))}
          {filteredProducts.length === 0 && (
            <ListItem>
              <ListItemText primary="未找到匹配的商品" sx={{ textAlign: "center", color: "text.secondary" }} />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* 代码对比 */}
      <Paper sx={{ p: 3, bgcolor: "grey.900" }}>
        <Typography variant="subtitle2" color="grey.400" sx={{ mb: 1 }}>
          改造前（React 18）— 手动状态管理
        </Typography>
        <Box component="pre" sx={{ fontSize: 13, color: "grey.300", overflow: "auto", m: 0 }}>
          {`const [isLoading, setIsLoading] = useState(false);
// ... 需要 try/catch/finally 手动管理 ...
setIsLoading(true);
try {
  const data = await fetch(term);
  setFilteredProducts(data);
} finally {
  setIsLoading(false); // 容易忘记！
}`}
        </Box>
        <Divider sx={{ my: 2, borderColor: "grey.700" }} />
        <Typography variant="subtitle2" color="primary.main" sx={{ mb: 1 }}>
          改造后（React 19）— useTransition
        </Typography>
        <Box component="pre" sx={{ fontSize: 13, color: "grey.300", overflow: "auto", m: 0 }}>
          {`const [isPending, startTransition] = useTransition();
// isPending 在整个异步操作期间自动管理
startTransition(async () => {
  const data = await fetchFilteredProducts(term);
  setFilteredProducts(data);
  // isPending 自动重置，无需 finally！
});`}
        </Box>
      </Paper>
    </Box>
  );
}
