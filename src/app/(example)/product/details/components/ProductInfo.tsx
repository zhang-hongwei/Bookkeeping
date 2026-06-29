"use client";

import { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Chip,
  Rating,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  Remove,
  Add,
  FavoriteBorder,
  CompareArrows,
  Share,
  ShoppingCart,
} from "@mui/icons-material";
import type { Product } from "../data";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0].id);
  const [selectedSize, setSelectedSize] = useState(product.sizes[3]);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.availableStock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Badges */}
      <Stack direction="row" spacing={1}>
        {product.badges.map((badge) => (
          <Chip
            key={badge}
            label={badge}
            size="small"
            sx={{
              bgcolor:
                badge === "NEW" ? "info.main" : "success.main",
              color: "white",
              fontWeight: 600,
            }}
          />
        ))}
      </Stack>

      {/* Product Name */}
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {product.name}
      </Typography>

      {/* Rating */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Rating value={product.rating} readOnly precision={0.5} />
        <Typography variant="body2" color="text.secondary">
          ({product.reviewCount.toLocaleString()} reviews)
        </Typography>
      </Stack>

      {/* Price */}
      <Typography variant="h3" sx={{ fontWeight: 700, color: "primary.main" }}>
        {product.price.toFixed(2)} {product.currency}
      </Typography>

      {/* Description */}
      <Typography variant="body2" color="text.secondary">
        {product.description}
      </Typography>

      {/* Color Selection */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Color
        </Typography>
        <Stack direction="row" spacing={1.5}>
          {product.colors.map((color) => (
            <Box
              key={color.id}
              onClick={() => setSelectedColor(color.id)}
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: color.hex,
                border: 2,
                borderColor:
                  selectedColor === color.id
                    ? "primary.main"
                    : "grey.300",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "primary.light",
                },
                ...(color.hex === "#FFFFFF" && {
                  border: "2px solid",
                  borderColor:
                    selectedColor === color.id
                      ? "primary.main"
                      : "grey.300",
                }),
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Size Selection */}
      <Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1.5 }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Size
          </Typography>
          <Typography
            variant="caption"
            color="primary"
            sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          >
            Size chart
          </Typography>
        </Stack>
        <FormControl fullWidth>
          <Select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            size="small"
          >
            {product.sizes.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Quantity */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Quantity
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" spacing={0} alignItems="center">
            <IconButton
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              size="small"
              sx={{
                border: 1,
                borderColor: "grey.300",
                borderRadius: "8px 0 0 8px",
              }}
            >
              <Remove fontSize="small" />
            </IconButton>
            <Box
              sx={{
                width: 60,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: 1,
                borderColor: "grey.300",
                borderLeft: 0,
                borderRight: 0,
              }}
            >
              <Typography>{quantity}</Typography>
            </Box>
            <IconButton
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= product.availableStock}
              size="small"
              sx={{
                border: 1,
                borderColor: "grey.300",
                borderRadius: "0 8px 8px 0",
              }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Available: {product.availableStock}
          </Typography>
        </Stack>
      </Box>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          size="large"
          startIcon={<ShoppingCart />}
          sx={{ flex: 1 }}
        >
          Add to cart
        </Button>
        <Button variant="outlined" size="large" sx={{ flex: 1 }}>
          Buy now
        </Button>
      </Stack>

      {/* Secondary Actions */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        sx={{ pt: 1 }}
      >
        <Button
          startIcon={<CompareArrows />}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          Compare
        </Button>
        <Button
          startIcon={<FavoriteBorder />}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          Favorite
        </Button>
        <Button
          startIcon={<Share />}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          Share
        </Button>
      </Stack>
    </Stack>
  );
}
