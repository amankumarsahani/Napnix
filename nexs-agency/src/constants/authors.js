/**
 * Article authors, as structured data and as the visible byline.
 *
 * Why this file exists: every post rendered a bare name next to a hand-typed
 * date, and the Person schema behind it carried nothing but that same name. An
 * anonymous-looking byline is a weak authority signal for AI answer engines,
 * which prefer a named author with stated expertise and a profile that can be
 * corroborated somewhere other than this site.
 *
 * NOTE FOR MAINTAINERS — `profiles` is deliberately empty for both authors.
 * A Person.sameAs must point at a profile that actually belongs to that
 * person; pointing it at the company LinkedIn page instead would conflate the
 * author with the organisation and is worse than omitting it. Add each author's
 * own LinkedIn / X / GitHub URL here and it flows into the schema and the
 * byline automatically. Until then the schema states only what is verifiable.
 *
 * `bio` is likewise limited to what the repository actually evidences: the
 * subjects each person has written about here. Do not add a years-of-
 * experience or certification claim that cannot be backed up.
 */

export const AUTHORS = {
    'aman-kumar': {
        id: 'aman-kumar',
        name: 'Aman Kumar',
        jobTitle: 'Founder & Engineering Lead',
        bio: 'Aman founded Napnix and leads its engineering work, building NapCRM and the custom CRM and automation systems Napnix delivers for agencies and service businesses.',
        knowsAbout: [
            'Custom CRM development',
            'Enterprise software architecture',
            'Microservices migration',
            'Applied AI for business workflows',
        ],
        /** @type {string[]} Add this author's own profile URLs. See note above. */
        profiles: [],
    },
    /*
     * Replaced Kshitij Bhardwaj on 2026-10-06; this author now owns the two
     * articles that byline previously carried (react-native-vs-flutter and
     * why-business-needs-pwa).
     *
     * jobTitle and knowsAbout are inherited from that byline because they
     * describe the subject matter of those two articles, which is what this file
     * limits itself to evidencing. If Anu's actual title differs, correct it
     * here — it flows into the byline, the author page and the Person schema.
     */
    'anu-kumar': {
        id: 'anu-kumar',
        name: 'Anu Kumar',
        jobTitle: 'Mobile & Web Engineer',
        bio: 'Anu builds the cross-platform mobile and progressive web applications Napnix ships, working across React Native, Flutter and the modern web platform.',
        knowsAbout: [
            'Cross-platform mobile development',
            'React Native',
            'Flutter',
            'Progressive Web Apps',
        ],
        profiles: [],
    },
};

/** @returns {{ id: string, name: string, jobTitle: string, bio: string, knowsAbout: string[], profiles: string[] }} */
export function getAuthor(id) {
    const author = AUTHORS[id];
    if (!author) throw new Error(`Unknown author id: ${id}`);
    return author;
}
