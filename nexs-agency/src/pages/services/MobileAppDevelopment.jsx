import ServicePageTemplate from '../../components/ServicePageTemplate';

const data = {
    themeColor: 'teal',
    badge: { icon: 'ri-smartphone-line', label: 'Mobile Engineering' },
    hero: {
        h1Line1: 'Apps That Users',
        h1Line2: 'Actually Love.',
        gradient: 'from-[#2563EB] to-[#1D4ED8]',
        paragraph: 'From native iOS/Android to high-performance cross-platform solutions, we build mobile experiences that drive engagement and retention.',
        ctaText: 'Discuss Your App',
        bgImage: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1280&q=60&fm=webp&auto=format&fit=crop',
        bgImageAlt: 'Mobile Development Background',
    },
    overview: {
        h2: 'Mobile First. <br /> User Centric.',
        paragraph: "With billions of smartphone users worldwide, a mobile presence is no longer optional. But simply having an app isn\u2019t enough\u2014it needs to be fast, intuitive, and flawless.",
        checklist: [
            'Seamless UI/UX Design',
            'Offline Functionality',
            'Push Notification Strategy',
            'Secure Biometric Auth',
        ],
        bento: {
            largeImage: {
                src: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800&fm=webp',
                alt: 'Mobile UI Design',
                label: 'Intuitive Interfaces',
            },
            smallImage: {
                src: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&q=80&w=800&fm=webp',
                alt: 'Phone Mockup',
            },
            stat: { value: '4.8', label: 'Avg App Store Rating' },
        },
    },
    capabilities: [
        {
            title: 'iOS Development',
            description: 'Native iOS applications written in Swift/SwiftUI that deliver seamless performance on all Apple devices.',
            tech: ['Swift', 'SwiftUI', 'Xcode', 'TestFlight'],
            icon: 'ri-apple-fill',
            color: 'slate',
        },
        {
            title: 'Android Development',
            description: 'Robust Android apps built with Kotlin to reach the widest possible global audience.',
            tech: ['Kotlin', 'Jetpack Compose', 'Android Studio'],
            icon: 'ri-android-fill',
            color: 'green',
        },
        {
            title: 'Cross-Platform (Flutter)',
            description: 'Build once, deploy everywhere. High-fidelity apps for iOS and Android using a single codebase.',
            tech: ['Flutter', 'Dart', 'Firebase', 'GetX'],
            icon: 'ri-flutter-fill',
            color: 'blue',
        },
        {
            title: 'React Native',
            description: 'Leverage your web team\'s skills to build native mobile experiences using React.',
            tech: ['React Native', 'Expo', 'Redux', 'NativeBase'],
            icon: 'ri-reactjs-line',
            color: 'cyan',
        },
    ],
    engagement: {
        h2: 'How a mobile build runs',
        intro: "App projects have two costs people underestimate: store review cycles and the long tail of OS updates. The sequence below plans for both, and the first decision is the one that affects every later one.",
        phases: [
            {
                title: 'Platform decision, before anything else',
                body: 'React Native, Flutter or fully native is not a preference, it is a consequence of what the app has to do. Heavy camera, Bluetooth or background-location work pushes toward native. A standard CRUD and messaging app does not. We make this call with you in week one and write down why, because reversing it later is a rewrite.',
            },
            {
                title: 'Scoping and store groundwork',
                body: 'We write the user stories, then open the Apple Developer and Google Play accounts in your name immediately. Store enrolment, especially Apple, can take longer than an increment, and projects that leave it to the end lose weeks at exactly the point everyone wants to launch.',
            },
            {
                title: 'Build in two-week increments',
                body: 'Each increment ships to TestFlight and Play Internal Testing, so the app is on your actual phone rather than in a simulator video. Device-specific problems, and most mobile problems are device-specific, surface while they are still cheap.',
            },
            {
                title: 'Offline behaviour and sync',
                body: 'We decide explicitly what the app does with no connection: queue writes, read from cache, or block. Indian field-use apps live on patchy mobile data, so this is a requirement rather than a refinement, and it is designed rather than discovered.',
            },
            {
                title: 'Submission and post-launch',
                body: 'We prepare store listings, screenshots and the privacy disclosures both stores now require, then handle the first submission including any rejection round. After launch you get crash reporting, and we budget for the annual iOS and Android releases, which routinely break something whether or not the app has changed.',
            },
        ],
        questions: [
            {
                q: 'React Native or Flutter?',
                a: 'For most business apps either will do the job, so the deciding factor is usually hiring: React Native shares a language and much of its tooling with a React web front end, so one team can maintain both. Flutter renders its own widgets, which gives tighter control over a custom design system and more consistent behaviour across old Android devices. We cover the trade-off in detail in our React Native versus Flutter guide.',
            },
            {
                q: 'Do we need separate iOS and Android builds?',
                a: 'Not usually. One cross-platform codebase covers both, with platform-specific code only where the OS genuinely differs, such as push notification handling or in-app purchase flows. Going fully native means two codebases and roughly 1.7 to 2 times the build and maintenance cost, which is worth it only when the app depends on hardware or performance that cross-platform cannot reach.',
            },
            {
                q: 'How long until the app is in the stores?',
                a: 'A focused first release is typically 10 to 14 weeks from scoping to live, of which 1 to 2 weeks is store review and is outside anyone\'s control. Apple rejects a meaningful share of first submissions, commonly over account deletion, privacy labels or sign-in requirements, so we plan for one rejection round rather than treating it as a surprise.',
            },
            {
                q: 'What does it cost to keep an app running?',
                a: 'Budget for the two annual OS releases plus store policy changes, which together are usually a few days of work a year even with no new features. Apple charges 99 USD a year for the developer programme and Google a one-off 25 USD. Those are yours directly, not billed through us.',
            },
        ],
    },
    capabilitiesSection: { label: 'Tech Stack', title: 'Native & Cross-Platform' },
    bottomSection: { title: 'Related Services', currentService: 'Mobile App Development' },
    cta: {
        h2: 'Have an App Idea?',
        paragraph: 'From MVP to App Store launch, we handle the entire lifecycle.',
        buttonText: 'Launch Your App',
    },
    seo: {
        title: 'Mobile App Development Services | iOS & Android',
        description: 'Create engaging native and cross-platform mobile apps with Napnix. Expert Flutter, React Native, and Swift developers.',
        keywords: 'mobile app development India, React Native development, iOS Android app development, cross-platform mobile app, mobile app company Mohali, Flutter development India, custom mobile solutions',
        canonicalPath: '/services/mobile-app-development',
        ogTitle: 'Mobile App Development Services | iOS & Android',
        ogDescription: 'Create engaging native and cross-platform mobile apps with Napnix. Expert Flutter, React Native, and Swift developers.',
        twitterTitle: 'Mobile App Development Services | iOS & Android',
        twitterDescription: 'Create engaging native and cross-platform mobile apps with Napnix. Expert Flutter, React Native, and Swift developers.',
    },
    schema: {
        name: 'Mobile App Development',
        description: 'Expert mobile app development services for iOS and Android using Swift, Kotlin, Flutter, and React Native.',
    },
};

export default function MobileAppDevelopment() {
    return <ServicePageTemplate data={data} />;
}
