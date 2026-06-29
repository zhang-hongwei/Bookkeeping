"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// ── Types ──────────────────────────────────────────────
interface MacWindow {
  id: number;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
}

type AppId = "finder" | "simpletext" | "calculator" | "about" | "scrapbook" | "puzzle";

let winId = 0;
const nextWinId = () => ++winId;
let topZ = 10;

const APP_TITLES: Record<AppId, string> = {
  finder: "Macintosh HD",
  simpletext: "SimpleText",
  calculator: "Calculator",
  about: "About This Macintosh",
  scrapbook: "Scrapbook",
  puzzle: "Puzzle",
};

const APP_SIZES: Record<AppId, { w: number; h: number }> = {
  finder: { w: 340, h: 280 },
  simpletext: { w: 360, h: 300 },
  calculator: { w: 180, h: 260 },
  about: { w: 320, h: 220 },
  scrapbook: { w: 320, h: 240 },
  puzzle: { w: 240, h: 280 },
};

// ── Desktop icons ──────────────────────────────────────
const DESKTOP_ICONS = [
  { id: "finder" as AppId, label: "Macintosh HD", icon: "💾", x: 30, y: 30 },
  { id: "simpletext" as AppId, label: "SimpleText", icon: "📝", x: 30, y: 110 },
  { id: "calculator" as AppId, label: "Calculator", icon: "🔢", x: 30, y: 190 },
  { id: "scrapbook" as AppId, label: "Scrapbook", icon: "✂️", x: 30, y: 270 },
  { id: "puzzle" as AppId, label: "Puzzle", icon: "🧩", x: 30, y: 350 },
];

// ── Menu bar items ─────────────────────────────────────
const MENU_ITEMS = ["File", "Edit", "View", "Special"];

