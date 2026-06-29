/**
 * Glass Preview Component
 * Live preview with multiple template options
 */

"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import type { GlassConfig, PreviewTemplate } from "../types";
import { computeGlassStyles } from "../utils";

// ─── Preview Templates ─────────────────────────────────────────────────

function CardTemplate({ fgColor }: { fgColor: string }) {
  return (
    <Box sx={{ textAlign: "center", width: "100%" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: fgColor, mb: 1 }}>
        Glass Effect
      </Typography>
      <Typography variant="body2" sx={{ color: fgColor, opacity: 0.7, mb: 2.5 }}>
        Create stunning frosted glass UI elements with customizable blur, transparency, and shadow.
      </Typography>
      <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
        {["Primary", "Secondary"].map((label, i) => (
          <Box
            key={label}
            sx={{
              px: 2.5,
              py: 0.75,
              borderRadius: 2,
              background: i === 0
                ? "rgba(99, 102, 241, 0.85)"
                : fgColor === "#ffffff" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
              color: i === 0 ? "#fff" : fgColor,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {label}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function ProfileTemplate({ fgColor }: { fgColor: string }) {
  return (
    <Box sx={{ textAlign: "center", width: "100%" }}>
      <Box
        sx={{
          width: 56, height: 56, borderRadius: "50%", mx: "auto", mb: 1.5,
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 700, color: "#fff",
        }}
      >
        J
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: fgColor }}>
        Jane Cooper
      </Typography>
      <Typography variant="body2" sx={{ color: fgColor, opacity: 0.6, mb: 2 }}>
        Senior Designer
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
        {[
          { label: "Articles", value: "38" },
          { label: "Followers", value: "100k" },
          { label: "Rating", value: "4.9" },
        ].map((s) => (
          <Box key={s.label} sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: fgColor, lineHeight: 1.2 }}>
              {s.value}
            </Typography>
            <Typography variant="caption" sx={{ color: fgColor, opacity: 0.5 }}>
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function NavBarTemplate({ fgColor }: { fgColor: string }) {
  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 2, width: "100%",
      px: 1,
    }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: fgColor, mr: "auto" }}>
        GlassUI
      </Typography>
      {["Home", "About", "Services"].map((item) => (
        <Typography
          key={item}
          variant="body2"
          sx={{ color: fgColor, opacity: 0.75, cursor: "pointer", "&:hover": { opacity: 1 } }}
        >
          {item}
        </Typography>
      ))}
      <Box
        sx={{
          px: 2, py: 0.5, borderRadius: 1.5,
          background: "rgba(99, 102, 241, 0.85)",
          color: "#fff", fontSize: 12, fontWeight: 600,
        }}
      >
        Contact
      </Box>
    </Box>
  );
}

function StatsTemplate({ fgColor }: { fgColor: string }) {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="body2" sx={{ color: fgColor, opacity: 0.6, mb: 0.5 }}>
        Total Revenue
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color: fgColor, lineHeight: 1.1 }}>
        $45,231
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, mb: 2 }}>
        <Box
          sx={{
            px: 0.75, py: 0.125, borderRadius: 0.5,
            background: "rgba(16, 185, 129, 0.2)", color: "#10b981",
            fontSize: 11, fontWeight: 600,
          }}
        >
          +20.1%
        </Box>
        <Typography variant="caption" sx={{ color: fgColor, opacity: 0.5 }}>
          from last month
        </Typography>
      </Box>
      <Box sx={{ width: "100%", height: 8, borderRadius: 4, background: "rgba(128,128,128,0.15)" }}>
        <Box sx={{ width: "72%", height: "100%", borderRadius: 4, background: "rgba(99, 102, 241, 0.7)" }} />
      </Box>
    </Box>
  );
}

const TEMPLATES: Record<PreviewTemplate, React.FC<{ fgColor: string }>> = {
  card: CardTemplate,
  profile: ProfileTemplate,
  navBar: NavBarTemplate,
  stats: StatsTemplate,
};

// ─── Main Preview ──────────────────────────────────────────────────────

interface GlassPreviewProps {
  config: GlassConfig;
}

export function GlassPreview({ config }: GlassPreviewProps) {
  const { container, background, isNeumorphism, surfaceColor } = computeGlassStyles(config);
  const Template = TEMPLATES[config.previewTemplate];

  // Determine text color based on surface
  const fgColor = isNeumorphism
    ? surfaceColor === "#2d2d2d" ? "#ffffff" : "#333333"
    : config.backgroundColor === "#000000" ? "#ffffff" : "#333333";

  const isNavBar = config.previewTemplate === "navBar";

  // Image takes priority over gradient
  const bgImage = config.backgroundImage || background;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: isNavBar ? 180 : 380,
        borderRadius: 2,
        overflow: "hidden",
        backgroundImage: bgImage.startsWith("http") || bgImage.startsWith("blob:") || bgImage.startsWith("data:")
          ? `url(${bgImage})`
          : bgImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 4,
      }}
    >
      {/* Background decorative circles */}
      {!isNeumorphism && (
        <>
          <Box sx={{
            position: "absolute", top: "10%", left: "10%",
            width: 120, height: 120, borderRadius: "50%",
            background: "rgba(255, 107, 107, 0.35)", filter: "blur(40px)",
          }} />
          <Box sx={{
            position: "absolute", bottom: "15%", right: "10%",
            width: 100, height: 100, borderRadius: "50%",
            background: "rgba(72, 219, 251, 0.35)", filter: "blur(40px)",
          }} />
        </>
      )}

      {/* Glass element */}
      <Box
        sx={{
          width: isNavBar ? "95%" : "75%",
          maxWidth: isNavBar ? 520 : 380,
          minHeight: isNavBar ? "auto" : 180,
          ...container,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: isNavBar ? "stretch" : "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Template fgColor={fgColor} />
      </Box>

      {/* Parameter badges */}
      {!isNavBar && (
        <Box sx={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 0.75 }}>
          {isNeumorphism ? (
            <>
              <ParamBadge label={`d: ${config.neumorphDistance}`} />
              <ParamBadge label={`blur: ${config.neumorphBlur}`} />
              <ParamBadge label={config.neumorphInset ? "inset" : "raised"} />
            </>
          ) : (
            <>
              <ParamBadge label={`blur: ${config.blur}px`} />
              <ParamBadge label={`opacity: ${config.opacity}`} />
              <ParamBadge label={`radius: ${config.borderRadius}px`} />
            </>
          )}
        </Box>
      )}
    </Box>
  );
}

function ParamBadge({ label }: { label: string }) {
  return (
    <Box
      sx={{
        px: 1.25, py: 0.25,
        bgcolor: "rgba(0,0,0,0.5)", borderRadius: 0.75,
        color: "#fff", fontSize: 11, fontWeight: 500,
      }}
    >
      {label}
    </Box>
  );
}
