/**
 * UnsplashTab - Search and browse Unsplash photos for the poster-card editor
 */

"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  searchPhotos,
  getPhotoUrl,
  type UnsplashPhoto,
  type Orientation,
} from '../services/unsplash';
import defaultPhotos from '../services/data.json';

interface UnsplashTabProps {
  onAdd: (src: string) => void;
}

export function UnsplashTab({ onAdd }: UnsplashTabProps) {
  const [query, setQuery] = useState('');
  const [orientation, setOrientation] = useState<Orientation | ''>('');
  const [photos, setPhotos] = useState<UnsplashPhoto[]>(defaultPhotos as UnsplashPhoto[]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = useCallback(
    async (q: string, p: number, orient?: Orientation | '') => {
      if (!q.trim()) {
        setPhotos([]);
        setHasMore(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await searchPhotos(
          q,
          p,
          orient || undefined,
        );
        if (p === 1) {
          setPhotos(result.photos);
        } else {
          setPhotos((prev) => [...prev, ...result.photos]);
        }
        setHasMore(p < result.totalPages);
      } catch {
        setError('Failed to fetch photos. Check your API key.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setPage(1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(value, 1, orientation);
    }, 400);
  };

  const handleOrientationChange = (_: React.MouseEvent, value: string | null) => {
    const newOrientation = (value ?? '') as Orientation | '';
    setOrientation(newOrientation);
    setPage(1);
    if (query.trim()) {
      doSearch(query, 1, newOrientation);
    }
  };

  const handleClear = () => {
    setQuery('');
    setError(null);
    setPage(1);
    setHasMore(false);
    setPhotos(defaultPhotos as UnsplashPhoto[]);
    inputRef.current?.focus();
  };

  const handleAddPhoto = (photo: UnsplashPhoto) => {
    const src = getPhotoUrl(photo, 800, 600);
    onAdd(src);
  };

  // Infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          doSearch(query, nextPage, orientation);
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page, query, orientation, doSearch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Search input */}
      <TextField
        inputRef={inputRef}
        size="small"
        placeholder="Search free photos..."
        value={query}
        onChange={(e) => handleSearchChange(e.target.value)}
        fullWidth
        inputProps={{ sx: { fontSize: 12 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16 }} />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClear} sx={{ p: 0.25 }}>
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />

      {/* Orientation filter */}
      <ToggleButtonGroup
        size="small"
        exclusive
        value={orientation}
        onChange={handleOrientationChange}
        sx={{ '& .MuiToggleButton-root': { fontSize: 10, px: 1.5, py: 0.25 } }}
      >
        <ToggleButton value="">All</ToggleButton>
        <ToggleButton value="landscape">Landscape</ToggleButton>
        <ToggleButton value="portrait">Portrait</ToggleButton>
        <ToggleButton value="squarish">Square</ToggleButton>
      </ToggleButtonGroup>

      {/* Results */}
      {error && (
        <Typography variant="caption" color="error.main">
          {error}
        </Typography>
      )}

      {!loading && photos.length === 0 && (
        <Typography variant="caption" color="text.secondary">
          No photos found. Try a different search.
        </Typography>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75 }}>
        {photos.map((photo) => (
          <Box
            key={photo.id}
            onClick={() => handleAddPhoto(photo)}
            onMouseEnter={() => setHoveredId(photo.id)}
            onMouseLeave={() => setHoveredId(null)}
            sx={{
              position: 'relative',
              borderRadius: 1,
              overflow: 'hidden',
              cursor: 'pointer',
              aspectRatio: '1',
              bgcolor: photo.color,
              '&:hover': { outline: '2px solid', outlineColor: 'primary.main' },
            }}
          >
            <img
              src={photo.urls.thumb}
              alt={photo.alt_description ?? photo.description ?? ''}
              loading="lazy"
              crossOrigin="anonymous"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {hoveredId === photo.id && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  px: 0.5,
                  py: 0.25,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: '#fff', fontSize: 8, lineHeight: 1.2 }}
                >
                  {photo.user.name}
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Loading indicator */}
      {loading && (
        <Stack alignItems="center" py={2}>
          <CircularProgress size={24} />
        </Stack>
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && !loading && <div ref={sentinelRef} style={{ height: 1 }} />}

      {/* Attribution notice */}
      {photos.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 0.5 }}>
          Photos from Unsplash
        </Typography>
      )}
    </Box>
  );
}
