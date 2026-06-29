'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (password.length < 8) {
      setError('密码至少 8 位');
      return;
    }
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, username: name } },
      });
      if (signUpError) throw signUpError;

      // 若项目开启了邮箱确认，session 会是 null
      if (data.session) {
        router.replace('/dashboard');
        router.refresh();
      } else {
        setInfo('注册成功，请前往邮箱完成验证后再登录。');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent>
          <Stack spacing={2} component="form" onSubmit={onSubmit}>
            <Typography variant="h5" component="h1">
              注册
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}
            {info && <Alert severity="success">{info}</Alert>}

            <TextField
              label="昵称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <TextField
              label="邮箱"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              fullWidth
            />
            <TextField
              label="密码（至少 8 位）"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? '注册中…' : '注册'}
            </Button>

            <Typography variant="body2" align="center">
              已有账号？{' '}
              <Link href="/signin">登录</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
