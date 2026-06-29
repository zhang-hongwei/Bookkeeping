import { NextRequest, NextResponse } from 'next/server';
import { Vibrant } from 'node-vibrant/node';
import { hexToOklch } from '@/app/(tools)/gradiweave/lib/colours/conversion';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const vibrant = new Vibrant(buffer);
    const palette = await vibrant.getPalette();

    const swatchNames = [
      'Vibrant',
      'Muted',
      'DarkVibrant',
      'DarkMuted',
      'LightVibrant',
      'LightMuted',
    ] as const;

    const colours = swatchNames
      .map((name) => palette[name])
      .filter((swatch) => swatch != null)
      .map((swatch) => {
        const hex = swatch.hex;
        return { hex, oklch: hexToOklch(hex) };
      });

    return NextResponse.json({ colours });
  } catch {
    return NextResponse.json({ error: 'Failed to extract colours' }, { status: 500 });
  }
}
