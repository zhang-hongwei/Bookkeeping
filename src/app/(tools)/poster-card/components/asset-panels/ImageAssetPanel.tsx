'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  CircularProgress,
  Button,
  keyframes,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as ReplaceIcon,
} from '@mui/icons-material';
import { AssetSearchBar } from './AssetSearchBar';
import { useImageAssets, useAssetRuntime, useAssetPanelMode } from '../../engine/assets/selectors';
import { useAssetStore } from '../../engine/assets/asset-store';
import { useEditorStore } from '../../engine/store';
import { createMatrix } from '../../engine/matrix-utils';
import { UpdateNodeCommand } from '../../engine/commands/commands/update-node';
import { getAssetPipeline } from '../../engine/assets/pipeline';
import { useAssetDrag } from '../../engine/assets/use-asset-drag';
import { UnsplashTab } from '../UnsplashTab';
import type { ImageAsset } from '../../engine/assets/types';

// Shimmer animation for image loading skeleton
const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
`;

/**
 * LazyImage — shimmer skeleton + fade-in on load.
 * Wraps <img> with a loading placeholder that animates away once the image is ready.
 */
function LazyImage({
  src,
  alt,
  aspectRatio,
  crossOrigin,
}: {
  src: string;
  alt: string;
  aspectRatio: number;
  crossOrigin?: "anonymous" | "use-credentials" | "";
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Shimmer skeleton */}
      {!loaded && !error && (
        <Box
          sx={{
            width: '100%',
            aspectRatio: `${aspectRatio}`,
            backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 75%)',
            backgroundSize: '400px 100%',
            animation: `${shimmer} 1.5s ease-in-out infinite`,
            borderRadius: 1,
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        crossOrigin={crossOrigin}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          width: '100%',
          aspectRatio: `${aspectRatio}`,
          objectFit: 'cover',
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
    </Box>
  );
}

type ImageTab = 'stock' | 'unsplash' | 'upload' | 'library';

const IMAGE_TABS: { id: ImageTab; label: string }[] = [
  { id: 'stock', label: 'Stock' },
  { id: 'unsplash', label: 'Unsplash' },
  { id: 'upload', label: 'Upload' },
  { id: 'library', label: 'My Images' },
];

// Preset stock images from picsum.photos, organized by category
const STOCK_CATEGORIES = ['nature', 'abstract', 'texture', 'architecture', 'people', 'food'] as const;

const STOCK_IMAGES: Record<string, { id: number; label: string; w: number; h: number }[]> = {
  nature: [
    { id: 10, label: 'Forest', w: 800, h: 1200 },
    { id: 15, label: 'River', w: 800, h: 600 },
    { id: 29, label: 'Mountain', w: 600, h: 800 },
    { id: 37, label: 'Ocean', w: 800, h: 500 },
    { id: 54, label: 'Sunset', w: 800, h: 800 },
    { id: 59, label: 'Field', w: 800, h: 1000 },
    { id: 73, label: 'Leaves', w: 600, h: 900 },
    { id: 110, label: 'Meadow', w: 800, h: 600 },
    { id: 129, label: 'Lake', w: 800, h: 1100 },
    { id: 137, label: 'Cliff', w: 600, h: 800 },
    { id: 155, label: 'Sky', w: 800, h: 500 },
    { id: 165, label: 'Beach', w: 800, h: 700 },
  ],
  abstract: [
    { id: 49, label: 'Gradient', w: 800, h: 800 },
    { id: 180, label: 'Blur', w: 600, h: 900 },
    { id: 225, label: 'Lines', w: 800, h: 600 },
    { id: 252, label: 'Smoke', w: 800, h: 1100 },
    { id: 312, label: 'Pattern', w: 800, h: 800 },
    { id: 325, label: 'Curve', w: 600, h: 800 },
    { id: 358, label: 'Wave', w: 800, h: 500 },
    { id: 393, label: 'Fractal', w: 800, h: 800 },
    { id: 425, label: 'Mesh', w: 600, h: 1000 },
  ],
  texture: [
    { id: 42, label: 'Wood', w: 800, h: 600 },
    { id: 64, label: 'Stone', w: 800, h: 800 },
    { id: 91, label: 'Brick', w: 800, h: 600 },
    { id: 119, label: 'Sand', w: 800, h: 900 },
    { id: 167, label: 'Marble', w: 600, h: 800 },
    { id: 203, label: 'Paper', w: 800, h: 600 },
    { id: 244, label: 'Fabric', w: 800, h: 1000 },
    { id: 305, label: 'Metal', w: 800, h: 800 },
    { id: 399, label: 'Concrete', w: 800, h: 600 },
  ],
  architecture: [
    { id: 20, label: 'Building', w: 600, h: 1000 },
    { id: 47, label: 'Bridge', w: 800, h: 500 },
    { id: 82, label: 'Stairs', w: 800, h: 1100 },
    { id: 106, label: 'Tower', w: 600, h: 900 },
    { id: 160, label: 'Glass', w: 800, h: 800 },
    { id: 219, label: 'Door', w: 800, h: 1200 },
    { id: 274, label: 'Arch', w: 800, h: 600 },
    { id: 335, label: 'Roof', w: 800, h: 700 },
    { id: 411, label: 'Window', w: 600, h: 800 },
  ],
  people: [
    { id: 64, label: 'Portrait', w: 600, h: 900 },
    { id: 177, label: 'Group', w: 800, h: 600 },
    { id: 203, label: 'Silhouette', w: 800, h: 1100 },
    { id: 219, label: 'Hands', w: 800, h: 800 },
    { id: 256, label: 'Dance', w: 600, h: 1000 },
    { id: 312, label: 'Smile', w: 800, h: 600 },
    { id: 387, label: 'Sport', w: 800, h: 700 },
    { id: 452, label: 'Walk', w: 600, h: 900 },
  ],
  food: [
    { id: 292, label: 'Fruit', w: 800, h: 800 },
    { id: 312, label: 'Coffee', w: 600, h: 800 },
    { id: 326, label: 'Bread', w: 800, h: 600 },
    { id: 429, label: 'Salad', w: 800, h: 800 },
    { id: 431, label: 'Sushi', w: 800, h: 1000 },
    { id: 488, label: 'Cake', w: 600, h: 900 },
    { id: 674, label: 'Wine', w: 800, h: 1200 },
    { id: 848, label: 'Spices', w: 800, h: 600 },
  ],
};

/** Masonry container — CSS columns with fixed-width items */
function MasonryGrid({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        columns: '2',
        columnGap: 1,
        '& > *': {
          breakInside: 'avoid',
          display: 'inline-block',
          width: '100%',
          mb: 1,
        },
      }}
    >
      {children}
    </Box>
  );
}

export function ImageAssetPanel() {
  const [activeTab, setActiveTab] = useState<ImageTab>('stock');

  return (
    <Box>
      {/* Sub-tabs */}
      <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
        {IMAGE_TABS.map((tab) => (
          <Chip
            key={tab.id}
            label={tab.label}
            size="small"
            variant={activeTab === tab.id ? 'filled' : 'outlined'}
            color={activeTab === tab.id ? 'primary' : 'default'}
            onClick={() => setActiveTab(tab.id)}
            sx={{ fontSize: 10, height: 22 }}
          />
        ))}
      </Stack>

      {activeTab === 'stock' && <StockTab />}
      {activeTab === 'unsplash' && <UnsplashSubTab />}
      {activeTab === 'upload' && <UploadSubTab />}
      {activeTab === 'library' && <LibraryTab />}
    </Box>
  );
}

// ═══════════════════════════════════════
// Stock images (picsum.photos) — masonry
// ═══════════════════════════════════════

function StockTab() {
  const addNode = useEditorStore((s) => s.addNode);
  const rootNodeId = useEditorStore((s) => s.rootNodeId);
  const [category, setCategory] = useState<string>('nature');

  const handleAdd = useCallback((src: string) => {
    addNode({
      type: 'image', parentId: rootNodeId!, childrenIds: [],
      localMatrix: createMatrix({ x: 400, y: 400 }),
      width: 400, height: 300, opacity: 100, visible: true, locked: false,
      src, objectFit: 'cover', borderRadius: 0,
    });
  }, [addNode, rootNodeId]);

  const images = STOCK_IMAGES[category] ?? [];

  return (
    <Box>
      <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
        {STOCK_CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={cat.charAt(0).toUpperCase() + cat.slice(1)}
            size="small"
            variant={category === cat ? 'filled' : 'outlined'}
            color={category === cat ? 'primary' : 'default'}
            onClick={() => setCategory(cat)}
            sx={{ fontSize: 10, height: 22 }}
          />
        ))}
      </Stack>

      <MasonryGrid>
        {images.map((img) => {
          const thumb = `https://picsum.photos/id/${img.id}/240/${Math.round(240 * img.h / img.w)}`;
          const full = `https://picsum.photos/id/${img.id}/${img.w}/${img.h}`;
          const aspectRatio = img.w / img.h;
          return (
            <Box
              key={img.id}
              onClick={() => handleAdd(full)}
              sx={{
                position: 'relative',
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                bgcolor: 'action.hover',
                '&:hover': { opacity: 0.85, outline: '2px solid', outlineColor: 'primary.main' },
              }}
            >
              <LazyImage
                src={thumb}
                alt={img.label}
                aspectRatio={aspectRatio}
                crossOrigin="anonymous"
              />
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  bgcolor: 'rgba(0,0,0,0.5)', color: '#fff',
                  textAlign: 'center', fontSize: 9, py: 0.25, lineHeight: 1.2,
                }}
              >
                {img.label}
              </Typography>
            </Box>
          );
        })}
      </MasonryGrid>
    </Box>
  );
}

