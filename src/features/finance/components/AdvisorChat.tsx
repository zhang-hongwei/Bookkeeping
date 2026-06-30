/**
 * 顾问对话面板（Phase 6，US2 / FR-003 / FR-007）。
 * - 会话列表 + 消息线程 + 提问输入。
 * - assistant 消息展示 citedFindings 依据（I1）；降级标注 degraded（SC-005）。
 * - 携带高风险提议时显示 proposalId（→ 审批中心，FR-004）。
 */
'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  useAdvisorSessions,
  useCreateAdvisorSession,
  useAdvisorMessages,
  useSendAdvisorMessage,
} from '../hooks/use-finance';

export function AdvisorChat() {
  const { data: sessionsData } = useAdvisorSessions();
  const createSession = useCreateAdvisorSession();
  const sessions = sessionsData?.sessions ?? [];

  const [activeId, setActiveId] = useState<string | null>(sessions[0]?.id ?? null);
  const activeSessionId = activeId ?? sessions[0]?.id ?? null;
  const { data: messagesEnvelope } = useAdvisorMessages(activeSessionId);
  const sendMessage = useSendAdvisorMessage();

  const [input, setInput] = useState('');
  const messages = messagesEnvelope?.data.messages ?? [];

  const handleSend = () => {
    if (!activeSessionId || !input.trim()) return;
    sendMessage.mutate({ sessionId: activeSessionId, content: input.trim() });
    setInput('');
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle2">AI 财务顾问</Typography>
          <Button
            size="small"
            variant="contained"
            disabled={createSession.isPending}
            onClick={() => createSession.mutate({})}
          >
            {createSession.isPending ? <CircularProgress size={16} /> : '新会话'}
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ minHeight: 320 }}>
          {/* 会话列表 */}
          <Stack spacing={0.5} sx={{ minWidth: 160 }}>
            {sessions.length === 0 && (
              <Typography variant="body2" color="text.secondary">暂无会话</Typography>
            )}
            {sessions.map((s) => (
              <Button
                key={s.id}
                size="small"
                variant={s.id === activeSessionId ? 'outlined' : 'text'}
                onClick={() => setActiveId(s.id)}
                sx={{ justifyContent: 'flex-start' }}
              >
                {s.title ?? s.createdAt.slice(0, 10)}
              </Button>
            ))}
          </Stack>

          {/* 消息线程 */}
          <Stack spacing={1} sx={{ flex: 1 }}>
            {!activeSessionId && (
              <Typography variant="body2" color="text.secondary">
                点击「新会话」开始与顾问对话。
              </Typography>
            )}
            {messages.map((m) => (
              <Box
                key={m.id}
                sx={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  p: 1,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: m.role === 'user' ? 'action.selected' : 'background.paper',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="caption" color="text.secondary">
                    {m.role === 'user' ? '我' : '顾问'}
                  </Typography>
                  {m.degraded && (
                    <Chip size="small" label="规则模板（LLM 不可用）" color="warning" variant="outlined" />
                  )}
                  {m.proposalId && (
                    <Chip size="small" label="含高风险提议" color="error" variant="outlined" />
                  )}
                </Stack>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                  {m.content}
                </Typography>
                {m.proposalId && (
                  <Typography variant="caption" color="text.secondary">
                    请到「审批中心」处理提议 {m.proposalId.slice(0, 8)}…
                  </Typography>
                )}
                {m.role === 'assistant' && m.citedFindings.length > 0 && (
                  <Accordion elevation={0} sx={{ mt: 0.5 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="caption" color="text.secondary">
                        依据（{m.citedFindings.length}）
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={0.5}>
                        {m.citedFindings.map((r, i) => (
                          <Typography key={i} variant="caption">
                            · {r.period} · {r.metric}：{r.value ?? 'N/A'}（{r.verdict}）
                          </Typography>
                        ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                )}
              </Box>
            ))}
          </Stack>
        </Stack>

        {sendMessage.isError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {(sendMessage.error as Error)?.message ?? '发送失败'}
          </Alert>
        )}

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="向顾问提问（如：储蓄率怎么提？）"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            variant="contained"
            disabled={sendMessage.isPending || !input.trim() || !activeSessionId}
            onClick={handleSend}
          >
            {sendMessage.isPending ? <CircularProgress size={16} /> : '发送'}
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {messagesEnvelope?.disclaimer}
        </Typography>
      </CardContent>
    </Card>
  );
}
