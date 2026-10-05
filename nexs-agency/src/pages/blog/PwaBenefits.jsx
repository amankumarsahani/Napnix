import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import RelatedServices from '../../components/seo/RelatedServices';
import ArticleSchema from '../../components/seo/ArticleSchema';
import ArticleHeader from '../../components/seo/ArticleHeader';
import ArticleFooter from '../../components/seo/ArticleFooter';
import { AnswerBlock, DataTable } from '../../components/seo/ArticleBlocks';
import { SITE_URL } from '../../constants/siteConfig';
import { getPost } from '../../constants/blogPosts';

const SLUG = 'why-business-needs-pwa';

const SOURCES = [
    {
        title: 'Progressive Web Apps — what they are and how to build one',
        publisher: 'web.dev, Google',
        url: 'https://web.dev/explore/progressive-web-apps',
    },
    {
        title: 'Service Worker API reference',
        publisher: 'MDN Web Docs',
        url: 'https://developer.mozilla.org/docs/Web/API/Service_Worker_API',
    },
    {
        title: 'Push API browser compatibility, including Safari on iOS',
        publisher: 'MDN Web Docs',
        url: 'https://developer.mozilla.org/docs/Web/API/Push_API#browser_compatibility',
    },
    {
        title: 'Web app manifest',
        publisher: 'MDN Web Docs',
        url: 'https://developer.mozilla.org/docs/Web/Progressive_web_apps/Manifest',
    },
];

