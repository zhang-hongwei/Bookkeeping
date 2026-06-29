/**
 * SVG Builder - Fluent API for constructing SVG strings
 */

type SVGElement = string;

export class SvgBuilder {
  private width: number;
  private height: number;
  private elements: SVGElement[] = [];
  private definitions: string[] = [];
  private currentGroup: string[] | null = null;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * Add a definition (gradient, pattern, filter, etc.)
   */
  def(id: string, content: string): this {
    this.definitions.push(content.replace(/id="[^"]*"/, `id="${id}"`));
    return this;
  }

  /**
   * Add linear gradient definition
   */
  linearGradient(
    id: string,
    stops: Array<{ offset: number; color: string; opacity?: number }>,
    options?: { x1?: string; y1?: string; x2?: string; y2?: string }
  ): this {
    const stopsStr = stops
      .map((s) => {
        const opacity = s.opacity !== undefined ? ` stop-opacity="${s.opacity}"` : '';
        return `<stop offset="${s.offset * 100}%" stop-color="${s.color}"${opacity}/>`;
      })
      .join('');

    const coords = options
      ? `x1="${options.x1 || '0%'}" y1="${options.y1 || '0%'}" x2="${options.x2 || '100%'}" y2="${options.y2 || '0%'}"`
      : '';

    this.definitions.push(
      `<linearGradient id="${id}" ${coords}>${stopsStr}</linearGradient>`
    );
    return this;
  }

  /**
   * Add radial gradient definition
   */
  radialGradient(
    id: string,
    stops: Array<{ offset: number; color: string; opacity?: number }>,
    options?: { cx?: string; cy?: string; r?: string; fx?: string; fy?: string }
  ): this {
    const stopsStr = stops
      .map((s) => {
        const opacity = s.opacity !== undefined ? ` stop-opacity="${s.opacity}"` : '';
        return `<stop offset="${s.offset * 100}%" stop-color="${s.color}"${opacity}/>`;
      })
      .join('');

    const attrs = options
      ? `cx="${options.cx || '50%'}" cy="${options.cy || '50%'}" r="${options.r || '50%'}"` +
        (options.fx ? ` fx="${options.fx}"` : '') +
        (options.fy ? ` fy="${options.fy}"` : '')
      : '';

    this.definitions.push(
      `<radialGradient id="${id}" ${attrs}>${stopsStr}</radialGradient>`
    );
    return this;
  }

  /**
   * Add blur filter definition
   */
  blurFilter(id: string, stdDeviation: number): this {
    this.definitions.push(
      `<filter id="${id}"><feGaussianBlur stdDeviation="${stdDeviation}"/></filter>`
    );
    return this;
  }

  /**
   * Set background color
   */
  background(color: string): this {
    this.rect(0, 0, this.width, this.height, { fill: color });
    return this;
  }

  /**
   * Add a rectangle
   */
  rect(
    x: number,
    y: number,
    width: number,
    height: number,
    attrs: Record<string, string | number> = {}
  ): this {
    const attrStr = this.attrsToString({ ...attrs, x, y, width, height });
    this.addElement(`<rect ${attrStr}/>`);
    return this;
  }

  /**
   * Add a circle
   */
  circle(
    cx: number,
    cy: number,
    r: number,
    attrs: Record<string, string | number> = {}
  ): this {
    const attrStr = this.attrsToString({ ...attrs, cx, cy, r });
    this.addElement(`<circle ${attrStr}/>`);
    return this;
  }

  /**
   * Add an ellipse
   */
  ellipse(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    attrs: Record<string, string | number> = {}
  ): this {
    const attrStr = this.attrsToString({ ...attrs, cx, cy, rx, ry });
    this.addElement(`<ellipse ${attrStr}/>`);
    return this;
  }

  /**
   * Add a path
   */
  path(d: string, attrs: Record<string, string | number> = {}): this {
    const attrStr = this.attrsToString({ ...attrs, d });
    this.addElement(`<path ${attrStr}/>`);
    return this;
  }

  /**
   * Add a polygon
   */
  polygon(points: Array<{ x: number; y: number }>, attrs: Record<string, string | number> = {}): this {
    const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');
    const attrStr = this.attrsToString({ ...attrs, points: pointsStr });
    this.addElement(`<polygon ${attrStr}/>`);
    return this;
  }

  /**
   * Add a polyline
   */
  polyline(points: Array<{ x: number; y: number }>, attrs: Record<string, string | number> = {}): this {
    const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');
    const attrStr = this.attrsToString({ ...attrs, points: pointsStr });
    this.addElement(`<polyline ${attrStr}/>`);
    return this;
  }

  /**
   * Add a line
   */
  line(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    attrs: Record<string, string | number> = {}
  ): this {
    const attrStr = this.attrsToString({ ...attrs, x1, y1, x2, y2 });
    this.addElement(`<line ${attrStr}/>`);
    return this;
  }

  /**
   * Add text
   */
  text(
    x: number,
    y: number,
    content: string,
    attrs: Record<string, string | number> = {}
  ): this {
    const attrStr = this.attrsToString({ ...attrs, x, y });
    this.addElement(`<text ${attrStr}>${content}</text>`);
    return this;
  }

  /**
   * Start a group
   */
  groupStart(attrs: Record<string, string | number> = {}): this {
    const attrStr = this.attrsToString(attrs);
    this.addElement(`<g ${attrStr}>`);
    this.currentGroup = [];
    return this;
  }

  /**
   * End current group
   */
  groupEnd(): this {
    if (this.currentGroup !== null) {
      this.addElement('</g>');
      this.currentGroup = null;
    }
    return this;
  }

  /**
   * Add a group with children (callback style)
   */
  group(attrs: Record<string, string | number>, children: () => void): this {
    const attrStr = this.attrsToString(attrs);
    this.addElement(`<g ${attrStr}>`);
    children();
    this.addElement('</g>');
    return this;
  }

  /**
   * Add raw SVG content
   */
  raw(content: string): this {
    this.addElement(content);
    return this;
  }

  /**
   * Build the final SVG string
   */
  build(): string {
    let defsStr = '';
    if (this.definitions.length > 0) {
      defsStr = `<defs>${this.definitions.join('')}</defs>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" width="${this.width}" height="${this.height}">
${defsStr}
${this.elements.join('\n')}
</svg>`;
  }

  /**
   * Build without XML declaration (for inline use)
   */
  buildInline(): string {
    let defsStr = '';
    if (this.definitions.length > 0) {
      defsStr = `<defs>${this.definitions.join('')}</defs>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}">
${defsStr}
${this.elements.join('\n')}
</svg>`;
  }

  /**
   * Get dimensions
   */
  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  // Private methods

  private addElement(element: string): void {
    if (this.currentGroup !== null) {
      this.currentGroup.push(element);
    } else {
      this.elements.push(element);
    }
  }

  private attrsToString(attrs: Record<string, string | number>): string {
    return Object.entries(attrs)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
  }
}

/**
 * Helper function to create SVG builder
 */
export function createSvg(width: number, height: number): SvgBuilder {
  return new SvgBuilder(width, height);
}
