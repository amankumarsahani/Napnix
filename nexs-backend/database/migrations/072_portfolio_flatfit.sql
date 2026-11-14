-- Add FlatFit (Napnix's own flatmate-matching app) to the agency portfolio.
-- sort_order 15 puts it second, so it shows on the homepage's first 6.
INSERT INTO portfolio_projects
    (title, slug, category, description, tags, tech_stack, metric, industry, accent, size, status, featured, sort_order)
VALUES
    ('FlatFit', 'flatfit', 'Mobile App',
     'Flatmate-matching app for Gurgaon and Noida. Matches people on sleep, cleanliness, guests and food habits, not just budget, with in-app chat and Aadhaar QR ID checks.',
     JSON_ARRAY('Mobile App','Matching','Chat'),
     JSON_ARRAY('React Native','Rust','MariaDB'),
     'Beta', 'Housing & Rentals', 'flatfit', 'small', 'published', 1, 15)
ON DUPLICATE KEY UPDATE slug = VALUES(slug);
