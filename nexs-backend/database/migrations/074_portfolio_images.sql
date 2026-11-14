-- Card covers for the remaining portfolio projects (real app screens with demo data), served from nexs-agency/public.
UPDATE portfolio_projects SET image_url = '/portfolio-taxiologists.webp' WHERE slug = 'taxiologists' AND image_url IS NULL;
UPDATE portfolio_projects SET image_url = '/portfolio-telesync.webp' WHERE slug = 'telesync' AND image_url IS NULL;
UPDATE portfolio_projects SET image_url = '/portfolio-callstats.webp' WHERE slug = 'callstats' AND image_url IS NULL;
UPDATE portfolio_projects SET image_url = '/portfolio-meet-master.webp' WHERE slug = 'meet-master' AND image_url IS NULL;
UPDATE portfolio_projects SET image_url = '/portfolio-hr-dashboard.webp' WHERE slug = 'hr-management-dashboard' AND image_url IS NULL;
UPDATE portfolio_projects SET image_url = '/portfolio-napcrm-manufacturing.webp' WHERE slug = 'napcrm-manufacturing' AND image_url IS NULL;
UPDATE portfolio_projects SET image_url = '/portfolio-napcrm-legal.webp' WHERE slug = 'napcrm-legal' AND image_url IS NULL;
