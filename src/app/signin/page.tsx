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

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
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
              登录
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

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
              label="密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? '登录中…' : '登录'}
            </Button>

            <Typography variant="body2" align="center">
              还没有账号？{' '}
              <Link href="/signup">注册</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
