import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SEO from '../components/SEO';

const FAQs = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "What materials do you use for your t-shirts?",
            answer: "All Ownvibes t-shirts are crafted from 100% premium combed and bio-washed cotton. We prioritize breathable, hypoallergenic, and durable fabrics that provide ultimate comfort and maintain their shape wash after wash."
        },
        {
            question: "How do I care for and wash my Ownvibes apparel?",
            answer: "We recommend machine washing on a gentle, cold cycle with like colors. Turn the t-shirt inside out to protect any prints or embroidery. Avoid bleach and tumble drying; let it air dry in the shade to preserve fabric softness and color vibrancy."
        },
        {
            question: "Do you offer international shipping?",
            answer: "Currently, we ship across all major cities and pin codes in India. We are working hard to bring Ownvibes styles to international customers very soon!"
        },
        {
            question: "Can I include a gift message with my order?",
            answer: "Absolutely! During checkout, you can add a personalized gift message, which we will include with your package."
        },
        {
            question: "What if I receive a damaged or incorrect product?",
            answer: "We take extreme care in quality checks and packaging. In the rare event of receiving a damaged or incorrect item, please contact us within 48 hours of delivery at info@ownvibes.com with your Order ID and photos, and we will arrange a hassle-free replacement immediately."
        }
    ];

    return (
    <div className="pt-4 pb-20 min-h-screen bg-[#fdfaf7] font-sans">
      <SEO 
        title="FAQs" 
        description="Find answers to common questions about Ownvibes's premium t-shirts, shipping, safety, and more."
        schema={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        }}
      />
            <div className="max-w-3xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#1c1c1c] tracking-tight mb-4">Frequently Asked Questions</h1>
                    <p className="text-lg text-gray-500 font-medium">
                        Got a question? We've got answers!
                    </p>
                </div>
                
                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div 
                            key={idx} 
                            className="bg-white border border-[#f5eadb] rounded-2xl overflow-hidden shadow-sm transition-all"
                        >
                            <button 
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full px-6 py-5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
                            >
                                <span className="font-bold text-[#1c1c1c]">{faq.question}</span>
                                {openIndex === idx ? (
                                    <ChevronUp className="w-5 h-5 text-[#cf7e28] shrink-0" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                                )}
                            </button>
                            {openIndex === idx && (
                                <div className="px-6 pb-5 text-[#483d36] leading-relaxed border-t border-gray-50 bg-gray-50/50 pt-4">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQs;