const PwaBenefits = () => {
    const post = getPost(SLUG);
    const url = `${SITE_URL}/blog/${SLUG}`;
    const metaTitle = 'Why Your Business Needs a PWA (And When It Does Not)';

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-blue-600 selection:text-white pt-20">
            <Helmet>
                <title>{metaTitle}</title>
                <meta name="description" content={post.excerpt} />
                <link rel="canonical" href={url} />
                <meta property="og:title" content={metaTitle} />
                <meta property="og:description" content={post.excerpt} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={url} />
                <meta property="og:image" content={post.image} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={metaTitle} />
                <meta name="twitter:description" content={post.excerpt} />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
                <meta property="og:site_name" content="Napnix" />
                <meta property="og:locale" content="en_IN" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta name="twitter:site" content="@napnix" />
                <meta name="twitter:creator" content="@napnix" />
                <meta property="article:published_time" content={post.published} />
                <meta property="article:modified_time" content={post.updated} />
            </Helmet>
            <ArticleSchema slug={SLUG} />

            <article className="max-w-4xl mx-auto px-6 py-12">
                <ArticleHeader slug={SLUG} accent="blue" />

                <div className="prose prose-lg prose-blue mx-auto">
                    <AnswerBlock question="What is a Progressive Web App?">
                        <p>
                            A <strong>Progressive Web App is a website that installs and behaves like
                            an app</strong>. A service worker lets it cache content and work offline, a
                            web app manifest lets it be added to the home screen and launch without
                            browser chrome, and because it is still a website, search engines can index
                            it and users reach it from a link — no app-store download required.
                        </p>
                    </AnswerBlock>

                    <p className="lead text-xl text-slate-600 mb-8">
                        PWAs give you most of what an app install provides while keeping the reach of
                        the open web. That combination is genuinely valuable — and it has real limits
                        that vendors tend not to mention. Both halves are below.
                    </p>

                    <h2>Why would you choose a PWA?</h2>

                    <h3>1. No install barrier</h3>
                    <p>
                        Persuading someone to visit a page is far easier than persuading them through
                        an app-store download. A PWA can prompt to install from the browser, so the
                        user commits after seeing value rather than before.
                    </p>

                    <h3>2. It stays discoverable</h3>
                    <p>
                        Native app content sits in a walled garden. A PWA is a website, so its pages
                        are crawlable, indexable and linkable — which also means they can be cited by
                        AI search engines, where native app content simply cannot appear.
                    </p>

                    <h3>3. It works without a connection</h3>
                    <p>
                        A service worker caches the shell and chosen data, so the app keeps working in
                        a lift, a tunnel or a patchy warehouse. That matters most for field service,
                        logistics and in-store retail tools.
                    </p>

                    <h3>4. One codebase instead of three</h3>
                    <p>
                        Rather than Swift for iOS, Kotlin for Android and a separate web build, you
                        maintain one. The saving is real but situational: it depends on how much
                        platform-specific work you would have written anyway, so treat any blanket
                        percentage claim with suspicion.
                    </p>

                    <div className="bg-blue-50 border-l-4 border-blue-600 p-8 my-8 rounded-r-xl not-prose">
                        <p className="text-xl font-bold text-blue-900 mb-2">Go mobile, fast</p>
                        <p className="text-blue-800 mb-0">
                            We can turn an existing site into an installable PWA in weeks.{' '}
                            <Link to="/services/custom-web-development" className="underline font-bold">
                                See our web services
                            </Link>.
                        </p>
                    </div>

                    <h2>When is a PWA the wrong choice?</h2>
                    <p>
                        This is the part most articles omit. Choose native when you need any of the
                        following, because a PWA will fight you on all of them:
                    </p>
                    <ul>
                        <li>
                            <strong>Deep hardware access</strong> — Bluetooth peripherals, NFC
                            payments, advanced camera control, background location.
                        </li>
                        <li>
                            <strong>Sustained high-end graphics</strong> — 3D games and heavy
                            real-time rendering.
                        </li>
                        <li>
                            <strong>App-store presence as a sales channel</strong> — if customers
                            expect to find you by searching the store, a PWA is invisible there.
                        </li>
                        <li>
                            <strong>Full parity on iOS.</strong> Safari supports installable PWAs and,
                            since iOS 16.4, web push for apps added to the home screen — but support
                            lags Android and background capabilities remain more restricted. Verify
                            each API you depend on against current compatibility data rather than
                            assuming parity.
                        </li>
                    </ul>

                    <h2>PWA or native: how do they compare?</h2>

                    <DataTable
                        caption="PWA and native compared on the factors that usually decide the question."
                        columns={['Factor', 'PWA', 'Native app']}
                        rows={[
                            ['Distribution', 'A URL; installs from the browser', 'App Store / Play Store review'],
                            ['Discoverable in search', 'Yes — indexable and citable', 'No'],
                            ['Offline support', 'Yes, via service worker', 'Yes'],
                            ['Push notifications', 'Yes; iOS needs the app installed to the home screen', 'Yes, fully'],
                            ['Hardware access', 'Limited', 'Full'],
                            ['Codebases to maintain', 'One', 'One per platform'],
                            ['Update path', 'Deploy like a website', 'Store review per release'],
                            ['Best fit', 'Commerce, content, dashboards, SaaS, field tools', 'Games, hardware-led and sensor-heavy apps'],
                        ]}
                    />

                    <h2>What does a PWA cost, and how do you decide?</h2>

                    <AnswerBlock question="Is a PWA cheaper than a native app?">
                        <p>
                            Usually, yes — roughly 40&ndash;60% of the cost of two native apps,
                            because there is one codebase, no store review and no annual developer
                            fees. The saving disappears if you later need native features and have to
                            build the app anyway, so the decision should rest on capability, not
                            price.
                        </p>
                    </AnswerBlock>

                    <p>
                        A PWA built alongside an existing web application is often a small increment
                        rather than a project: a service worker, a manifest, an offline strategy and
                        an install prompt. Built from nothing it costs about what the equivalent web
                        application costs, which is still well under two native builds.
                    </p>

                    <p>
                        The avoided costs are easy to overlook and add up. There is no Apple
                        developer programme fee, no Google Play registration, and no store review
                        cycle — which means no waiting a week to ship a fix, and no rejection round
                        over account deletion or privacy labels. Updates reach every user on their
                        next visit instead of waiting for them to update an app, so you support one
                        version rather than a long tail of old ones.
                    </p>

                    <p>
                        Three questions settle most PWA decisions:
                    </p>

                    <ul>
                        <li>
                            <strong>Does it need a hardware or OS capability the web cannot reach?</strong>{' '}
                            Background location, Bluetooth peripherals, HealthKit, widgets or
                            reliable iOS push for a critical alert all point to native. Camera,
                            geolocation on open, offline storage and payments do not.
                        </li>
                        <li>
                            <strong>How do your users find you?</strong> If discovery is through
                            search, a link or a WhatsApp forward, a PWA has the advantage, because it
                            is reachable without an install. If it comes from store search or an
                            existing app audience, that advantage disappears.
                        </li>
                        <li>
                            <strong>How often will they return?</strong> Daily-use tools justify an
                            install and the engagement tools that come with it. Something used
                            monthly rarely survives on a home screen, and a PWA suits it better.
                        </li>
                    </ul>

                    <p>
                        In India the data cost argument is often decisive on its own. A PWA is
                        typically a fraction of the download size of a native app, caches its shell
                        so repeat visits are near-instant on poor connections, and needs no free
                        storage on a device that may not have much. For a consumer-facing tool aimed
                        at a mass Indian audience, that reach usually outweighs the capabilities a
                        native build would add.
                    </p>

                    <p>
                        A useful last check: a PWA and a native app are not mutually exclusive, and
                        treating the choice as permanent causes more bad decisions than either
                        option does. Shipping a PWA first is a reasonable way to find out whether
                        people want the thing at all, at a fraction of the cost and with no store
                        gatekeeping — and if it earns daily use and starts bumping into real
                        platform limits, that is a far better position from which to commission a
                        native build than a slide deck is. The PWA keeps serving everyone who never
                        installs anything.
                    </p>

                    <p>
                        If you are deciding between the two, our{' '}
                        <Link to="/services/mobile-app-development">mobile app development</Link>{' '}
                        page covers how we make the platform call, and{' '}
                        <Link to="/blog/react-native-vs-flutter">React Native versus Flutter</Link>{' '}
                        goes into the cross-platform options if a native build turns out to be the
                        right answer.
                    </p>

                    <h2>The bottom line</h2>
                    <p>
                        For e-commerce, publishing, dashboards, SaaS and internal tools, a PWA usually
                        gives you the reach of the web with most of the engagement of an app, for one
                        codebase. For games and hardware-led products, build native. The deciding
                        question is not which technology is more modern — it is which platform
                        capabilities your product actually depends on.
                    </p>
                </div>
            </article>

            <ArticleFooter slug={SLUG} sources={SOURCES} />

            <div className="bg-[#F8FAFC] py-16">
                <div className="container-custom">
                    <h2 className="text-3xl font-bold text-center mb-12">Build for Every Device</h2>
                    <RelatedServices currentService="Custom Web Development" />
                </div>
            </div>
        </div>
    );
};

export default PwaBenefits;
