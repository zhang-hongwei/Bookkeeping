/**
 * Type declarations for CSS and other asset imports
 */

// CSS modules
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

// SCSS modules
declare module "*.scss" {
  const content: Record<string, string>;
  export default content;
}

// LESS modules
declare module "*.less" {
  const content: Record<string, string>;
  export default content;
}

// Image assets
declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

declare module "*.gif" {
  const content: string;
  export default content;
}

declare module "*.webp" {
  const content: string;
  export default content;
}

declare module "*.ico" {
  const content: string;
  export default content;
}

// Font files
declare module "*.woff" {
  const content: string;
  export default content;
}

declare module "*.woff2" {
  const content: string;
  export default content;
}

declare module "*.ttf" {
  const content: string;
  export default content;
}

declare module "*.eot" {
  const content: string;
  export default content;
}
