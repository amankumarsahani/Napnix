import { memo } from 'react';
import { Link } from 'react-router-dom';
import Icon from './ui/Icon';
import { COMPANY_STATS } from '../constants/companyStats';
import { RiArrowRightLine, RiPhoneLine, RiShakeHandsLine } from 'react-icons/ri';

/**
 * Platforms and tools Napnix builds on.
 *
 * Declared once; the marquee below renders it twice to loop seamlessly. The
 * two copies used to be separate literals, so any edit had to be made in both
 * places or the loop would show different cards on each pass.
 *
 * Claims here are deliberately about what the team builds with, not about
 * partner status or certifications. The previous copy asserted "Cloud Partner"
 * for AWS, Azure and Google Cloud, "Database Partner" for MongoDB, and a
 * "Certified AWS solutions architect", "Azure certified professional",
 * "Google Cloud certified engineer" and "MongoDB certified developer" — with
 * no certificate holder, credential ID or verification link anywhere on the
 * site. AWS, Microsoft and Google all operate named partner programmes with
 * public directories, so those are checkable claims, and an unlisted company
 * making them is a trust problem rather than a marketing flourish. It also
 * listed React and Node.js as "Technology Partners", which are open-source
 * projects with no partner programme to join.
 *
 * If a real partner status or certification is earned, state it here with the
 * programme tier and a link to the public listing.
 */
const TECH_STACK = [
  { logo: "AWS", name: "Amazon Web Services", type: "Cloud platform", desc: "EC2, S3, RDS and Lambda for scalable hosting and serverless workloads.", bgColor: "bg-orange-50", iconColor: "text-orange-600", borderColor: "border-orange-200" },
  { logo: "Azure", name: "Microsoft Azure", type: "Cloud platform", desc: "App Service, Azure SQL and Blob Storage for Microsoft-estate deployments.", bgColor: "bg-[#F8FAFC]", iconColor: "text-[#2563EB]", borderColor: "border-slate-200" },
  { logo: "GCP", name: "Google Cloud", type: "Cloud platform", desc: "Cloud Run, BigQuery and Vertex AI for data and machine-learning workloads.", bgColor: "bg-red-50", iconColor: "text-red-600", borderColor: "border-red-200" },
  { logo: "React", name: "React & Next.js", type: "Frontend", desc: "React with Next.js, TypeScript and Tailwind for product and marketing front ends.", bgColor: "bg-cyan-50", iconColor: "text-cyan-600", borderColor: "border-cyan-200" },
  { logo: "Node", name: "Node.js", type: "Backend runtime", desc: "Express and Fastify APIs, background workers and webhook services.", bgColor: "bg-green-50", iconColor: "text-green-600", borderColor: "border-green-200" },
  { logo: "MongoDB", name: "MongoDB & MySQL", type: "Databases", desc: "Document and relational stores, chosen per project rather than by default.", bgColor: "bg-emerald-50", iconColor: "text-emerald-600", borderColor: "border-emerald-200" }
];

