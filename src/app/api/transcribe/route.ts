import { execFile } from "child_process";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const SCRIPT_PATH = join(process.cwd(), "scripts", "transcribe.py");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof File)) {
      return Response.json({ error: "No audio file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const ext = audioFile.name?.split(".").pop() || "webm";
    const tmpPath = join(tmpdir(), `whisper-${randomUUID()}.${ext}`);

    await writeFile(tmpPath, buffer);

    try {
      const text = await new Promise<string>((resolve, reject) => {
        execFile(
          "python3",
          [SCRIPT_PATH, tmpPath],
          { timeout: 120_000, maxBuffer: 10 * 1024 * 1024 },
          (error, stdout, stderr) => {
            if (error) {
              console.error("[transcribe] error:", stderr || error.message);
              reject(new Error(stderr || error.message));
            } else {
              resolve(stdout.trim());
            }
          }
        );
      });

      return Response.json({ text });
    } finally {
      await unlink(tmpPath).catch(() => {});
    }
  } catch (err) {
    console.error("[transcribe] error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
