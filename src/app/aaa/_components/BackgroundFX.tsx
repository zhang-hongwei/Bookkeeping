import { Box } from "@mui/material";
import { COLOR } from "../_config/site";

/**
 * Fixed full-viewport background: deep base color, three blurred radial
 * "glow" blobs (purple / blue / teal) and a faint grid that fades downward.
 * Purely decorative — `pointer-events: none` and `aria-hidden`.
 */
export default function BackgroundFX() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        background: COLOR.bg,
      }}
    >
      {/* Purple glow — top left */}
      <Box
        sx={{
          position: "absolute",
          top: "-18%",
          left: "-12%",
          width: "58vw",
          height: "58vw",
          background:
            "radial-gradient(circle, rgba(100,61,255,0.42), transparent 64%)",
          filter: "blur(60px)",
        }}
      />
      {/* Blue glow — top right */}
      <Box
        sx={{
          position: "absolute",
          top: "2%",
          right: "-14%",
          width: "52vw",
          height: "52vw",
          background:
            "radial-gradient(circle, rgba(0,166,255,0.34), transparent 64%)",
          filter: "blur(70px)",
        }}
      />
      {/* Teal glow — bottom center */}
      <Box
        sx={{
          position: "absolute",
          bottom: "-12%",
          left: "28%",
          width: "48vw",
          height: "48vw",
          background:
            "radial-gradient(circle, rgba(41,204,176,0.20), transparent 66%)",
          filter: "blur(80px)",
        }}
      />
      {/* Faint grid overlay, masked to fade toward the bottom */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 75% 60% at 50% 0%, #000 25%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 60% at 50% 0%, #000 25%, transparent 78%)",
        }}
      />
    </Box>
  );
}
