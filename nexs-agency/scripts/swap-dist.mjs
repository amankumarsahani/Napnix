/**
 * Swap a freshly built staging directory into place as `dist`.
 *
 * Why this exists: nginx serves straight out of `dist`, and the build used to
 * write into it in stages — `vite build` empties it, then prerender.mjs fills it
 * one route at a time over roughly 90 seconds. For that whole window the live
 * webroot held a partial site.
 *
 * That was survivable while unknown paths fell through to the homepage on a 200.
 * It stopped being survivable once the nginx config started returning real 404s:
 * a route that had not been written yet now answered 404 to anyone asking,
 * including Googlebot and the Bing crawler we actively push URLs to via
 * IndexNow. During verification this produced three separate false alarms, which
 * is a good indication of how it looks from outside.
 *
 * So the build assembles everything in `dist-next` and this swaps it in. POSIX
 * rename() cannot replace a non-empty directory, so it takes two renames with a
 * microsecond gap rather than one atomic call — against a 90 second window, that
 * is the whole point. Both paths are on the same filesystem, so each rename is
 * atomic and neither copies data.
 *
 * On failure `dist` is left untouched, which means a broken build leaves the
 * previous site serving rather than a half-written one.
 */
import { existsSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const cwd = process.cwd();
const next = join(cwd, process.env.BUILD_OUT_DIR || 'dist-next');
const live = join(cwd, 'dist');
const prev = join(cwd, 'dist-prev');

if (!existsSync(next)) {
  console.error(`swap-dist: ${next} does not exist — nothing to swap. Build must have failed.`);
  process.exit(1);
}
if (!existsSync(join(next, 'index.html'))) {
  console.error(`swap-dist: ${next}/index.html missing — refusing to publish an incomplete build.`);
  process.exit(1);
}

try {
  rmSync(prev, { recursive: true, force: true });
  if (existsSync(live)) renameSync(live, prev);
  renameSync(next, live);
  rmSync(prev, { recursive: true, force: true });
  console.log('swap-dist: dist-next swapped into dist');
} catch (err) {
  // Put the previous build back rather than leave no webroot at all.
  if (!existsSync(live) && existsSync(prev)) {
    renameSync(prev, live);
    console.error('swap-dist: swap failed, previous dist restored');
  }
  console.error(`swap-dist: ${err.message}`);
  process.exit(1);
}
