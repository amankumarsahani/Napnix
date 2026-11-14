-- FlatFit card cover: real app screenshots, served by the agency site from public/.
UPDATE portfolio_projects SET image_url = '/portfolio-flatfit.webp' WHERE slug = 'flatfit' AND image_url IS NULL;
