"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Stack,
  Button,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { productCreateSchema, defaultValues, type ProductCreateFormData } from "./schema";
import { DetailsSection } from "./components/DetailsSection";
import { PropertiesSection } from "./components/PropertiesSection";
import { PricingSection } from "./components/PricingSection";

export default function ProductCreatePage() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string>("details");

  const { control, handleSubmit } = useForm<ProductCreateFormData>({
    resolver: zodResolver(productCreateSchema),
    defaultValues,
  });

  const onSubmit = (data: ProductCreateFormData) => {
    console.log("Form data:", data);
    // Handle form submission
  };

  const handleSectionChange = (section: string) => (isExpanded: boolean) => {
    setExpandedSection(isExpanded ? section : "");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.900",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={4}>
          {/* Header */}
          <Box>
            <Typography
              variant="h4"
              sx={{ color: "white", fontWeight: 700, mb: 2 }}
            >
              Create a new product
            </Typography>

            {/* Breadcrumbs */}
            <Breadcrumbs
              sx={{
                "& .MuiBreadcrumbseparator": { color: "grey.500" },
              }}
            >
              <Link
                underline="hover"
                sx={{ color: "grey.400", cursor: "pointer" }}
                onClick={() => router.push("/")}
              >
                Dashboard
              </Link>
              <Link
                underline="hover"
                sx={{ color: "grey.400", cursor: "pointer" }}
                onClick={() => router.push("/product")}
              >
                Product
              </Link>
              <Typography sx={{ color: "grey.500" }}>Create</Typography>
            </Breadcrumbs>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              {/* Details Section */}
              <DetailsSection
                control={control}
                expanded={expandedSection === "details"}
                onChange={handleSectionChange("details")}
              />

              {/* Properties Section */}
              <PropertiesSection
                control={control}
                expanded={expandedSection === "properties"}
                onChange={handleSectionChange("properties")}
              />

              {/* Pricing Section */}
              <PricingSection
                control={control}
                expanded={expandedSection === "pricing"}
                onChange={handleSectionChange("pricing")}
              />

              {/* Action Buttons */}
              <Stack
                direction="row"
                spacing={2}
                justifyContent="space-between"
                sx={{ pt: 2 }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    color: "white",
                    borderColor: "grey.700",
                    "&:hover": {
                      borderColor: "grey.600",
                      bgcolor: "grey.800",
                    },
                  }}
                >
                  Publish
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: "primary.main",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }}
                >
                  Create product
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
