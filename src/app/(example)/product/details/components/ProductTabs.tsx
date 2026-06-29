"use client";

import { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Stack,
  Rating,
  Avatar,
  Divider,
} from "@mui/material";
import { SpecificationsTable } from "./SpecificationsTable";
import type { Product, Review } from "../data";

interface ProductTabsProps {
  product: Product;
  reviews: Review[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
    >
      {value === index && <Box sx={{ py: 4 }}>{children}</Box>}
    </div>
  );
}

export function ProductTabs({ product, reviews }: ProductTabsProps) {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box>
      <Tabs
        value={value}
        onChange={handleChange}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Tab
          label="Description"
          sx={{
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: value === 0 ? 600 : 400,
          }}
        />
        <Tab
          label={`Reviews (${reviews.length})`}
          sx={{
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: value === 1 ? 600 : 400,
          }}
        />
      </Tabs>

      <TabPanel value={value} index={0}>
        <Stack spacing={6}>
          {/* Specifications */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Specifications
            </Typography>
            <SpecificationsTable specifications={product.specifications} />
          </Box>

          {/* Product Details */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Product details
            </Typography>
            <Stack component="ul" spacing={1} sx={{ pl: 2 }}>
              {product.details.map((detail, index) => (
                <Typography
                  key={index}
                  component="li"
                  variant="body2"
                  color="text.secondary"
                >
                  {detail}
                </Typography>
              ))}
            </Stack>
          </Box>

          {/* Benefits */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Benefits
            </Typography>
            <Stack component="ul" spacing={1} sx={{ pl: 2 }}>
              {product.benefits.map((benefit, index) => (
                <Typography
                  key={index}
                  component="li"
                  variant="body2"
                  color="text.secondary"
                >
                  {benefit}
                </Typography>
              ))}
            </Stack>
          </Box>

          {/* Delivery and Returns */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Delivery and returns
            </Typography>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Your order of ${product.deliveryInfo.freeDeliveryThreshold} or
                more gets free standard delivery.
              </Typography>
              <Stack component="ul" spacing={1} sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" color="text.secondary">
                  Standard delivered {product.deliveryInfo.standardDelivery}
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Express delivered {product.deliveryInfo.expressDelivery}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {product.deliveryInfo.note}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Stack spacing={3}>
          {reviews.map((review, index) => (
            <Box key={review.id}>
              <Stack direction="row" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
                  {review.avatar}
                </Avatar>
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {review.author}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Typography>
                  </Stack>
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary">
                    {review.comment}
                  </Typography>
                </Stack>
              </Stack>
              {index < reviews.length - 1 && <Divider sx={{ mt: 3 }} />}
            </Box>
          ))}
        </Stack>
      </TabPanel>
    </Box>
  );
}
