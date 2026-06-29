# ImageGallerySwiper

A reusable and highly customizable image gallery component with swiper functionality and lightbox support.

## Features

- 🖼️ **Main image swiper** with smooth transitions
- 🔍 **Thumbnail navigation** with active state and auto-scroll
- 🔎 **Click to zoom** - Full-screen lightbox view
- ⬅️➡️ **Navigation arrows** (optional)
- 🔢 **Image counter** (optional)
- 🎨 **Fully customizable** rendering for main images and thumbnails
- 📱 **Touch-enabled** for mobile devices
- 🔄 **Loop mode** support
- ⏱️ **Autoplay** support
- 🎯 **TypeScript** support with generic types
- ✨ **Lightbox features**: Zoom, fullscreen, keyboard navigation (ESC to close, arrows to navigate)

## Basic Usage

```tsx
import { ImageGallerySwiper } from "@/components/shared/ImageGallerySwiper";

const images = [
  { id: "1", url: "/image1.jpg", alt: "Image 1" },
  { id: "2", url: "/image2.jpg", alt: "Image 2" },
  { id: "3", url: "/image3.jpg", alt: "Image 3" },
];

function MyComponent() {
  return <ImageGallerySwiper images={images} />;
}
```

## Advanced Usage with Custom Rendering

```tsx
import { ImageGallerySwiper } from "@/components/shared/ImageGallerySwiper";
import { Box, Typography } from "@mui/material";

const images = [
  { id: "1", url: "/image1.jpg", alt: "Product Image 1", title: "Front View" },
  { id: "2", url: "/image2.jpg", alt: "Product Image 2", title: "Side View" },
];

function ProductGallery() {
  return (
    <ImageGallerySwiper
      images={images}
      renderMainImage={(image) => (
        <Box>
          <img src={image.url} alt={image.alt} />
          <Typography>{image.title}</Typography>
        </Box>
      )}
      renderThumbnail={(image, index) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundImage: `url(${image.url})`,
            backgroundSize: "cover",
          }}
        />
      )}
      showNavigation={true}
      showThumbnails={true}
      showCounter={true}
      aspectRatio="16/9"
      thumbnailWidth={100}
      thumbnailHeight={75}
    />
  );
}
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `images` | `T[]` | Array of image items. Must extend `ImageGalleryItem` type |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `renderMainImage` | `(item: T, index: number) => ReactNode` | Default image renderer | Custom render function for main images |
| `renderThumbnail` | `(item: T, index: number) => ReactNode` | Default thumbnail renderer | Custom render function for thumbnails |
| `showNavigation` | `boolean` | `true` | Show/hide navigation arrows |
| `showThumbnails` | `boolean` | `true` | Show/hide thumbnail navigation |
| `showCounter` | `boolean` | `true` | Show/hide image counter (e.g., "1/5") |
| `mainImageSx` | `SxProps<Theme>` | `undefined` | Custom styles for main image container |
| `thumbnailSx` | `SxProps<Theme>` | `undefined` | Custom styles for thumbnail container |
| `thumbnailWidth` | `number` | `80` | Width of thumbnail in pixels |
| `thumbnailHeight` | `number` | `80` | Height of thumbnail in pixels |
| `thumbnailSpacing` | `number` | `12` | Spacing between thumbnails in pixels |
| `aspectRatio` | `string` | `"1/1"` | Aspect ratio of main image (e.g., "16/9", "4/3") |
| `loop` | `boolean` | `false` | Enable loop mode (infinite scroll) |
| `autoplayDelay` | `number` | `undefined` | Autoplay delay in milliseconds. Set to enable autoplay |

## Types

### ImageGalleryItem

The base interface that your image objects must extend:

```typescript
interface ImageGalleryItem {
  id: string;
  url?: string;
  alt: string;
}
```

You can extend this interface to add custom properties:

```typescript
interface ProductImage extends ImageGalleryItem {
  title: string;
  price: number;
}
```

## Examples

### Example 1: Product Image Gallery

```tsx
<ImageGallerySwiper
  images={productImages}
  aspectRatio="1/1"
  showNavigation={true}
  showCounter={true}
/>
```

### Example 2: Blog Post Gallery with Autoplay

```tsx
<ImageGallerySwiper
  images={blogImages}
  aspectRatio="16/9"
  autoplayDelay={3000}
  loop={true}
  showThumbnails={false}
/>
```

### Example 3: Gallery without Navigation

```tsx
<ImageGallerySwiper
  images={images}
  showNavigation={false}
  showCounter={false}
  thumbnailWidth={60}
  thumbnailHeight={60}
/>
```

### Example 4: Custom Styled Gallery

```tsx
<ImageGallerySwiper
  images={images}
  mainImageSx={{
    borderRadius: 4,
    boxShadow: 3,
  }}
  thumbnailSx={{
    opacity: 0.7,
    "&:hover": { opacity: 1 },
  }}
/>
```

## Integration with Swiper

This component uses [Swiper](https://swiperjs.com/) library under the hood. The following Swiper modules are included:

- **Navigation** - For arrow navigation
- **Thumbs** - For thumbnail synchronization
- **FreeMode** - For free scrolling thumbnails

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Lightbox (Full-Screen Image Viewer)

The component includes built-in lightbox functionality powered by `yet-another-react-lightbox`.

### Features:
- **Click any image** to open full-screen view
- **Zoom in/out** with mouse wheel or pinch gestures
- **Navigate** with arrow keys or on-screen buttons
- **Close** with ESC key or close button
- **Thumbnail navigation** in lightbox view
- **Automatic synchronization** between swiper and lightbox

### How it works:
1. Click on any main image to open lightbox
2. Use arrow keys (← →) to navigate between images
3. Use mouse wheel or zoom buttons to zoom in/out
4. Press ESC to close lightbox
5. Click close button (X) to exit

The lightbox automatically opens at the correct image index and stays synchronized with the main swiper.

## Dependencies

- `swiper` - ^12.0.0
- `yet-another-react-lightbox` - ^3.25.0
- `@mui/material` - ^7.x
- `react` - ^18.x or ^19.x