const Partners = memo(function Partners() {

  return (
    <section id="partners" className="relative py-20 bg-slate-50 overflow-hidden">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-16 transition-all duration-1000 transform translate-y-0 opacity-100">
          <span className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider">Technology Stack</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 mt-4 leading-tight">
            Platforms &
            <span className="block text-[#2563EB] mt-1">
              Tools We Build On
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">
            The cloud platforms, frameworks and databases behind every Napnix build — picked per project, not by default
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 transition-all duration-1000 delay-300 transform translate-y-0 opacity-100">
          {/* Every figure below is checkable on this site: the stack count is
              TECH_STACK.length, the edition count is INDUSTRY_SLUGS.length and
              each edition has a live page, and the service count matches the
              /services children. The tiles this replaced read "2 Technology
              Partners" while six were listed beneath them, and "6+
              Certifications" with none evidenced. */}
          {[
            { icon: "ri-stack-line", number: String(TECH_STACK.length), label: "Core Platforms & Tools", bgColor: "bg-[#2563EB]/10", textColor: "text-[#2563EB]" },
            { icon: "ri-cloud-line", number: "3", label: "Cloud Platforms Supported", bgColor: "bg-emerald-50", textColor: "text-emerald-600" },
            { icon: "ri-apps-2-line", number: "5", label: "Service Lines", bgColor: "bg-[#D97706]/10", textColor: "text-[#D97706]" },
            { icon: "ri-shield-check-line", number: COMPANY_STATS.industries, label: "Industry CRM Editions", bgColor: "bg-orange-50", textColor: "text-orange-600" }
          ].map((stat, index) => (
            <div key={index} className="group text-center">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 group-hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className={`w-16 h-16 ${stat.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon name={stat.icon} className={`text-2xl ${stat.textColor}`} />
                </div>
                <div className={`text-3xl font-bold mb-2 ${stat.textColor}`}>
                  {stat.number}
                </div>
                <div className="text-slate-600 font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-20 transition-all duration-1000 delay-500 transform translate-y-0 opacity-100">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
              Our Technology Stack
            </h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              What we build with day to day, and what each piece is used for
            </p>
          </div>

          <div className="max-w-7xl mx-auto overflow-hidden">
            <div className="relative">
              <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

              <div className="flex animate-slide-left space-x-6 w-max">
                {TECH_STACK.map((partner, index) => (
                  <div key={`first-${index}`} className="group flex-shrink-0 w-80">
                    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200 ${partner.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 h-full`}>
                      <div className="flex items-center mb-4">
                        <div className={`w-12 h-12 ${partner.bgColor} rounded-xl flex items-center justify-center mr-4`}>
                          <span className={`text-sm font-bold ${partner.iconColor}`}>{partner.logo}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 text-base mb-1">
                            {partner.name}
                          </h4>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${partner.bgColor} ${partner.iconColor}`}>
                            {partner.type}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {partner.desc}
                      </p>
                    </div>
                  </div>
                ))}

                {TECH_STACK.map((partner, index) => (
                  <div key={`second-${index}`} className="group flex-shrink-0 w-80">
                    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200 ${partner.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 h-full`}>
                      <div className="flex items-center mb-4">
                        <div className={`w-12 h-12 ${partner.bgColor} rounded-xl flex items-center justify-center mr-4`}>
                          <span className={`text-sm font-bold ${partner.iconColor}`}>{partner.logo}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 text-base mb-1">
                            {partner.name}
                          </h4>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${partner.bgColor} ${partner.iconColor}`}>
                            {partner.type}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {partner.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* The "Professional Certifications" marquee that was here is gone.

            It listed six named credentials — AWS Solutions Architect, Azure
            Developer Associate, Google Cloud Professional, Kubernetes
            Administrator (CNCF), MongoDB Developer and Certified Scrum Master —
            each stamped "2024" and each carrying a "Verified Certification"
            badge, with no holder named and no credential ID or verification
            link. Every one of those issuers runs a public credential registry,
            so the claims are checkable, and all six were dated a year before
            the company was founded.

            Replaced with the proof that does exist and can be followed off-site
            in one click. A short honest block beats a long unverifiable one. */}
        <div className="mb-20 transition-all duration-1000 delay-700 transform translate-y-0 opacity-100">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
              What You Can Verify
            </h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Every claim on this page can be checked — here is where to check it
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: 'ri-briefcase-line', title: 'Client case studies', desc: 'Named clients, the problem, what we built, and what changed afterwards.', to: '/portfolio', external: false },
              { icon: 'ri-star-line', title: 'Clutch profile', desc: 'Independently collected client reviews, hosted off this site.', to: 'https://clutch.co/profile/napnix', external: true },
              { icon: 'ri-github-line', title: 'GitHub organisation', desc: 'Public repositories under the Napnix-LLP organisation.', to: 'https://github.com/Napnix-LLP', external: true },
              { icon: 'ri-shield-check-line', title: 'Security practices', desc: 'How we handle data, access and backups, stated in detail.', to: '/security', external: false },
            ].map((item, index) => {
              const body = (
                <div className="h-full bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                  <div className="w-12 h-12 bg-[#2563EB]/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon name={item.icon} className="text-2xl text-[#2563EB]" />
                  </div>
                  <h4 className="font-semibold text-slate-800 text-base mb-2">{item.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                  <span className="inline-flex items-center text-sm font-medium text-[#2563EB] mt-4">
                    {item.external ? 'Open profile' : 'View'}
                    <RiArrowRightLine className="ml-1" />
                  </span>
                </div>
              );

              return (
                <div key={index} className="group">
                  {item.external
                    ? <a href={item.to} target="_blank" rel="noopener noreferrer" className="block h-full">{body}</a>
                    : <Link to={item.to} className="block h-full">{body}</Link>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="transition-all duration-1000 delay-900 transform translate-y-0 opacity-100">
          <div className="bg-[#2563EB] rounded-2xl p-8 md:p-12 text-center text-white shadow-xl">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <RiShakeHandsLine className="text-2xl text-white" />
            </div>

            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Partner With Us?
            </h3>

            <p className="text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Tell us what you are trying to build. We will tell you which of these platforms fits, what it will take, and what it will cost.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link
                to="/contact"
                className="bg-white text-[#2563EB] px-8 py-4 rounded-xl font-semibold hover:bg-[#F8FAFC] transition-all duration-300 cursor-pointer"
              >
                <span className="flex items-center justify-center">
                  Start Your Project
                  <RiArrowRightLine className="ml-2" />
                </span>
              </Link>
              <Link
                to="/contact?intent=demo"
                className="border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <span className="flex items-center justify-center">
                  <RiPhoneLine className="mr-2" />
                  Schedule Call
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})

export default Partners
