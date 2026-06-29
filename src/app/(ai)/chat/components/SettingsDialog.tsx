"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Slider,
  Typography,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Settings } from "../hooks/useChatSettings";

const DEFAULT_MODELS = ["qwen3.5-27b", "qwen3-32b"];

// ── Slider helper ──

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  hint?: string;
}) {
  return (
    <div className="mt-1">
      <div className="flex items-center justify-between mb-0.5">
        <Typography variant="body2" color="text.secondary">
          {label}
          {hint && <span className="text-xs ml-1 opacity-50">({hint})</span>}
        </Typography>
        <TextField
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(v);
          }}
          type="number"
          size="small"
          slotProps={{
            htmlInput: {
              min,
              max,
              step,
              style: { width: 64, textAlign: "right", padding: "2px 6px" },
            },
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
        />
      </div>
      <Slider
        value={value}
        onChange={(_, v) => onChange(v as number)}
        min={min}
        max={max}
        step={step}
        size="small"
      />
    </div>
  );
}

// ── Dialog ──

export default function SettingsDialog({
  open,
  settings: initialSettings,
  models: initialModels,
  onClose,
}: {
  open: boolean;
  settings: Settings;
  models: string[];
  onClose: (settings: Settings, models: string[]) => void;
}) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [models, setModels] = useState<string[]>(initialModels);
  const [newModel, setNewModel] = useState("");
  const [addingModel, setAddingModel] = useState(false);

  useEffect(() => {
    if (open) {
      setSettings(initialSettings);
      setModels(initialModels);
      setAddingModel(false);
      setNewModel("");
    }
  }, [open, initialSettings, initialModels]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));

  const handleAddModel = () => {
    const name = newModel.trim();
    if (!name || models.includes(name)) return;
    const next = [...models, name];
    setModels(next);
    setNewModel("");
    setAddingModel(false);
    update("model", name);
  };

  const handleRemoveModel = (name: string) => {
    if (DEFAULT_MODELS.includes(name)) return;
    const next = models.filter((m) => m !== name);
    setModels(next);
    if (settings.model === name) {
      update("model", next[0]);
    }
  };

  const handleClose = () => {
    onClose(settings, models);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>设置</DialogTitle>
      <DialogContent
        className="space-y-3 pt-2"
        sx={{
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
          连接
        </Typography>
        <TextField
          label="Host"
          fullWidth
          margin="dense"
          value={settings.host}
          onChange={(e) => update("host", e.target.value)}
          placeholder="http://183.222.230.10"
          size="small"
        />
        <TextField
          label="Port"
          fullWidth
          margin="dense"
          value={settings.port}
          onChange={(e) => update("port", e.target.value)}
          placeholder="40073"
          size="small"
        />
        <TextField
          label="Path"
          fullWidth
          margin="dense"
          value={settings.path}
          onChange={(e) => update("path", e.target.value)}
          placeholder="/v1"
          size="small"
        />
        <TextField
          label="Auth Token"
          fullWidth
          margin="dense"
          value={settings.authToken}
          onChange={(e) => update("authToken", e.target.value)}
          placeholder="any"
          size="small"
        />

        <div className="flex gap-1 items-end">
          <Select
            value={models.includes(settings.model) ? settings.model : ""}
            onChange={(e) => update("model", e.target.value)}
            size="small"
            fullWidth
            sx={{ mt: 1 }}
          >
            {models.map((m) => (
              <MenuItem
                key={m}
                value={m}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{m}</span>
                {!DEFAULT_MODELS.includes(m) && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveModel(m);
                    }}
                    sx={{ ml: 1, color: "text.secondary" }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </MenuItem>
            ))}
          </Select>
          <Tooltip title="添加模型">
            <IconButton
              onClick={() => setAddingModel(true)}
              sx={{ mb: 0.5 }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </div>

        {addingModel && (
          <TextField
            label="新模型名称"
            fullWidth
            margin="dense"
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddModel();
            }}
            size="small"
            autoFocus
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Button size="small" onClick={handleAddModel} disabled={!newModel.trim()}>
                      添加
                    </Button>
                  </InputAdornment>
                ),
              },
            }}
          />
        )}

        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
          模型参数
        </Typography>

        <SliderField
          label="Temperature"
          hint="随机性"
          value={settings.temperature}
          onChange={(v) => update("temperature", v)}
          min={0}
          max={2}
          step={0.1}
        />

        <SliderField
          label="Top P"
          hint="核采样"
          value={settings.topP}
          onChange={(v) => update("topP", v)}
          min={0}
          max={1}
          step={0.05}
        />

        <SliderField
          label="Top K"
          hint="候选数"
          value={settings.topK}
          onChange={(v) => update("topK", v)}
          min={1}
          max={200}
          step={1}
        />

        <SliderField
          label="Max Tokens"
          hint="最大输出长度"
          value={settings.maxTokens}
          onChange={(v) => update("maxTokens", v)}
          min={256}
          max={65536}
          step={256}
        />

        <SliderField
          label="Frequency Penalty"
          hint="频率惩罚"
          value={settings.frequencyPenalty}
          onChange={(v) => update("frequencyPenalty", v)}
          min={-2}
          max={2}
          step={0.1}
        />

        <SliderField
          label="Presence Penalty"
          hint="存在惩罚"
          value={settings.presencePenalty}
          onChange={(v) => update("presencePenalty", v)}
          min={-2}
          max={2}
          step={0.1}
        />

        <FormControlLabel
          control={
            <Switch
              checked={settings.enableThinking}
              onChange={(e) => update("enableThinking", e.target.checked)}
            />
          }
          label="启用 Thinking（思维链）"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>确定</Button>
      </DialogActions>
    </Dialog>
  );
}