// ═══════════════════════════════════════
// Unsplash search
// ═══════════════════════════════════════

function UnsplashSubTab() {
  const addNode = useEditorStore((s) => s.addNode);
  const rootNodeId = useEditorStore((s) => s.rootNodeId);

  const handleAdd = useCallback((src: string) => {
    addNode({
      type: 'image', parentId: rootNodeId!, childrenIds: [],
      localMatrix: createMatrix({ x: 400, y: 400 }),
      width: 400, height: 300, opacity: 100, visible: true, locked: false,
      src, objectFit: 'cover', borderRadius: 0,
    });
  }, [addNode, rootNodeId]);

  return <UnsplashTab onAdd={handleAdd} />;
}

// ═══════════════════════════════════════
// Upload
// ═══════════════════════════════════════

function UploadSubTab() {
  const addNode = useEditorStore((s) => s.addNode);
  const rootNodeId = useEditorStore((s) => s.rootNodeId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Try asset pipeline first, fall back to direct FileReader
    const store = useAssetStore.getState();
    const pipeline = getAssetPipeline(store);
    if (pipeline) {
      pipeline.uploadImage(file).then((asset) => {
        store.addAsset(asset);
      }).catch(() => {
        // Fallback: add directly to canvas
        const reader = new FileReader();
        reader.onload = () => {
          addNode({
            type: 'image', parentId: rootNodeId!, childrenIds: [],
            localMatrix: createMatrix({ x: 400, y: 400 }),
            width: 300, height: 200, opacity: 100, visible: true, locked: false,
            src: reader.result as string, objectFit: 'cover', borderRadius: 0,
          });
        };
        reader.readAsDataURL(file);
      });
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        addNode({
          type: 'image', parentId: rootNodeId!, childrenIds: [],
          localMatrix: createMatrix({ x: 400, y: 400 }),
          width: 300, height: 200, opacity: 100, visible: true, locked: false,
          src: reader.result as string, objectFit: 'cover', borderRadius: 0,
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  }, [addNode, rootNodeId]);

  return (
    <Box>
      <Box
        onClick={() => fileInputRef.current?.click()}
        sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 1, py: 6, borderRadius: 2, border: '2px dashed', borderColor: 'divider',
          cursor: 'pointer', bgcolor: 'action.hover',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'action.selected' },
        }}
      >
        <UploadIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          Click to upload image
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
          PNG, JPG, SVG, GIF
        </Typography>
      </Box>
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleUpload} />
    </Box>
  );
}

