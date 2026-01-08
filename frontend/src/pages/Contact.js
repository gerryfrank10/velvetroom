import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending message
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you within 24 hours.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
        <div className="text-center mb-16">
          <h1 
            className="text-5xl font-bold mb-6" 
            style={{ fontFamily: 'Playfair Display, serif' }}
            data-testid="contact-heading"
          >
            <span className="text-gradient">Contact Us</span>
          </h1>
          <p className="text-xl text-gray-300">
            Have questions? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6" data-testid="contact-email">
              <Mail className="w-8 h-8 text-fuchsia-500 mb-3" />
              <h3 className="text-lg font-bold mb-2">Email Us</h3>
              <p className="text-gray-400 text-sm mb-2">For general inquiries</p>
              <a href="mailto:support@durexethiopia.com" className="text-fuchsia-500 hover:underline">
                support@durexethiopia.com
              </a>
            </div>

            <div className="glass rounded-2xl p-6" data-testid="contact-location">
              <MapPin className="w-8 h-8 text-fuchsia-500 mb-3" />
              <h3 className="text-lg font-bold mb-2">Our Office</h3>
              <p className="text-gray-400 text-sm">
                123 Luxury Lane<br />
                London, UK<br />
                SW1A 1AA
              </p>
            </div>

            <div className="glass rounded-2xl p-6" data-testid="contact-phone">
              <Phone className="w-8 h-8 text-fuchsia-500 mb-3" />
              <h3 className="text-lg font-bold mb-2">Call Us</h3>
              <p className="text-gray-400 text-sm mb-2">24/7 Support Line</p>
              <a href="tel:+442012345678" className="text-fuchsia-500 hover:underline">
                +44 20 1234 5678
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-8">
              <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-black/20 border-white/10 text-white mt-2"
                      placeholder="Your name"
                      data-testid="contact-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-black/20 border-white/10 text-white mt-2"
                      placeholder="your@email.com"
                      data-testid="contact-email-input"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="bg-black/20 border-white/10 text-white mt-2"
                    placeholder="How can we help?"
                    data-testid="contact-subject"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-gray-300">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="bg-black/20 border-white/10 text-white mt-2 resize-none"
                    rows={6}
                    placeholder="Tell us more about your inquiry..."
                    data-testid="contact-message"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white py-4 rounded-full hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all duration-300"
                  data-testid="contact-submit"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;