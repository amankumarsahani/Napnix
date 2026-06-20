import { organizationSchema, websiteSchema } from '../../constants/seoConfig';

/** Sitewide Organization + WebSite JSON-LD on every public page. */
export default function SiteSchema() {
    return (
        <>
            <script type="application/ld+json">{JSON.stringify(organizationSchema())}</script>
            <script type="application/ld+json">{JSON.stringify(websiteSchema())}</script>
        </>
    );
}
