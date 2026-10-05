# nginx configuration — redirects, headers, real 404s

napnix.in is served by **nginx on the VPS**, from
`/var/www/html/Napnix/nexs-agency/dist`. Cloudflare sits in front as a proxy
(admin access is through a cloudflared tunnel, `admin@ssh.napnix.in`).

Deployment is `nexs-backend/deploy-webhook.js` on port 9000: a GitHub push
webhook triggers `git pull`, then `npm install` and `npm run build:prod` inside
`nexs-agency`. There is no Cloudflare Pages project and no GitHub Pages
involvement — the old `.github/workflows/deploy.yml` published to GitHub Pages,
which never served this domain, and has been deleted.

## Why three findings stayed open

`public/_redirects` and `public/_headers` hold the correct rules, but they are
Netlify / Cloudflare Pages conventions. **nginx does not read either file.**
They ship into `dist/` and sit in the webroot doing nothing.

The clean proof: `_redirects` asks for `/assets/* 404`, and production returns
200 with the HTML shell for `/assets/missing-abc123.js`. That is nginx
`try_files` falling through to index.html.

| Finding | Declared in repo | Production |
|---|---|---|
| C3 redirects | `http://*` and `www` → apex, 301 | all four origins return 200 |
| C4 headers | HSTS, nosniff, Referrer-Policy, Permissions-Policy | all absent |
| C5 real 404s | `/assets/* 404` | 200 + HTML |
| M5 cache | — | ~360 KiB re-fetched |

Delete both files once the config below is live; leaving them implies rules are
active when they are not. Until then both carry an INERT banner at the top, and
the block below is version-controlled as `deploy/nginx-napnix.conf` rather than
living only in this document.

---

## The server block

```nginx
server {
    listen 443 ssl http2;
    server_name napnix.in;
    root /var/www/html/Napnix/nexs-agency/dist;
    index index.html;

    # C4 — security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    # Serve the .gz / .br that vite-plugin-compression2 and prerender.mjs write,
    # instead of recompressing on every request.
    gzip_static on;
    # brotli_static on;   # only if nginx was built with ngx_brotli

    # M5 — hashed bundles never change; C5 — a missing one must 404 rather than
    # fall through to index.html, or a client holding a stale chunk reference
    # receives HTML and fails to parse it.
    location /assets/ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }

    location = /index.html { add_header Cache-Control "no-cache" always; }
    location = /sitemap.xml { add_header Cache-Control "public, max-age=3600" always; }

    # Prerendered routes are real directories: dist/napcrm/index.html and so on.
    # $uri/ is what serves them, so it must come before the fallback. Unmatched
    # paths go to 404.html with a 404 status, not to index.html with a 200.
    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
        add_header Cache-Control "no-cache" always;
    }
}

# C3 — one canonical origin
server {
    listen 443 ssl http2;
    server_name www.napnix.in;
    return 301 https://napnix.in$request_uri;
}

server {
    listen 80;
    server_name napnix.in www.napnix.in;
    return 301 https://napnix.in$request_uri;
}
```

The `try_files $uri $uri/ =404` line is the one that changes behaviour most.
Before prerendering, every unknown path had to fall through to `index.html` for
client-side routing to work, which is what made soft 404s unavoidable. Now that
all 51 sitemap routes exist on disk as real files, the fallback is only needed
for routes that are not prerendered. `/blog` is no longer one of them: its index
renders the curated guides from a local manifest, so it prerenders like any other
route. What still needs the fallback is the generated blog slugs that exist only
in the API, plus `/portfolio/:slug`, `/thank-you`, `/data-deletion` and
`/admin/*` — scoped per prefix in `deploy/nginx-napnix.conf`. If you would rather keep client-side routing for any URL, use
`try_files $uri $uri/ /404.html;` instead: same 404 status, but the SPA shell
still boots and can route.

## Deploying it

```bash
ssh -o ProxyCommand="cloudflared access ssh --hostname %h" admin@ssh.napnix.in

sudo nano /etc/nginx/sites-available/napnix.in     # paste the block
sudo nginx -t                                      # must pass before reloading
sudo systemctl reload nginx
```

## The prerender browser

`build:prod` ends with `scripts/prerender.mjs`, which needs a headless Chromium.
Without it the chain exits non-zero **after** vite has already overwritten
`dist/`, so nginx serves a fresh shell with no prerendered routes and the
webhook reports a failed deploy. That is what has been happening on every push.

`deploy-webhook.js` now installs it before building, but the first run still
needs the browser present:

```bash
cd /var/www/html/Napnix/nexs-agency
npx playwright install --with-deps chromium --only-shell
```

`--with-deps` needs sudo on a fresh box for the shared libraries.

## Verifying

```bash
# C3 — each should answer 301
for u in http://napnix.in https://www.napnix.in http://www.napnix.in; do
  curl -sS -o /dev/null -w "$u -> %{http_code} %{redirect_url}\n" "$u"
done

# C4 — expect all five
curl -sSI https://napnix.in | grep -iE 'strict-transport|x-content-type|referrer-policy|permissions-policy|x-frame'

# C5 — expect 404, not 200
curl -sS -o /dev/null -w "%{http_code}\n" https://napnix.in/nope-12345
curl -sS -o /dev/null -w "%{http_code}\n" https://napnix.in/assets/missing-abc123.js

# C2 — expect thousands of characters, and the route's own canonical
curl -sS https://napnix.in/napcrm | grep -o 'rel="canonical" href="[^"]*"'
curl -sS https://napnix.in/napcrm | wc -c      # ~180KB prerendered, not ~12.5KB
```

The last pair is the real test. Until `/napcrm` returns its own canonical and
six-figure byte count, prerendering is not reaching production regardless of
what the build logs say.
