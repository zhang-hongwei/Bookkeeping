/**
 * 退休模拟面板（Phase 7，US3 / FR-003）。
 * - 假设滑杆（年龄/回报率/通胀/支出/提取率）→ 三点区间（悲观/中性/乐观 corpus）+ 可持续性。
 * - 显著标注「区间仅供方向参考、非确定预测」（SC-003）；depletionAge 标注。
 * - 免责强渲染（I9）；AI 解读仅文本旁注（NC5 零编造）。
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
  Typography,
  Alert,
  CircularProgress,
  Slider,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useComputeRetirement, useInterpretRetirement } from '../hooks/use-finance';
import type { RetirementDTO } from '../api';

const VERDICT_LABEL: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
  sustainable: { label: '可持续', color: 'success' },
  marginal: { label: '勉强维持', color: 'warning' },
  insufficient: { label: '不足', color: 'error' },
};

function yuan(v: string): string {
  return `¥${Number(v).toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`;
}

export function RetirementSimulator({ familyId }: { familyId?: string } = {}) {
  const compute = useComputeRetirement();
  const interpret = useInterpretRetirement();
  const [text, setText] = useState('');

  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [monthlyContribution, setMonthlyContribution] = useState('5000');
  const [realReturnRatePct, setRealReturnRatePct] = useState(4);
  const [inflationPct, setInflationPct] = useState(2.5);
  const [postRetireSpend, setPostRetireSpend] = useState('8000');
  const [withdrawalRatePct, setWithdrawalRatePct] = useState(4);

  const result = compute.data?.retirement;

  const submit = async () => {
    await compute.mutateAsync({
      familyId,
      assumptions: {
        currentAge,
        retirementAge,
        monthlyContribution: Number(monthlyContribution).toFixed(2),
        realReturnRatePct,
        inflationPct,
        postRetirementMonthlySpend: Number(postRetireSpend).toFixed(2),
        withdrawalRatePct,
      },
    });
  };

  const runInterpret = async () => {
    if (!result) return;
    setText('');
    const r = await interpret.mutateAsync(result.id);
    setText(r.text);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>退休模拟（三点区间）</Typography>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            <SliderField label={`当前年龄：${currentAge}`} value={currentAge} min={18} max={70} step={1} onChange={setCurrentAge} />
            <SliderField label={`退休年龄：${retirementAge}`} value={retirementAge} min={45} max={75} step={1} onChange={setRetirementAge} />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            <TextField size="small" type="number" label="月投入（¥）" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} />
            <TextField size="small" type="number" label="退休后月支出（¥）" value={postRetireSpend} onChange={(e) => setPostRetireSpend(e.target.value)} />
          </Box>
          <SliderField label={`实际回报率：${realReturnRatePct}%`} value={realReturnRatePct} min={0} max={10} step={0.5} onChange={setRealReturnRatePct} />
          <SliderField label={`通胀率：${inflationPct}%`} value={inflationPct} min={0} max={8} step={0.5} onChange={setInflationPct} />
          <SliderField label={`安全提取率：${withdrawalRatePct}%`} value={withdrawalRatePct} min={2} max={6} step={0.5} onChange={setWithdrawalRatePct} />
          <Button variant="contained" size="small" disabled={compute.isPending} onClick={submit}
            startIcon={compute.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}>
            模拟退休
          </Button>
          {compute.isError && <Alert severity="error">{(compute.error as Error)?.message ?? '模拟失败'}</Alert>}
        </Stack>

        {result && (
          <RetirementResult result={result} text={text} onInterpret={runInterpret} interpretPending={interpret.isPending} />
        )}
      </CardContent>
    </Card>
  );
}

function RetirementResult({
  result,
  text,
  onInterpret,
  interpretPending,
}: {
  result: RetirementDTO;
  text: string;
  onInterpret: () => void;
  interpretPending: boolean;
}) {
  const v = VERDICT_LABEL[result.sustainableVerdict] ?? { label: result.sustainableVerdict, color: 'warning' as const };
  const data = [
    { name: '悲观', corpus: Number(result.resultPessimistic.retirementCorpus), fill: '#d32f2f' },
    { name: '中性', corpus: Number(result.resultBaseline.retirementCorpus), fill: '#1976d2' },
    { name: '乐观', corpus: Number(result.resultOptimistic.retirementCorpus), fill: '#2e7d32' },
  ];
  const base = result.resultBaseline;

  return (
    <Stack spacing={1.5} sx={{ mt: 2 }}>
      <Alert severity="warning">
        长期模拟含强假设，以下区间仅供方向参考，<strong>非确定预测</strong>（SC-003）。
      </Alert>
      {result.status === 'degraded' && (
        <Alert severity="info">
          数据不足（{result.missing.join('、')}），结果按已填假设计算，不编造（SC-005）。
        </Alert>
      )}
      <Box sx={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} width={64} tickFormatter={(val) => yuan(String(val))} />
            <Tooltip formatter={(value) => yuan(String(value))} />
            <Bar dataKey="corpus" radius={[4, 4, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ p: 1.25, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Stack direction="row" justifyContent="space-between" flexWrap="wrap" useFlexGap spacing={1}>
          <Typography variant="body2">
            可持续性：<strong style={{ color: v.color === 'success' ? '#2e7d32' : v.color === 'error' ? '#d32f2f' : '#ed6c02' }}>{v.label}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            月可支撑 {yuan(base.monthlySustainable)} · 资产耗尽年龄 {base.depletionAge ?? '可持续'}
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          退休时点资产：悲观 {yuan(result.resultPessimistic.retirementCorpus)} · 中性 {yuan(result.resultBaseline.retirementCorpus)} · 乐观 {yuan(result.resultOptimistic.retirementCorpus)}
        </Typography>
      </Box>
      <Box>
        <Button size="small" variant="outlined" disabled={interpretPending} onClick={onInterpret}
          startIcon={interpretPending ? <CircularProgress size={16} color="inherit" /> : undefined}>
          AI 解读退休
        </Button>
        {text && <Alert severity="info" sx={{ mt: 1 }}>{text}</Alert>}
      </Box>
      {result.disclaimers.map((d, i) => (
        <Typography key={i} variant="caption" color="text.secondary">· {d}</Typography>
      ))}
    </Stack>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Slider value={value} onChange={(_, v) => onChange(v as number)} min={min} max={max} step={step} size="small" />
    </Box>
  );
}
