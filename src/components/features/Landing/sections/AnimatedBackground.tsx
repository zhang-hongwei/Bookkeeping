"use client";

import { Box, alpha, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Generate particles data once to avoid hydration mismatch
const generateParticles = () => {
  return [...Array(30)].map((_, i) => ({
    id: i,
    width: Math.random() * 4 + 2,
    height: Math.random() * 4 + 2,
    opacity: Math.random() * 0.5 + 0.2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    animateY: Math.random() * 100 - 50,
    animateX: Math.random() * 100 - 50,
    scale: Math.random() + 0.5,
    duration: Math.random() * 10 + 10,
  }));
};

// Generate floating orbs
const generateOrbs = () => {
  return [...Array(5)].map((_, i) => ({
    id: i,
    size: Math.random() * 300 + 200,
    left: Math.random() * 100,
    top: Math.random() * 100,
    color: i % 3 === 0 ? "primary" : i % 3 === 1 ? "secondary" : "success",
    duration: Math.random() * 20 + 15,
  }));
};

// Generate geometric shapes
const generateShapes = () => {
  return [...Array(8)].map((_, i) => ({
    id: i,
    size: Math.random() * 60 + 40,
    left: Math.random() * 100,
    top: Math.random() * 100,
    rotation: Math.random() * 360,
    duration: Math.random() * 15 + 10,
    shape: i % 3 === 0 ? "square" : i % 3 === 1 ? "triangle" : "circle",
  }));
};

export const AnimatedBackground = () => {
  const theme = useTheme();
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([]);
  const [orbs, setOrbs] = useState<ReturnType<typeof generateOrbs>>([]);
  const [shapes, setShapes] = useState<ReturnType<typeof generateShapes>>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Generate all elements only on client side after hydration
  useEffect(() => {
    setParticles(generateParticles());
    setOrbs(generateOrbs());
    setShapes(generateShapes());
    setIsMounted(true);
  }, []);

  // Don't render during SSR to avoid hydration mismatch
  if (!isMounted) {
    return (
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          background: `
            radial-gradient(ellipse at top, ${alpha(
              theme.palette.primary.main,
              0.15
            )} 0%, transparent 60%),
            radial-gradient(circle at 80% 20%, ${alpha(
              theme.palette.secondary.main,
              0.1
            )} 0%, transparent 50%)
          `,
        }}
      />
    );
  }

  const getShapeStyle = (shape: string) => {
    if (shape === "square") {
      return { borderRadius: "20%" };
    }
    if (shape === "triangle") {
      return {
        width: 0,
        height: 0,
        borderLeft: "30px solid transparent",
        borderRight: "30px solid transparent",
        borderBottom: `60px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      };
    }
    return { borderRadius: "50%" };
  };

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Grid Background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${alpha(theme.palette.divider, 0.03)} 1px, transparent 1px),
            linear-gradient(90deg, ${alpha(theme.palette.divider, 0.03)} 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          opacity: 0.5,
        }}
      />

      {/* Gradient Overlays */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse at top left, ${alpha(
              theme.palette.primary.main,
              0.15
            )} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(
              theme.palette.secondary.main,
              0.12
            )} 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, ${alpha(
              theme.palette.primary.main,
              0.08
            )} 0%, transparent 50%)
          `,
        }}
      />

      {/* Large Floating Orbs */}
      {orbs.map((orb) => (
        <motion.div
          key={`orb-${orb.id}`}
          style={{
            position: "absolute",
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(
              theme.palette[orb.color as keyof typeof theme.palette].main as string,
              0.2
            )} 0%, transparent 70%)`,
            left: `${orb.left}%`,
            top: `${orb.top}%`,
            filter: "blur(60px)",
          }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 60, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Geometric Shapes */}
      {shapes.map((shape) => (
        <motion.div
          key={`shape-${shape.id}`}
          style={{
            position: "absolute",
            width: shape.shape === "triangle" ? 0 : shape.size,
            height: shape.shape === "triangle" ? 0 : shape.size,
            left: `${shape.left}%`,
            top: `${shape.top}%`,
            background:
              shape.shape !== "triangle"
                ? alpha(theme.palette.primary.main, 0.08)
                : undefined,
            ...getShapeStyle(shape.shape),
          }}
          animate={{
            rotate: [shape.rotation, shape.rotation + 360],
            y: [0, -30, 30, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Small Particles */}
      {particles.map((particle) => (
        <motion.div
          key={`particle-${particle.id}`}
          style={{
            position: "absolute",
            width: particle.width,
            height: particle.height,
            borderRadius: "50%",
            background: theme.palette.primary.main,
            opacity: particle.opacity,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, particle.animateY],
            x: [0, particle.animateX],
            scale: [1, particle.scale, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Decorative Lines */}
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: "200px",
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${alpha(
            theme.palette.primary.main,
            0.3
          )}, transparent)`,
          transform: "rotate(-15deg)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "30%",
          right: "15%",
          width: "150px",
          height: "2px",
          background: `linear-gradient(90deg, transparent, ${alpha(
            theme.palette.secondary.main,
            0.3
          )}, transparent)`,
          transform: "rotate(25deg)",
        }}
      />
    </Box>
  );
};
