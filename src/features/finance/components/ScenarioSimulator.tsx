/**
 * What-if 情景模拟面板（Phase 7，US1 / FR-001，MVP）。
 * - 设置情景（降薪/加息/大额支出/失业/自定义）→ 确定性投影净资产曲线（baseline vs scenario）。
 * - netWorthDelta = scenario − baseline（I3，可复现）；无历史结余 → 降级提示（NC6）。
 * - 免责强渲染（SC-004）；AI 解读仅文本旁注（NC5 零编造）。
 */
'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Slider,
} from '@mui/material';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCreateScenario, useInterpretScenario } from '../hooks/use-finance';
import type { ScenarioDTO, ScenarioKindDTO } from '../api';

const KIND_LABEL: Record<ScenarioKindDTO, string> = {
  income_cut: '降薪',
  rate_hike: '加息（房贷）',
  lump_expense: '大额支出',
  unemployment: '失业',
  custom: '自定义',
};

function yuan(v: string): string {
  return `¥${Number(v).toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`;
}

export function ScenarioSimulator({ familyId }: { familyId?: string } = {}) {
  const create = useCreateScenario();
  const interpret = useInterpretScenario();
  const [text, setText] = useState('');

  const [name, setName] = useState('降薪 30% 持续 6 个月');
  const [kind, setKind] = useState<ScenarioKindDTO>('income_cut');
  const [horizonMonths, setHorizonMonths] = useState(12);
  const [incomeDeltaPct, setIncomeDeltaPct] = useState(-30); // 百分比
  const [durationMonths, setDurationMonths] = useState(6);
  const [rateDeltaPct, setRateDeltaPct] = useState<number | ''>('');
  const [lumpExpense, setLumpExpense] = useState('');
  const [affectedMonth, setAffectedMonth] = useState<number | ''>('');

  const result = create.data?.scenario;

  const submit = async () => {
    const assumptions: {
      incomeDeltaPct: number;
      durationMonths: number;
      rateDeltaPct?: number | null;
      lumpExpense?: string | null;
      affectedMonth?: number | null;
    } = {
      incomeDeltaPct: incomeDeltaPct / 100,
      durationMonths,
    };
    if (rateDeltaPct !== '') assumptions.rateDeltaPct = (rateDeltaPct as number) / 100;
    if (lumpExpense && Number(lumpExpense) > 0) assumptions.lumpExpense = Number(lumpExpense).toFixed(2);
    if (affectedMonth !== '') assumptions.affectedMonth = affectedMonth as number;

    await create.mutateAsync({ name, kind, assumptions, horizonMonths, familyId });
  };

  const runInterpret = async () => {
    if (!result) return;
    setText('');
    const r = await interpret.mutateAsync({ id: result.id, familyId });
    setText(r.text);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>问问「如果」：情景模拟</Typography>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 1.5 }}>
            <TextField size="small" label="情景名称" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField size="small" select label="类型" value={kind} onChange={(e) => setKind(e.target.value as ScenarioKindDTO)}>
              {(Object.keys(KIND_LABEL) as ScenarioKindDTO[]).map((k) => (
                <MenuItem key={k} value={k}>{KIND_LABEL[k]}</MenuItem>
              ))}
            </TextField>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">投影时长：{horizonMonths} 个月</Typography>
            <Slider value={horizonMonths} onChange={(_, v) => setHorizonMonths(v as number)} min={3} max={36} step={1} size="small" />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            <TextField size="small" type="number" label="收入变化（%，降薪填负）" value={incomeDeltaPct} onChange={(e) => setIncomeDeltaPct(Number(e.target.value))} />
            <Box>
              <Typography variant="caption" color="text.secondary">持续 {durationMonths} 个月</Typography>
              <Slider value={durationMonths} onChange={(_, v) => setDurationMonths(v as number)} min={1} max={horizonMonths} step={1} size="small" />
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.5 }}>
            <TextField size="small" type="number" label="利率变化（%，可选）" value={rateDeltaPct} onChange={(e) => setRateDeltaPct(e.target.value === '' ? '' : Number(e.target.value))} placeholder="如 1" />
            <TextField size="small" type="number" label="大额支出（¥，可选）" value={lumpExpense} onChange={(e) => setLumpExpense(e.target.value)} placeholder="50000" />
            <TextField size="small" type="number" label="支出发生月（可选）" value={affectedMonth} onChange={(e) => setAffectedMonth(e.target.value === '' ? '' : Number(e.target.value))} placeholder="如 3" />
          </Box>
          <Button variant="contained" size="small" disabled={create.isPending} onClick={submit}
            startIcon={create.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}>
            模拟情景
          </Button>
          {create.isError && <Alert severity="error">{(create.error as Error)?.message ?? '模拟失败'}</Alert>}
        </Stack>

        {result && (
          <ScenarioResult result={result} text={text} onInterpret={runInterpret} interpretPending={interpret.isPending} />
        )}
      </CardContent>
    </Card>
  );
}

function ScenarioResult({
  result,
  text,
  onInterpret,
  interpretPending,
}: {
  result: ScenarioDTO;
  text: string;
  onInterpret: () => void;
  interpretPending: boolean;
}) {
  const data = result.projections.map((p) => ({
    month: `M${p.monthOffset}`,
    baseline: Number(p.baselineNetWorth),
    scenario: Number(p.scenarioNetWorth),
    delta: Number(p.netWorthDelta),
  }));
  const last = result.projections[result.projections.length - 1];

  return (
    <Stack spacing={1.5} sx={{ mt: 2 }}>
      {result.status === 'degraded' && (
        <Alert severity="info">
          历史结余数据不足（{result.missing.join('、')}），暂无法可靠投影。建议积累更多月份的收支记录后再模拟（不编造，SC-005）。
        </Alert>
      )}
      {last && (
        <Typography variant="body2" color="text.secondary">
          第 {result.horizonMonths} 月：基线净资产 {yuan(last.baselineNetWorth)} → 情景 {yuan(last.scenarioNetWorth)}
          （差异 <strong style={{ color: Number(last.netWorthDelta) < 0 ? '#d32f2f' : '#2e7d32' }}>{yuan(last.netWorthDelta)}</strong>）
        </Typography>
      )}
      {data.length > 0 && (
        <Box sx={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} width={64} tickFormatter={(v) => yuan(String(v))} />
              <Tooltip formatter={(value) => yuan(String(value))} />
              <Legend />
              <Line type="monotone" dataKey="baseline" name="基线" stroke="#1976d2" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="scenario" name="情景" stroke="#d32f2f" dot={false} strokeWidth={2} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
      <Box>
        <Button size="small" variant="outlined" disabled={interpretPending || data.length === 0} onClick={onInterpret}
          startIcon={interpretPending ? <CircularProgress size={16} color="inherit" /> : undefined}>
          AI 解读情景
        </Button>
        {text && <Alert severity="info" sx={{ mt: 1 }}>{text}</Alert>}
      </Box>
      {result.disclaimers.map((d, i) => (
        <Typography key={i} variant="caption" color="text.secondary">· {d}</Typography>
      ))}
    </Stack>
  );
}
