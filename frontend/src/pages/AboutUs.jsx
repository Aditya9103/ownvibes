import React from 'react';
import SEO from '../components/SEO';

const AboutUs = () => {
    return (
    <main className="pt-4 pb-20 min-h-screen bg-[#fdfaf7] font-sans">
      <SEO 
        title="About Us" 
        description="Learn more about Ownvibes, our story, and our mission to spread happiness through premium t-shirts."
        schema={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About Ownvibes",
          "description": "Founded with a simple mission—to spread happiness through comfort—Ownvibes began as a small passion project.",
          "url": "https://www.ownvibes.in/about"
        }}
      />
            <div className="max-w-4xl mx-auto px-4">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#1c1c1c] tracking-tight mb-4">About Ownvibes</h1>
                    <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
                        Bringing confidence, comfort, and premium styles to your everyday wardrobe.
                    </p>
                </header>
                
                <article className="bg-white rounded-[30px] p-8 md:p-12 shadow-xl shadow-[#cf7e28]/5 border border-[#f5eadb]">
                    <div className="space-y-8 text-[#483d36] leading-relaxed">
                        <section aria-labelledby="our-story">
                            <h2 id="our-story" className="text-2xl font-extrabold text-[#1c1c1c] mb-4">Our Story</h2>
                            <p className="mb-4">
                                Founded with a simple mission—to elevate everyday comfort—<strong>Ownvibes</strong> began as a small passion project. We noticed that finding truly premium, durable, and perfectly fitting t-shirts was harder than it should be. 
                            </p>
                            <p>
                                We set out to change that by curating a collection of apparel that doesn't just look good, but feels exceptional. From oversized streetwear to classic polos, every Ownvibes t-shirt is crafted with attention to detail and the highest quality cotton blends.
                            </p>
                        </section>

                        <section aria-labelledby="our-promise">
                            <h2 id="our-promise" className="text-2xl font-extrabold text-[#1c1c1c] mb-4">Our Promise</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Unmatched Quality:</strong> We source only the most premium, breathable fabrics built to last.</li>
                                <li><strong>Modern Fits:</strong> Our apparel is designed with contemporary silhouettes, ensuring they look great on everyone.</li>
                                <li><strong>Confidence Guaranteed:</strong> We believe in the power of good style. We guarantee our apparel will make you feel your best.</li>
                            </ul>
                        </section>

                        <section aria-labelledby="why-choose-us">
                            <h2 id="why-choose-us" className="text-2xl font-extrabold text-[#1c1c1c] mb-4">Why Choose Ownvibes?</h2>
                            <p>
                                At Ownvibes, we don't just sell t-shirts; we deliver confidence. Whether you're dressing up for a night out or keeping it casual on the weekend, an Ownvibes t-shirt is the perfect foundation for your look. Join our community today and experience the premium quality of Ownvibes!
                            </p>
                        </section>
                    </div>
                </article>
            </div>
        </main>
    );
};

export default AboutUs;
