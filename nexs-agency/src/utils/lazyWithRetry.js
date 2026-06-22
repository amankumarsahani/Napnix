import { lazy } from 'react';

const CHUNK_RELOAD_KEY = 'napnix-chunk-reload';

/**
 * Retry lazy route chunks once after deploy (stale index.html → missing hashed JS).
 * A full reload fetches the latest index.html and correct chunk URLs.
 */
export function lazyWithRetry(importFn) {
    return lazy(() =>
        importFn().catch((error) => {
            const isChunkError =
                error?.message?.includes('Failed to fetch dynamically imported module') ||
                error?.message?.includes('Importing a module script failed') ||
                error?.message?.includes('error loading dynamically imported module') ||
                error?.name === 'ChunkLoadError';

            const alreadyReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1';

            if (isChunkError && !alreadyReloaded) {
                sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
                window.location.reload();
                return new Promise(() => {});
            }

            sessionStorage.removeItem(CHUNK_RELOAD_KEY);
            throw error;
        }),
    );
}
