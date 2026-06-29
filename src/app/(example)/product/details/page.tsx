"use client";

import { Box, Container, Grid, Stack, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { ProductImageGallery } from "./components/ProductImageGallery";
import { ProductInfo } from "./components/ProductInfo";
import { ProductFeatures } from "./components/ProductFeatures";
import { ProductTabs } from "./components/ProductTabs";
import { productData, productFeatures, mockReviews } from "./data";

export default function ProductDetailsPage() {
  const router = useRouter();

  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          {/* Back Button */}
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            sx={{
              alignSelf: "flex-start",
              color: "text.primary",
              textTransform: "none",
              fontSize: "1rem",
            }}
          >
            Back
          </Button>

          {/* Product Main Section */}
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 7 }}>
              <ProductImageGallery images={productData.images} />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <ProductInfo product={productData} />
            </Grid>
          </Grid>

          {/* Product Features */}
          <ProductFeatures features={productFeatures} />

          {/* Product Tabs */}
          <ProductTabs product={productData} reviews={mockReviews} />
        </Stack>
      </Container>
    </Box>
  );
}
