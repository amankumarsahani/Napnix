import { useState, useMemo, useEffect, memo } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowRightLine, RiEyeLine } from 'react-icons/ri';
import { PORTFOLIO_FALLBACK, ACCENT_GRADIENTS } from '../constants/portfolioFallback';
import { portfolioAPI } from '../services/api';

// Map an API row (snake→camel by the axios interceptor) to the card shape.
const normalize = (p) => ({
  title: p.title,
  slug: p.slug || String(p.title).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  category: p.category || 'Web Platform',
  description: p.description || '',
  accent: p.accent || 'default',
  image: p.imageUrl || p.image || null,
  technologies: p.techStack || p.technologies || [],
});

const Portfolio = memo(function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [projects, setProjects] = useState(PORTFOLIO_FALLBACK)

  useEffect(() => {
    let cancelled = false;
    portfolioAPI.getAll({ limit: 6 })
      .then((res) => {
        const list = res?.data?.projects;
        if (!cancelled && Array.isArray(list) && list.length) {
          setProjects(list.map(normalize));
        }
      })
      .catch(() => { /* keep fallback */ });
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(projects.map((p) => p.category)))],
    [projects]
  );

  const filteredProjects = useMemo(() => activeCategory === "All"
    ? projects
    : projects.filter(project => project.category === activeCategory),
    [activeCategory, projects])

  return (
    <section id="portfolio" className="relative py-12 sm:py-16 lg:py-20 bg-slate-50 overflow-hidden">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-8 sm:mb-12 lg:mb-16 transition-all duration-1000 transform translate-y-0 opacity-100">
          <span className="text-sm font-semibold text-[#2563EB] uppercase tracking-wider">Our Portfolio</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-4 sm:mb-6 mt-4 leading-tight tracking-tight">
            Products We've
            <span className="block text-[#2563EB] mt-2">
              Shipped to Production
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl leading-relaxed">
            A focused set of real products across mobile, web, AI, and CRM — built, deployed, and running.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12 lg:mb-16 transition-all duration-1000 delay-300 transform translate-y-0 opacity-100">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setActiveCategory(category)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 border ${activeCategory === category
                ? 'bg-[#2563EB] text-white shadow-lg border-[#2563EB]'
                : 'bg-white text-slate-700 hover:bg-[#F8FAFC] border-slate-200 hover:shadow-lg'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16 transition-all duration-1000 delay-500 transform translate-y-0 opacity-100">
          {filteredProjects.map((project, index) => (
            <div key={index} className="group relative">
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

                <div className="relative overflow-hidden h-40 sm:h-48">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      height={192}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:-translate-y-2"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${ACCENT_GRADIENTS[project.accent] || ACCENT_GRADIENTS.default} flex items-center justify-center`}>
                      <span className="text-6xl font-black text-white/25 select-none">{project.title.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Link
                      to="/portfolio"
                      className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg text-[#9333EA]"
                    >
                      <RiEyeLine className="text-xl" />
                    </Link>
                  </div>

                  <div className="absolute top-4 left-4">
                    <span className="text-xs font-bold text-white px-3 py-1.5 rounded-full bg-[#9333EA]/80">
                      {project.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 border-l-2 border-transparent transition-colors duration-300 group-hover:border-[#2563EB]">
                  <h3 className="text-xl font-bold mb-3 text-slate-800">
                    {project.title}
                  </h3>

                  <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 3).map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="text-xs bg-[#F8FAFC] text-slate-700 px-3 py-1.5 rounded-full border border-slate-200"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="text-xs bg-[#F8FAFC] text-slate-500 px-3 py-1.5 rounded-full border border-slate-200">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center transition-all duration-1000 delay-700 transform translate-y-0 opacity-100">
          <Link to="/portfolio" className="group relative inline-block bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-10 py-4 rounded-2xl font-bold shadow-lg transition-all duration-300 overflow-hidden">
            <span className="relative z-10 flex items-center">
              View More Projects
              <RiArrowRightLine className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
});

export default Portfolio;
