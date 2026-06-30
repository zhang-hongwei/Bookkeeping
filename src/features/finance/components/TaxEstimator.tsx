/**
 * 个税估算面板（Phase 7，US2 / FR-002）。
 * - 收入 / 五险一金 / 专项附加扣除 / 年终奖 → 年终奖单独 vs 并入综合所得对比。
 * - 较优方向应纳税额 + 实际税率 + 规则化提示（非税务建议）。
 * - 「非税务建议；需以当期法规为准」免责强渲染（I6/SC-004）。
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
  Divider,
} from '@mui/material';
import { useComputeTax, useInterpretTax } from '../hooks/use-finance';
import type { TaxEstimateDTO } from '../api';

/** 常用专项附加扣除（键名与后端一致；金额由用户填，留空不计）。 */
const DEDUCTION_FIELDS: { key: string; label: string }[] = [
  { key: 'children_education', label: '子女教育' },
  { key: 'supporting_elderly', label: '赡养老人' },
  { key: 'housing_loan', label: '住房贷款利息' },
  { key: 'rent', label: '住房租金' },
  { key: 'continuing_education', label: '继续教育' },
  { key: 'infant_care', label: '婴幼儿照护' },
];

function yuan(v: string): string {
  return `¥${Number(v).toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`;
}

export function TaxEstimator({ familyId }: { familyId?: string } = {}) {
  const compute = useComputeTax();
  const interpret = useInterpretTax();
  const [text, setText] = useState('');

  const [annualIncome, setAnnualIncome] = useState('');
  const [insuranceAndFund, setInsuranceAndFund] = useState('');
  const [annualBonus, setAnnualBonus] = useState('');
  const [deductions, setDeductions] = useState<Record<string, string>>({});

  const result = compute.data?.taxEstimate;

  const submit = async () => {
    const specialDeductions: Record<string, string> = {};
    for (const d of DEDUCTION_FIELDS) {
      const v = (deductions[d.key] ?? '').trim();
      if (v && Number(v) > 0) specialDeductions[d.key] = Number(v).toFixed(2);
    }
    const bonusVal = annualBonus.trim();
    await compute.mutateAsync({
      taxYear: new Date().getFullYear(),
      familyId,
      inputs: {
        annualIncome: Number(annualIncome).toFixed(2),
        insuranceAndFund: Number(insuranceAndFund || '0').toFixed(2),
        specialDeductions,
        annualBonus: bonusVal && Number(bonusVal) > 0 ? Number(bonusVal).toFixed(2) : null,
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
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          个税估算（中国，按规则版本计算）
        </Typography>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            <NumField label="年综合所得（¥）" value={annualIncome} onChange={setAnnualIncome} placeholder="360000.00" />
            <NumField label="五险一金（年，¥）" value={insuranceAndFund} onChange={setInsuranceAndFund} placeholder="36000.00" />
          </Box>
          <NumField label="年终奖（可选，¥）" value={annualBonus} onChange={setAnnualBonus} placeholder="60000.00" />
          <Box>
            <Typography variant="caption" color="text.secondary">专项附加扣除（年额，可留空）</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1, mt: 0.5 }}>
              {DEDUCTION_FIELDS.map((d) => (
                <NumField
                  key={d.key}
                  label={d.label}
                  value={deductions[d.key] ?? ''}
                  onChange={(v) => setDeductions((p) => ({ ...p, [d.key]: v }))}
                  placeholder="0.00"
                />
              ))}
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            disabled={compute.isPending || !annualIncome}
            onClick={submit}
            startIcon={compute.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            估算个税
          </Button>
          {compute.isError && (
            <Alert severity="error">{(compute.error as Error)?.message ?? '估算失败'}</Alert>
          )}
        </Stack>

        {result && <TaxResult result={result} text={text} onInterpret={runInterpret} interpretPending={interpret.isPending} />}
      </CardContent>
    </Card>
  );
}

function TaxResult({
  result,
  text,
  onInterpret,
  interpretPending,
}: {
  result: TaxEstimateDTO;
  text: string;
  onInterpret: () => void;
  interpretPending: boolean;
}) {
  const mc = result.methodComparison;
  return (
    <Stack spacing={1.5} sx={{ mt: 2 }}>
      <Divider />
      {result.status === 'degraded' && (
        <Alert severity="info">
          数据不足（{result.missing.join('、') || '收入缺失'}），结果按已填项估算，不编造。
        </Alert>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
        <Stat label="较优方向应纳税额" value={yuan(result.totalTaxAmount)} highlight />
        <Stat
          label="实际税率"
          value={result.effectiveRate ? `${(Number(result.effectiveRate) * 100).toFixed(2)}%` : 'N/A'}
        />
      </Box>
      <Box sx={{ p: 1.25, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">年终奖计税方式对比</Typography>
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
          <Typography variant="body2">单独计税：{yuan(mc.separate.taxAmount)}</Typography>
          <Typography variant="body2">并入综合：{yuan(mc.merged.taxAmount)}</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          差额 {yuan(mc.diff)} · 较优：
          <strong>{mc.better === 'separate' ? '单独计税' : '并入综合所得'}</strong>（规则化对比，非税务建议）
        </Typography>
      </Box>
      {result.hints.length > 0 && (
        <Stack spacing={0.5}>
          {result.hints.map((h, i) => (
            <Typography key={i} variant="body2">· {h.text}</Typography>
          ))}
        </Stack>
      )}
      <Box>
        <Button size="small" variant="outlined" disabled={interpretPending} onClick={onInterpret}
          startIcon={interpretPending ? <CircularProgress size={16} color="inherit" /> : undefined}>
          AI 解读计税差异
        </Button>
        {text && <Alert severity="info" sx={{ mt: 1 }}>{text}</Alert>}
      </Box>
      {result.disclaimers.map((d, i) => (
        <Typography key={i} variant="caption" color="text.secondary">· {d}</Typography>
      ))}
    </Stack>
  );
}

function NumField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <TextField
      size="small"
      type="number"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      fullWidth
    />
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Box sx={{ p: 1.25, border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant={highlight ? 'h6' : 'body1'} fontWeight={highlight ? 700 : 400}>
        {value}
      </Typography>
    </Box>
  );
}
