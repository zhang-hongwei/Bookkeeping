import { useShallow } from 'zustand/shallow';
import { useHdrGradientStore } from './store';
import type { GradientLayer } from '@/app/(tools)/hdr-gradient/types';

/** Get the active layer */
export function useActiveLayer(): GradientLayer | undefined {
  return useHdrGradientStore(
    useShallow((s) => s.layers[s.activeLayerIndex]),
  );
}

/** Get composited CSS from all visible layers */
export function useGradientCss(): { modern: string; classic: string } {
  return useHdrGradientStore(
    useShallow((s) => {
      const visible = s.layers.filter((l) => l.visible);
      const modern = visible.map((l) => l.cachedCss?.modern || '').filter(Boolean).join(', ');
      const classic = visible.map((l) => l.cachedCss?.classic || '').filter(Boolean).join(', ');
      return { modern, classic };
    }),
  );
}

/** Stable action selectors (prevents re-renders) */
export function useGradientActions() {
  return useHdrGradientStore(
    useShallow((s) => ({
      setGradientType: s.setGradientType,
      setGradientSpace: s.setGradientSpace,
      setInterpolation: s.setInterpolation,
      setLinearAngle: s.setLinearAngle,
      setLinearNamedAngle: s.setLinearNamedAngle,
      setRadialShape: s.setRadialShape,
      setRadialSize: s.setRadialSize,
      setRadialPosition: s.setRadialPosition,
      setRadialNamedPosition: s.setRadialNamedPosition,
      setConicAngle: s.setConicAngle,
      setConicPosition: s.setConicPosition,
      setConicNamedPosition: s.setConicNamedPosition,
      setStops: s.setStops,
      updateStop: s.updateStop,
      addStop: s.addStop,
      removeStop: s.removeStop,
      duplicateStop: s.duplicateStop,
      moveStop: s.moveStop,
      addLayer: s.addLayer,
      selectLayer: s.selectLayer,
      deleteLayer: s.deleteLayer,
      moveLayer: s.moveLayer,
      toggleLayerVisibility: s.toggleLayerVisibility,
      renameLayer: s.renameLayer,
      applyPreset: s.applyPreset,
      applyParsedGradient: s.applyParsedGradient,
      restoreFromHash: s.restoreFromHash,
      reset: s.reset,
      setColorPickerOpen: s.setColorPickerOpen,
      setImportDialogOpen: s.setImportDialogOpen,
      setExportDialogOpen: s.setExportDialogOpen,
      setPreviewHd: s.setPreviewHd,
    })),
  );
}
