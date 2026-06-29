"use client";

import { useState, useEffect, ReactNode } from "react";
import { Box, Stack, IconButton } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, FreeMode } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";
import Lightbox from "yet-another-react-lightbox";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";

// Import Lightbox styles
import "yet-another-react-lightbox/styles.css";

export interface ImageGalleryItem {
  id: string;
  url?: string;
  alt: string;
}

export interface ImageGallerySwiperProps<T extends ImageGalleryItem> {
  /** 图片数组 */
  images: T[];
  /** 自定义主图渲染函数 */
  renderMainImage?: (item: T, index: number) => ReactNode;
  /** 自定义缩略图渲染函数 */
  renderThumbnail?: (item: T, index: number) => ReactNode;
  /** 是否显示导航按钮 */
  showNavigation?: boolean;
  /** 是否显示缩略图 */
  showThumbnails?: boolean;
  /** 是否显示计数器 */
  showCounter?: boolean;
  /** 主图容器样式 */
  mainImageSx?: SxProps<Theme>;
  /** 缩略图容器样式 */
  thumbnailSx?: SxProps<Theme>;
  /** 缩略图宽度 */
  thumbnailWidth?: number;
  /** 缩略图高度 */
  thumbnailHeight?: number;
  /** 缩略图间距 */
  thumbnailSpacing?: number;
  /** 主图宽高比 */
  aspectRatio?: string;
  /** 循环播放 */
  loop?: boolean;
  /** 自动播放延迟（毫秒），设置后自动播放 */
  autoplayDelay?: number;
}

export function ImageGallerySwiper<T extends ImageGalleryItem>({
  images,
  renderMainImage,
  renderThumbnail,
  showNavigation = true,
  showThumbnails = true,
  showCounter = true,
  mainImageSx,
  thumbnailSx,
  thumbnailWidth = 80,
  thumbnailHeight = 80,
  thumbnailSpacing = 12,
  aspectRatio = "1/1",
  loop = false,
  autoplayDelay,
}: ImageGallerySwiperProps<T>) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Auto scroll thumbnails to keep active thumbnail visible
  useEffect(() => {
    if (thumbsSwiper && activeIndex !== undefined) {
      thumbsSwiper.slideTo(activeIndex);
    }
  }, [activeIndex, thumbsSwiper]);

  // Handle image click to open lightbox
  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Prepare slides for lightbox
  const lightboxSlides = images
    .filter((img) => img.url)
    .map((img) => ({
      src: img.url!,
      alt: img.alt,
    }));

  const defaultMainImageRender = (item: T) => (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
      }}
    >
      {item.url ? (
        <Box
          component="img"
          src={item.url}
          alt={item.alt}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Box>{item.alt}</Box>
      )}
    </Box>
  );

  const defaultThumbnailRender = (item: T) => (
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
      {item.url ? (
        <Box
          component="img"
          src={item.url}
          alt={item.alt}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Box>{item.alt}</Box>
      )}
    </Box>
  );

  return (
    <Stack spacing={2}>
      {/* Main Image Swiper */}
      <Box
        sx={[
          {
            position: "relative",
            width: "100%",
            borderRadius: 2,
            overflow: "hidden",
          },
          ...(Array.isArray(mainImageSx) ? mainImageSx : [mainImageSx]),
        ]}
      >
        <Swiper
          modules={[Navigation, Thumbs]}
          spaceBetween={0}
          slidesPerView={1}
          thumbs={showThumbnails ? { swiper: thumbsSwiper } : undefined}
          navigation={
            showNavigation
              ? {
                  prevEl: ".swiper-button-prev-custom",
                  nextEl: ".swiper-button-next-custom",
                }
              : false
          }
          loop={loop}
          autoplay={
            autoplayDelay
              ? {
                  delay: autoplayDelay,
                  disableOnInteraction: false,
                }
              : false
          }
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          style={{
            aspectRatio,
            width: "100%",
          }}
        >
          {images.map((image, index) => (
            <SwiperSlide key={image.id}>
              <Box
                onClick={() => handleImageClick(index)}
                sx={{ cursor: "pointer", width: "100%", height: "100%" }}
              >
                {renderMainImage
                  ? renderMainImage(image, index)
                  : defaultMainImageRender(image)}
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        {showNavigation && (
          <>
            <IconButton
              className="swiper-button-prev-custom"
              sx={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                bgcolor: "rgba(255, 255, 255, 0.9)",
                "&:hover": { bgcolor: "white" },
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              className="swiper-button-next-custom"
              sx={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                bgcolor: "rgba(255, 255, 255, 0.9)",
                "&:hover": { bgcolor: "white" },
              }}
            >
              <ChevronRight />
            </IconButton>
          </>
        )}

        {/* Image Counter */}
        {showCounter && (
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              zIndex: 10,
              bgcolor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              px: 2,
              py: 0.5,
              borderRadius: 1,
              typography: "caption",
            }}
          >
            {activeIndex + 1}/{images.length}
          </Box>
        )}
      </Box>

      {/* Thumbnails Swiper */}
      {showThumbnails && (
        <Box>
          <Swiper
            onSwiper={setThumbsSwiper}
            modules={[FreeMode, Thumbs]}
            spaceBetween={thumbnailSpacing}
            slidesPerView="auto"
            freeMode={true}
            watchSlidesProgress={true}
            slideToClickedSlide={true}
            centeredSlides={false}
            centerInsufficientSlides={true}
            style={{ width: "100%" }}
          >
            {images.map((image, index) => (
              <SwiperSlide
                key={image.id}
                style={{
                  width: `${thumbnailWidth}px`,
                  height: `${thumbnailHeight}px`,
                }}
              >
                <Box
                  sx={[
                    {
                      width: "100%",
                      height: "100%",
                      borderRadius: 1.5,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: 2,
                      borderColor:
                        activeIndex === index ? "primary.main" : "transparent",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "primary.light",
                      },
                    },
                    ...(Array.isArray(thumbnailSx)
                      ? thumbnailSx
                      : [thumbnailSx]),
                  ]}
                >
                  {renderThumbnail
                    ? renderThumbnail(image, index)
                    : defaultThumbnailRender(image)}
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      )}

      {/* Lightbox for full-screen image viewing */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
        on={{
          view: ({ index }) => setLightboxIndex(index),
        }}
      />
    </Stack>
  );
}
