import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), process.env.BUILD_OUT_DIR || 'dist');
const indexPath = join(distDir, 'index.html');
const notFoundPath = join(distDir, '404.html');
const appShellPath = join(distDir, 'app-shell.html');

if (!existsSync(indexPath)) {
  console.error(`copy-404: ${indexPath} not found. Run vite build first.`);
  process.exit(1);
}

copyFileSync(indexPath, notFoundPath);
console.log(`copy-404: ${notFoundPath} created — nginx serves it via error_page 404.`);

/*
 * app-shell.html: the SPA fallback for routes that are deliberately not
 * prerendered.
 *
 * This runs BEFORE prerender.mjs, so index.html is still the plain Vite shell
 * here -- no baked canonical, no robots meta, no data-prerendered-path. That is
 * exactly what a fallback needs, and it is why the copy has to happen at this
 * point in the build.
 *
 * Why it exists: prerender.mjs overwrites index.html with the fully rendered
 * homepage, and nginx was serving that same file as the fallback for the 86
 * machine-generated /blog/ slugs, /thank-you, /portfolio/<unknown> and /admin/.
 * So every one of those URLs returned the homepage's
 * `<link rel="canonical" href="https://napnix.in/">` and
 * `<meta name="robots" content="index, follow">` to any client that does not run
 * JavaScript -- 86 URLs each claiming to be the homepage, and an index directive
 * contradicting the `X-Robots-Tag: noindex` the same response carried.
 *
 * Serving this shell instead means those routes assert nothing about
 * themselves. react-helmet then sets the correct canonical and robots values
 * once the bundle runs, which is the only place that knows what the route is.
 */
copyFileSync(indexPath, appShellPath);
console.log(`copy-404: ${appShellPath} created — nginx serves it as the SPA fallback.`);
