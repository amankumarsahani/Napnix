import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

vi.mock('../services/api', () => ({
  blogAPI: { getBySlug: vi.fn() },
}));

import BlogArticle from '../pages/BlogArticle';
import { blogAPI } from '../services/api';

/**
 * The soft-404 contract. nginx answers any /blog/<slug> with the SPA shell on a
 * 200, and that shell carries a static `index, follow`, so a withdrawn or
 * deleted article is only kept out of the index by what this component renders.
 *
 * The transient-failure case is the one worth protecting: it must stay silent on
 * robots, because a crawler rendering during an API outage would otherwise
 * deindex a live article.
 */
const renderArticle = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/blog/some-withdrawn-post']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogArticle />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );

const robotsTags = () =>
  [...document.head.querySelectorAll('meta[name="robots"]')].map((m) => m.getAttribute('content'));

const httpError = (status) => Object.assign(new Error(`HTTP ${status}`), { response: { status } });

describe('BlogArticle soft 404', () => {
  beforeEach(() => {
    document.head.querySelectorAll('meta[name="robots"]').forEach((m) => m.remove());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('noindexes a missing article, and keeps it followable', async () => {
    blogAPI.getBySlug.mockRejectedValue(httpError(404));
    renderArticle();

    await waitFor(() => expect(screen.getByText('Article Not Found')).toBeInTheDocument());
    await waitFor(() => expect(robotsTags()).toContain('noindex, follow'));
  });

  it('noindexes a 200 response that carries no article', async () => {
    blogAPI.getBySlug.mockResolvedValue({ data: { blog: null } });
    renderArticle();

    await waitFor(() => expect(screen.getByText('Article Not Found')).toBeInTheDocument());
    await waitFor(() => expect(robotsTags()).toContain('noindex, follow'));
  });

  it('does NOT noindex when the API is merely unavailable', async () => {
    blogAPI.getBySlug.mockRejectedValue(httpError(503));
    renderArticle();

    await waitFor(() => expect(screen.getByText('Article Unavailable')).toBeInTheDocument());
    expect(robotsTags()).not.toContain('noindex, follow');
    expect(robotsTags()).not.toContain('noindex, nofollow');
  });

  it('does NOT noindex on a network error with no response', async () => {
    blogAPI.getBySlug.mockRejectedValue(new Error('Network Error'));
    renderArticle();

    await waitFor(() => expect(screen.getByText('Article Unavailable')).toBeInTheDocument());
    expect(robotsTags()).not.toContain('noindex, follow');
  });

  it('tells the reader which failure it was', async () => {
    blogAPI.getBySlug.mockRejectedValue(httpError(500));
    renderArticle();

    await waitFor(() =>
      expect(screen.getByText(/couldn't load this article just now/i)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/doesn't exist/i)).not.toBeInTheDocument();
  });
});
