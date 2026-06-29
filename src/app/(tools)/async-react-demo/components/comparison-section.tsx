"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { SectionHeader } from "./shared";

const ROWS = [
  { feature: "执行模型", transition: "并行（触发即忘）", action: "顺序队列" },
  { feature: "返回值", transition: "无", action: "返回 prevState → newState" },
  { feature: "竞态条件", transition: "可能发生（需自行处理）", action: "已防止（有序队列）" },
  { feature: "原子性 UI 更新", transition: "否（每次 setState 都渲染）", action: "是（队列清空后批量更新）" },
  { feature: "适用场景", transition: "搜索、过滤、一次性操作", action: "表单、计数器、资源管理" },
  { feature: "错误处理", transition: "手动 try/catch", action: "在状态对象中返回错误" },
  { feature: "表单集成", transition: "不适用", action: "原生支持 <form action={}>" },
];

export function ComparisonSection() {
  return (
    <Box>
      <SectionHeader title="应该用哪个？" badge="决策指南" />
      <Paper sx={{ overflow: "hidden" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "grey.900",
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700}>特性</Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} color="warning.main">useTransition</Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} color="primary.main">useActionState</Typography>
          </Box>
        </Box>
        {ROWS.map((row, i) => (
          <Box
            key={row.feature}
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              borderBottom: i < ROWS.length - 1 ? "1px solid" : "none",
              borderColor: "divider",
              bgcolor: i % 2 === 0 ? "transparent" : "action.hover",
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" fontWeight={600}>{row.feature}</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">{row.transition}</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">{row.action}</Typography>
            </Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
