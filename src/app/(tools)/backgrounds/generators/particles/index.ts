/**
 * Particles Generator
 * Creates dynamic particle effect backgrounds
 */

import type { ParticlesConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { BaseBackgroundGenerator, registerBackgroundGenerator } from '../BaseBackgroundGenerator';
import type { SeededRandom } from '../../lib/algorithms/random';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  rotation?: number;
}

export class ParticlesGenerator extends BaseBackgroundGenerator<ParticlesConfig> {
  readonly type = 'particles' as const;
  readonly name = 'Particles';
  readonly description = 'Dynamic particle effects background';
  readonly icon = 'Grain';
  readonly supportsSVG = true;

  readonly defaultConfig: Partial<ParticlesConfig> = {
    count: 100,
    minSize: 2,
    maxSize: 15,
    opacity: 60,
    distribution: 'random',
    shape: 'circle',
    blur: 0,
    colors: {
      background: '#0a0a1a',
      palette: ['#ffffff', '#ffffcc', '#ccffff', '#ffccff'],
    },
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Starry Night',
      config: {
        count: 200,
        minSize: 1,
        maxSize: 3,
        distribution: 'random',
        shape: 'circle',
        colors: { background: '#0a0a1a', palette: ['#ffffff', '#ffffcc', '#ccffff'] },
      },
    },
    {
      name: 'Bokeh',
      config: {
        count: 50,
        minSize: 20,
        maxSize: 80,
        opacity: 30,
        blur: 15,
        distribution: 'random',
        shape: 'circle',
        colors: { background: '#1a1a2e', palette: ['#ff6b6b', '#4ecdc4', '#45b7d1'] },
      },
    },
    {
      name: 'Confetti',
      config: {
        count: 150,
        minSize: 5,
        maxSize: 12,
        distribution: 'random',
        shape: 'square',
        colors: { background: '#f7f7f7', palette: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3'] },
      },
    },
    {
      name: 'Cosmic Dust',
      config: {
        count: 300,
        minSize: 1,
        maxSize: 4,
        distribution: 'clustered',
        shape: 'circle',
        colors: { background: '#0c0c1e', palette: ['#9d4edd', '#c77dff', '#e0aaff'] },
      },
    },
    {
      name: 'Neon Dots',
      config: {
        count: 80,
        minSize: 8,
        maxSize: 20,
        distribution: 'grid',
        shape: 'circle',
        colors: { background: '#0a0a0a', palette: ['#00ff88', '#00ccff', '#ff00ff'] },
      },
    },
    {
      name: 'Geometric',
      config: {
        count: 60,
        minSize: 10,
        maxSize: 30,
        distribution: 'spiral',
        shape: 'triangle',
        colors: { background: '#1a1a2e', palette: ['#e94560', '#533483', '#16213e'] },
      },
    },
  ];

  readonly controls: GeneratorControl[] = [
    {
      key: 'count',
      label: 'Particle Count',
      type: 'slider',
      min: 10,
      max: 500,
      step: 10,
      defaultValue: 100,
    },
    {
      key: 'minSize',
      label: 'Min Size',
      type: 'slider',
      min: 1,
      max: 20,
      step: 1,
      defaultValue: 2,
    },
    {
      key: 'maxSize',
      label: 'Max Size',
      type: 'slider',
      min: 5,
      max: 100,
      step: 5,
      defaultValue: 15,
    },
    {
      key: 'opacity',
      label: 'Opacity',
      type: 'slider',
      min: 10,
      max: 100,
      step: 5,
      defaultValue: 60,
    },
    {
      key: 'distribution',
      label: 'Distribution',
      type: 'select',
      options: [
        { value: 'random', label: 'Random' },
        { value: 'clustered', label: 'Clustered' },
        { value: 'grid', label: 'Grid' },
        { value: 'spiral', label: 'Spiral' },
      ],
      defaultValue: 'random',
    },
    {
      key: 'shape',
      label: 'Shape',
      type: 'select',
      options: [
        { value: 'circle', label: 'Circle' },
        { value: 'square', label: 'Square' },
        { value: 'triangle', label: 'Triangle' },
        { value: 'star', label: 'Star' },
      ],
      defaultValue: 'circle',
    },
    {
      key: 'blur',
      label: 'Blur',
      type: 'slider',
      min: 0,
      max: 20,
      step: 1,
      defaultValue: 0,
    },
  ];

  generateCanvas(config: ParticlesConfig, canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = config.canvas;
    canvas.width = width;
    canvas.height = height;

    const random = this.getRandom(config);

    // Background
    ctx.fillStyle = config.colors.background;
    ctx.fillRect(0, 0, width, height);

    // Generate particles
    const particles = this.generateParticles(width, height, config, random);

    // Apply blur filter
    if (config.blur > 0) {
      ctx.filter = `blur(${config.blur}px)`;
    }

    // Draw particles
    particles.forEach((particle) => {
      ctx.globalAlpha = (config.opacity / 100) * particle.opacity;
      ctx.fillStyle = particle.color;

      switch (config.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'square':
          ctx.save();
          ctx.translate(particle.x, particle.y);
          ctx.rotate((particle.rotation ?? 0) * Math.PI / 180);
          ctx.fillRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2);
          ctx.restore();
          break;
        case 'triangle':
          this.drawTriangle(ctx, particle);
          break;
        case 'star':
          this.drawStar(ctx, particle);
          break;
      }
    });

