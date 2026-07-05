import { useState, memo } from 'react'
import { RiArrowLeftSLine, RiArrowRightSLine, RiStarFill } from 'react-icons/ri';
import { COMPANY_STATS } from '../constants/companyStats';
import { TESTIMONIALS as testimonials } from '../constants/testimonials';

function Avatar({ initials }) {
  return (
    <div
      className="w-16 h-16 rounded-full bg-[#2563EB]/10 border-2 border-[#2563EB]/20 flex items-center justify-center mr-4 flex-shrink-0"
      aria-hidden="true"
    >
      <span className="text-lg font-bold text-[#2563EB]">{initials}</span>
    </div>
  );
}

const Testimonials = memo(function Testimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToTestimonial = (index) => {
    setCurrentTestimonial(index)
  }

  const current = testimonials[currentTestimonial];

  return (
    <section id="testimonials" className="py-20 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Feedback on Napnix delivery and NapCRM from teams we work with.
          </p>
        </div>

        <div className="relative" role="region" aria-roledescription="carousel" aria-label="Client testimonials">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <RiStarFill key={i} className="text-yellow-400" />
                ))}
              </div>
            </div>
            <blockquote className="text-xl md:text-2xl text-slate-600 leading-relaxed text-center mb-8">
              &ldquo;{current.text}&rdquo;
            </blockquote>
            <div className="flex items-center justify-center">
              <Avatar initials={current.initials} />
              <div className="text-center">
                <div className="font-semibold text-slate-800 text-lg">
                  {current.name}
                </div>
                <div className="text-[#7C3AED] mb-1">{current.position}</div>
                <div className="text-slate-500 text-sm">
                  {current.project}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
            className="hidden md:flex absolute -left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 items-center justify-center bg-white rounded-full shadow-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <RiArrowLeftSLine className="text-slate-600 text-xl" />
          </button>
          <button
            onClick={nextTestimonial}
            aria-label="Next testimonial"
            className="hidden md:flex absolute -right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 items-center justify-center bg-white rounded-full shadow-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <RiArrowRightSLine className="text-slate-600 text-xl" />
          </button>
        </div>

        <div className="flex justify-center gap-4 mt-6 md:hidden">
          <button
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <RiArrowLeftSLine className="text-slate-600 text-lg" />
          </button>
          <button
            onClick={nextTestimonial}
            aria-label="Next testimonial"
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <RiArrowRightSLine className="text-slate-600 text-lg" />
          </button>
        </div>

        <div className="flex justify-center mt-6 md:mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              aria-label={`Go to testimonial ${index + 1}`}
              aria-current={currentTestimonial === index}
              className="w-8 h-8 flex items-center justify-center cursor-pointer"
            >
              <span className={`w-3 h-3 rounded-full transition-colors ${currentTestimonial === index ? 'bg-[#7C3AED]' : 'bg-slate-300'}`} />
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#D97706] mb-2">{COMPANY_STATS.successRate}</div>
            <div className="text-slate-600">Client Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#D97706] mb-2">{COMPANY_STATS.projects}</div>
            <div className="text-slate-600">Projects Completed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#D97706] mb-2">{COMPANY_STATS.support}</div>
            <div className="text-slate-600">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  )
})

export default Testimonials
