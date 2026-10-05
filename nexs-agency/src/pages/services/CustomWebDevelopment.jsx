import ServicePageTemplate from '../../components/ServicePageTemplate';

const data = {
    themeColor: 'teal',
    badge: { icon: 'ri-code-s-slash-line', label: 'Web Engineering' },
    hero: {
        h1Line1: 'Scalable',
        h1Line2: 'Web Applications.',
        gradient: 'from-[#2563EB] to-[#1D4ED8]',
        paragraph: 'We define the digital standard for your business with robust, secure, and high-performance web solutions tailored to your unique goals.',
        ctaText: 'Start Project',
        bgImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&q=60&fm=webp&auto=format&fit=crop',
        bgImageAlt: 'Background',
    },
    overview: {
        h2: 'Built for Scale. <br /> Designed for Growth.',
        paragraph: "Off-the-shelf software often creates more problems than it solves. We build custom platforms that fit your business logic perfectly, allowing you to innovate without constraints.",
        checklist: [
            'Single Page Applications (SPAs)',
            'Progressive Web Apps (PWAs)',
            'Enterprise SaaS Platforms',
            'Complex Dashboards & Portals',
        ],
        bento: {
            largeImage: {
                src: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=60&w=1280&auto=format&fit=crop&fm=webp',
                alt: 'Coding Interface',
                label: 'Code Excellence',
            },
            smallImage: {
                src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=60&w=1280&auto=format&fit=crop&fm=webp',
                alt: 'Analytics Dashboard',
            },
            stat: { value: '99%', label: 'Uptime Guarantee' },
        },
    },
    capabilities: [
        {
            title: 'Frontend Architecture',
            description: 'Pixel-perfect, responsive interfaces built with React and Next.js for maximum performance and SEO.',
            tech: ['React.js', 'Next.js', 'Tailwind Connectivity', 'Framer Motion'],
            icon: 'ri-layout-masonry-line',
            color: 'blue',
        },
        {
            title: 'Backend Engineering',
            description: 'Scalable server-side solutions designed to handle high concurrency and complex business logic.',
            tech: ['Node.js', 'Python', 'PostgreSQL', 'Redis'],
            icon: 'ri-server-line',
            color: 'purple',
        },
        {
            title: 'API Development',
            description: 'Secure RESTful and GraphQL APIs that seamlessly connect your applications with third-party services.',
            tech: ['GraphQL', 'REST', 'Stripe Integration', 'Auth0'],
            icon: 'ri-links-line',
            color: 'emerald',
        },
        {
            title: 'Cloud Infrastructure',
            description: 'Automated CI/CD pipelines and serverless architectures for rapid, reliable deployment.',
            tech: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
            icon: 'ri-cloud-windy-line',
            color: 'cyan',
        },
    ],
    engagement: {
        h2: 'How a web build runs',
        intro: "Most custom web projects fail on scope and handover, not on code. The sequence below is the one we use on every engagement, and the deliverables at each step are yours whether or not the project continues past it.",
        phases: [
            {
                title: 'Scoping, 1 to 2 weeks',
                body: 'We map the workflows the application has to support and write them down as user stories with acceptance criteria. This is where most of the cost is decided, so it happens before any code. You leave with a written scope, a build estimate in INR, and a prioritised list of what is in the first release and what is deliberately deferred.',
            },
            {
                title: 'Architecture and data model',
                body: 'We design the schema and the API surface first, because retrofitting a data model after launch is the single most expensive change in a web project. You get an ER diagram, the API contract, and a decision record for the trade-offs we made on storage, caching and authentication.',
            },
            {
                title: 'Build in two-week increments',
                body: 'Work ships to a staging URL every fortnight with a short demo. You can use the application while it is being built rather than reviewing screenshots, which is how scope problems surface early enough to be cheap to fix.',
            },
            {
                title: 'Hardening and launch',
                body: 'Before go-live: load testing against expected concurrency, an accessibility pass, Core Web Vitals measurement on real devices, automated backups, and error tracking wired to an inbox you control. We deploy behind a CDN with CI/CD so later releases do not need us to be available.',
            },
            {
                title: 'Handover',
                body: 'You receive the repository, the infrastructure in your own cloud account, environment documentation, and a runbook for the common operational tasks. Nothing is locked to us. If you want ongoing work we quote it separately rather than assuming a retainer.',
            },
        ],
        questions: [
            {
                q: 'How much does a custom web application cost?',
                a: 'A focused internal tool or portal typically runs from about ₹4,00,000. A multi-tenant SaaS platform with billing, roles and an admin surface is usually ₹15,00,000 and up. The variable that moves the number most is the number of distinct user roles, because each one multiplies the permission logic and the testing surface. We give a written estimate after scoping, not before.',
            },
            {
                q: 'Should we build custom or use an off-the-shelf product?',
                a: 'Buy when your process is close to an industry standard, because you are then paying for someone else to maintain it. Build when the process is the thing that differentiates you, or when the licensing cost of a product scales with seats faster than your revenue does. We will say so if a product fits better than a build, and we have told clients to buy.',
            },
            {
                q: 'What happens if we need to change direction mid-build?',
                a: 'Two-week increments exist for this. Re-prioritising the backlog between increments costs nothing. Changing the data model or the authentication approach after launch is the expensive case, which is why those decisions are made and written down in the architecture phase.',
            },
            {
                q: 'Who owns the code?',
                a: 'You do, from the first commit. The repository sits in your organisation and the infrastructure runs in your cloud account. There is no proprietary runtime or licence that stops another team picking the project up.',
            },
        ],
    },
    capabilitiesSection: { label: 'Technical Expertise', title: 'Full-Stack Excellence' },
    bottomSection: { title: 'More Solutions', currentService: 'Custom Web Development' },
    cta: {
        h2: 'Ready to Build?',
        paragraph: "Let's turn your concept into a high-performing digital product.",
        buttonText: 'Get Your Free Quote',
    },
    seo: {
        title: 'Custom Web Development Services | Enterprise Solutions',
        description: 'Build scalable, high-performance web applications with Napnix. Expert React, Next.js, and Node.js developers delivering custom solutions for global brands.',
        keywords: 'custom web development India, bespoke web application, React development company, Next.js development, full stack web development Mohali, enterprise web solutions, scalable web applications',
        canonicalPath: '/services/custom-web-development',
        ogTitle: 'Custom Web Development Services | Enterprise Solutions',
        ogDescription: 'Build scalable, high-performance web applications with Napnix. Expert React, Next.js, and Node.js developers.',
        twitterTitle: 'Custom Web Development Services | Enterprise Solutions',
        twitterDescription: 'Build scalable, high-performance web applications with Napnix. Expert React, Next.js, and Node.js developers.',
    },
    schema: {
        name: 'Custom Web Development',
        description: 'Enterprise-grade custom web application development services using React, Next.js, and Node.js.',
    },
};

export default function CustomWebDevelopment() {
    return <ServicePageTemplate data={data} />;
}
