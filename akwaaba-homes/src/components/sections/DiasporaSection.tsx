'use client';

export function DiasporaSection() {
  const testimonials = [
    {
      name: 'Sarah Osei',
      location: 'London, UK',
      message: 'Found my retirement home in Accra from London. The virtual tours and family inspection service made it seamless.',
      flag: '🇬🇧'
    },
    {
      name: 'Kwame Asante',
      location: 'Toronto, Canada',
      message: 'The multi-currency feature and dedicated diaspora support made buying property in Ghana stress-free.',
      flag: '🇨🇦'
    },
    {
      name: 'Akosua Mensah',
      location: 'New York, USA',
      message: 'Excellent service! My family in Ghana helped with the inspection while I handled everything remotely.',
      flag: '🇺🇸'
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">{testimonial.flag}</div>
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                &ldquo;{testimonial.message}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
