# Why `index.html`'s head looks the way it does

Rationale for the non-obvious decisions in `index.html` and
`scripts/prerender.mjs`. It lives here rather than in HTML comments because
`index.html`'s head is copied into all 51 prerendered pages, so every comment
byte ships 51 times.

Written 2026-10-05 alongside the `napnix.in-audit/` findings.

---

## 1. Structured data: `#localbusiness` only

`index.html` declares **only** the `ProfessionalService` node.
`src/components/seo/SiteSchema.jsx` emits `Organization` and `WebSite` from
`src/constants/seoConfig.js`, keyed to the same `@id` values.

Both used to be declared in both places, so every page shipped two
`Organization` nodes sharing
`@id: "https://napnix.in/#organization"` — one with the current `sameAs` list,
one whose GitHub URL had been renamed and returned 404. Two nodes under one
`@id` is an unresolvable conflict for a consumer, and the dead link went out on
all 51 pages. Commit `a5a3359` fixed `seoConfig.js` and missed `index.html`.

`priceRange` is `₹₹`, not `$$`: the business is in Mohali, bills in INR, and the
`Organization` node is `addressCountry: IN`.

**Rule:** identity (`Organization`, `WebSite`) belongs to `SiteSchema.jsx`.
`index.html` owns the local-business node only. Don't reintroduce either here.

**Check:** `npm run build:prod`, then confirm no `@id` is defined twice:

```bash
grep -c '"@id": "https://napnix.in/#organization"' dist/index.html   # 1 definition + refs
```

Per-page schema must also not redefine `#organization` — see
`src/pages/seo/CityLandingPage.jsx`, where the non-HQ branch uses a bare
`{"@id": ...}` reference for `provider` and the HQ branch has its own
`@id: "<pageUrl>#localbusiness"` with `parentOrganization` pointing at the
company node.

---

## 2. No `hasMerchantReturnPolicy` or `shippingDetails` on offers

Removed from `src/constants/productSchema.js`. Every NapCRM and service offer
used to assert a 14-day finite return window, `ReturnByMail`, `FreeReturn` and
`FullRefund`, plus zero-cost shipping details.

- No such policy is published. "refund", "free trial", "14-day" and "money
  back" appear nowhere in the Terms, pricing page, FAQ or NapCRM page. The only
  "refund" text on the site describes a NapCRM *feature* for e-commerce clients
  handling their own customers' returns.
- `ReturnByMail` is meaningless for software.
- Neither property is required: these offers hang off `SoftwareApplication` and
  `Service`, not `Product`.

Omitting a property asserts nothing, which is the accurate state. If a real
refund or trial policy is published, add it back **and** put it in visible copy
on the pricing page — markup has to match what a reader can see.

---

## 3. Fonts: `media="print"` is restored by the prerender

`index.html` loads the Google Fonts stylesheet non-blockingly with
`media="print"` + `onload="this.media='all'"`.

By the time `scripts/prerender.mjs` serialises a page, that `onload` has already
fired in the headless browser, so the DOM holds `media="all"` — and writing that
out bakes a **render-blocking** stylesheet into every static page, which is the
opposite of what the trick is for. PSI put the two blocking font requests at
~880 ms.

The prerender therefore resets any `link[rel="stylesheet"][onload]` back to
`media="print"` before serialising, and logs how many it touched. The
`<noscript>` fallback is left alone: it is correctly nested and only applies
when JS is off.

**Check:** the build prints
`prerender: restored media="print" on N font stylesheet link(s)`, and:

```bash
grep -o 'rel="stylesheet"[^>]*fonts.googleapis[^>]*' dist/index.html
```

should show `media="print"` on the `onload` one.

---

## 4. Analytics and the Meta Pixel load after first paint

`gtag.js` used to be requested **twice** from two separate blocks in the head
(`G-C0JQD47CHK` near the top, `G-XZZDQ3BX19` lower down), each redeclaring
`window.dataLayer` and `gtag()`, with the Meta Pixel inline right after. PSI
measured the three together at ~1.15 MB of the homepage's 1.63 MB and ~2.4 s of
blocking time, owning the two longest main-thread tasks (593 ms and 583 ms) —
all ahead of the hero image.

Now one deferred block:

1. **`gtag.js` is fetched once.** A single load can configure any number of
   properties, so both measurement IDs are kept and each gets its own `config`
   call. Nothing stops being tracked.
2. **Everything waits for `load`, then an idle callback.** Pageviews still
   register on effectively every real session, but none of it competes with LCP.
3. **It does not run for automation or on localhost.** `navigator.webdriver` is
   true under Playwright, which drives `scripts/prerender.mjs`, so the build used
   to fire a PageView on every one of the 51 routes it renders. GA4 also showed
   ~10% of sessions arriving from localhost and preview hosts. Both are now
   excluded at the source rather than filtered after the fact.

If a property ever needs a hit before `load` (a paid-landing experiment, say),
move that one ID back inline rather than reverting the whole block.

**Still open:** which GA4 property the two IDs correspond to was never
established — the Admin API returned `403 SERVICE_DISABLED`. Confirm in GA4
Admin → Data streams whether both are wanted; if not, drop one from `GA4_IDS`.

---

## 5. Hero image preload is responsive and must match `Hero.jsx`

The preload used to request a single `q=80&w=1920` URL while the `<img>`
requested `q=40` variants. A different URL is a different cache entry, so the
browser fetched the `q=80` copy at top priority (198 KB), discarded it, then
fetched the `q=40` one the markup actually asked for — making the
"optimisation" a net regression on the most important page on the site. It also
ignored the 640w/1024w candidates, so phones preloaded the 1920-wide file.

It now uses `imagesrcset` + `imagesizes` mirroring the `<img>`.

**Rule:** keep the `imagesrcset` list byte-identical to `srcSet` in
`src/components/Hero.jsx`. If they drift, the double-fetch returns silently.

**Check:** cold-load `/` in DevTools → Network, filter `photo-1519389950473`.
There must be exactly **one** request.

---

## 6. Currency defaults to INR

`src/hooks/useCurrency.js` initialises to `INR`, not `USD`.

The prerendered HTML is built with whatever that initial value is, and that HTML
is what Googlebot's first pass, every non-JS AI crawler and the
`/napcrm/pricing` meta tags read. With `USD` the page shipped `$49` while its
own `AggregateOffer` said `INR 4165`.

Detection also used to be broken outright: it called
`fetch('http://ip-api.com/json/?fields=countryCode')` — **plain HTTP from an
HTTPS page**, which every browser blocks as mixed content. The `.catch()`
swallowed it silently, so no visitor was ever switched, including the Indian
market that supplies most of the site's search traffic. ip-api.com has no HTTPS
on its free tier, so there was no drop-in replacement; detection now reads the
visitor's IANA timezone via `Intl.DateTimeFormat`, which needs no request, no
key and nothing to rate-limit. The switcher still overrides it, and a manual
choice is remembered.
