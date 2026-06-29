/**
 * Wave Background Generator
 * Creates animated wave backgrounds with multiple layers
 */

import type { WaveConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { BaseBackgroundGenerator, registerBackgroundGenerator } from '../BaseBackgroundGenerator';

export class WaveGenerator extends BaseBackgroundGenerator<WaveConfig> {
  readonly type = 'wave' as const;
  readonly name = 'Wave';
  readonly description = 'Animated wave backgrounds with multiple layers';
  readonly icon = 'Wave';
  readonly supportsSVG = true;

  readonly defaultConfig: Partial<WaveConfig> = {
    layers: 3,
    amplitude: 50,
    frequency: 0.02,
    speed: 1,
    opacity: 0.8,
    direction: 'right',
    waveType: 'sine',
    gradient: true,
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Ocean Waves',
      config: {
        layers: 4,
        amplitude: 60,
        frequency: 0.015,
        speed: 0.8,
        colors: {
          background: '#000033',
          palette: ['#0066cc', '#0099ff', '#66ccff', '#99ddff'],
        },
      },
    },
    {
      name: 'Sunset Waves',
      config: {
        layers: 3,
        amplitude: 45,
        frequency: 0.02,
        speed: 0.6,
        colors: {
          background: '#33001a',
          palette: ['#ff6666', '#ff9966', '#ffcc66', '#ffff66'],
        },
      },
    },
    {
      name: 'Purple Haze',
      config: {
        layers: 3,
        amplitude: 55,
        frequency: 0.018,
        speed: 0.7,
        colors: {
          background: '#1a001a',
          palette: ['#9933ff', '#cc66ff', '#ff99ff', '#ffccff'],
        },
      },
    },
    {
      name: 'Green Valley',
      config: {
        layers: 4,
        amplitude: 50,
        frequency: 0.022,
        speed: 0.9,
        colors: {
          background: '#003300',
          palette: ['#009933', '#33cc33', '#66ff66', '#99ff99'],
        },
      },
    },
  ];

  readonly controls: GeneratorControl[] = [
    {
      key: 'layers',
      label: 'Layers',
      type: 'slider',
      min: 1,
      max: 5,
      step: 1,
      defaultValue: 3,
    },
    {
      key: 'amplitude',
      label: 'Amplitude',
      type: 'slider',
      min: 10,
      max: 100,
      step: 5,
      defaultValue: 50,
    },
    {
      key: 'frequency',
      label: 'Frequency',
      type: 'slider',
      min: 0.005,
      max: 0.05,
      step: 0.005,
      defaultValue: 0.02,
    },
    {
      key: 'speed',
      label: 'Speed',
      type: 'slider',
      min: 0.1,
      max: 2,
      step: 0.1,
      defaultValue: 1,
    },
    {
      key: 'opacity',
      label: 'Opacity',
      type: 'slider',
      min: 0.1,
      max: 1,
      step: 0.1,
      defaultValue: 0.8,
    },
    {
      key: 'direction',
      label: 'Direction',
      type: 'select',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'right',
    },
    {
      key: 'waveType',
      label: 'Wave Type',
      type: 'select',
      options: [
        { value: 'sine', label: 'Sine' },
        { value: 'cosine', label: 'Cosine' },
        { value: 'triangle', label: 'Triangle' },
      ],
      defaultValue: 'sine',
    },
    {
      key: 'gradient',
      label: 'Gradient Fill',
      type: 'toggle',
      defaultValue: true,
    },
  ];

  generateCanvas(config: WaveConfig, canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = config.canvas;
    canvas.width = width;
    canvas.height = height;

    // Clear canvas with background color
    this.clearCanvas(canvas, config.colors.background);

    const currentTime = Date.now() * 0.001 * config.speed;
    const direction = config.direction === 'right' ? 1 : -1;

    // Draw each wave layer
    for (let i = 0; i < config.layers; i++) {
      const layerProgress = i / (config.layers - 1);
      const layerAmplitude = config.amplitude * (1 - layerProgress * 0.3);
      const layerFrequency = config.frequency * (1 + layerProgress * 0.5);
      const layerSpeed = currentTime * (1 + layerProgress * 0.5);
      const layerOpacity = config.opacity * (0.5 + layerProgress * 0.5);
      const layerY = height * (0.3 + layerProgress * 0.4);

      // Create gradient for the layer
      let fillStyle: CanvasGradient | string;
      if (config.gradient && config.colors.palette.length > 0) {
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        const colorCount = config.colors.palette.length;
        for (let j = 0; j < colorCount; j++) {
          gradient.addColorStop(j / (colorCount - 1), config.colors.palette[j]);
        }
        fillStyle = gradient;
      } else {
        fillStyle = config.colors.palette[i % config.colors.palette.length] || '#ffffff';
      }

      // Start drawing the wave path
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, layerY);

      // Generate wave points
      for (let x = 0; x <= width; x += 5) {
        let offsetX = x * layerFrequency + layerSpeed * direction;
        let yOffset: number;

        switch (config.waveType) {
          case 'sine':
            yOffset = Math.sin(offsetX) * layerAmplitude;
            break;
          case 'cosine':
            yOffset = Math.cos(offsetX) * layerAmplitude;
            break;
          case 'triangle':
            yOffset = Math.abs(((offsetX % (Math.PI * 2)) - Math.PI) / Math.PI) * layerAmplitude * 2 - layerAmplitude;
            break;
          default:
            yOffset = Math.sin(offsetX) * layerAmplitude;
        }

        const y = layerY + yOffset;
        ctx.lineTo(x, y);
      }

      // Complete the path
      ctx.lineTo(width, layerY);
      ctx.lineTo(width, height);
      ctx.closePath();

      // Fill the wave
      ctx.fillStyle = fillStyle;
      ctx.globalAlpha = layerOpacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  generateSVG(config: WaveConfig): string {
    const { width, height } = config.canvas;
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs>`;

    // Create gradients if needed
    if (config.gradient && config.colors.palette.length > 0) {
      svg += `<linearGradient id="waveGradient" x1="0%" y1="100%" x2="0%" y2="0%">`;
      const colorCount = config.colors.palette.length;
      for (let i = 0; i < colorCount; i++) {
        svg += `<stop offset="${(i / (colorCount - 1) * 100).toFixed(0)}%" stop-color="${config.colors.palette[i]}"/>`;
      }
      svg += `</linearGradient>`;
    }

    svg += `</defs>`;

    // Background
    svg += `<rect width="100%" height="100%" fill="${config.colors.background}"/>`;

    const currentTime = Date.now() * 0.001 * config.speed;
    const direction = config.direction === 'right' ? 1 : -1;

    // Draw each wave layer
    for (let i = 0; i < config.layers; i++) {
      const layerProgress = i / (config.layers - 1);
      const layerAmplitude = config.amplitude * (1 - layerProgress * 0.3);
      const layerFrequency = config.frequency * (1 + layerProgress * 0.5);
      const layerSpeed = currentTime * (1 + layerProgress * 0.5);
      const layerOpacity = config.opacity * (0.5 + layerProgress * 0.5);
      const layerY = height * (0.3 + layerProgress * 0.4);

      let fillColor = config.gradient ? 'url(#waveGradient)' : (config.colors.palette[i % config.colors.palette.length] || '#ffffff');

      // Generate wave path
      let path = `M0,${height} L0,${layerY}`;

      for (let x = 0; x <= width; x += 10) {
        let offsetX = x * layerFrequency + layerSpeed * direction;
        let yOffset: number;

        switch (config.waveType) {
          case 'sine':
            yOffset = Math.sin(offsetX) * layerAmplitude;
            break;
          case 'cosine':
            yOffset = Math.cos(offsetX) * layerAmplitude;
            break;
          case 'triangle':
            yOffset = Math.abs(((offsetX % (Math.PI * 2)) - Math.PI) / Math.PI) * layerAmplitude * 2 - layerAmplitude;
            break;
          default:
            yOffset = Math.sin(offsetX) * layerAmplitude;
        }

        const y = layerY + yOffset;
        path += ` L${x},${y}`;
      }

      path += ` L${width},${layerY} L${width},${height} Z`;

      svg += `<path d="${path}" fill="${fillColor}" opacity="${layerOpacity}"/>`;
    }

    svg += `</svg>`;

    return svg;
  }

  /**
   * Generate CSS animation for waves
   */
  generateCSS(config: WaveConfig): string {
    const { width, height } = config.canvas;
    const keyframes = `@keyframes wave-animation {
  0% { transform: translateX(0); }
  100% { transform: translateX(${config.direction === 'right' ? '-100' : '100'}px); }
}`;

    let css = keyframes + '\n\n';
    css += `.wave-background {
  position: relative;
  width: ${width}px;
  height: ${height}px;
  background: ${config.colors.background};
  overflow: hidden;
}`;

    for (let i = 0; i < config.layers; i++) {
      const layerProgress = i / (config.layers - 1);
      const layerAmplitude = config.amplitude * (1 - layerProgress * 0.3);
      const layerFrequency = config.frequency * (1 + layerProgress * 0.5);
      const layerSpeed = 1 + layerProgress * 0.5;
      const layerOpacity = config.opacity * (0.5 + layerProgress * 0.5);
      const layerY = height * (0.3 + layerProgress * 0.4);

      const color = config.colors.palette[i % config.colors.palette.length] || '#ffffff';

      css += `\n\n.wave-layer-${i} {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: ${height - layerY + layerAmplitude}px;
  background: ${color};
  opacity: ${layerOpacity};
  animation: wave-animation ${10 / layerSpeed}s linear infinite;
  transform-origin: bottom left;
}`;
    }

    return css;
  }
}

// Register generator
const waveGenerator = new WaveGenerator();
registerBackgroundGenerator(waveGenerator);

export { waveGenerator };