    ctx.filter = 'none';
    ctx.globalAlpha = 1;
  }

  generateSVG(config: ParticlesConfig): string {
    const { width, height } = config.canvas;
    const random = this.getRandom(config);
    const particles = this.generateParticles(width, height, config, random);

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<rect width="100%" height="100%" fill="${config.colors.background}"/>
<defs>`;

    if (config.blur > 0) {
      svg += `<filter id="blur"><feGaussianBlur stdDeviation="${config.blur}"/></filter>`;
    }

    svg += `</defs>`;
    svg += `<g${config.blur > 0 ? ' filter="url(#blur)"' : ''}>`;

    particles.forEach((particle) => {
      const opacity = (config.opacity / 100) * particle.opacity;
      const fill = particle.color;

      switch (config.shape) {
        case 'circle':
          svg += `<circle cx="${particle.x}" cy="${particle.y}" r="${particle.size}" fill="${fill}" opacity="${opacity}"/>`;
          break;
        case 'square':
          svg += `<rect x="${particle.x - particle.size}" y="${particle.y - particle.size}" width="${particle.size * 2}" height="${particle.size * 2}" fill="${fill}" opacity="${opacity}" transform="rotate(${particle.rotation ?? 0} ${particle.x} ${particle.y})"/>`;
          break;
        case 'triangle':
          svg += this.getTriangleSVG(particle, fill, opacity);
          break;
        case 'star':
          svg += this.getStarSVG(particle, fill, opacity);
          break;
      }
    });

    svg += `</g></svg>`;
    return svg;
  }

  private generateParticles(
    width: number,
    height: number,
    config: ParticlesConfig,
    random: SeededRandom
  ): Particle[] {
    const particles: Particle[] = [];

    // For clustered distribution, create cluster centers first
    const clusterCenters: Array<{ x: number; y: number }> = [];
    if (config.distribution === 'clustered') {
      const clusterCount = Math.ceil(config.count / 20);
      for (let i = 0; i < clusterCount; i++) {
        clusterCenters.push({
          x: random.range(0, width),
          y: random.range(0, height),
        });
      }
    }

    for (let i = 0; i < config.count; i++) {
      let x: number;
      let y: number;

      switch (config.distribution) {
        case 'clustered': {
          const cluster = random.pick(clusterCenters);
          const stdDev = Math.min(width, height) * 0.15;
          x = cluster.x + random.gaussian(0, stdDev);
          y = cluster.y + random.gaussian(0, stdDev);
          break;
        }
        case 'grid': {
          const cols = Math.ceil(Math.sqrt(config.count));
          const cellWidth = width / cols;
          const cellHeight = height / cols;
          const row = Math.floor(i / cols);
          const col = i % cols;
          x = col * cellWidth + cellWidth / 2 + random.range(-cellWidth * 0.3, cellWidth * 0.3);
          y = row * cellHeight + cellHeight / 2 + random.range(-cellHeight * 0.3, cellHeight * 0.3);
          break;
        }
        case 'spiral': {
          const angle = i * 0.5;
          const radius = i * 2;
          x = width / 2 + Math.cos(angle) * radius;
          y = height / 2 + Math.sin(angle) * radius;
          break;
        }
        default: // random
          x = random.range(0, width);
          y = random.range(0, height);
      }

      particles.push({
        x,
        y,
        size: random.range(config.minSize, config.maxSize),
        color: random.pick(config.colors.palette),
        opacity: random.range(0.5, 1),
        rotation: random.range(0, 360),
      });
    }

    return particles;
  }

  private drawTriangle(ctx: CanvasRenderingContext2D, particle: Particle): void {
    const { x, y, size } = particle;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((particle.rotation ?? 0) * Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.866, size * 0.5);
    ctx.lineTo(-size * 0.866, size * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawStar(ctx: CanvasRenderingContext2D, particle: Particle): void {
    const { x, y, size } = particle;
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.5;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((particle.rotation ?? 0) * Math.PI / 180);
    ctx.beginPath();

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      if (i === 0) {
        ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      } else {
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      }
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private getTriangleSVG(particle: Particle, fill: string, opacity: number): string {
    const { x, y, size, rotation = 0 } = particle;
    const points = [
      { px: x, py: y - size },
      { px: x + size * 0.866, py: y + size * 0.5 },
      { px: x - size * 0.866, py: y + size * 0.5 },
    ];
    const pointsStr = points.map((p) => `${p.px},${p.py}`).join(' ');
    return `<polygon points="${pointsStr}" fill="${fill}" opacity="${opacity}" transform="rotate(${rotation} ${x} ${y})"/>`;
  }

  private getStarSVG(particle: Particle, fill: string, opacity: number): string {
    const { x, y, size, rotation = 0 } = particle;
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.5;
    const points: string[] = [];

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes - Math.PI / 2 + (rotation * Math.PI) / 180;
      points.push(`${x + Math.cos(angle) * radius},${y + Math.sin(angle) * radius}`);
    }

    return `<polygon points="${points.join(' ')}" fill="${fill}" opacity="${opacity}"/>`;
  }
}

// Register generator
const particlesGenerator = new ParticlesGenerator();
registerBackgroundGenerator(particlesGenerator);

export { particlesGenerator };
