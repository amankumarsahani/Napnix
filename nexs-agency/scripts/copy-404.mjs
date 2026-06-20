import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const indexPath = join(distDir, 'index.html');
const notFoundPath = join(distDir, '404.html');

if (!existsSync(indexPath)) {
  console.error('copy-404: dist/index.html not found. Run vite build first.');
  process.exit(1);
}

copyFileSync(indexPath, notFoundPath);
console.log('copy-404: dist/404.html created for GitHub Pages SPA routing.');
