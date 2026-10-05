import ServicePageTemplate from '../../components/ServicePageTemplate';

const data = {
    themeColor: 'teal',
    badge: { icon: 'ri-shopping-cart-2-line', label: 'Digital Commerce' },
    hero: {
        h1Line1: 'Sell Smarter.',
        h1Line2: 'Grow Faster.',
        gradient: 'from-[#2563EB] to-[#1D4ED8]',
        paragraph: 'We build data-driven e-commerce experiences that turn visitors into loyal customers. From headless storefronts to complex marketplaces.',
        ctaText: 'Start Selling',
        bgImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=1280&q=60&fm=webp&auto=format&fit=crop',
        bgImageAlt: 'Ecommerce Background',
    },
    overview: {
        h2: 'Experience-Led. <br /> Conversion-Focused.',
        paragraph: "In a crowded market, generic stores don\u2019t cut it. We design unique shopping journeys that reflect your brand and remove friction at every touchpoint.",
        checklist: [
            'High-Performance Storefronts',
            'Seamless Payment Integration',
            'Inventory Management Sync',
            'Loyalty Program Systems',
        ],
        bento: {
            largeImage: {
                src: 'https://images.unsplash.com/photo-1601933973783-43cf8a7d4c5f?auto=format&fit=crop&q=80&w=800&fm=webp',
                alt: 'Online Shopping',
                label: 'Seamless Checkout',
            },
            smallImage: {
                src: 'https://images.unsplash.com/photo-1556742031-c6961e8560b0?auto=format&fit=crop&q=80&w=800&fm=webp',
                alt: 'Payment Terminal',
            },
            stat: { value: '3x', label: 'Conversion Rate' },
        },
    },
    capabilities: [
        {
            title: 'Custom Shopify',
            description: "Bespoke Shopify Plus themes and private apps that push the boundaries of what\u2019s possible.",
            tech: ['Liquid', 'Hydrogen', 'Shopify CLI', 'Storefront API'],
            icon: 'ri-shopping-bag-3-line',
            color: 'green',
        },
        {
            title: 'WooCommerce',
            description: 'Scalable WordPress-based stores with custom plugin development and performance optimization.',
            tech: ['PHP', 'WordPress', 'MySQL', 'Redis'],
            icon: 'ri-wordpress-fill',
            color: 'blue',
        },
        {
            title: 'Marketplace Development',
            description: 'Complex multi-vendor platforms like Amazon or Etsy, built for high transaction volumes.',
            tech: ['Next.js', 'Stripe Connect', 'PostgreSQL', 'Elasticsearch'],
            icon: 'ri-store-3-line',
            color: 'orange',
        },
        {
            title: 'Headless Commerce',
            description: 'Decoupled frontend experiences powered by best-in-class commerce backends.',
            tech: ['Medusa.js', 'Contentful', 'Sanity', 'Vercel'],
            icon: 'ri-arrow-right-up-line',
            color: 'purple',
        },
    ],
    engagement: {
        h2: 'How a storefront build runs',
        intro: "The build is rarely what decides whether an online store works. Payments, logistics and the tax setup are, and in India those are where the detail lives. We sequence the work accordingly.",
        phases: [
            {
                title: 'Platform decision',
                body: 'Shopify, WooCommerce or custom, chosen against your catalogue and your margin rather than by default. A few hundred simple SKUs rarely justify a custom build. Complex configurable products, B2B price lists per customer, or stock shared across channels often do. We will recommend a hosted platform when it fits, even though it is the smaller project.',
            },
            {
                title: 'Payments and the tax setup',
                body: 'Indian checkout means UPI first, because it is how most customers actually pay, alongside cards, net banking and usually cash on delivery. We wire a gateway such as Razorpay or PayU, set GST rates per HSN code, and make sure invoices carry what the law requires. Getting GST wrong is an accounting problem that surfaces months later, so it is handled at build time.',
            },
            {
                title: 'Catalogue, search and the product page',
                body: 'We model variants, build search that tolerates misspellings and synonyms, and structure product pages with the schema needed for rich results. Most storefront revenue is decided on the product page and in search, so these get the attention, not the homepage carousel.',
            },
            {
                title: 'Logistics and operations',
                body: 'Shipping rates by weight and pin code, courier integration for label generation and tracking, and a returns flow your team can actually operate. If stock lives in NapCRM or an ERP, we sync it rather than letting two systems disagree about what is available.',
            },
            {
                title: 'Launch and the first month',
                body: 'Before launch: Core Web Vitals on mobile, since most Indian traffic is mobile and checkout abandonment tracks page speed closely; analytics with ecommerce events; and abandoned-cart recovery configured. Afterwards we watch the checkout funnel for the first month, because that is when the real-traffic problems appear.',
            },
        ],
        questions: [
            {
                q: 'Shopify or a custom storefront?',
                a: 'Shopify is the right answer more often than agencies admit. You get hosting, PCI compliance, a payment stack and an app ecosystem for a predictable monthly fee, and no maintenance burden. It becomes the wrong answer when per-transaction fees at your volume exceed the cost of building, when you need B2B pricing logic or deep ERP integration it cannot express, or when the catalogue structure fights the platform. We model both at your projected volume.',
            },
            {
                q: 'How do you handle GST and invoicing?',
                a: 'Tax rates are configured per HSN code rather than per product, so a catalogue change does not break the tax setup. Invoices are generated with GSTIN, HSN codes and the correct CGST/SGST or IGST split depending on whether the sale crosses a state line. Where you need it in Tally or Zoho Books, we push invoice data across rather than leaving someone to re-key it.',
            },
            {
                q: 'Can the store share stock with our CRM or ERP?',
                a: 'Yes, and it should. Two systems holding independent stock numbers is how overselling happens. We sync inventory in one direction with a clear owner for the number, usually the ERP, and push orders back the other way. NapCRM has this built in; other systems connect over their API or a scheduled job.',
            },
            {
                q: 'What about cash on delivery?',
                a: 'It is still a large share of Indian ecommerce orders and needs deliberate handling, because COD carries higher return rates and ties up stock. We typically add order confirmation by call or WhatsApp for COD above a value threshold, pin-code-level COD availability, and a partial prepayment option. Those three measurably reduce failed deliveries.',
            },
        ],
    },
    capabilitiesSection: { label: 'Our Expertise', title: 'Commerce Solutions' },
    bottomSection: { title: 'Related Services', currentService: 'E-commerce Development' },
    cta: {
        h2: 'Ready to Scale?',
        paragraph: 'Build an online store that delivers results.',
        buttonText: 'Get Your Free Quote',
    },
    seo: {
        title: 'E-commerce Development Services | Shopify & Custom Stores',
        description: 'Build high-conversion online stores with Napnix. Experts in Shopify, WooCommerce, and Headless Commerce solutions.',
        keywords: 'ecommerce development India, online store development, Shopify development, custom ecommerce platform, ecommerce website Mohali, WooCommerce development, headless commerce India',
        canonicalPath: '/services/ecommerce-development',
        ogTitle: 'E-commerce Development Services | Shopify & Custom Stores',
        ogDescription: 'Build high-conversion online stores with Napnix. Experts in Shopify, WooCommerce, and Headless Commerce solutions.',
        twitterTitle: 'E-commerce Development Services | Shopify & Custom Stores',
        twitterDescription: 'Build high-conversion online stores with Napnix. Experts in Shopify, WooCommerce, and Headless Commerce solutions.',
    },
    schema: {
        name: 'E-commerce Development',
        description: 'Expert E-commerce development services. Shopify, WooCommerce, and Custom Marketplaces.',
    },
};

export default function EcommerceDevelopment() {
    return <ServicePageTemplate data={data} />;
}