// ── Component ──────────────────────────────────────────
export default function MacClassicPage() {
  const [windows, setWindows] = useState<MacWindow[]>([]);
  const [activeWinId, setActiveWinId] = useState<number | null>(null);
  const [dragging, setDragging] = useState<{ winId: number; offsetX: number; offsetY: number } | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<AppId | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [openApp, setOpenApp] = useState<AppId | null>(null);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcMemory, setCalcMemory] = useState<string | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [puzzleTiles, setPuzzleTiles] = useState<number[]>([]);
  const [scrapPage, setScrapPage] = useState(0);

  const desktopRef = useRef<HTMLDivElement>(null);

  // Init puzzle
  useEffect(() => {
    const tiles = Array.from({ length: 15 }, (_, i) => i + 1);
    tiles.push(0);
    // Shuffle with valid moves
    let empty = 15;
    for (let i = 0; i < 200; i++) {
      const moves: number[] = [];
      if (empty % 4 !== 0) moves.push(empty - 1);
      if (empty % 4 !== 3) moves.push(empty + 1);
      if (empty >= 4) moves.push(empty - 4);
      if (empty < 12) moves.push(empty + 4);
      const pick = moves[Math.floor(Math.random() * moves.length)];
      [tiles[empty], tiles[pick]] = [tiles[pick], tiles[empty]];
      empty = pick;
    }
    setPuzzleTiles(tiles);
  }, []);

  // Close menu on click outside
  useEffect(() => {
    const handler = () => openMenu !== null && setOpenMenu(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [openMenu]);

  const openWindow = useCallback((appId: AppId) => {
    const size = APP_SIZES[appId];
    const existing = windows.find((w) => w.title === APP_TITLES[appId]);
    if (existing) {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === existing.id ? { ...w, minimized: false, zIndex: ++topZ } : w
        )
      );
      setActiveWinId(existing.id);
      setOpenApp(appId);
      return;
    }

    const id = nextWinId();
    const newWin: MacWindow = {
      id,
      title: APP_TITLES[appId],
      x: 80 + (id % 5) * 30,
      y: 40 + (id % 5) * 25,
      w: size.w,
      h: size.h,
      zIndex: ++topZ,
      minimized: false,
      maximized: false,
    };
    setWindows((prev) => [...prev, newWin]);
    setActiveWinId(id);
    setOpenApp(appId);
  }, [windows]);

  const closeWindow = useCallback((winId: number) => {
    setWindows((prev) => prev.filter((w) => w.id !== winId));
    setActiveWinId(null);
    setOpenApp(null);
  }, []);

  const focusWindow = useCallback((winId: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === winId ? { ...w, zIndex: ++topZ } : w))
    );
    setActiveWinId(winId);
  }, []);

  // Drag handlers
  const handleTitleMouseDown = useCallback(
    (e: React.MouseEvent, winId: number) => {
      e.stopPropagation();
      const win = windows.find((w) => w.id === winId);
      if (!win) return;
      setDragging({ winId, offsetX: e.clientX - win.x, offsetY: e.clientY - win.y });
      focusWindow(winId);
    },
    [windows, focusWindow]
  );

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === dragging.winId
            ? { ...w, x: e.clientX - dragging.offsetX, y: e.clientY - dragging.offsetY }
            : w
        )
      );
    };
    const handleUp = () => setDragging(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging]);

  // Double click on icon
  const handleIconDblClick = useCallback(
    (appId: AppId) => {
      openWindow(appId);
    },
    [openWindow]
  );

  // Calculator logic
  const calcPress = useCallback(
    (key: string) => {
      if (key >= "0" && key <= "9") {
        setCalcDisplay((prev) => (prev === "0" ? key : prev + key));
      } else if (key === "C") {
        setCalcDisplay("0");
        setCalcMemory(null);
        setCalcOp(null);
      } else if (key === "±") {
        setCalcDisplay((prev) => String(-parseFloat(prev)));
      } else if (key === ".") {
        setCalcDisplay((prev) => (prev.includes(".") ? prev : prev + "."));
      } else if (["+", "-", "×", "÷"].includes(key)) {
        setCalcMemory(calcDisplay);
        setCalcOp(key);
        setCalcDisplay("0");
      } else if (key === "=") {
        if (calcMemory && calcOp) {
          const a = parseFloat(calcMemory);
          const b = parseFloat(calcDisplay);
          let result = 0;
          switch (calcOp) {
            case "+": result = a + b; break;
            case "-": result = a - b; break;
            case "×": result = a * b; break;
            case "÷": result = b !== 0 ? a / b : 0; break;
          }
          setCalcDisplay(String(result));
          setCalcMemory(null);
          setCalcOp(null);
        }
      }
    },
    [calcDisplay, calcMemory, calcOp]
  );

  // Puzzle move
  const moveTile = useCallback((idx: number) => {
    setPuzzleTiles((prev) => {
      const empty = prev.indexOf(0);
      const row = Math.floor(idx / 4);
      const col = idx % 4;
      const eRow = Math.floor(empty / 4);
      const eCol = empty % 4;
      if (Math.abs(row - eRow) + Math.abs(col - eCol) !== 1) return prev;
      const next = [...prev];
      [next[idx], next[empty]] = [next[empty], next[idx]];
      return next;
    });
  }, []);

  const scrapPages = [
    { title: "MacPaint Drawing", content: "A beautiful pixel art landscape.\nMountains, sun, and a happy little tree.\n(MacPaint, 1984)" },
    { title: "Recipe Notes", content: "Mom's Apple Pie Recipe:\n- 6 large apples\n- 3/4 cup sugar\n- 2 tbsp cinnamon\n- Pie crust\nBake at 425°F for 45 min." },
    { title: "Phone Numbers", content: "Important numbers:\n\nMom: 555-0134\nDad: 555-0198\nPizza: 555-PIZZA\nBBS: 555-BBS1" },
  ];

  // ── Styles ───────────────────────────────────────────
  const macBlack = "#000000";
  const macWhite = "#FFFFFF";
  const macBg = "#DDDDDD";
  const macTitleInactive = "#CCCCCC";
  const macTitleActive = "#FFFFFF";

  return (
    <Box
      ref={desktopRef}
      sx={{
        width: "100vw",
        height: "100vh",
        bgcolor: macBg,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Chicago', 'Geneva', 'Verdana', sans-serif",
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Menu Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1,
          height: 22,
          bgcolor: macWhite,
          borderBottom: `1px solid #999`,
          flexShrink: 0,
          position: "relative",
          zIndex: 1000,
        }}
      >
        {/* Apple logo */}
        <Box
          sx={{
            px: 1,
            py: 0,
            fontSize: 14,
            cursor: "pointer",
            "&:active": { bgcolor: macBlack, color: macWhite },
          }}
          onClick={(e) => {
            e.stopPropagation();
            openWindow("about");
          }}
        >
          🍎
        </Box>

        {/* Menu items */}
        {MENU_ITEMS.map((item, i) => (
          <Typography
            key={item}
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === i ? null : i);
            }}
            sx={{
              fontFamily: "inherit",
              fontSize: 12,
              px: 1.5,
              py: 0.3,
              cursor: "pointer",
              bgcolor: openMenu === i ? macBlack : "transparent",
              color: openMenu === i ? macWhite : macBlack,
              "&:hover": { bgcolor: openMenu === i ? macBlack : "#eee" },
            }}
          >
            {item}
          </Typography>
        ))}

        {/* Right side: app name + clock */}
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontFamily: "inherit", fontSize: 12, color: macBlack, mr: 2 }}>
          {openApp ? APP_TITLES[openApp] : "Finder"}
        </Typography>
        <Typography sx={{ fontFamily: "inherit", fontSize: 12, color: macBlack }}>
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Typography>
      </Box>

      {/* Desktop area */}
      <Box sx={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Desktop pattern */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.03,
            backgroundImage:
              "repeating-linear-gradient(45deg, #000 0px, #000 1px, transparent 1px, transparent 10px)",
          }}
        />

        {/* Desktop Icons */}
        {DESKTOP_ICONS.map((icon) => (
          <Box
            key={icon.id}
            onDoubleClick={() => handleIconDblClick(icon.id)}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIcon(icon.id);
            }}
            sx={{
              position: "absolute",
              left: icon.x,
              top: icon.y,
              width: 70,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              bgcolor: selectedIcon === icon.id ? "#444" : "transparent",
              borderRadius: 1,
              p: 0.5,
            }}
          >
            <Box sx={{ fontSize: 32, lineHeight: 1 }}>{icon.icon}</Box>
            <Typography
              sx={{
                fontFamily: "inherit",
                fontSize: 9,
                color: macBlack,
                textAlign: "center",
                mt: 0.3,
                bgcolor: selectedIcon === icon.id ? macBlack : "transparent",
                color: selectedIcon === icon.id ? macWhite : macBlack,
                px: 0.5,
                borderRadius: 0.5,
                lineHeight: 1.2,
              }}
            >
              {icon.label}
            </Typography>
          </Box>
        ))}

        {/* Windows */}
        {windows.map((win) => {
          if (win.minimized) return null;
          const isActive = win.id === activeWinId;
          const appId = (Object.entries(APP_TITLES).find(([, t]) => t === win.title)?.[0] ?? "finder") as AppId;

          return (
            <Box
              key={win.id}
              onMouseDown={() => focusWindow(win.id)}
              sx={{
                position: "absolute",
                left: win.x,
                top: win.y,
                width: win.maximized ? "calc(100% - 20px)" : win.w,
                height: win.maximized ? "calc(100% - 10px)" : win.h,
                zIndex: win.zIndex,
                display: "flex",
                flexDirection: "column",
                border: "1px solid #000",
                borderRadius: "4px 4px 0 0",
                overflow: "hidden",
                boxShadow: "1px 1px 0 #999, 2px 2px 0 #888",
              }}
            >
              {/* Title bar */}
              <Box
                onMouseDown={(e) => handleTitleMouseDown(e, win.id)}
                sx={{
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  px: 0.5,
                  bgcolor: isActive ? "#EEEEEE" : macTitleInactive,
                  backgroundImage: isActive
                    ? "repeating-linear-gradient(90deg, transparent, transparent 1px, #ccc 1px, #ccc 2px)"
                    : "none",
                  backgroundBlendMode: "overlay",
                  borderBottom: "1px solid #999",
                  cursor: "default",
                  flexShrink: 0,
                }}
              >
                {/* Close box */}
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(win.id);
                  }}
                  sx={{
                    width: 13,
                    height: 13,
                    border: "1px solid #000",
                    bgcolor: macBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 8,
                    fontWeight: 700,
                    cursor: "pointer",
                    mr: 0.5,
                  }}
                >
                  ■
                </Box>

                {/* Title */}
                <Typography
                  sx={{
                    fontFamily: "inherit",
                    fontSize: 12,
                    fontWeight: 700,
                    textAlign: "center",
                    flex: 1,
                    color: macBlack,
                  }}
                >
                  {win.title}
                </Typography>

                {/* Zoom box */}
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    setWindows((prev) =>
                      prev.map((w) =>
                        w.id === win.id ? { ...w, maximized: !w.maximized } : w
                      )
                    );
                  }}
                  sx={{
                    width: 13,
                    height: 13,
                    border: "1px solid #000",
                    bgcolor: macBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 8,
                    fontWeight: 700,
                    cursor: "pointer",
                    ml: 0.5,
                  }}
                >
                  □
                </Box>
              </Box>

              {/* Window content */}
              <Box sx={{ flex: 1, bgcolor: macWhite, overflow: "auto", p: 1, position: "relative" }}>
                {appId === "finder" && (
                  <Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {[
                        { icon: "📁", label: "System Folder" },
                        { icon: "📁", label: "Applications" },
                        { icon: "📁", label: "Documents" },
                        { icon: "📄", label: "ReadMe" },
                        { icon: "📄", label: "Welcome" },
                      ].map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            width: 60,
                            cursor: "pointer",
                          }}
                        >
                          <Box sx={{ fontSize: 24 }}>{item.icon}</Box>
                          <Typography sx={{ fontFamily: "inherit", fontSize: 9, textAlign: "center", color: macBlack }}>
                            {item.label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {appId === "simpletext" && (
                  <Box>
                    <textarea
                      defaultValue={`Dear Macintosh User,

Welcome to SimpleText. This is where you can write letters, notes, and poems on your Macintosh.

The year is 1989. The Berlin Wall is about to fall. The World Wide Web doesn't exist yet. But you have this beautiful machine on your desk.

"Insanely great." — Steve Jobs

Enjoy computing!

- The Macintosh Team`}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        outline: "none",
                        resize: "none",
                        fontFamily: "'Geneva', 'Verdana', sans-serif",
                        fontSize: 12,
                        lineHeight: 1.6,
                        backgroundColor: "transparent",
                        color: "#000",
                      }}
                    />
                  </Box>
                )}

                {appId === "calculator" && (
                  <Box sx={{ p: 0.5 }}>
                    {/* Display */}
                    <Box
                      sx={{
                        bgcolor: "#CCFFCC",
                        border: "1px inset #999",
                        px: 1,
                        py: 0.5,
                        mb: 1,
                        textAlign: "right",
                        fontFamily: "inherit",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#000",
                      }}
                    >
                      {calcDisplay}
                    </Box>
                    {/* Buttons */}
                    {[
                      ["C", "±", "%", "÷"],
                      ["7", "8", "9", "×"],
                      ["4", "5", "6", "-"],
                      ["1", "2", "3", "+"],
                      ["0", ".", "=", "="],
                    ].map((row, ri) => (
                      <Box key={ri} sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
                        {row.map((key, ci) => (
                          <Box
                            key={`${ri}-${ci}`}
                            onClick={() => calcPress(key)}
                            sx={{
                              flex: key === "0" ? 2 : 1,
                              height: 24,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid #000",
                              borderBottom: "2px solid #666",
                              borderRight: "2px solid #666",
                              bgcolor: macBg,
                              fontFamily: "inherit",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              "&:active": {
                                borderBottom: "none",
                                borderRight: "none",
                                borderTop: "2px solid #666",
                                borderLeft: "2px solid #666",
                              },
                            }}
                          >
                            {key}
                          </Box>
                        ))}
                      </Box>
                    ))}
                  </Box>
                )}

                {appId === "about" && (
                  <Box sx={{ textAlign: "center", pt: 2 }}>
                    <Box sx={{ fontSize: 48, mb: 1 }}>🖥️</Box>
                    <Typography sx={{ fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: macBlack }}>
                      Macintosh Classic
                    </Typography>
                    <Typography sx={{ fontFamily: "inherit", fontSize: 11, color: "#333", mt: 0.5 }}>
                      System Software 6.0.8
                    </Typography>
                    <Typography sx={{ fontFamily: "inherit", fontSize: 11, color: "#333" }}>
                      Built-in ROM: 512K
                    </Typography>
                    <Typography sx={{ fontFamily: "inherit", fontSize: 11, color: "#333" }}>
                      Total Memory: 4,096K
                    </Typography>
                    <Typography sx={{ fontFamily: "inherit", fontSize: 11, color: "#333" }}>
                      Largest Free Block: 3,200K
                    </Typography>
                    <Box sx={{ mt: 2, borderTop: "1px solid #999", pt: 1 }}>
                      <Typography sx={{ fontFamily: "inherit", fontSize: 9, color: "#666" }}>
                        © Apple Computer, Inc. 1984-1989
                      </Typography>
                      <Typography sx={{ fontFamily: "inherit", fontSize: 9, color: "#666" }}>
                        All Rights Reserved
                      </Typography>
                    </Box>
                  </Box>
                )}

                {appId === "scrapbook" && (
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, borderBottom: "1px solid #ccc", pb: 0.5 }}>
                      <Typography sx={{ fontFamily: "inherit", fontSize: 11, fontWeight: 700 }}>
                        Page {scrapPage + 1} of {scrapPages.length}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Box
                          component="button"
                          onClick={() => setScrapPage((p) => Math.max(0, p - 1))}
                          sx={{ fontFamily: "inherit", fontSize: 10, px: 1, border: "1px solid #999", bgcolor: macBg, cursor: "pointer" }}
                        >
                          ◀ Prev
                        </Box>
                        <Box
                          component="button"
                          onClick={() => setScrapPage((p) => Math.min(scrapPages.length - 1, p + 1))}
                          sx={{ fontFamily: "inherit", fontSize: 10, px: 1, border: "1px solid #999", bgcolor: macBg, cursor: "pointer" }}
                        >
                          Next ▶
                        </Box>
                      </Box>
                    </Box>
                    <Typography sx={{ fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: macBlack, mb: 0.5 }}>
                      {scrapPages[scrapPage].title}
                    </Typography>
                    <Typography
                      sx={{ fontFamily: "inherit", fontSize: 11, color: "#333", whiteSpace: "pre-wrap", lineHeight: 1.6 }}
                    >
                      {scrapPages[scrapPage].content}
                    </Typography>
                  </Box>
                )}

                {appId === "puzzle" && (
                  <Box>
                    <Typography sx={{ fontFamily: "inherit", fontSize: 11, fontWeight: 700, color: macBlack, mb: 1, textAlign: "center" }}>
                      15-Puzzle
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0.5 }}>
                      {puzzleTiles.map((tile, idx) => (
                        <Box
                          key={idx}
                          onClick={() => tile !== 0 && moveTile(idx)}
                          sx={{
                            height: 40,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: tile === 0 ? "transparent" : macBg,
                            border: tile === 0 ? "none" : "1px solid #000",
                            borderBottom: tile === 0 ? "none" : "2px solid #666",
                            borderRight: tile === 0 ? "none" : "2px solid #666",
                            fontFamily: "inherit",
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: tile === 0 ? "default" : "pointer",
                            "&:active": tile !== 0
                              ? { borderBottom: "none", borderRight: "none", borderTop: "2px solid #666", borderLeft: "2px solid #666" }
                              : {},
                          }}
                        >
                          {tile || ""}
                        </Box>
                      ))}
                    </Box>
                    {puzzleTiles.every((t, i) => i === 15 ? t === 0 : t === i + 1) && (
                      <Typography sx={{ fontFamily: "inherit", fontSize: 12, color: "green", mt: 1, textAlign: "center", fontWeight: 700 }}>
                        🎉 You solved it!
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Trash icon at bottom right */}
      <Box
        sx={{
          position: "absolute",
          right: 20,
          bottom: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          zIndex: 5,
        }}
      >
        <Box sx={{ fontSize: 32 }}>🗑️</Box>
        <Typography sx={{ fontFamily: "inherit", fontSize: 9, color: "#000" }}>Trash</Typography>
      </Box>
    </Box>
  );
}
