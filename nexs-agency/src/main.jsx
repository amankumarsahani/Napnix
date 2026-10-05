import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { MotionConfig } from 'framer-motion'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

/**
 * createRoot, deliberately — hydrateRoot was tried and measured slower.
 *
 * The obvious-looking optimisation here is hydrateRoot: scripts/prerender.mjs
 * writes real HTML for all 51 sitemap routes, so React could adopt that DOM
 * instead of rebuilding it. It was implemented and benchmarked, and it made
 * things worse. Medians of 5 runs per route, 4x CPU throttle, 390x844:
 *
 *   route                              hydrate (LCP/script)  createRoot
 *   /                                        676 / 249        636 / 216
 *   /napcrm/pricing                          408 / 171        368 / 154
 *   /services/custom-web-development         476 / 189        688 / 161
 *   /blog/ai-trends-2026                     516 / 162        448 / 145
 *
 * Script duration was lower with createRoot on every route, and hydrateRoot
 * logged 4 recoverable React errors per page (#418, text content mismatch)
 * against zero.
 *
 * The reason is structural, not a bug to fix in the components. prerender.mjs
 * captures a settled DOM out of a real browser, and a browser DOM has already
 * merged adjacent text nodes. Genuine SSR via renderToString emits `<!-- -->`
 * separators between adjacent JSX text children precisely so hydration can tell
 * them apart — so any element written as `Founded in {FOUNDED_YEAR}, Napnix…`
 * arrives as one text node where React expects three. Hydration mismatches,
 * React repairs the subtree, and that repair costs more than rendering it fresh.
 *
 * Making hydrateRoot pay off needs the prerender replaced by real SSR (running
 * the app in Node with server-side data fetching), not a tweak here. Until
 * then createRoot is the faster path: crawlers and the first paint still get the
 * prerendered HTML, and React simply takes over afterwards.
 *
 * The `data-prerendered-path` attribute prerender.mjs stamps on <html> is kept.
 * Nothing reads it at runtime now, but it records which route each built
 * document belongs to, which is what made the A/B above possible from a single
 * build — strip the attribute and the guard fell back to createRoot.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <HelmetProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HelmetProvider>
    </MotionConfig>
  </StrictMode>,
)
