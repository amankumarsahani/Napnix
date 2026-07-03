export const inquiryIntentOptions = [
    {
        value: 'demo',
        label: 'Schedule a demo',
        description: 'See NapCRM or our delivery workflow before deciding.',
    },
    {
        value: 'audit',
        label: 'Revenue-Leak Audit',
        description: 'Find where leads and follow-ups are slipping, and how to fix it.',
    },
    {
        value: 'build',
        label: 'Build a product',
        description: 'Launch a custom web app, mobile app, or internal platform.',
    },
    {
        value: 'optimize',
        label: 'Improve conversion',
        description: 'Fix UX, speed, SEO, or lead flow on an existing site.',
    },
    {
        value: 'automate',
        label: 'Automate operations',
        description: 'Use AI, CRM, or workflow tools to reduce manual work.',
    },
    {
        value: 'support',
        label: 'Existing client support',
        description: 'Get help with an active delivery, support, or maintenance issue.',
    },
    {
        value: 'other',
        label: 'Something else',
        description: 'General questions, partnerships, or anything not listed above.',
    },
];

export const defaultInquiryIntent = inquiryIntentOptions[0].value;

const inquiryIntentMap = Object.fromEntries(
    inquiryIntentOptions.map((option) => [option.value, option])
);

export function normalizeInquiryIntent(value) {
    return inquiryIntentMap[value] ? value : defaultInquiryIntent;
}

export function getInquiryIntentFromSearch(search = '') {
    const params = new URLSearchParams(search);
    return normalizeInquiryIntent(params.get('intent'));
}

export function buildInquiryMessage(intent, details = '', context = '') {
    const option = inquiryIntentMap[normalizeInquiryIntent(intent)];
    const detailParts = [context, details]
        .map((value) => value?.trim())
        .filter(Boolean);

    return [
        `Inquiry intent: ${option.label}`,
        option.description,
        detailParts.length
            ? `Details:\n${detailParts.join('\n\n')}`
            : 'Details:\nPlease share the next best step and we will follow up quickly.',
    ].join('\n\n');
}
