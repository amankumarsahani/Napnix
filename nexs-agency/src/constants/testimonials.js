/** Real client testimonials — shared by the homepage carousel and Review schema. */
export const TESTIMONIALS = [
    {
        text: "We run our manufacturing operations on NapCRM now — inventory, orders, and our lead pipeline all in one place. It replaced a pile of spreadsheets and gave the whole team the same view of the business.",
        name: "Rahul Verma",
        position: "Managing Director",
        project: "NapCRM — Verma Industries",
        initials: "RV",
    },
    {
        text: "Managing admissions, enquiries, and follow-ups used to be scattered across registers and phones. NapCRM brought it together for us, and the team picked it up quickly. Support has been genuinely helpful.",
        name: "Ajeet Yadav",
        position: "Manager, Prabhawati Vidya Peeth",
        project: "NapCRM — Education",
        initials: "AY",
    },
    {
        text: "As an advocate I need clean records and reliable follow-up. NapCRM keeps my cases, clients, and documents organised in one system, so nothing slips through. It fits how a legal practice actually works.",
        name: "Aman Singh",
        position: "Advocate, Aman Singh Legal",
        project: "NapCRM — Legal",
        initials: "AS",
    },
    {
        text: "Napnix built the Taxiologists app and our management dashboard end to end — bookings, driver tracking, and dispatch in real time. Clear timelines, regular demos, and they stayed involved after launch.",
        name: "Parminder Singh",
        position: "Owner, Taxiologists",
        project: "Taxiologists — App & Dashboard",
        initials: "PS",
    },
    {
        text: "I run lead capture and follow-up on NapCRM — every enquiry lands in one pipeline and nothing gets forgotten. Fewer tools, less manual work, and I can actually see which efforts are bringing in leads.",
        name: "Aman Singh",
        position: "Marketing Lead",
        project: "NapCRM",
        initials: "AS",
    },
];

/**
 * The client organisations named in TESTIMONIALS above, for the proof strip on
 * /services.
 *
 * Every entry is a real, named business with an attributed testimonial, and
 * three of the four also have a case study. ClientLogos used to render six
 * invented companies instead — TechCorp, HealthPlus, EduLearn, FinanceFirst,
 * RetailMax, LogiFlow — as grey two-letter tiles. With no logo assets behind
 * them the section rendered as the literal text "TC HP EL FF RM LF" under the
 * heading "Trusted by Industry Leaders", which is fabricated social proof and
 * reads as placeholder work to anyone evaluating the company.
 *
 * Four named clients stated plainly is weaker-sounding and considerably more
 * credible, and it gives an answer engine real entities to cite. Add to this
 * list only when there is a client who has agreed to be named.
 */
export const CLIENT_ORGANISATIONS = [
    { name: 'Taxiologists', sector: 'Taxi & fleet operations', caseStudy: '/portfolio/taxiologists' },
    { name: 'Verma Industries', sector: 'Manufacturing', caseStudy: '/portfolio/napcrm-manufacturing' },
    { name: 'Aman Singh Legal', sector: 'Legal practice', caseStudy: '/portfolio/napcrm-legal' },
    { name: 'Prabhawati Vidya Peeth', sector: 'Education', caseStudy: null },
];
