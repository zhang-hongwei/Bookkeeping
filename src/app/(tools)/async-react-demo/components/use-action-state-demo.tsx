"use client";

import { useState, useActionState, startTransition } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ShieldIcon from "@mui/icons-material/Shield";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CasinoIcon from "@mui/icons-material/Casino";
import Grid from "@mui/material/Grid";
import { SectionHeader } from "./shared";

// ── 游戏商店数据 ──────────────────────────────────────────

interface ShopItem {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  color: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: "sword", name: "铁剑", price: 200, icon: <LocalFireDepartmentIcon />, color: "#ef5350" },
  { id: "shield", name: "钢盾", price: 150, icon: <ShieldIcon />, color: "#42a5f5" },
  { id: "potion", name: "生命药水", price: 50, icon: <AutoFixHighIcon />, color: "#66bb6a" },
  { id: "ring", name: "力量之戒", price: 300, icon: <CardGiftcardIcon />, color: "#ab47bc" },
  { id: "dice", name: "幸运骰子", price: 100, icon: <CasinoIcon />, color: "#ffa726" },
];

interface ShopState {
  gold: number;
  inventory: string[];
  message: string;
  isError: boolean;
  log: string[];
}

function simulatePurchase(itemId: string, currentGold: number): Promise<{ success: boolean; newGold: number }> {
  const item = SHOP_ITEMS.find((i) => i.id === itemId)!;
  return new Promise((resolve) => {
    const delay = 300 + Math.random() * 700;
    setTimeout(() => {
      if (currentGold < item.price) {
        resolve({ success: false, newGold: currentGold });
      } else {
        resolve({ success: true, newGold: currentGold - item.price });
      }
    }, delay);
  });
}

// ── useActionState 演示 ───────────────────────────────────

export function UseActionStateDemo() {
  const [shopState, formAction, isPending] = useActionState(
    async (prevState: ShopState, itemId: string): Promise<ShopState> => {
      const item = SHOP_ITEMS.find((i) => i.id === itemId)!;
      const result = await simulatePurchase(itemId, prevState.gold);

      if (!result.success) {
        return {
          ...prevState,
          message: `金币不足，无法购买 ${item.name}！需要 ${item.price}g，当前 ${prevState.gold}g。`,
          isError: true,
          log: [...prevState.log, `购买失败：${item.name}（金币不足）`],
        };
      }

      return {
        gold: result.newGold,
        inventory: [...prevState.inventory, item.name],
        message: `成功购买 ${item.name}，花费 ${item.price}g！`,
        isError: false,
        log: [...prevState.log, `已购买：${item.name}（-${item.price}g）`],
      };
    },
    { gold: 500, inventory: [], message: "", isError: false, log: [] }
  );

  const [queuedItems, setQueuedItems] = useState<string[]>([]);

  const handleBuy = (itemId: string) => {
    setQueuedItems((prev) => [...prev, itemId]);
    startTransition(() => {
      formAction(itemId);
    });
  };

  const handleClearQueue = () => {
    if (!isPending) {
      setQueuedItems([]);
    }
  };

  return (
    <Box>
      <SectionHeader title="useActionState" badge="顺序执行 & 原子更新" />

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>工作原理：</strong>快速连续点击商品购买。Actions 会排成队列{" "}
          <strong>顺序执行</strong> — 每个操作都能看到上一个的真实结果。
          UI 更新是<strong>原子性</strong>的，只有当整个队列处理完毕后才会刷新。
        </Typography>
      </Alert>

      {/* 金币 & 背包 */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ textAlign: "center", p: 2 }}>
              <Typography variant="h3" fontWeight={700} color="warning.main">
                {shopState.gold}g
              </Typography>
              <Typography variant="caption" color="text.secondary">
                剩余金币
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                背包（{shopState.inventory.length} 件物品）
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {shopState.inventory.map((item, i) => (
                  <Chip key={i} label={item} size="small" color="primary" variant="outlined" />
                ))}
                {shopState.inventory.length === 0 && (
                  <Typography variant="body2" color="text.disabled">
                    空空如也 — 去买点什么吧！
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 消息提示 */}
      {shopState.message && (
        <Alert
          severity={shopState.isError ? "error" : "success"}
          sx={{ mb: 2 }}
          onClose={handleClearQueue}
        >
          {shopState.message}
        </Alert>
      )}

      {/* 处理中 & 队列指示器 */}
      {isPending && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress sx={{ borderRadius: 1, mb: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              正在处理队列中的 {queuedItems.length} 个请求...
              （原子更新 — 所有操作完成后才会刷新 UI）
            </Typography>
          </Box>
        </Box>
      )}

      {/* 商品列表 */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          商品商店 — 快速连续点击来测试 Action 队列
        </Typography>
        <Grid container spacing={2}>
          {SHOP_ITEMS.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  transition: "all 0.2s",
                  "&:hover": { borderColor: item.color, transform: "translateY(-2px)" },
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                <Avatar sx={{ bgcolor: item.color, color: "#fff" }}>{item.icon}</Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body1" fontWeight={600} noWrap>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="warning.main">
                    {item.price}g
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={isPending}
                  onClick={() => handleBuy(item.id)}
                  sx={{ flexShrink: 0 }}
                >
                  购买
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 购买日志 */}
      {shopState.log.length > 0 && (
        <Paper sx={{ p: 3, mb: 2, bgcolor: "grey.900" }}>
          <Typography variant="subtitle2" color="grey.400" gutterBottom>
            操作日志（顺序队列）
          </Typography>
          {shopState.log.map((entry, i) => (
            <Typography key={i} variant="body2" sx={{ fontFamily: "monospace", color: "grey.300", py: 0.25 }}>
              [{i + 1}] {entry}
            </Typography>
          ))}
        </Paper>
      )}

      {/* 代码对比 */}
      <Paper sx={{ p: 3, bgcolor: "grey.900" }}>
        <Typography variant="subtitle2" color="grey.400" sx={{ mb: 1 }}>
          改造前（React 18）— 手动状态同步
        </Typography>
        <Box component="pre" sx={{ fontSize: 13, color: "grey.300", overflow: "auto", m: 0 }}>
          {`const [gold, setGold] = useState(500);
const [inventory, setInventory] = useState([]);
const [isPending, setIsPending] = useState(false);
const [message, setMessage] = useState("");
const [isError, setIsError] = useState(false);
// ... 需要 20+ 行 try/catch/finally 手动同步 ...`}
        </Box>
        <Divider sx={{ my: 2, borderColor: "grey.700" }} />
        <Typography variant="subtitle2" color="primary.main" sx={{ mb: 1 }}>
          改造后（React 19）— useActionState
        </Typography>
        <Box component="pre" sx={{ fontSize: 13, color: "grey.300", overflow: "auto", m: 0 }}>
          {`const [state, formAction, isPending] = useActionState(
  async (prevState, itemId) => {
    const result = await simulatePurchase(itemId, prevState.gold);
    // 直接返回新状态 — React 自动处理一切！
    return { gold: result.newGold, ... };
  },
  { gold: 500, inventory: [], ... }
);`}
        </Box>
      </Paper>
    </Box>
  );
}