// ═══════════════════════════════════════
// My Images library (asset store) — masonry
// ═══════════════════════════════════════

function LibraryTab() {
  const images = useImageAssets();
  const addNode = useEditorStore((s) => s.addNode);
  const rootNodeId = useEditorStore((s) => s.rootNodeId);
  const panelMode = useAssetPanelMode();
  const store = useAssetStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  const filteredImages = images.filter((img) => {
    if (search && !img.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const pipeline = getAssetPipeline(store);
      const asset = await pipeline.uploadImage(file);
      store.addAsset(asset);
    } catch (err) {
      console.error('Upload failed:', err);
    }
    e.target.value = '';
  }, [store]);

  const handleAddToCanvas = useCallback((asset: ImageAsset) => {
    if (panelMode.mode === 'replace' && panelMode.selectedNodeId) {
      const state = useEditorStore.getState();
      const node = state.nodes[panelMode.selectedNodeId];
      if (node?.type === 'image') {
        state.execute(
          new UpdateNodeCommand(
            panelMode.selectedNodeId,
            { assetId: (node as any).assetId, src: (node as any).src } as any,
            { assetId: asset.id, src: asset.src } as any,
            'Replace image',
          ),
        );
        return;
      }
    }

    addNode({
      type: 'image',
      parentId: rootNodeId!,
      childrenIds: [],
      localMatrix: createMatrix({ x: 400, y: 400 }),
      width: Math.min(asset.width, 400),
      height: Math.min(asset.height, 300),
      opacity: 100,
      visible: true,
      locked: false,
      src: asset.src,
      assetId: asset.id,
      objectFit: 'cover',
      borderRadius: 0,
    });
  }, [addNode, rootNodeId, panelMode]);

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} alignItems="center">
        <AssetSearchBar onSearch={setSearch} placeholder="Search images..." />
        <Tooltip title="Upload image">
          <IconButton size="small" onClick={() => fileInputRef.current?.click()} sx={{ flexShrink: 0 }}>
            <UploadIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      {filteredImages.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="caption" color="text.secondary">
            No images in library yet.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => fileInputRef.current?.click()}
            sx={{ mt: 1.5, fontSize: 11, textTransform: 'none' }}
          >
            Upload Image
          </Button>
        </Box>
      ) : (
        <MasonryGrid>
          {filteredImages.map((asset) => (
            <LibraryImageItem key={asset.id} asset={asset} onAdd={handleAddToCanvas} mode={panelMode.mode} />
          ))}
        </MasonryGrid>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleUpload} />
    </Box>
  );
}

