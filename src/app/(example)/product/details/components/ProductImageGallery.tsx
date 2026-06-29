"use client";

import { Box } from "@mui/material";
import { ImageGallerySwiper } from "@/components/shared/ImageGallerySwiper";
import type { ProductImage } from "../data";

interface ProductImageGalleryProps {
  images: ProductImage[];
}

export function ProductImageGallery({ images }: ProductImageGalleryProps) {
  return (
    <ImageGallerySwiper
      images={images}
      renderMainImage={(image) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.100",
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src={image.url}
            alt={image.alt}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>
      )}
      renderThumbnail={(image) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.100",
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src={image.url}
            alt={image.alt}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>
      )}
      showNavigation={true}
      showThumbnails={true}
      showCounter={true}
      aspectRatio="1/1"
    />
  );
}
