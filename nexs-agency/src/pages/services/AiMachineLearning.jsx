import ServicePageTemplate from '../../components/ServicePageTemplate';

const data = {
    themeColor: 'teal',
    badge: { icon: 'ri-brain-line', label: 'Artificial Intelligence' },
    hero: {
        h1Line1: 'Intelligence,',
        h1Line2: 'Integrated.',
        gradient: 'from-[#2563EB] to-[#1D4ED8]',
        paragraph: 'Transform your business with next-gen AI. From automating workflows to predicting market trends, we build intelligent systems that drive value.',
        ctaText: 'Consult AI Expert',
        bgImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1280&q=60&fm=webp&auto=format&fit=crop',
        bgImageAlt: 'AI Background',
    },
    overview: {
        h2: 'Data into Decisions. <br /> Automation into Art.',
        paragraph: 'The future belongs to businesses that leverage data. We help you move beyond hype and implement practical, high-ROI AI solutions that integrate seamlessly with your existing infrastructure.',
        checklist: [
            'Custom Large Language Models (LLMs)',
            'Automated Customer Support',
            'Sales Forecasting Engines',
            'Intelligent Document Processing',
        ],
        bento: {
            largeImage: {
                src: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800&fm=webp',
                alt: 'AI Network',
                label: 'Predictive Power',
            },
            smallImage: {
                src: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&q=80&w=800&fm=webp',
                alt: 'Data Visualization',
            },
            stat: { value: '40%', label: 'Efficiency Boost' },
        },
    },
    capabilities: [
        {
            title: 'Generative AI',
            description: 'Custom LLM integration and fine-tuning. Build your own ChatGPT-like assistants for internal data.',
            tech: ['OpenAI API', 'Llama 2', 'LangChain', 'Vector DBs'],
            icon: 'ri-openai-fill',
            color: 'emerald',
        },
        {
            title: 'Predictive Analytics',
            description: 'Turn historical data into future insights. Forecast sales, churn, and market trends with high accuracy.',
            tech: ['Python', 'scikit-learn', 'TensorFlow', 'Pandas'],
            icon: 'ri-line-chart-line',
            color: 'blue',
        },
        {
            title: 'Computer Vision',
            description: 'Automate visual inspections, facial recognition, and object detection using state-of-the-art CNNs.',
            tech: ['OpenCV', 'YOLO', 'PyTorch'],
            icon: 'ri-camera-lens-line',
            color: 'purple',
        },
        {
            title: 'NLP & Chatbots',
            description: 'Intelligent customer service agents that understand context, sentiment, and intent.',
            tech: ['NLTK', 'SpaCy', 'Dialogflow', 'RASA'],
            icon: 'ri-chat-voice-line',
            color: 'cyan',
        },
    ],
    engagement: {
        h2: 'How an AI project runs',
        intro: "Most AI work that fails does so because the data was not ready or the task did not need a model. We check both before quoting a build, and we will tell you when a set of rules would do the job for a fraction of the cost.",
        phases: [
            {
                title: 'Problem framing and a feasibility check',
                body: 'We start from the decision you want to change, not the technique. Then we test whether it needs a model at all: a surprising share of requests are better served by a report, a rules engine or an off-the-shelf API. If a model is warranted we define what good looks like as a number, before any training, so there is a threshold to judge the result against.',
            },
            {
                title: 'Data audit',
                body: 'We assess what you actually hold: volume, labelling quality, class balance, and how much of it is reachable without a migration. This is where projects get re-scoped, and it is far cheaper to discover a labelling gap here than after a build. You get a written assessment either way.',
            },
            {
                title: 'Baseline, then a model',
                body: 'The first thing we ship is a deliberately simple baseline. It sets the bar a model has to clear to be worth its operating cost, and often it is close enough that we stop there. Where a model does win, we can show by how much rather than asserting it.',
            },
            {
                title: 'Evaluation against the threshold',
                body: 'We measure on data the model has not seen, report the failure modes rather than the headline accuracy, and include the cases it gets confidently wrong. For anything touching people, we check performance across the groups the system will be used on.',
            },
            {
                title: 'Deployment and monitoring',
                body: 'The model ships behind an API with versioning, request logging and a documented rollback. Inputs drift, so we set up monitoring on the input distribution and on prediction quality, with an alert when either moves. A model nobody is watching quietly degrades.',
            },
        ],
        questions: [
            {
                q: 'How much data do we need?',
                a: 'It depends far more on how distinct the categories are than on raw volume. A clean binary classification on well-separated text can work from a few thousand labelled examples; subtle multi-class problems need tens of thousands. If you are using a general-purpose language model with retrieval, the figure can drop to a few hundred good examples, because the model already brings the language understanding. The data audit answers this for your case specifically.',
            },
            {
                q: 'Should we fine-tune a model or use retrieval?',
                a: 'Start with retrieval. Putting your documents behind a general-purpose model is cheaper, updates the moment your content changes, and lets you cite sources, which matters when someone asks why the system said what it said. Fine-tuning earns its cost when you need a particular output format or tone reliably, or when latency and per-call price at volume make a smaller specialised model worth running.',
            },
            {
                q: 'Can you work with the data we have in NapCRM?',
                a: 'Yes, and that is usually the most productive starting point, because CRM data is already structured and already yours. Common work includes lead scoring from historical conversion, routing enquiries by predicted intent, and surfacing accounts that have gone quiet. No separate data warehouse is needed to begin.',
            },
            {
                q: 'What does an AI project cost to run, not just to build?',
                a: 'Running cost is the part most estimates omit. Hosted model APIs are billed per token or per request and scale directly with usage, so a successful feature gets more expensive, not less. A self-hosted model trades that for fixed GPU cost. We put both figures in the estimate at projected volume so the choice is made on arithmetic.',
            },
        ],
    },
    capabilitiesSection: { label: 'Our Capabilities', title: 'AI Innovation' },
    bottomSection: { title: 'Service Integration', currentService: 'AI & Machine Learning' },
    cta: {
        h2: 'Ready to Automate?',
        paragraph: 'Discover how AI can reduce costs and increase revenue for your business.',
        buttonText: 'Explore AI Solutions',
    },
    seo: {
        title: 'AI & Machine Learning Services | Generative AI Solutions',
        description: 'Unlock the power of AI with Napnix. Custom Machine Learning, Generative AI, and Predictive Analytics for enterprise growth.',
        keywords: 'AI ML development India, machine learning solutions, artificial intelligence services, NLP development, computer vision India, AI consulting Mohali, predictive analytics, deep learning',
        canonicalPath: '/services/ai-machine-learning',
        ogTitle: 'AI & Machine Learning Services | Generative AI Solutions',
        ogDescription: 'Unlock the power of AI with Napnix. Custom Machine Learning, Generative AI, and Predictive Analytics.',
        twitterTitle: 'AI & Machine Learning Services | Generative AI Solutions',
        twitterDescription: 'Unlock the power of AI with Napnix. Custom Machine Learning, Generative AI, and Predictive Analytics.',
    },
    schema: {
        name: 'AI & Machine Learning Services',
        description: 'Enterprise AI and Machine Learning development services. Generative AI, Predictive Analytics, and Computer Vision solutions.',
    },
};

export default function AiMachineLearning() {
    return <ServicePageTemplate data={data} />;
}
