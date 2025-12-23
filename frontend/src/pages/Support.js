import React from 'react';
import { HelpCircle, Book, Shield, AlertCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

const Support = () => {
  const faqs = [
    {
      question: "How do I create a listing?",
      answer: "After signing up, click 'Post Listing' in the navigation. Fill in your details, upload photos/videos, select services, and add pricing tiers. Your listing will be reviewed by our team before going live."
    },
    {
      question: "Is my information kept private?",
      answer: "Absolutely. We use end-to-end encryption for all communications. Your contact information is only shared when you choose to display it in your listing. We never sell or share your data with third parties."
    },
    {
      question: "How does the pricing system work?",
      answer: "You can set multiple pricing tiers based on hours of service. For example: 1 hour = $100, 2 hours = $180, 5 hours = $400. This gives clients flexibility and you control over your rates."
    },
    {
      question: "What are VIP features?",
      answer: "VIP members get premium placement in search results, verified badges, unlimited photo/video uploads, priority support, and access to exclusive features. Contact us to upgrade to VIP."
    },
    {
      question: "How long does listing approval take?",
      answer: "Most listings are reviewed within 24 hours. We check for quality, authenticity, and adherence to our community guidelines. You'll receive an email once your listing is approved."
    },
    {
      question: "Can I edit my listing after posting?",
      answer: "Yes! Go to your Dashboard, find your listing, and click Edit. You can update photos, description, services, and pricing at any time."
    },
    {
      question: "How do payments work?",
      answer: "All payments are handled directly between clients and service providers. VelvetRoom does not process payments for services. We only charge for premium features like VIP membership and featured listings."
    },
    {
      question: "What if I encounter a problem?",
      answer: "Contact our 24/7 support team via email at support@velvetroom.com or use the contact form. We typically respond within 2-4 hours."
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-8">
        <div className="text-center mb-16">
          <h1 
            className="text-5xl font-bold mb-6" 
            style={{ fontFamily: 'Playfair Display, serif' }}
            data-testid="support-heading"
          >
            <span className="text-gradient">Help & Support</span>
          </h1>
          <p className="text-xl text-gray-300">
            Find answers to common questions and get the help you need.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link to="/contact" className="glass rounded-2xl p-6 hover:border-fuchsia-500/30 transition-all">
            <Mail className="w-10 h-10 text-fuchsia-500 mb-3" />
            <h3 className="text-lg font-bold mb-2">Contact Support</h3>
            <p className="text-gray-400 text-sm">Get in touch with our team</p>
          </Link>

          <div className="glass rounded-2xl p-6">
            <Book className="w-10 h-10 text-fuchsia-500 mb-3" />
            <h3 className="text-lg font-bold mb-2">Documentation</h3>
            <p className="text-gray-400 text-sm">Learn how to use VelvetRoom</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <Shield className="w-10 h-10 text-fuchsia-500 mb-3" />
            <h3 className="text-lg font-bold mb-2">Safety Guidelines</h3>
            <p className="text-gray-400 text-sm">Stay safe on our platform</p>
          </div>
        </div>

        {/* FAQs */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Frequently Asked Questions
          </h2>
          
          <Accordion type="single" collapsible className="w-full" data-testid="faq-accordion">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-white/10">
                <AccordionTrigger className="text-left text-white hover:text-fuchsia-500 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Emergency Contact */}
        <div className="glass rounded-2xl p-8 mt-8 border border-amber-500/30">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2 text-amber-500">Need Immediate Help?</h3>
              <p className="text-gray-300 mb-3">
                For urgent safety concerns or to report violations of our community guidelines, please contact us immediately.
              </p>
              <a 
                href="mailto:urgent@velvetroom.com" 
                className="text-fuchsia-500 hover:underline font-medium"
              >
                urgent@velvetroom.com
              </a>
              <span className="text-gray-400 mx-2">|</span>
              <a 
                href="tel:+442012345678" 
                className="text-fuchsia-500 hover:underline font-medium"
              >
                +44 20 1234 5678
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;