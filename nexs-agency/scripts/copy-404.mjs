import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), process.env.BUILD_OUT_DIR || 'dist');
const indexPath = join(distDir, 'index.html');
const notFoundPath = join(distDir, '404.html');

if (!existsSync(indexPath)) {
  console.error(`copy-404: ${indexPath} not found. Run vite build first.`);
  process.exit(1);
}

copyFileSync(indexPath, notFoundPath);
console.log(`copy-404: ${notFoundPath} created — nginx serves it via error_page 404.`);
