"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { STTSegment } from "../types";

// ─── Constants ───

const SILENCE_THRESHOLD = 0.01;
const SILENCE_DURATION_WHISPER = 1200; // ms
const SILENCE_DURATION_FUNASR = 800; // ms
const MAX_SEGMENT_DURATION = 5000; // ms
const MIN_RECORDING_TIME = 800; // ms
const SILENCE_CHECK_INTERVAL = 150; // ms
const TARGET_SAMPLE_RATE = 16000;

// ─── Types ───

interface UseSTTWebSocketOptions {
  sttUrl: string;
  sttModel: string;
  sttLanguage: string;
}

// ─── Helpers ───

function isFunASR(model: string): boolean {
  return model === "paraformer-zh";
}

function getWSUrl(httpUrl: string, endpoint: string): string {
  return httpUrl.replace(/^http/, "ws") + endpoint;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Sliding-window overlap correction for Whisper mode */
function findOverlap(prev: string, curr: string): number {
  if (!prev || !curr) return 0;
  const maxLen = Math.min(prev.length, curr.length, 30);
  for (let len = maxLen; len > 2; len--) {
    if (prev.slice(-len) === curr.slice(0, len)) return len;
  }
  return 0;
}

// ─── Hook ───

/**
 * WebSocket STT hook
 * Supports Whisper (webm blobs) and FunASR (PCM streaming) engines
 * Includes silence detection and auto-segmentation
 */
export function useSTTWebSocket({ sttUrl, sttModel, sttLanguage }: UseSTTWebSocketOptions) {
  // ─── State ───
  const [segments, setSegments] = useState<STTSegment[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentSpeaker, setCurrentSpeaker] = useState("");
  const [micActive, setMicActive] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // ─── Refs ───
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const silenceCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const micActiveRef = useRef(false);

  // Whisper-specific refs
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const segmentStartRef = useRef(0);

  // FunASR-specific refs
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  // Scroll container ref (set by component)
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // ─── Computed ───
  const allText = segments.map((s) => s.text).concat(currentText ? [currentText] : []).join("");
  const totalChars = allText.length;

  // ─── Scroll helper ───
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  // ─── Apply transcription (Whisper overlap correction) ───
  const applyTranscription = useCallback(
    (text: string) => {
      if (!text) return;

      setCurrentText((prev) => {
        if (prev) {
          const overlap = findOverlap(prev, text);
          if (overlap > 0) {
            const corrected = prev.slice(0, -overlap) + text;
            scrollToBottom();
            return corrected;
          } else {
            // Finalize previous text as a segment
            setSegments((prevSegs) => [
              ...prevSegs,
              { time: formatTime(new Date()), text: prev, speaker: "" },
            ]);
            scrollToBottom();
            return text;
          }
        }
        scrollToBottom();
        return text;
      });
      setCurrentTime(formatTime(new Date()));
    },
    [scrollToBottom]
  );

  // ─── Silence Detection ───
  const startSilenceDetection = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Float32Array(analyser.fftSize);
    let silenceStart: number | null = null;
    const funasr = isFunASR(sttModel);
    const silenceDuration = funasr ? SILENCE_DURATION_FUNASR : SILENCE_DURATION_WHISPER;

    silenceCheckRef.current = setInterval(() => {
      if (!analyserRef.current) return;
      analyser.getFloatTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i] * dataArray[i];
      const rms = Math.sqrt(sum / dataArray.length);

      setCurrentVolume(Math.min(rms * 20, 1));

      if (rms < SILENCE_THRESHOLD) {
        if (!silenceStart) {
          silenceStart = Date.now();
        } else {
          const duration = Date.now() - silenceStart;
          if (funasr && duration >= SILENCE_DURATION_FUNASR) {
            silenceStart = null;
            // FunASR: send segment_end for precise transcription
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              setCurrentText((ct) => {
                if (ct) {
                  wsRef.current?.send(JSON.stringify({ type: "segment_end" }));
                }
                return ct;
              });
            }
          } else if (!funasr && duration >= SILENCE_DURATION_WHISPER) {
            silenceStart = null;
            flushCurrentSegment();
          }
        }
      } else {
        silenceStart = null;
      }
    }, SILENCE_CHECK_INTERVAL);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sttModel]);

  // ─── Whisper: Segment Recording ───
  const startNewSegment = useCallback(() => {
    const stream = activeStreamRef.current;
    if (!stream || !micActiveRef.current) return;

    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    recorderRef.current = recorder;
    segmentStartRef.current = Date.now();

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      clearMaxDurationTimer();
      const duration = Date.now() - segmentStartRef.current;
      if (duration >= MIN_RECORDING_TIME && chunksRef.current.length > 0) {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        sendToSTT(blob);
      }
      // Auto-restart if still active
      if (micActiveRef.current) startNewSegment();
    };

    recorder.start(200);
    maxDurationTimerRef.current = setTimeout(() => flushCurrentSegment(), MAX_SEGMENT_DURATION);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flushCurrentSegment = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  const clearMaxDurationTimer = useCallback(() => {
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
  }, []);

  // ─── FunASR: PCM Capture ───
  const startPCMCapture = useCallback(() => {
    const audioContext = audioContextRef.current;
    const stream = activeStreamRef.current;
    if (!audioContext || !stream) return;

    const sourceSampleRate = audioContext.sampleRate;
    const ratio = sourceSampleRate / TARGET_SAMPLE_RATE;
    const bufferSize = 4096;
    const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
    scriptProcessorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (!micActiveRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      const inputData = e.inputBuffer.getChannelData(0);
      const outputLength = Math.round(inputData.length / ratio);
      const output = new Float32Array(outputLength);

      for (let i = 0; i < outputLength; i++) {
        const srcIdx = Math.round(i * ratio);
        output[i] = inputData[Math.min(srcIdx, inputData.length - 1)];
      }

      // float32 → int16 PCM
      const pcm16 = new Int16Array(outputLength);
      for (let i = 0; i < outputLength; i++) {
        const s = Math.max(-1, Math.min(1, output[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      wsRef.current.send(pcm16.buffer);
    };

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(processor);
    processor.connect(audioContext.destination);
  }, []);

  const stopPCMCapture = useCallback(() => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
  }, []);

  // ─── WebSocket Connections ───

  const connectWSWhisper = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      const url = getWSUrl(sttUrl, "/v1/stream");
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            model: sttModel,
            language: sttLanguage || "zh",
            prompt: "",
          })
        );
        resolve();
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "result") {
          applyTranscription(data.text);
        } else if (data.type === "error") {
          console.error("STT stream error:", data.message);
        }
      };

      ws.onerror = (err) => reject(err);
      ws.onclose = () => {
        wsRef.current = null;
      };
    });
  }, [sttUrl, sttModel, sttLanguage, applyTranscription]);

  const connectWSFunASR = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      const url = getWSUrl(sttUrl, "/v1/stream-funasr");
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ model: sttModel }));
        resolve();
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "partial") {
          setCurrentText(data.text);
          setCurrentTime(formatTime(new Date()));
          scrollToBottom();
        } else if (data.type === "final") {
          if (data.text) {
            const spk = data.speaker_text || "";
            setSegments((prev) => [
              ...prev,
              { time: formatTime(new Date()), text: data.text, speaker: spk },
            ]);
          }
          setCurrentText("");
          setCurrentTime("");
          setCurrentSpeaker("");
          scrollToBottom();
        } else if (data.type === "error") {
          console.error("FunASR stream error:", data.message);
        }
      };

      ws.onerror = (err) => reject(err);
      ws.onclose = () => {
        wsRef.current = null;
      };
    });
  }, [sttUrl, sttModel, scrollToBottom]);

  // ─── Send audio to Whisper ───

  const sendToSTT = useCallback(async (blob: Blob) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(await blob.arrayBuffer());
    } catch (err) {
      console.error("Send audio failed:", err);
    }
  }, []);

  // ─── Stop All ───

  const stopAll = useCallback(() => {
    clearMaxDurationTimer();
    if (silenceCheckRef.current) {
      clearInterval(silenceCheckRef.current);
      silenceCheckRef.current = null;
    }
    setCurrentVolume(0);

    if (isFunASR(sttModel)) {
      stopPCMCapture();
    } else {
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    }

    // Disconnect WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stop" }));
      wsRef.current.close();
    }
    wsRef.current = null;

    // Stop media stream
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((t) => t.stop());
      activeStreamRef.current = null;
    }

    // Close AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
      analyserRef.current = null;
    }

    // Finalize any pending current text as a segment
    setCurrentText((ct) => {
      if (ct) {
        setCurrentTime((ctTime) => {
          setCurrentSpeaker((spk) => {
            setSegments((prev) => [...prev, { time: ctTime, text: ct, speaker: spk }]);
            return "";
          });
          return "";
        });
        return "";
      }
      return ct;
    });
  }, [sttModel, clearMaxDurationTimer, stopPCMCapture]);

  // ─── Main Control ───

  const startListening = useCallback(async () => {
    try {
      // Connect WebSocket
      if (isFunASR(sttModel)) {
        await connectWSFunASR();
      } else {
        await connectWSWhisper();
      }

      // Get microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: { ideal: TARGET_SAMPLE_RATE } },
      });
      activeStreamRef.current = stream;

      // Set up audio analysis
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start silence detection
      startSilenceDetection();

      // Start engine-specific capture
      if (isFunASR(sttModel)) {
        startPCMCapture();
      } else {
        startNewSegment();
      }
    } catch (err) {
      console.error("STT start failed:", err);
      setMicActive(false);
    }
  }, [
    sttModel,
    connectWSFunASR,
    connectWSWhisper,
    startSilenceDetection,
    startPCMCapture,
    startNewSegment,
  ]);

  const toggleRecording = useCallback(async () => {
    if (micActive) {
      micActiveRef.current = false;
      setMicActive(false);
      stopAll();
    } else {
      micActiveRef.current = true;
      setMicActive(true);
      await startListening();
    }
  }, [micActive, stopAll, startListening]);

  // ─── Utility Actions ───

  const copyAll = useCallback(() => {
    navigator.clipboard.writeText(allText).catch(() => {});
  }, [allText]);

  const clearAll = useCallback(() => {
    setSegments([]);
    setCurrentText("");
    setCurrentTime("");
    setCurrentSpeaker("");
  }, []);

  // ─── Generate Meeting Minutes ───

  const [showMinutes, setShowMinutes] = useState(false);
  const [minutesContent, setMinutesContent] = useState("");

  const generateMinutes = useCallback(async () => {
    if (!allText || isGenerating) return;

    setIsGenerating(true);
    setMinutesContent("");
    setShowMinutes(true);

    const prompt = `请将以下会议录音转写内容整理为一份结构化的会议纪要。

要求：
1. 提取会议主题、参会要点
2. 梳理讨论的核心议题和关键结论
3. 列出待办事项或行动项（如有）
4. 语言简洁、结构清晰，使用 Markdown 格式
5. 不要编造转写内容中没有的信息

以下是录音转写内容：

${allText}`;

    try {
      const formData = new FormData();
      formData.append("message", prompt);
      formData.append("stream", "true");

      const resp = await fetch("/api/chat/simple", { method: "POST", body: formData });
      if (!resp.ok) {
        setMinutesContent(`生成失败: ${resp.status}`);
        setIsGenerating(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) {
        setMinutesContent("生成失败: 无响应");
        setIsGenerating(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue;
          if (trimmed.startsWith("data: ") || trimmed.startsWith("data:")) {
            const data = trimmed.startsWith("data: ") ? trimmed.slice(6) : trimmed.slice(5).trim();
            if (data === "[DONE]") {
              setIsGenerating(false);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "chunk" && parsed.content) {
                setMinutesContent((prev) => prev + parsed.content);
              } else if (parsed.type === "error") {
                setMinutesContent((prev) => prev + `\n\n错误: ${parsed.message}`);
              }
            } catch {
              // skip
            }
          }
        }
      }
    } catch (err) {
      setMinutesContent(`生成失败: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
    setIsGenerating(false);
  }, [allText, isGenerating]);

  const copyMinutes = useCallback(() => {
    navigator.clipboard.writeText(minutesContent).catch(() => {});
  }, [minutesContent]);

  // ─── Volume Bar Helper ───

  const volumeBarActive = useCallback(
    (i: number) => currentVolume * 5 >= i * 0.7,
    [currentVolume]
  );

  // ─── Cleanup on Unmount ───

  useEffect(() => {
    return () => {
      if (micActive) stopAll();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // State
    segments,
    currentText,
    currentTime,
    currentSpeaker,
    micActive,
    currentVolume,
    allText,
    totalChars,
    isGenerating,
    showMinutes,
    minutesContent,
    // Refs
    scrollRef,
    // Actions
    toggleRecording,
    copyAll,
    clearAll,
    generateMinutes,
    copyMinutes,
    setShowMinutes,
    volumeBarActive,
  };
}
