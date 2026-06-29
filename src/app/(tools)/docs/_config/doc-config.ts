import { readFile } from "fs/promises";
import path from "path";
import type { DocEntry } from "./doc-entries";

export type { DocEntry } from "./doc-entries";
export { muiDocs } from "./doc-entries";

const DOCS_DIR = path.join(process.cwd(), "docs", "mui");

export async function getDocContent(slug: string): Promise<string | null> {
  try {
    const filePath = path.join(DOCS_DIR, `${slug}.md`);
    const normalized = path.normalize(filePath);
    if (!normalized.startsWith(DOCS_DIR)) return null;

    const content = await readFile(normalized, "utf-8");
    return content;
  } catch {
    return null;
  }
}

export async function getReadmeContent(): Promise<string | null> {
  try {
    return await readFile(path.join(DOCS_DIR, "README.md"), "utf-8");
  } catch {
    return null;
  }
}
