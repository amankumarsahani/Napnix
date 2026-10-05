import ServicePageTemplate from '../../components/ServicePageTemplate';

const data = {
    themeColor: 'teal',
    badge: { icon: 'ri-cloud-windy-line', label: 'Cloud Infrastructure' },
    hero: {
        h1Line1: 'Scale Without',
        h1Line2: 'Limits.',
        gradient: 'from-[#2563EB] to-[#1D4ED8]',
        paragraph: 'Build, deploy, and manage your applications with the speed and reliability of modern cloud infrastructure.',
        ctaText: 'Plan Your Migration',
        bgImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280&q=60&fm=webp&auto=format&fit=crop',
        bgImageAlt: 'Background',
    },
    overview: {
        h2: 'Agility. Security. <br /> Cost Efficiency.',
        paragraph: "The cloud isn\u2019t just a place to store data; it\u2019s an innovation engine. We help you leverage the full power of AWS, Azure, and GCP to build resilient systems that grow with your business.",
        checklist: [
            '99.99% Uptime Architectures',
            'Auto-Scaling Infrastructure',
            'Disaster Recovery Planning',
            'Cost Optimization Audits',
        ],
        bento: {
            largeImage: {
                src: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800&fm=webp',
                alt: 'Server Room',
                label: 'Secure Infrastructure',
            },
            smallImage: {
                src: 'https://images.unsplash.com/photo-1667372393119-c85c020799a3?auto=format&fit=crop&q=80&w=800&fm=webp',
                alt: 'Cloud Data',
            },
            stat: { value: '99.9%', label: 'Uptime SLA' },
        },
    },
    capabilities: [
        {
            title: 'Cloud Migration',
            description: 'Seamlessly move your legacy infrastructure to the cloud with zero downtime strategies.',
            tech: ['AWS Migration Hub', 'Azure Migrate', 'VMware'],
            icon: 'ri-upload-cloud-2-line',
            color: 'blue',
        },
        {
            title: 'DevOps Automation',
            description: 'Accelerate delivery with CI/CD pipelines, Infrastructure as Code, and automated testing.',
            tech: ['Jenkins', 'GitHub Actions', 'Terraform', 'Ansible'],
            icon: 'ri-loop-right-line',
            color: 'orange',
        },
        {
            title: 'Serverless Architecture',
            description: 'Reduce costs and operational overhead by moving to event-driven, serverless computing.',
            tech: ['AWS Lambda', 'Azure Functions', 'Google Cloud Run'],
            icon: 'ri-server-line',
            color: 'purple',
        },
        {
            title: 'Cloud Security',
            description: 'Implement banking-grade security, compliance monitoring, and identity management.',
            tech: ['IAM', 'WAF', 'Shield', 'CloudTrail'],
            icon: 'ri-shield-check-line',
            color: 'cyan',
        },
    ],
    engagement: {
        h2: 'How cloud work runs',
        intro: "Cloud projects go wrong in two directions: a lift-and-shift that costs more than the servers it replaced, and a re-architecture that takes a year. Which one you need depends on what is actually hurting, so that is the first thing we establish.",
        phases: [
            {
                title: 'Assessment and the cost baseline',
                body: 'We inventory what is running, what it costs today, and where the pain actually is: spend, reliability, deployment speed or compliance. Without a baseline there is no way to tell afterwards whether the migration worked, and "it feels faster" is not a result anyone can act on.',
            },
            {
                title: 'Choosing the migration path',
                body: 'Rehost, replatform or refactor, decided per workload rather than for the whole estate. A stable internal application that nobody is changing is usually best rehosted and left alone. The service that blocks every release is the one worth refactoring. Most estates end up with a mix, and saying so early prevents a year-long rewrite nobody asked for.',
            },
            {
                title: 'Infrastructure as code',
                body: 'Everything is defined in Terraform from the start, so the environment can be rebuilt from the repository rather than from memory. This is also what makes a staging environment that genuinely matches production possible, which is where most deployment surprises come from.',
            },
            {
                title: 'Migration with a rollback',
                body: 'We move workload by workload, each with a tested rollback and a defined cutover window. Data migrations run as a dry run against a copy first. Nothing moves on a Friday.',
            },
            {
                title: 'Cost controls and handover',
                body: 'After cutover we set budget alerts, right-size the instances against observed load rather than the guesses made during planning, and move cold data to cheaper storage classes. You get the Terraform repository, runbooks, and a monthly cost breakdown by service, in your own cloud account.',
            },
        ],
        questions: [
            {
                q: 'Will moving to the cloud reduce our costs?',
                a: 'Often not at first, and anyone promising otherwise is guessing. A straight lift-and-shift of always-on servers frequently costs more than the hardware did, because you are now paying retail for idle capacity. Savings come from the things the cloud makes possible afterwards: scaling down out of hours, managed services instead of self-run databases, and tiered storage. We model the before and after figures during assessment so the decision is not taken on faith.',
            },
            {
                q: 'AWS, Azure or Google Cloud?',
                a: 'For most workloads the three are close enough that the deciding factors are practical: existing commitments and credits, whether your team already knows one, what your compliance regime requires about data residency, and which has a region near your users. If you are already on Microsoft 365 and Entra ID, Azure removes real integration work. We have no reseller arrangement with any of them, so the recommendation is not influenced by margin.',
            },
            {
                q: 'Do we need Kubernetes?',
                a: 'Usually not. Kubernetes earns its considerable operational overhead when you are running many services with genuinely independent scaling, or you need to be portable across providers. For a handful of services, a managed container runtime such as ECS, Cloud Run or App Service does the same job with a fraction of the complexity and far fewer ways to page someone at 3am. We suggest it only when the workload warrants it.',
            },
            {
                q: 'How do you handle data residency for Indian clients?',
                a: 'All three providers have Indian regions, and we default to them for Indian data unless there is a reason not to. Where a regulation or a client contract requires data to stay in India, we constrain it in the Terraform configuration rather than in a policy document, so a later deployment cannot quietly place a resource elsewhere.',
            },
        ],
    },
    capabilitiesSection: { label: 'Our Expertise', title: 'DevOps & Cloud' },
    bottomSection: { title: 'Related Services', currentService: 'Cloud Solutions' },
    cta: {
        h2: 'Ready to Migrate?',
        paragraph: 'Optimize your cloud infrastructure for speed, security, and cost.',
        buttonText: 'Get Your Free Audit',
    },
    seo: {
        title: 'Cloud Solutions & DevOps Services | AWS & Azure Experts',
        description: 'Scale your business with expert Cloud and DevOps services from Napnix. Security, migration, and automation on AWS, Azure, and GCP.',
        keywords: 'cloud solutions India, AWS cloud services, cloud migration, DevOps services Mohali, cloud infrastructure management, serverless architecture India, cloud consulting',
        canonicalPath: '/services/cloud-solutions',
        ogTitle: 'Cloud Solutions & DevOps Services | AWS & Azure Experts',
        ogDescription: 'Scale your business with expert Cloud and DevOps services from Napnix. Security, migration, and automation on AWS, Azure, and GCP.',
        twitterTitle: 'Cloud Solutions & DevOps Services | AWS & Azure Experts',
        twitterDescription: 'Scale your business with expert Cloud and DevOps services from Napnix. Security, migration, and automation on AWS, Azure, and GCP.',
    },
    schema: {
        name: 'Cloud Solutions & DevOps',
        description: 'Expert Cloud and DevOps services. AWS, Azure, Google Cloud migration and management.',
    },
};

export default function CloudSolutions() {
    return <ServicePageTemplate data={data} />;
}
