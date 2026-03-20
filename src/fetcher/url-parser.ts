import type { FileType } from "../parser/field-definitions.js";

export interface PostiFile {
  url: string;
  filename: string;
  extensionless: string;
  fileType: FileType;
}

const FILE_TYPES = new Set<string>(["BAF", "PCF", "POM"]);

function isFileType(value: string): value is FileType {
  return FILE_TYPES.has(value);
}

export function parseFileUrls(html: string): PostiFile[] {
  const matches = html.matchAll(/href="((.*)?webpcode\/(((BAF|PCF|POM)(.*))\.zip))"/g);
  const files: PostiFile[] = [];

  for (const match of matches) {
    const url = match[1];
    const filename = match[3];
    const extensionless = match[4];
    const rawType = match[5];

    if (url && filename && extensionless && rawType && isFileType(rawType)) {
      files.push({ url, filename, extensionless, fileType: rawType });
    }
  }

  return files;
}
