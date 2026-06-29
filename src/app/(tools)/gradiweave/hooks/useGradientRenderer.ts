'use client';

import { useEffect, useRef, useCallback, type RefObject } from 'react';
import { useGradientStore } from '../store/gradient-store';
import { createProgram, setupFullscreenQuad } from '../lib/shaders/compiler';
import { VERTEX_SHADER, FRAGMENT_SHADER } from '../lib/shaders/sources';
import {
  GRADIENT_TYPE_INDEX,
  WARP_SHAPE_INDEX,
  NOISE_TYPE_INDEX,
  NOISE_COLOR_MODE_INDEX,
  type PixelDensity,
} from '../types/gradient';

interface UniformLocations {
  u_resolution: WebGLUniformLocation | null;
  u_coloursOklch: WebGLUniformLocation | null;
  u_colourCount: WebGLUniformLocation | null;
  u_gradientType: WebGLUniformLocation | null;
  u_warpType: WebGLUniformLocation | null;
  u_warp: WebGLUniformLocation | null;
  u_warpSize: WebGLUniformLocation | null;
  u_noise: WebGLUniformLocation | null;
  u_noiseScale: WebGLUniformLocation | null;
  u_noiseType: WebGLUniformLocation | null;
  u_noiseColorMode: WebGLUniformLocation | null;
  u_angle: WebGLUniformLocation | null;
  u_simpleSubtype: WebGLUniformLocation | null;
  u_colourPositions: WebGLUniformLocation | null;
}

interface GlResources {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  vao: WebGLVertexArrayObject;
  uniforms: UniformLocations;
}

function getUniformLocations(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
): UniformLocations {
  return {
    u_resolution: gl.getUniformLocation(program, 'u_resolution'),
    u_coloursOklch: gl.getUniformLocation(program, 'u_coloursOklch'),
    u_colourCount: gl.getUniformLocation(program, 'u_colourCount'),
    u_gradientType: gl.getUniformLocation(program, 'u_gradientType'),
    u_warpType: gl.getUniformLocation(program, 'u_warpType'),
    u_warp: gl.getUniformLocation(program, 'u_warp'),
    u_warpSize: gl.getUniformLocation(program, 'u_warpSize'),
    u_noise: gl.getUniformLocation(program, 'u_noise'),
    u_noiseScale: gl.getUniformLocation(program, 'u_noiseScale'),
    u_noiseType: gl.getUniformLocation(program, 'u_noiseType'),
    u_noiseColorMode: gl.getUniformLocation(program, 'u_noiseColorMode'),
    u_angle: gl.getUniformLocation(program, 'u_angle'),
    u_simpleSubtype: gl.getUniformLocation(program, 'u_simpleSubtype'),
    u_colourPositions: gl.getUniformLocation(program, 'u_colourPositions'),
  };
}

const SIMPLE_SUBTYPE_INDEX = { linear: 0, radial: 1, conic: 2 } as const;

function render(res: GlResources, overrideColourPositions?: Float32Array) {
  const { gl, program, vao, uniforms } = res;
  const state = useGradientStore.getState();

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.useProgram(program);

  // Resolution
  gl.uniform2f(uniforms.u_resolution, gl.canvas.width, gl.canvas.height);

  // Colours: flatten to [l,c,h, l,c,h, ...] padded to 12
  const colourData = new Float32Array(36); // 12 * 3
  for (let i = 0; i < state.colours.length && i < 12; i++) {
    const { l, c, h } = state.colours[i].oklch;
    colourData[i * 3] = l;
    colourData[i * 3 + 1] = c;
    colourData[i * 3 + 2] = h;
  }
  gl.uniform3fv(uniforms.u_coloursOklch, colourData);
  gl.uniform1i(uniforms.u_colourCount, Math.min(state.colours.length, 12));

  // Colour positions for mesh modes
  const posData = overrideColourPositions || new Float32Array(24); // 12 * 2
  if (!overrideColourPositions) {
    for (let i = 0; i < state.colours.length && i < 12; i++) {
      const pos = state.colours[i].position;
      if (pos) {
        posData[i * 2] = pos.x;
        posData[i * 2 + 1] = pos.y;
      } else {
        // Default: distribute evenly in a circle
        const angle = (i / state.colours.length) * Math.PI * 2;
        posData[i * 2] = 0.5 + Math.cos(angle) * 0.3;
        posData[i * 2 + 1] = 0.5 + Math.sin(angle) * 0.3;
      }
    }
  }
  gl.uniform2fv(uniforms.u_colourPositions, posData);

  // Gradient type
  gl.uniform1i(uniforms.u_gradientType, GRADIENT_TYPE_INDEX[state.type]);

  // Warp
  gl.uniform1i(uniforms.u_warpType, WARP_SHAPE_INDEX[state.warpShape]);
  gl.uniform1f(uniforms.u_warp, state.warp);
  gl.uniform1f(uniforms.u_warpSize, state.warpSize);

  // Noise
  gl.uniform1f(uniforms.u_noise, state.noise);
  gl.uniform1f(uniforms.u_noiseScale, state.noiseScale);
  gl.uniform1i(uniforms.u_noiseType, NOISE_TYPE_INDEX[state.noiseType]);
  gl.uniform1i(uniforms.u_noiseColorMode, NOISE_COLOR_MODE_INDEX[state.noiseColorMode]);

  // Angle & simple subtype
  gl.uniform1f(uniforms.u_angle, state.angle);
  gl.uniform1i(uniforms.u_simpleSubtype, SIMPLE_SUBTYPE_INDEX[state.simpleSubtype]);

  // Draw
  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.bindVertexArray(null);
}

