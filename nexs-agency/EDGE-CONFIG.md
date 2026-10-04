# Edge configuration — redirects, headers, real 404s

Three audit findings cannot be fixed in this repo. `public/_redirects` and
`public/_headers` already contain the right rules, but they are Netlify /
Cloudflare Pages conventions and neither GitHub Pages nor nginx reads them.
They ship into `dist/` and sit in the webroot doing nothing.

| Finding | Declared in repo | Production today |
|---|---|---|
| C3 redirects | `http://*` and `www` → apex, 301 | all four origins return 200, no redirect |
| C4 headers | HSTS, nosniff, Referrer-Policy, Permissions-Policy | all six absent |
| C5 real 404s | `/assets/* 404` | `/assets/missing-abc123.js` returns 200 + HTML |

That last row is the clean proof the file never executes: the repo explicitly
asks for a 404 on that path and production serves the SPA shell with a 200.

## First: establish which origin actually serves napnix.in

The repo contains two deployment paths and it is not clear which one is live.

- `.github/workflows/deploy.yml` — builds `nexs-agency` on push to `master`
  and publishes to **GitHub Pages** via `actions/deploy-pages@v4`
- `deploy-prod.ps1` — builds and SCPs `dist/*` to a **VPS** at `/var/www/html/`

Cloudflare fronts the domain and strips origin headers, so this cannot be
settled from outside. The observed behaviour points at nginx rather than
GitHub Pages:

- `/assets/missing-abc123.js` returns **200 with the HTML shell**. GitHub Pages
  returns a real 404 for a missing asset; serving index.html for *any* path is
  nginx `try_files $uri $uri/ /index.html`.
- No `etag` on responses. GitHub Pages always sends one.
- `content-type: text/html` with no charset. GitHub Pages sends
  `text/html; charset=utf-8`.

Confirm before applying anything below — `curl -I` against the origin directly,
bypassing Cloudflare, settles it in one command.

---

## If the origin is nginx (VPS)

Everything is fixed in the server block. This is also where the SPA fallback
currently turns every unknown path into a 200.

```nginx
server {
    listen 443 ssl http2;
    server_name napnix.in;
    root /var/www/html;

    # C4 — security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    # M5 — hashed bundles are immutable; everything else revalidates
    location /assets/ {
        # C5 — a missing bundle must 404, never fall through to index.html,
        # or a client holding a stale chunk reference gets HTML and fails to parse it
        try_files $uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }

    location = /index.html {
        add_header Cache-Control "no-cache" always;
    }

    # Prerendered routes are real directories: /napcrm/index.html etc.
    # $uri/ must come before the fallback so they are served as static files.
    location / {
        try_files $uri $uri/ /404.html;
    }

    # C5 — unknown paths get the shell with a 404 status, not a 200
    error_page 404 /404.html;
    location = /404.html {
        internal;
        add_header Cache-Control "no-cache" always;
    }
}

# C3 — single canonical origin
server {
    listen 80;
    listen 443 ssl http2;
    server_name www.napnix.in;
    return 301 https://napnix.in$request_uri;
}

server {
    listen 80;
    server_name napnix.in;
    return 301 https://napnix.in$request_uri;
}
```

Note the ordering in `location /`: `try_files $uri $uri/` is what lets the
prerendered `dist/<route>/index.html` files be served directly. Falling back to
`/404.html` instead of `/index.html` is the change that turns soft 404s into
real ones — the prerendered routes no longer need a catch-all, because each one
exists on disk.

## If the origin is GitHub Pages

GitHub Pages cannot set response headers or redirect, so C3 and C4 move to
Cloudflare. It does return a real 404 for unknown paths once `404.html` exists,
which `copy-404.mjs` already produces — so C5 may resolve on its own.

**C3 — Rules → Redirect Rules**, one rule:

```
Expression:  (http.host eq "www.napnix.in")
Then:        Dynamic redirect
URL:         concat("https://napnix.in", http.request.uri.path)
Status:      301
Preserve query string: on
```

For `http://` → `https://`, do not write a rule: enable
**SSL/TLS → Edge Certificates → Always Use HTTPS**.

**C4 — Rules → Transform Rules → Modify Response Header**, one rule matching
`true` (all requests), setting static values:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options:    nosniff
Referrer-Policy:           strict-origin-when-cross-origin
Permissions-Policy:        camera=(), microphone=(), geolocation=()
X-Frame-Options:           SAMEORIGIN
```

Enable HSTS only once you are sure every subdomain serves HTTPS; `preload` is
hard to reverse.

## Either way

Delete `public/_redirects` and `public/_headers` once the real configuration is
in place. Leaving them implies the rules are active when they are not — that
misreading is what left these three findings open while the repo looked correct.

## Verifying

```bash
# C3 — each should answer 301 to https://napnix.in/...
for u in http://napnix.in https://www.napnix.in http://www.napnix.in; do
  curl -sS -o /dev/null -w "$u -> %{http_code} %{redirect_url}\n" "$u"
done

# C4 — expect all five
curl -sSI https://napnix.in | grep -iE 'strict-transport|x-content-type|referrer-policy|permissions-policy|x-frame'

# C5 — expect 404, not 200
curl -sS -o /dev/null -w "%{http_code}\n" https://napnix.in/nope-12345
curl -sS -o /dev/null -w "%{http_code}\n" https://napnix.in/assets/missing-abc123.js
```
