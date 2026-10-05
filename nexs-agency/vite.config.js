import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip', threshold: 1024 }),
    compression({ algorithm: 'brotliCompress', threshold: 1024 }),
  ],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 250,
    /*
     * Do not modulepreload the below-the-fold homepage sections.
     *
     * Services, About, Technologies, Testimonials, Blog, FAQ, Partners and
     * Contact are all lazy-loaded behind <ScrollReveal> and <Suspense> in
     * App.jsx — the whole point is that they load when scrolled to. Vite still
     * emitted a modulepreload for each, so ~83 KB of JS nobody can see was
     * fetched at high priority during the window that decides LCP, alongside
     * the hero image.
     *
     * The vendor chunks are deliberately NOT filtered: react, the router and
     * framer-motion are all needed by the hero on first paint.
     */
    modulePreload: {
      resolveDependencies: (_url, deps) => {
        const BELOW_FOLD = /\/(Services|About|Technologies|Testimonials|Blog|FAQ|Partners|Contact|inquiry|companyStats|testimonials|blogPosts|authors)-[A-Za-z0-9_-]+\.js$/;
        return deps.filter((dep) => !BELOW_FOLD.test('/' + dep));
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
})
