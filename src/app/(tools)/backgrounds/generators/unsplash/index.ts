/**
 * Unsplash Generator
 * Integration with Unsplash API for photo backgrounds
 */

import type { UnsplashConfig, GeneratorPreset, GeneratorControl } from '../../types';
import { BaseBackgroundGenerator, registerBackgroundGenerator } from '../BaseBackgroundGenerator';

// Unsplash API types
interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    custom?: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  width: number;
  height: number;
  color: string;
  description?: string;
  alt_description?: string;
}

// Collection of fallback photos for demo/offline use
const DEMO_PHOTOS: Array<{
  id: string;
  url: string;
  photographer: string;
  link: string;
  color: string;
}> = [
  {
    id: 'demo1',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    photographer: 'Samuel Ferraria',
    link: 'https://unsplash.com/@samuelzeller',
    color: '#2d3436',
  },
  {
    id: 'demo2',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
    photographer: 'Lukas Budimaier',
    link: 'https://unsplash.com/@lukasbudimaier',
    color: '#1a1a2e',
  },
  {
    id: 'demo3',
    url: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1920&q=80',
    photographer: 'Ashim D Silva',
    link: 'https://unsplash.com/@ashimdsilva',
    color: '#0f3460',
  },
  {
    id: 'demo4',
    url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80',
    photographer: 'NASA',
    link: 'https://unsplash.com/@nasa',
    color: '#0a0a1a',
  },
  {
    id: 'demo5',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80',
    photographer: 'Benjamin Voros',
    link: 'https://unsplash.com/@vorosbenisop',
    color: '#16213e',
  },
  {
    id: 'demo6',
    url: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=1920&q=80',
    photographer: 'Nathan Dumlao',
    link: 'https://unsplash.com/@nate_dumlao',
    color: '#e17055',
  },
];

export class UnsplashGenerator extends BaseBackgroundGenerator<UnsplashConfig> {
  readonly type = 'unsplash' as const;
  readonly name = 'Unsplash';
  readonly description = 'Beautiful photo backgrounds from Unsplash';
  readonly icon = 'PhotoCamera';
  readonly supportsSVG = false; // Photos cannot be exported as SVG

  readonly defaultConfig: Partial<UnsplashConfig> = {
    query: 'nature',
    orientation: 'landscape',
    overlay: false,
    overlayColor: '#000000',
    overlayOpacity: 30,
    blur: 0,
    brightness: 0,
    colors: {
      background: '#1a1a2e',
      palette: ['#16213e', '#0f3460'],
    },
  };

  readonly presets: GeneratorPreset[] = [
    {
      name: 'Nature',
      config: { query: 'nature', overlay: false },
    },
    {
      name: 'Abstract',
      config: {
        query: 'abstract',
        overlay: true,
        overlayColor: '#1a1a2e',
        overlayOpacity: 50,
      },
    },
    {
      name: 'Minimal',
      config: { query: 'minimal', brightness: 10 },
    },
    {
      name: 'Dark Overlay',
      config: {
        query: 'technology',
        overlay: true,
        overlayColor: '#000000',
        overlayOpacity: 60,
      },
    },
    {
      name: 'Space',
      config: {
        query: 'galaxy stars',
        overlay: true,
        overlayColor: '#0a0a1a',
        overlayOpacity: 30,
      },
    },
    {
      name: 'Texture',
      config: { query: 'texture pattern', blur: 2 },
    },
    {
      name: 'City Night',
      config: {
        query: 'city night',
        overlay: true,
        overlayColor: '#1a0a2e',
        overlayOpacity: 40,
      },
    },
    {
      name: 'Mountain',
      config: { query: 'mountain landscape', brightness: 5 },
    },
  ];

