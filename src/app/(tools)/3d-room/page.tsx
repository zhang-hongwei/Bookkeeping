"use client";

import React, { useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";
import { ViewInAr } from "@mui/icons-material";
import ControlPanel from "./components/ControlPanel";
import DeviceInfoPanel from "./components/DeviceInfoPanel";
import type { SceneConfig, DeviceInfo } from "./components/RoomScene";
import * as THREE from "three";

// Dynamic import to avoid SSR issues with Three.js
const RoomCanvas = dynamic(() => import("./components/RoomScene"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Loading 3D Scene...
      </Typography>
    </Box>
  ),
});

const defaultConfig: SceneConfig = {
  ambientIntensity: 0.6,
  lightColor: "#fffaf0",
  lightIntensity: 1.2,
  weather: "sunny",
  timeOfDay: 14,
  showDevices: true,
  showGrid: true,
};

export default function Room3DPage() {
  const [config, setConfig] = useState<SceneConfig>(defaultConfig);
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [cameraPosition, setCameraPosition] = useState({ x: 8, y: 6, z: 8 });

  const handleConfigChange = useCallback((partial: Partial<SceneConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleCameraChange = useCallback((pos: THREE.Vector3) => {
    setCameraPosition({ x: pos.x, y: pos.y, z: pos.z });
  }, []);

  // Import DEVICES at render to avoid circular dependency
  // We'll use a local copy
  const devices: DeviceInfo[] = [
    {
      id: "projector-01",
      name: "Projector",
      type: "projection",
      position: [0, 2.8, -3.5],
      status: "online",
      params: {
        model: "Epson EB-L200F",
        resolution: "1920x1080",
        brightness: "4500 lumens",
        lamp_hours: 1240,
        temperature: "42°C",
        wifi: "Connected",
      },
    },
    {
      id: "screen-01",
      name: "Smart Screen",
      type: "display",
      position: [0, 1.8, -4.4],
      status: "online",
      params: {
        model: "Samsung Flip Pro",
        size: '85"',
        resolution: "3840x2160",
        input: "HDMI 1",
        brightness: "350 nits",
      },
    },
    {
      id: "ac-01",
      name: "Air Conditioner",
      type: "climate",
      position: [-4.4, 2.5, 0],
      status: "online",
      params: {
        model: "Daikin FVXM",
        mode: "Cooling",
        set_temp: "24°C",
        current_temp: "23.5°C",
        humidity: "45%",
        fan_speed: "Auto",
        power: "1.2 kW",
      },
    },
    {
      id: "light-01",
      name: "Ceiling Light (Main)",
      type: "lighting",
      position: [0, 2.95, 0],
      status: "online",
      params: {
        model: "Philips Hue Panel",
        brightness: "80%",
        color_temp: "4000K",
        power: "36W",
        zone: "Main Area",
      },
    },
    {
      id: "light-02",
      name: "Ceiling Light (Side L)",
      type: "lighting",
      position: [-2.5, 2.95, 0],
      status: "online",
      params: {
        model: "Philips Hue Panel",
        brightness: "75%",
        color_temp: "4000K",
        power: "36W",
        zone: "Left Side",
      },
    },
    {
      id: "light-03",
      name: "Ceiling Light (Side R)",
      type: "lighting",
      position: [2.5, 2.95, 0],
      status: "warning",
      params: {
        model: "Philips Hue Panel",
        brightness: "60%",
        color_temp: "4000K",
        power: "36W",
        zone: "Right Side",
        warning: "Lamp life expiring soon",
      },
    },
    {
      id: "camera-01",
      name: "Conference Camera",
      type: "video",
      position: [0, 2.2, -4.4],
      status: "online",
      params: {
        model: "Logitech Rally Bar",
        resolution: "4K",
        fov: "90°",
        mic_range: "8m",
        zoom: "15x",
        status: "In Meeting",
      },
    },
    {
      id: "speaker-01",
      name: "Speaker System",
      type: "audio",
      position: [3.5, 0.5, -4.2],
      status: "online",
      params: {
        model: "JBL Charge 5",
        volume: "65%",
        connection: "Bluetooth 5.1",
        battery: "80%",
      },
    },
    {
      id: "sensor-01",
      name: "Environment Sensor",
      type: "sensor",
      position: [4.2, 1.5, 0],
      status: "online",
      params: {
        model: "Bosch BME680",
        temperature: "23.5°C",
        humidity: "45%",
        co2: "520 ppm",
        noise: "35 dB",
        air_quality: "Good",
      },
    },
    {
      id: "router-01",
      name: "Network Router",
      type: "network",
      position: [-4.2, 0.3, -3],
      status: "online",
      params: {
        model: "Ubiquiti UDM Pro",
        bandwidth: "1 Gbps",
        connected: 12,
        uptime: "45d 12h",
        signal: "Strong",
      },
    },
  ];

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      {/* Top Bar */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: 1,
          borderColor: "divider",
          zIndex: 20,
        }}
      >
        <ViewInAr sx={{ fontSize: 28, color: "primary.main" }} />
        <Box>
          <Typography variant="h6" fontWeight={700}>
            3D Conference Room
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Digital Twin Platform — Real-time monitoring &amp; device management
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
          {devices.filter((d) => d.status === "online").length}/{devices.length} devices online
        </Typography>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* 3D Canvas */}
        <Box sx={{ flex: 1, position: "relative" }}>
          <Suspense
            fallback={
              <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CircularProgress />
              </Box>
            }
          >
            <RoomCanvas
              config={config}
              selectedDevice={selectedDevice}
              onSelectDevice={setSelectedDevice}
              onCameraChange={handleCameraChange}
            />
          </Suspense>

          {/* Device info overlay */}
          {selectedDevice && (
            <DeviceInfoPanel device={selectedDevice} onClose={() => setSelectedDevice(null)} />
          )}
        </Box>

        {/* Control Panel Sidebar */}
        <Box
          sx={{
            width: 320,
            borderLeft: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            overflow: "hidden",
          }}
        >
          <ControlPanel
            config={config}
            onConfigChange={handleConfigChange}
            devices={devices}
            selectedDevice={selectedDevice}
            onSelectDevice={setSelectedDevice}
            cameraPosition={cameraPosition}
          />
        </Box>
      </Box>
    </Box>
  );
}
