'use client';

import * as React from 'react';
import { alpha, useColorScheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Link from 'next/link';

interface ComponentShowcaseCardProps {
  imgLoading?: 'eager' | 'lazy';
  link: string;
  md1?: boolean;
  md2?: boolean;
  md3?: boolean;
  name: string;
  noGuidelines?: boolean;
  srcDark: string;
  srcLight: string;
}

export default function ComponentShowcaseCard(props: ComponentShowcaseCardProps) {
  const { link, srcLight, srcDark, name, md1, md2, md3, noGuidelines, imgLoading = 'lazy' } = props;
  const { mode } = useColorScheme();

  // Use light or dark image based on theme
  const imgSrc = mode === 'dark' ? srcDark : srcLight;

  return (
    <Card
      component={Link}
      href={link}
      sx={(theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 1,
        borderColor: 'divider',
        textDecoration: 'none',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      })}
    >
      <CardMedia
        component="img"
        alt=""
        loading={imgLoading}
        image={imgSrc}
        sx={(theme) => ({
          aspectRatio: '16 / 9',
          background: `${(theme.vars || theme).palette.grey[50]}`,
          borderBottom: '1px solid',
          borderColor: 'divider',
          ...(theme.palette.mode === 'dark' && {
            background: `${alpha(theme.palette.grey[900], 0.4)}`,
          }),
        })}
      />
      <Stack direction="row" sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>
        <Typography component="h2" variant="body2" sx={{ fontWeight: 600 }}>
          {name}
        </Typography>
        <Stack direction="row" spacing={0.5} useFlexGap>
          {md1 && <Chip label="MD1" size="small" variant="outlined" color="primary" />}
          {md2 && <Chip label="MD2" size="small" variant="outlined" color="primary" />}
          {md3 && <Chip label="MD3" size="small" variant="outlined" color="success" />}
          {noGuidelines && (
            <Chip label="No guidelines" size="small" variant="outlined" />
          )}
        </Stack>
      </Stack>
    </Card>
  );
}
