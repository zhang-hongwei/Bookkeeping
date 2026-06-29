"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
} from "@react-three/drei";
import * as THREE from "three";

// ── Types ──────────────────────────────────────────────
export interface DeviceInfo {
  id: string;
  name: string;
  type: string;
  position: [number, number, number];
  status: "online" | "offline" | "warning";
  params: Record<string, string | number>;
}

export interface SceneConfig {
  ambientIntensity: number;
  lightColor: string;
  lightIntensity: number;
  weather: "sunny" | "cloudy" | "rain" | "snow";
  timeOfDay: number; // 0-24
  showDevices: boolean;
  showGrid: boolean;
}

interface RoomSceneProps {
  config: SceneConfig;
  selectedDevice: DeviceInfo | null;
  onSelectDevice: (device: DeviceInfo | null) => void;
  onCameraChange?: (position: THREE.Vector3) => void;
}

// ── Device Data ────────────────────────────────────────
export const DEVICES: DeviceInfo[] = [
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

  // ── Room Dimensions ───────────────────────────────────
  const ROOM = { width: 10, height: 3, depth: 10 };
  // const WALL_THICKNESS = 0.15;

  // ── Helper: Weather sky color ─────────────────────────
  function getSkyColor(weather: SceneConfig["weather"], time: number): string {
    const dayFactor = Math.max(0, Math.sin(((time - 6) / 12) * Math.PI));

    const colors: Record<string, string> = {
      sunny: `rgb(${135 + dayFactor * 80}, ${206 + dayFactor * 30}, ${235 + dayFactor * 15})`,
      cloudy: `rgb(${149 + dayFactor * 40}, ${165 + dayFactor * 30}, ${180 + dayFactor * 20})`,
      rain: `rgb(${100 + dayFactor * 30}, ${110 + dayFactor * 25}, ${130 + dayFactor * 20})`,
      snow: `rgb(${200 + dayFactor * 40}, ${210 + dayFactor * 35}, ${225 + dayFactor * 25})`,
    };
    return colors[weather];
  }

  function getSunIntensity(time: number): number {
    return Math.max(0.1, Math.sin(((time - 6) / 12) * Math.PI));
  }

  // ── Room Shell ────────────────────────────────────────
  function RoomShell() {
    const wallColor = "#e8e0d8";
    const floorColor = "#8b7355";

    return (
      <group>
        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[ROOM.width, ROOM.depth]} />
          <meshStandardMaterial color={floorColor} roughness={0.7} metalness={0.1} />
        </mesh>

        {/* Floor grid lines */}
        {Array.from({ length: 21 }).map((_, i) => {
          const pos = -ROOM.width / 2 + (i * ROOM.width) / 20;
          return (
            <group key={`grid-${i}`}>
              <mesh position={[pos, 0.001, 0]}>
                <boxGeometry args={[0.005, 0.002, ROOM.depth]} />
                <meshBasicMaterial color="#9c8a6e" transparent opacity={0.3} />
              </mesh>
              <mesh position={[0, 0.001, pos]}>
                <boxGeometry args={[ROOM.width, 0.002, 0.005]} />
                <meshBasicMaterial color="#9c8a6e" transparent opacity={0.3} />
              </mesh>
            </group>
          );
        })}

        {/* Ceiling */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.height, 0]}>
          <planeGeometry args={[ROOM.width, ROOM.depth]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
        </mesh>

        {/* Back Wall */}
        <mesh position={[0, ROOM.height / 2, -ROOM.depth / 2]}>
          <planeGeometry args={[ROOM.width, ROOM.height]} />
          <meshStandardMaterial color={wallColor} roughness={0.85} />
        </mesh>

        {/* Front Wall (with door opening) */}
        {/* Left section */}
        <mesh position={[-3, ROOM.height / 2, ROOM.depth / 2]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[4, ROOM.height]} />
          <meshStandardMaterial color={wallColor} roughness={0.85} />
        </mesh>
        {/* Right section */}
        <mesh position={[3, ROOM.height / 2, ROOM.depth / 2]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[4, ROOM.height]} />
          <meshStandardMaterial color={wallColor} roughness={0.85} />
        </mesh>
        {/* Above door */}
        <mesh position={[0, 2.65, ROOM.depth / 2]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[2, 0.7]} />
          <meshStandardMaterial color={wallColor} roughness={0.85} />
        </mesh>

        {/* Left Wall */}
        <mesh position={[-ROOM.width / 2, ROOM.height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[ROOM.depth, ROOM.height]} />
          <meshStandardMaterial color={wallColor} roughness={0.85} />
        </mesh>

        {/* Right Wall - with window */}
        {/* Section below window */}
        <mesh position={[ROOM.width / 2, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[ROOM.depth, 1]} />
          <meshStandardMaterial color={wallColor} roughness={0.85} />
        </mesh>
        {/* Section above window */}
        <mesh position={[ROOM.width / 2, 2.65, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[ROOM.depth, 0.7]} />
          <meshStandardMaterial color={wallColor} roughness={0.85} />
        </mesh>
        {/* Window left */}
        <mesh position={[ROOM.width / 2, 1.5, -2.5]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1, 2.3]} />
          <meshStandardMaterial color={wallColor} roughness={0.85} />
        </mesh>
        {/* Window right */}
        <mesh position={[ROOM.width / 2, 1.5, 2.5]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1, 2.3]} />
          <meshStandardMaterial color={wallColor} roughness={0.85} />
        </mesh>

        {/* Window glass */}
        <mesh position={[ROOM.width / 2 - 0.02, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[5, 2.3]} />
          <meshPhysicalMaterial
            color="#b3d9ff"
            transparent
            opacity={0.25}
            roughness={0.05}
            metalness={0.1}
            transmission={0.8}
          />
        </mesh>

        {/* Window frame */}
        {/* Horizontal bars */}
        <mesh position={[ROOM.width / 2 - 0.03, 1.5, 0]}>
          <boxGeometry args={[0.05, 0.04, 5]} />
          <meshStandardMaterial color="#666" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[ROOM.width / 2 - 0.03, 2.3, 0]}>
          <boxGeometry args={[0.05, 0.04, 5]} />
          <meshStandardMaterial color="#666" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Vertical bars */}
        {[-1.2, 0, 1.2].map((z, i) => (
          <mesh key={`wbar-${i}`} position={[ROOM.width / 2 - 0.03, 1.5, z]}>
            <boxGeometry args={[0.05, 2.3, 0.04]} />
            <meshStandardMaterial color="#666" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}

        {/* Baseboard */}
        {[
          [0, 0.06, -ROOM.depth / 2 + 0.07, ROOM.width, 0.12, 0.08],
          [-3, 0.06, ROOM.depth / 2 - 0.07, 4, 0.12, 0.08],
          [3, 0.06, ROOM.depth / 2 - 0.07, 4, 0.12, 0.08],
          [-ROOM.width / 2 + 0.07, 0.06, 0, 0.08, 0.12, ROOM.depth],
          [ROOM.width / 2 - 0.07, 0.06, 0, 0.08, 0.12, ROOM.depth],
        ].map(([x, y, z, w, h, d], i) => (
          <mesh key={`base-${i}`} position={[x as number, y as number, z as number]}>
            <boxGeometry args={[w as number, h as number, d as number]} />
            <meshStandardMaterial color="#5a4a3a" roughness={0.8} />
          </mesh>
        ))}
      </group>
    );
  }

  // ── Conference Table ──────────────────────────────────
  function ConferenceTable() {
    return (
      <group position={[0, 0, 0]}>
        {/* Table top - oval shape */}
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.6, 0.06, 1.4]} />
          <meshStandardMaterial color="#5c4033" roughness={0.4} metalness={0.1} />
        </mesh>
        {/* Table edge highlight */}
        <mesh position={[0, 0.74, 0]}>
          <boxGeometry args={[3.62, 0.02, 1.42]} />
          <meshStandardMaterial color="#4a3428" roughness={0.5} />
        </mesh>
        {/* Table legs */}
        {[
          [-1.5, -0.5],
          [-1.5, 0.5],
          [1.5, -0.5],
          [1.5, 0.5],
        ].map(([x, z], i) => (
          <mesh key={`leg-${i}`} position={[x, 0.375, z]} castShadow>
            <boxGeometry args={[0.08, 0.75, 0.08]} />
            <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {/* Cable management tray */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2.5, 0.04, 0.4]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
    );
  }

  // ── Chair ─────────────────────────────────────────────
  function Chair({ position, rotation }: { position: [number, number, number]; rotation?: number }) {
    return (
      <group position={position} rotation={[0, rotation ?? 0, 0]}>
        {/* Seat */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.5, 0.06, 0.5]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.6} />
        </mesh>
        {/* Back */}
        <mesh position={[0, 0.75, -0.22]} castShadow>
          <boxGeometry args={[0.5, 0.55, 0.06]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.6} />
        </mesh>
        {/* Base pole */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.44, 8]} />
          <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Base star */}
        {[0, 72, 144, 216, 288].map((deg, i) => (
          <mesh
            key={`base-${i}`}
            position={[Math.sin((deg * Math.PI) / 180) * 0.15, 0.02, Math.cos((deg * Math.PI) / 180) * 0.15]}
            rotation={[0, (deg * Math.PI) / 180, 0]}
          >
            <boxGeometry args={[0.25, 0.03, 0.04]} />
            <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
        {/* Wheels */}
        {[0, 72, 144, 216, 288].map((deg, i) => (
          <mesh
            key={`wheel-${i}`}
            position={[Math.sin((deg * Math.PI) / 180) * 0.28, 0.03, Math.cos((deg * Math.PI) / 180) * 0.28]}
          >
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
      </group>
    );
  }

  // ── Chairs Arrangement ────────────────────────────────
  function Chairs() {
    const chairs: { pos: [number, number, number]; rot: number }[] = [
      // Left side
      { pos: [-1.2, 0, 1], rot: Math.PI },
      { pos: [-0.4, 0, 1], rot: Math.PI },
      { pos: [0.4, 0, 1], rot: Math.PI },
      { pos: [1.2, 0, 1], rot: Math.PI },
      // Right side
      { pos: [-1.2, 0, -1], rot: 0 },
      { pos: [-0.4, 0, -1], rot: 0 },
      { pos: [0.4, 0, -1], rot: 0 },
      { pos: [1.2, 0, -1], rot: 0 },
      // Ends
      { pos: [-2, 0, 0], rot: Math.PI / 2 },
      { pos: [2, 0, 0], rot: -Math.PI / 2 },
    ];
    return (
      <group>
        {chairs.map((c, i) => (
          <Chair key={i} position={c.pos} rotation={c.rot} />
        ))}
      </group>
    );
  }

  // ── Projector Screen ──────────────────────────────────
  function ProjectorScreen() {
    return (
      <group position={[0, 1.5, -4.7]}>
        {/* Screen */}
        <mesh>
          <boxGeometry args={[2.4, 1.6, 0.03]} />
          <meshStandardMaterial color="#1a1a2e" emissive="#1a1a2e" emissiveIntensity={0.3} />
        </mesh>
        {/* Screen content (simulated) */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[2.2, 1.4]} />
          <meshStandardMaterial
            color="#2563eb"
            emissive="#2563eb"
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.5, 1.7, 0.02]} />
          <meshStandardMaterial color="#333" metalness={0.5} />
        </mesh>
        {/* Mount bar */}
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[2.6, 0.05, 0.06]} />
          <meshStandardMaterial color="#555" metalness={0.6} />
        </mesh>
      </group>
    );
  }

  // ── AC Unit ───────────────────────────────────────────
  function ACUnit() {
    return (
      <group position={[-4.7, 2.3, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.3, 0.25]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Vent */}
        <mesh position={[0, -0.12, 0.13]}>
          <boxGeometry args={[1.0, 0.04, 0.01]} />
          <meshStandardMaterial color="#ddd" />
        </mesh>
        {/* LED indicator */}
        <mesh position={[0.5, 0.05, 0.13]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
        </mesh>
      </group>
    );
  }

  // ── Ceiling Light Panel ───────────────────────────────
  function CeilingLight({ position }: { position: [number, number, number] }) {
    return (
      <group position={position}>
        {/* Housing */}
        <mesh>
          <boxGeometry args={[0.6, 0.05, 0.6]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.3} roughness={0.5} />
        </mesh>
        {/* Light panel */}
        <mesh position={[0, -0.03, 0]}>
          <boxGeometry args={[0.55, 0.01, 0.55]} />
          <meshStandardMaterial
            color="#fff"
            emissive="#fffaf0"
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>
    );
  }

  // ── Device Marker ─────────────────────────────────────
  function DeviceMarker({
    device,
    isSelected,
    onClick,
  }: {
    device: DeviceInfo;
    isSelected: boolean;
    onClick: () => void;
  }) {
    const ref = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
      if (ref.current) {
        ref.current.position.y =
          device.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05 + 0.15;
      }
    });

    const statusColor = device.status === "online" ? "#00e676" : device.status === "warning" ? "#ffab00" : "#ff1744";

    return (
      <group position={device.position}>
        {/* Marker pin */}
        <mesh
          ref={ref}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color={isSelected ? "#2196f3" : statusColor}
            emissive={isSelected ? "#2196f3" : statusColor}
            emissiveIntensity={hovered ? 2.5 : 1.5}
          />
        </mesh>

        {/* Pulse ring */}
        {!isSelected && (
          <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.18, 32]} />
            <meshBasicMaterial color={statusColor} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Label */}
        {(hovered || isSelected) && (
          <Html position={[0, 0.4, 0]} center distanceFactor={8}>
            <div
              style={{
                background: "rgba(0,0,0,0.85)",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 12,
                whiteSpace: "nowrap",
                fontFamily: "system-ui",
                pointerEvents: "none",
                border: `1px solid ${statusColor}`,
              }}
            >
              {device.name}
              <span style={{ marginLeft: 6, opacity: 0.7 }}>
                {device.status.toUpperCase()}
              </span>
            </div>
          </Html>
        )}
      </group>
    );
  }

  // ── Weather Particles ─────────────────────────────────
  function WeatherParticles({ weather }: { weather: SceneConfig["weather"] }) {
    const count = weather === "rain" ? 800 : weather === "snow" ? 400 : 0;
    const ref = useRef<THREE.Points>(null);

    const positions = useMemo(() => {
      if (count === 0) return new Float32Array(0);
      const arr = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        arr[i * 3] = (Math.random() - 0.5) * 20;
        arr[i * 3 + 1] = Math.random() * 8;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
      }
      return arr;
    }, [count]);

    useFrame((_, delta) => {
      if (!ref.current || count === 0) return;
      const pos = ref.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        const speed = weather === "rain" ? 15 : 1.5;
        pos.setY(i, pos.getY(i) - speed * delta);
        if (weather === "snow") {
          pos.setX(i, pos.getX(i) + Math.sin(Date.now() * 0.001 + i) * 0.005);
        }
        if (pos.getY(i) < 0) {
          pos.setY(i, 8);
        }
      }
      pos.needsUpdate = true;
    });

    if (count === 0) return null;

    return (
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={count}
          />
        </bufferGeometry>
        <pointsMaterial
          size={weather === "rain" ? 0.03 : 0.08}
          color={weather === "rain" ? "#8ab4f8" : "#fff"}
          transparent
          opacity={weather === "rain" ? 0.6 : 0.8}
          sizeAttenuation
        />
      </points>
    );
  }

  // ── Camera Controller ─────────────────────────────────
  function CameraTracker({ onCameraChange }: { onCameraChange: (pos: THREE.Vector3) => void }) {
    const { camera } = useThree();
    const lastUpdate = useRef(0);

    useFrame(() => {
      const now = Date.now();
      if (now - lastUpdate.current > 200) {
        lastUpdate.current = now;
        onCameraChange(camera.position.clone());
      }
    });

    return null;
  }

  // ── Main Scene ────────────────────────────────────────
  function Scene({ config, selectedDevice, onSelectDevice, onCameraChange }: RoomSceneProps) {
    const sunIntensity = getSunIntensity(config.timeOfDay);
    const sunAngle = ((config.timeOfDay - 6) / 12) * Math.PI;

    return (
      <>
        {/* Lighting */}
        <ambientLight intensity={config.ambientIntensity * sunIntensity} />
        <directionalLight
          position={[Math.cos(sunAngle) * 10, Math.sin(sunAngle) * 10 + 3, 5]}
          intensity={config.lightIntensity * sunIntensity}
          color={config.lightColor}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        {/* Interior point lights */}
        <pointLight position={[0, 2.5, 0]} intensity={1.5} color="#fffaf0" distance={8} />
        <pointLight position={[-2.5, 2.5, 0]} intensity={1} color="#fffaf0" distance={6} />
        <pointLight position={[2.5, 2.5, 0]} intensity={1} color="#fffaf0" distance={6} />

        {/* Sky color */}
        <color attach="background" args={[getSkyColor(config.weather, config.timeOfDay)]} />
        <fog attach="fog" args={[getSkyColor(config.weather, config.timeOfDay), 15, 30]} />

        {/* Room */}
        <RoomShell />
        <ConferenceTable />
        <Chairs />
        <ProjectorScreen />
        <ACUnit />

        {/* Ceiling lights */}
        <CeilingLight position={[0, 2.95, 0]} />
        <CeilingLight position={[-2.5, 2.95, 0]} />
        <CeilingLight position={[2.5, 2.95, 0]} />

        {/* Device markers */}
        {config.showDevices &&
          DEVICES.map((device) => (
            <DeviceMarker
              key={device.id}
              device={device}
              isSelected={selectedDevice?.id === device.id}
              onClick={() => onSelectDevice(selectedDevice?.id === device.id ? null : device)}
            />
          ))}

        {/* Weather effects */}
        <WeatherParticles weather={config.weather} />

        {/* Camera */}
        <OrbitControls
          makeDefault
          minDistance={2}
          maxDistance={18}
          maxPolarAngle={Math.PI / 2 + 0.1}
          enableDamping
          dampingFactor={0.05}
          target={[0, 1.2, 0]}
        />
        <CameraTracker onCameraChange={onCameraChange ?? (() => {})} />

        {/* Ground outside */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#7caa5c" roughness={1} />
        </mesh>
      </>
    );
  }

  // ── Exported Component ────────────────────────────────
  export default function RoomCanvas(props: RoomSceneProps) {
    return (
      <Canvas
        shadows
        camera={{ position: [8, 6, 8], fov: 50, near: 0.1, far: 100 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <Scene {...props} />
      </Canvas>
    );
  }
