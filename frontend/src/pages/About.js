import React from 'react';
import { Sparkles, Shield, Heart, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 
            className="text-5xl font-bold mb-6" 
            style={{ fontFamily: 'Playfair Display, serif' }}
            data-testid="about-heading"
          >
            <span className="text-gradient">About VelvetRoom</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The world's most exclusive platform for premium companionship and adult services.
          </p>
        </div>

        {/* Mission */}
        <div className="glass rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Our Mission
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            VelvetRoom was founded with a clear vision: to create a safe, sophisticated, and discreet platform where adults can connect for premium companionship services. We believe in empowering service providers and offering clients an unparalleled experience.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Our platform combines cutting-edge technology with a commitment to privacy, security, and quality. Every listing is carefully moderated to ensure authenticity and professionalism.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="glass rounded-2xl p-8" data-testid="value-discretion">
            <Shield className="w-12 h-12 text-fuchsia-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Discretion & Privacy
            </h3>
            <p className="text-gray-300">
              Your privacy is our top priority. All communications are encrypted, and we never share your personal information.
            </p>
          </div>

          <div className="glass rounded-2xl p-8" data-testid="value-quality">
            <Sparkles className="w-12 h-12 text-fuchsia-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Quality Assurance
            </h3>
            <p className="text-gray-300">
              Every profile is verified and moderated by our team to ensure authenticity and professionalism.
            </p>
          </div>

          <div className="glass rounded-2xl p-8" data-testid="value-respect">
            <Heart className="w-12 h-12 text-fuchsia-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Respect & Safety
            </h3>
            <p className="text-gray-300">
              We promote a culture of mutual respect and consent. Our community guidelines ensure a safe environment for all.
            </p>
          </div>

          <div className="glass rounded-2xl p-8" data-testid="value-community">
            <Users className="w-12 h-12 text-fuchsia-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Global Community
            </h3>
            <p className="text-gray-300">
              Connect with premium companions across multiple cities and countries worldwide.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="glass rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
            By The Numbers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-gradient mb-2">10,000+</div>
              <div className="text-gray-400">Active Profiles</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-gradient mb-2">50+</div>
              <div className="text-gray-400">Cities Worldwide</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-gradient mb-2">24/7</div>
              <div className="text-gray-400">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;