IndexNow host key
=================

The file 9a67fcc2c8a45afb14e6957f0e705dc9.txt in this directory is an IndexNow host key. IndexNow lets us
tell Bing, Yandex, Seznam and Naver that a URL changed, instead of waiting for
them to re-crawl. Google does NOT participate in IndexNow — for Google the
sitemap and Search Console remain the mechanism.

Why it matters here: Bing backs Bing Copilot and ChatGPT Search, both of which
robots.txt explicitly invites, so faster Bing indexation is faster AI-surface
visibility.

The key must stay served at https://napnix.in/9a67fcc2c8a45afb14e6957f0e705dc9.txt with the key as its
only content. Deleting or changing it invalidates submissions.

Submit after a deploy with:
  INDEXNOW_KEY=9a67fcc2c8a45afb14e6957f0e705dc9 \
  "$CLAUDE_PLUGIN_ROOT/scripts/claude-seo" run indexnow_submit.py \
    --host napnix.in --urls-file deploy/indexnow-urls.txt