// Module-level refs for external access
let _renderToBlob: ((density: PixelDensity) => Promise<Blob>) | null = null;
let _updateSingleColourPosition: ((colourIndex: number, x: number, y: number) => void) | null = null;
let _getGlResources: () => GlResources | null = () => null;

export function getRenderToBlob() {
  return _renderToBlob;
}

export function getUpdateSingleColourPosition() {
  return _updateSingleColourPosition;
}

export function useGradientRenderer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  onError?: (message: string) => void,
): { renderToBlob: (density: PixelDensity) => Promise<Blob> } {
  const resourcesRef = useRef<GlResources | null>(null);
  const rafRef = useRef<number>(0);

  // Initialise WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      antialias: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) {
      onError?.('Your browser does not support WebGL2, which is required for rendering.');
      return;
    }

    let program: WebGLProgram;
    let vao: WebGLVertexArrayObject;
    let uniforms: UniformLocations;

    try {
      program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
      vao = setupFullscreenQuad(gl, program);
      uniforms = getUniformLocations(gl, program);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Shader compilation failed');
      return;
    }

    const res: GlResources = { gl, program, vao, uniforms };
    resourcesRef.current = res;

    // Expose getter for resources
    _getGlResources = () => res;

    // Set initial canvas size from store
    const state = useGradientStore.getState();
    canvas.width = state.width;
    canvas.height = state.height;

    // Initial render
    render(res);

    // Subscribe to store changes
    const unsub = useGradientStore.subscribe(() => {
      const s = useGradientStore.getState();

      // Resize canvas if dimensions changed
      if (canvas.width !== s.width || canvas.height !== s.height) {
        canvas.width = s.width;
        canvas.height = s.height;
      }

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => render(res));
    });

    // Optimized function to update a single colour position without triggering store subscription
    _updateSingleColourPosition = (colourIndex: number, x: number, y: number) => {
      const res = resourcesRef.current;
      if (!res) return;

      const state = useGradientStore.getState();

      // Build position data with the updated position
      const posData = new Float32Array(24);
      for (let i = 0; i < state.colours.length && i < 12; i++) {
        const pos = state.colours[i].position;
        if (i === colourIndex) {
          // Use the new position
          posData[i * 2] = x;
          posData[i * 2 + 1] = y;
        } else if (pos) {
          posData[i * 2] = pos.x;
          posData[i * 2 + 1] = pos.y;
        } else {
          // Default: distribute evenly in a circle
          const angle = (i / state.colours.length) * Math.PI * 2;
          posData[i * 2] = 0.5 + Math.cos(angle) * 0.3;
          posData[i * 2 + 1] = 0.5 + Math.sin(angle) * 0.3;
        }
      }

      // Render with updated positions
      render(res, posData);
    };

    // Expose renderToBlob to module-level for useExport
    _renderToBlob = renderToBlob;

    return () => {
      unsub();
      cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(program);
      gl.deleteVertexArray(vao);
      resourcesRef.current = null;
      _renderToBlob = null;
      _updateSingleColourPosition = null;
      _getGlResources = () => null;
    };
  }, [canvasRef]);

  const renderToBlob = useCallback(
    (density: PixelDensity): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const res = resourcesRef.current;
        if (!res) return reject(new Error('WebGL not initialised'));

        const canvas = canvasRef.current;
        if (!canvas) return reject(new Error('Canvas not available'));

        const state = useGradientStore.getState();
        const origW = canvas.width;
        const origH = canvas.height;

        // Resize for export
        canvas.width = state.width * density;
        canvas.height = state.height * density;
        render(res);

        canvas.toBlob(
          (blob) => {
            // Restore original size
            canvas.width = origW;
            canvas.height = origH;
            render(res);

            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          },
          'image/png',
        );
      });
    },
    [canvasRef],
  );

  return { renderToBlob };
}