function LibraryImageItem({ asset, onAdd, mode }: { asset: ImageAsset; onAdd: (asset: ImageAsset) => void; mode: 'insert' | 'replace' }) {
  const runtime = useAssetRuntime(asset.id);
  const removeAsset = useAssetStore((s) => s.removeAsset);
  const { onDragStart } = useAssetDrag();
  const aspectRatio = asset.width / asset.height;

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 1,
        overflow: 'hidden',
        cursor: 'pointer',
        bgcolor: 'action.hover',
        '&:hover .overlay': { opacity: 1 },
      }}
      onClick={() => onAdd(asset)}
      draggable
      onDragStart={(e) => onDragStart(e, {
        assetType: 'image',
        assetId: asset.id,
        src: asset.src,
        width: asset.width,
        height: asset.height,
      })}
    >
      <LazyImage
        src={asset.thumbnail || asset.src}
        alt={asset.name}
        aspectRatio={aspectRatio}
        crossOrigin="anonymous"
      />
      {runtime?.status === 'loading' && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.3)' }}>
          <CircularProgress size={20} />
        </Box>
      )}
      <Box
        className="overlay"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          bgcolor: 'rgba(0,0,0,0.4)',
          opacity: 0,
          transition: 'opacity 0.15s',
        }}
      >
        <Tooltip title={mode === 'replace' ? 'Replace image' : 'Add to canvas'}>
          <IconButton size="small" sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.15)' }}>
            {mode === 'replace' ? <ReplaceIcon sx={{ fontSize: 16 }} /> : <AddIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.15)' }}
            onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography
        variant="caption"
        sx={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          bgcolor: 'rgba(0,0,0,0.5)', color: '#fff',
          textAlign: 'center', fontSize: 9, py: 0.25, lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', px: 0.5,
        }}
      >
        {asset.name}
      </Typography>
    </Box>
  );
}
