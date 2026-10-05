# Citations and NAP — the canonical record

Copy from this file when creating or correcting any listing. Google
cross-references name, address and phone across a site, its structured data
and its directory citations; a listing that disagrees with the others weakens
all of them.

This file exists because that already happened. The site published
`IT Park, Sector 67, Mohali 160062` in schema while Clutch — the listing
carrying the only verified client review — said `2519, Azad Nagar, Balongi`.
Four different founding years were live simultaneously (2020 in three places,
2023 in `llms-full.txt`, 2025 on Clutch, with the domain registered 2026).

## Canonical NAP

```
Name      Napnix
Street    2519, Azad Nagar, Balongi
Locality  Sahibzada Ajit Singh Nagar (Mohali)
Region    Punjab
Postcode  160055
Country   India
Phone     +91 6239396615          display
          +916239396615           E.164, for tel: links and schema
Phone 2   +91 7009108646          support only; never the primary
Email     info@napnix.in
Founded   2025
Geo       30.7293, 76.6947        Balongi locality centroid
Website   https://napnix.in
```

Two caveats on the geo pair: it is a locality centroid, not the building.
Replace it with a real pin when you have one — `index.html` and
`CityLandingPage.jsx` (`mohali` entry) both carry it. Postcode 160055 is the
Balongi BO record; Clutch states none, so confirm against your post.

Source of truth in code is `src/constants/siteConfig.js` and
`src/constants/seoConfig.js`. Change them there, never inline.

## Priority order

Ranked by what actually moves a four-month-old local business, not by
domain authority.

### 1. Google Business Profile — not created

Nothing was found for Napnix. This is the largest single gap in the whole
audit. A GBP is how a local business enters the Map Pack, and
`/software-development-company/mohali` is currently not indexed at all.

Free, roughly thirty minutes, requires postcard or phone verification at the
Balongi address. Use the NAP above exactly. Category: *Software company*.
Add the service areas you genuinely cover (Mohali, Chandigarh, Panchkula,
Zirakpur) rather than every city with a landing page.

Nothing else on this list comes close in value.

### 2. Bing Places and Bing Webmaster Tools

Free, and Bing Webmaster also unlocks backlink data, which the audit tooling
cannot currently read at all (no Moz, Bing or Keywords Everywhere key, and
Common Crawl has no entry for the domain). It additionally feeds Copilot,
which matters given the GEO work already in the repo.

### 3. Claim and correct the two live profiles

- **Clutch** — `clutch.co/profile/napnix`. Live, links to napnix.in, carries a
  verified 5.0 review from the taxi fleet client. Confirm the NAP matches
  above.
- **The Manifest** — `themanifest.com/company/napnix`. Clutch's sister site,
  indexed, same data.

Both already exist. Correcting them costs nothing and makes three sources
agree for the first time.

### 4. Relevant B2B directories

GoodFirms and DesignRush are genuine agency directories where buyers actually
look. A profile there is worth more than fifty generic listings.

### 5. LinkedIn company page

Already in `siteConfig.socialUrls`. Check the About section matches the NAP
and the 2025 founding.

## What not to do

Skip the "top 100 free business listing sites with high DA" lists. Mass
directory submission is a 2010-era tactic that Google discounts, and it looks
manipulative on a domain registered four months ago. The September 2026 Spam
Update began on 24 September, global and all-language, with no named target.
A new domain that suddenly acquires a hundred directory links is the wrong
shape to present right now.

Justdial, Sulekha and IndiaMART are defensible — they carry real local search
traffic in India. The rest of those lists are not.

## Before any of this matters

The live site exposes **zero crawlable `<a href>`**; the prerendered build has
**123**. Internal linking is already correct — all eight city pages sit in the
footer plus the `AreasWeServe` component — but crawlers cannot see it, so
inbound equity has nowhere to flow.

Prerendering needs one command on the VPS:

```bash
cd /var/www/html/Napnix/nexs-agency
npx playwright install --with-deps chromium --only-shell
```

Do that before the outreach, not after.
