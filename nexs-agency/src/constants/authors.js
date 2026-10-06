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
        bio: 'Aman co-founded Napnix and leads its engineering work, building NapCRM and the custom CRM and automation systems Napnix delivers for agencies and service businesses.',
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
     * Replaced Kshitij Bhardwaj on 2026-10-06, and owns the two articles that
     * byline carried (react-native-vs-flutter and why-business-needs-pwa).
     *
     * Same title as Aman: both are founders of Napnix. `founder` on the
     * Organization node in seoConfig.js references both of these Person records,
     * so the company entity and the two people resolve to each other — which is
     * the point of giving authors their own pages at all.
     *
     * knowsAbout stays mobile and web, because that is what the articles under
     * this byline are about and this file limits itself to what the repository
     * evidences.
     */
    'anu-kumar': {
        id: 'anu-kumar',
        name: 'Anu Kumar',
        jobTitle: 'Founder & Engineering Lead',
        bio: 'Anu co-founded Napnix and builds the cross-platform mobile and progressive web applications it ships, working across React Native, Flutter and the modern web platform.',
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
