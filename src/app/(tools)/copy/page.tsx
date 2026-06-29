'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  Chip,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  TextFields as TextIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import type { CopyType, CopyTone, CopySuggestion, CopyGenerationRequest } from '@/types/ai';
import { COPY_TYPES, COPY_TONES } from '@/types/ai';

export default function CopyPage() {
  const [type, setType] = useState<CopyType>('button');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState<CopyTone>('friendly');
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CopySuggestion[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!context.trim()) {
      setError('Please enter context for the copy');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, context, tone, count } as CopyGenerationRequest),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate copy');
      }

      setSuggestions(data.data.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [type, context, tone, count]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const exampleContexts: Record<CopyType, string[]> = {
    button: [
      'Submit a contact form',
      'Create a new project',
      'Delete an item permanently',
      'Start free trial',
    ],
    heading: [
      'Pricing section on landing page',
      'Features overview section',
      'Success page after purchase',
    ],
    description: [
      'A project management tool for teams',
      'Premium subscription benefits',
      'Security settings explanation',
    ],
    error: [
      'User enters wrong password',
      'Payment failed',
      'Network connection lost',
    ],
    success: [
      'User successfully registered',
      'Order placed successfully',
      'File uploaded successfully',
    ],
    placeholder: [
      'Email input field',
      'Search bar',
      'Name input field',
    ],
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            AI Copy Assistant
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate UI copy and text content for your designs
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Input Section */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Configure Your Copy
                </Typography>

                {/* Copy Type */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Copy Type</InputLabel>
                  <Select<CopyType>
                    value={type}
                    label="Copy Type"
                    onChange={(e) => setType(e.target.value)}
                  >
                    {Object.entries(COPY_TYPES).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        <Box>
                          <Typography variant="body2">{value.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {value.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Context Input */}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Context"
                  placeholder="e.g., A button to submit a contact form..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  sx={{ mb: 2 }}
                />

                {/* Quick Context Suggestions */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Quick examples:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {exampleContexts[type].map((ctx) => (
                      <Chip
                        key={ctx}
                        label={ctx}
                        size="small"
                        onClick={() => setContext(ctx)}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Tone */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Tone</InputLabel>
                  <Select<CopyTone>
                    value={tone}
                    label="Tone"
                    onChange={(e) => setTone(e.target.value)}
                  >
                    {Object.entries(COPY_TONES).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Count */}
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>
                    Number of suggestions: {count}
                  </Typography>
                  <Slider
                    value={count}
                    onChange={(_, value) => setCount(value as number)}
                    min={1}
                    max={5}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>

                {/* Generate Button */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleGenerate}
                  disabled={loading || !context.trim()}
                  startIcon={loading ? <CircularProgress size={20} /> : <EditIcon />}
                >
                  {loading ? 'Generating...' : 'Generate Copy'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Results Section */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Suggestions</Typography>
                  {suggestions.length > 0 && (
                    <Button
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={handleGenerate}
                    >
                      Regenerate
                    </Button>
                  )}
                </Box>

                {suggestions.length > 0 ? (
                  <List sx={{ pt: 0 }}>
                    {suggestions.map((suggestion, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          '&:hover': {
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontFamily: type === 'heading' ? 'h5.fontFamily' : 'body1.fontFamily',
                                fontWeight: type === 'heading' ? 'bold' : 'normal',
                                fontSize: type === 'button' ? '0.875rem' : type === 'heading' ? '1.5rem' : '1rem',
                              }}
                            >
                              {suggestion.text}
                            </Typography>
                            <Chip
                              size="small"
                              label={`${suggestion.characterCount} characters`}
                              sx={{ mt: 1 }}
                            />
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Copy">
                              <IconButton
                                size="small"
                                onClick={() => handleCopy(suggestion.text)}
                                color={copied === suggestion.text ? 'success' : 'default'}
                              >
                                {copied === suggestion.text ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                ) : (
                  <Box
                    sx={{
                      height: 300,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    <TextIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                    <Typography>Select a type and enter context to generate copy</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Error Alert */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>

        {/* Copy Success */}
        <Snackbar open={!!copied} autoHideDuration={2000}>
          <Alert severity="success" icon={<CopyIcon />}>
            Copied to clipboard
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
