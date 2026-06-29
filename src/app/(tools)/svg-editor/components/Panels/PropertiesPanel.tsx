'use client';

import { useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  TextField,
  InputAdornment,
  Stack,
  Select,
  MenuItem,
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import { useSvgEditorStore } from '../../store/svgEditorStore';
import { findElementById } from '../../lib/svg-parser';
import { getElementBBox } from '../../utils';
import type { SvgElementData } from '../../types';

export default function PropertiesPanel() {
  const document = useSvgEditorStore((s) => s.document);
  const selection = useSvgEditorStore((s) => s.selection);
  const updateElementAttrs = useSvgEditorStore((s) => s.updateElementAttrs);
  const pushHistory = useSvgEditorStore((s) => s.pushHistory);

  // All hooks must be called before any early returns
  const selectedId = selection.elementIds.length === 1 ? selection.elementIds[0] : null;
  const el = selectedId ? findElementById(document, selectedId) : null;

  const handleAttrChange = useCallback(
    (id: string, key: string, value: string) => {
      updateElementAttrs(id, { [key]: value });
      pushHistory(`Change ${key}`);
    },
    [updateElementAttrs, pushHistory],
  );

  if (selection.elementIds.length === 0) {
    return (
      <Box sx={{ color: 'text.secondary', textAlign: 'center', py: 4, fontSize: 12 }}>
        Select an element to edit its properties
      </Box>
    );
  }

  if (selection.elementIds.length > 1) {
    return (
      <Box sx={{ color: 'text.secondary', textAlign: 'center', py: 4, fontSize: 12 }}>
        {selection.elementIds.length} elements selected
      </Box>
    );
  }

  if (!el) return null;

  const bbox = getElementBBox(el.attrs, el.tag);
  const num = (key: string) => Number.parseFloat(el.attrs[key] ?? '0') || 0;

  return (
    <Box sx={{ fontSize: 12 }}>
      {/* Element info */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          &lt;{el.tag}&gt;
        </Typography>
      </Box>

      {/* Position & Size */}
      <Section title="Transform">
        <Stack spacing={0.5}>
          <Row label="X">
            <NumInput
              value={Math.round(bbox.x * 10) / 10}
              onChange={(v) => handleAttrChange(el.id, 'x', String(v))}
            />
          </Row>
          <Row label="Y">
            <NumInput
              value={Math.round(bbox.y * 10) / 10}
              onChange={(v) => handleAttrChange(el.id, 'y', String(v))}
            />
          </Row>
          <Row label="W">
            <NumInput
              value={Math.round(bbox.width * 10) / 10}
              onChange={(v) => handleAttrChange(el.id, 'width', String(v))}
            />
          </Row>
          <Row label="H">
            <NumInput
              value={Math.round(bbox.height * 10) / 10}
              onChange={(v) => handleAttrChange(el.id, 'height', String(v))}
            />
          </Row>
        </Stack>
      </Section>

      {/* Fill */}
      <Section title="Fill">
        <ColorField
          value={el.attrs.fill ?? 'none'}
          onChange={(v) => handleAttrChange(el.id, 'fill', v)}
        />
      </Section>

      {/* Stroke */}
      <Section title="Stroke">
        <ColorField
          value={el.attrs.stroke ?? 'none'}
          onChange={(v) => handleAttrChange(el.id, 'stroke', v)}
        />
        <Row label="Width" mt={0.5}>
          <NumInput
            value={num('stroke-width')}
            onChange={(v) => handleAttrChange(el.id, 'stroke-width', String(v))}
            min={0}
            step={0.5}
          />
        </Row>
      </Section>

      {/* Opacity */}
      {'opacity' in el.attrs && (
        <Section title="Opacity">
          <Row label="Opacity">
            <NumInput
              value={num('opacity')}
              onChange={(v) => handleAttrChange(el.id, 'opacity', String(Math.max(0, Math.min(1, v))))}
              min={0}
              max={1}
              step={0.1}
            />
          </Row>
        </Section>
      )}

      {/* Corner radius for rect */}
      {el.tag === 'rect' && (
        <Section title="Corner Radius">
          <Row label="RX">
            <NumInput
              value={num('rx')}
              onChange={(v) => handleAttrChange(el.id, 'rx', String(v))}
              min={0}
            />
          </Row>
          <Row label="RY" mt={0.5}>
            <NumInput
              value={num('ry')}
              onChange={(v) => handleAttrChange(el.id, 'ry', String(v))}
              min={0}
            />
          </Row>
        </Section>
      )}

      {/* Path data for path elements */}
      {el.tag === 'path' && el.attrs.d && (
        <Section title="Path Data">
          <Box
            component="textarea"
            defaultValue={el.attrs.d}
            onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => {
              if (e.target.value !== el.attrs.d) {
                handleAttrChange(el.id, 'd', e.target.value);
              }
            }}
            sx={{
              width: '100%',
              minHeight: 60,
              px: 0.5,
              py: 0.25,
              border: 1,
              borderColor: 'divider',
              borderRadius: 0.5,
              fontSize: 10,
              fontFamily: 'monospace',
              resize: 'vertical',
              outline: 'none',
              '&:focus': { borderColor: 'primary.main' },
              bgcolor: 'transparent',
              color: 'text.primary',
            }}
          />
        </Section>
      )}

      {/* Typography for text/tspan elements */}
      {(el.tag === 'text' || el.tag === 'tspan') && (
        <TypographySection el={el} onChange={handleAttrChange} />
      )}
    </Box>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function Row({ label, children, mt = 0 }: { label: string; children: React.ReactNode; mt?: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt }}>
      <Typography variant="caption" sx={{ width: 20, flexShrink: 0, color: 'text.secondary' }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

function NumInput({
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <TextField
      size="small"
      type="number"
      value={value}
      onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
      inputProps={{ min, max, step, sx: { py: 0.25, px: 0.5, fontSize: 11 } }}
      sx={{
        flex: 1,
        '& .MuiOutlinedInput-root': { borderRadius: 0.5 },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
      }}
    />
  );
}

function TypographySection({
  el,
  onChange,
}: {
  el: SvgElementData;
  onChange: (id: string, key: string, value: string) => void;
}) {
  const updateTextContent = useSvgEditorStore((s) => s.updateElementTextContent);

  const num = (key: string) => Number.parseFloat(el.attrs[key] ?? '0') || 0;
  const str = (key: string, fallback = '') => el.attrs[key] ?? fallback;

  return (
    <>
      <Section title="Typography">
        <Stack spacing={0.5}>
          {/* Text Content */}
          {el.tag === 'text' && (
            <Row label="Text">
              <TextField
                size="small"
                value={el.textContent ?? ''}
                onChange={(e) => {
                  updateTextContent(el.id, e.target.value);
                }}
                inputProps={{ sx: { py: 0.25, px: 0.5, fontSize: 11 } }}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': { borderRadius: 0.5 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                }}
              />
            </Row>
          )}

          {/* Font Family */}
          <Row label="Font">
            <TextField
              size="small"
              value={str('font-family')}
              onChange={(e) => onChange(el.id, 'font-family', e.target.value)}
              placeholder="Arial, sans-serif"
              inputProps={{ sx: { py: 0.25, px: 0.5, fontSize: 11 } }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': { borderRadius: 0.5 },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
              }}
            />
          </Row>

          {/* Font Size */}
          <Row label="Size">
            <NumInput
              value={num('font-size') || 16}
              onChange={(v) => onChange(el.id, 'font-size', String(v))}
              min={1}
              step={1}
            />
          </Row>

          {/* Font Weight */}
          <Row label="Wt">
            <Select
              size="small"
              value={el.attrs['font-weight'] || 'normal'}
              onChange={(e) => onChange(el.id, 'font-weight', e.target.value)}
              sx={{
                flex: 1,
                height: 28,
                fontSize: 11,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                '& .MuiSelect-select': { py: 0.25, px: 0.5 },
              }}
            >
              <MenuItem value="normal" sx={{ fontSize: 11 }}>Normal</MenuItem>
              <MenuItem value="bold" sx={{ fontSize: 11 }}>Bold</MenuItem>
              <MenuItem value="100" sx={{ fontSize: 11 }}>100 Thin</MenuItem>
              <MenuItem value="200" sx={{ fontSize: 11 }}>200 Extra Light</MenuItem>
              <MenuItem value="300" sx={{ fontSize: 11 }}>300 Light</MenuItem>
              <MenuItem value="400" sx={{ fontSize: 11 }}>400 Regular</MenuItem>
              <MenuItem value="500" sx={{ fontSize: 11 }}>500 Medium</MenuItem>
              <MenuItem value="600" sx={{ fontSize: 11 }}>600 Semi Bold</MenuItem>
              <MenuItem value="700" sx={{ fontSize: 11 }}>700 Bold</MenuItem>
              <MenuItem value="800" sx={{ fontSize: 11 }}>800 Extra Bold</MenuItem>
              <MenuItem value="900" sx={{ fontSize: 11 }}>900 Black</MenuItem>
            </Select>
          </Row>

          {/* Font Style */}
          <Row label="Style">
            <Select
              size="small"
              value={el.attrs['font-style'] || 'normal'}
              onChange={(e) => onChange(el.id, 'font-style', e.target.value)}
              sx={{
                flex: 1,
                height: 28,
                fontSize: 11,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                '& .MuiSelect-select': { py: 0.25, px: 0.5 },
              }}
            >
              <MenuItem value="normal" sx={{ fontSize: 11 }}>Normal</MenuItem>
              <MenuItem value="italic" sx={{ fontSize: 11 }}>Italic</MenuItem>
            </Select>
          </Row>

          {/* Text Anchor */}
          <Row label="Align">
            <Select
              size="small"
              value={el.attrs['text-anchor'] || 'start'}
              onChange={(e) => onChange(el.id, 'text-anchor', e.target.value)}
              sx={{
                flex: 1,
                height: 28,
                fontSize: 11,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                '& .MuiSelect-select': { py: 0.25, px: 0.5 },
              }}
            >
              <MenuItem value="start" sx={{ fontSize: 11 }}>Left</MenuItem>
              <MenuItem value="middle" sx={{ fontSize: 11 }}>Center</MenuItem>
              <MenuItem value="end" sx={{ fontSize: 11 }}>Right</MenuItem>
            </Select>
          </Row>

          {/* Letter Spacing */}
          <Row label="LS">
            <NumInput
              value={num('letter-spacing')}
              onChange={(v) => onChange(el.id, 'letter-spacing', String(v))}
              step={0.5}
            />
          </Row>

          {/* Text Decoration */}
          <Row label="Dec">
            <Select
              size="small"
              value={el.attrs['text-decoration'] || 'none'}
              onChange={(e) => onChange(el.id, 'text-decoration', e.target.value)}
              sx={{
                flex: 1,
                height: 28,
                fontSize: 11,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                '& .MuiSelect-select': { py: 0.25, px: 0.5 },
              }}
            >
              <MenuItem value="none" sx={{ fontSize: 11 }}>None</MenuItem>
              <MenuItem value="underline" sx={{ fontSize: 11 }}>Underline</MenuItem>
              <MenuItem value="line-through" sx={{ fontSize: 11 }}>Line-through</MenuItem>
              <MenuItem value="overline" sx={{ fontSize: 11 }}>Overline</MenuItem>
            </Select>
          </Row>
        </Stack>
      </Section>
    </>
  );
}

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const isNone = value === 'none';

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        <Box
          onClick={() => {
            if (isNone) {
              onChange('#000000');
            } else {
              setShowPicker(!showPicker);
            }
          }}
          sx={{
            width: 24,
            height: 24,
            borderRadius: 0.5,
            border: 1,
            borderColor: 'divider',
            bgcolor: isNone ? 'transparent' : value,
            backgroundImage: isNone
              ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)'
              : undefined,
            backgroundSize: isNone ? '6px 6px' : undefined,
            backgroundPosition: isNone ? '0 0, 3px 3px' : undefined,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        />
        <TextField
          size="small"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputProps={{ sx: { py: 0.25, px: 0.5, fontSize: 11, fontFamily: 'monospace' } }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': { borderRadius: 0.5 },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
          }}
        />
        {showPicker && (
          <Box
            component="button"
            onClick={() => onChange('none')}
            sx={{
              px: 0.5,
              py: 0.25,
              fontSize: 10,
              border: 1,
              borderColor: 'divider',
              borderRadius: 0.5,
              cursor: 'pointer',
              bgcolor: 'transparent',
              color: 'text.primary',
            }}
          >
            None
          </Box>
        )}
      </Box>
      {showPicker && !isNone && (
        <Box sx={{ mt: 0.5 }}>
          <HexColorPicker color={value} onChange={onChange} style={{ width: '100%', height: 120 }} />
        </Box>
      )}
    </Box>
  );
}