  readonly controls: GeneratorControl[] = [
    {
      key: 'query',
      label: 'Search Query',
      type: 'text',
      defaultValue: 'nature',
    },
    {
      key: 'orientation',
      label: 'Orientation',
      type: 'select',
      options: [
        { value: 'landscape', label: 'Landscape' },
        { value: 'portrait', label: 'Portrait' },
        { value: 'squarish', label: 'Square' },
      ],
      defaultValue: 'landscape',
    },
    {
      key: 'overlay',
      label: 'Color Overlay',
      type: 'toggle',
      defaultValue: false,
    },
    {
      key: 'overlayColor',
      label: 'Overlay Color',
      type: 'color',
      defaultValue: '#000000',
    },
    {
      key: 'overlayOpacity',
      label: 'Overlay Opacity',
      type: 'slider',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 30,
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
    {
      key: 'brightness',
      label: 'Brightness',
      type: 'slider',
      min: -50,
      max: 50,
      step: 5,
      defaultValue: 0,
    },
  ];

  // Cache for loaded images
  private imageCache = new Map<string, HTMLImageElement>();

  async generateCanvas(config: UnsplashConfig, canvas: HTMLCanvasElement): Promise<void> {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = config.canvas;
    canvas.width = width;
    canvas.height = height;

    // Draw background color first
    ctx.fillStyle = config.colors.background;
    ctx.fillRect(0, 0, width, height);

    // Get image URL
    let imageUrl = config.photoUrl;
    let photoInfo = {
      photographerName: config.photographerName,
      photographerLink: config.photographerLink,
    };

    // If no cached URL, fetch from Unsplash or use demo
    if (!imageUrl) {
      if (process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY) {
        try {
          const photoData = await this.fetchUnsplashImage(config);
          imageUrl = photoData.url;
          photoInfo = {
            photographerName: photoData.photographer,
            photographerLink: photoData.link,
          };
        } catch (error) {
          console.warn('Failed to fetch from Unsplash, using demo image');
          const randomPhoto = this.getRandom(config).pick(DEMO_PHOTOS);
          imageUrl = randomPhoto.url;
          photoInfo = {
            photographerName: randomPhoto.photographer,
            photographerLink: randomPhoto.link,
          };
        }
      } else {
        // Use demo photos when no API key
        const randomPhoto = this.getRandom(config).pick(DEMO_PHOTOS);
        imageUrl = randomPhoto.url;
        photoInfo = {
          photographerName: randomPhoto.photographer,
          photographerLink: randomPhoto.link,
        };
      }
    }

    if (!imageUrl) return;

    // Load and draw image
    return new Promise((resolve, reject) => {
      const img = this.imageCache.get(imageUrl!) || new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        this.imageCache.set(imageUrl!, img);

        // Apply blur
        if (config.blur > 0) {
          ctx.filter = `blur(${config.blur}px)`;
        }

        // Draw image (cover fit)
        const scale = Math.max(width / img.width, height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        ctx.filter = 'none';

        // Apply brightness
        if (config.brightness !== 0) {
          ctx.globalCompositeOperation = config.brightness > 0 ? 'screen' : 'multiply';
          const brightnessColor =
            config.brightness > 0
              ? `rgba(255, 255, 255, ${Math.abs(config.brightness) / 100})`
              : `rgba(0, 0, 0, ${Math.abs(config.brightness) / 100})`;
          ctx.fillStyle = brightnessColor;
          ctx.fillRect(0, 0, width, height);
          ctx.globalCompositeOperation = 'source-over';
        }

        // Apply overlay
        if (config.overlay) {
          ctx.globalAlpha = config.overlayOpacity / 100;
          ctx.fillStyle = config.overlayColor;
          ctx.fillRect(0, 0, width, height);
          ctx.globalAlpha = 1;
        }

        resolve();
      };

      img.onerror = () => {
        console.warn('Failed to load image');
        reject(new Error('Failed to load image'));
      };

      if (!this.imageCache.has(imageUrl!)) {
        img.src = imageUrl!;
      } else {
        img.onload?.({} as Event);
      }
    });
  }

  private async fetchUnsplashImage(config: UnsplashConfig): Promise<{
    url: string;
    photographer: string;
    link: string;
  }> {
    const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
    if (!UNSPLASH_ACCESS_KEY) {
      throw new Error('Unsplash API key not configured');
    }

    const { width, height } = config.canvas;

    const url = new URL('https://api.unsplash.com/photos/random');
    url.searchParams.set('query', config.query);
    url.searchParams.set('orientation', config.orientation);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('h', height.toString());

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Unsplash');
    }

    const data: UnsplashPhoto = await response.json();

    return {
      url: data.urls.raw + `&w=${width}&h=${height}&fit=crop&q=80`,
      photographer: data.user.name,
      link: data.user.links.html,
    };
  }

  /**
   * Load a random new image
   */
  async loadRandomImage(config: UnsplashConfig): Promise<{
    photoUrl: string;
    photographerName: string;
    photographerLink: string;
  }> {
    const random = this.getRandom(config);

    if (process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY) {
      try {
        const photoData = await this.fetchUnsplashImage(config);
        return {
          photoUrl: photoData.url,
          photographerName: photoData.photographer,
          photographerLink: photoData.link,
        };
      } catch (error) {
        console.warn('Failed to fetch from Unsplash, using demo image');
      }
    }

    // Use demo photos
    const photo = random.pick(DEMO_PHOTOS);
    return {
      photoUrl: photo.url,
      photographerName: photo.photographer,
      photographerLink: photo.link,
    };
  }

  /**
   * Get attribution text
   */
  getAttribution(config: UnsplashConfig): string | null {
    if (config.photographerName) {
      return `Photo by ${config.photographerName} on Unsplash`;
    }
    return null;
  }
}

// Register generator
const unsplashGenerator = new UnsplashGenerator();
registerBackgroundGenerator(unsplashGenerator);

export { unsplashGenerator };
