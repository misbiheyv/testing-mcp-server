import fsAsync from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';

export const BASE_DIR = path.resolve(import.meta.dirname, '../..');

export function readFileSync(path: string, encoding: BufferEncoding = 'utf8') {
  const filePath = BASE_DIR + `/${path.replace(/^\//, '')}`;

  if (!fsSync.existsSync(filePath)) {
    throw new Error(`Invalid path to resource ${filePath}`);
  }

  return fsSync.readFileSync(filePath, {encoding});
}

export function writeFileSafety(filePath: string, data: any): Promise<void> {
  const projectDir = BASE_DIR + `/${filePath.split(path.sep).slice(0, -1).join(path.sep).replace(/^\//, '')}`;

  if (!fsSync.existsSync(projectDir)) {
    fsSync.mkdirSync(projectDir, {recursive: true});
  }

  return fsAsync.writeFile(filePath, JSON.stringify(data));
}
