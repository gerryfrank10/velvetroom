import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const TITLE = `${process.env.REACT_APP_TITLE}`;

const Footer = () => {
  return (
    <footer className="glass-heavy border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <span className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                <span className="text-gradient">{TITLE}</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              The world's most exclusive platform for premium companionship.
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-fuchsia-500 transition-colors text-sm" data-testid="footer-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-fuchsia-500 transition-colors text-sm" data-testid="footer-contact">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-400 hover:text-fuchsia-500 transition-colors text-sm" data-testid="footer-support">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Users</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/post" className="text-gray-400 hover:text-fuchsia-500 transition-colors text-sm">
                  Post Listing
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-fuchsia-500 transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/messages" className="text-gray-400 hover:text-fuchsia-500 transition-colors text-sm">
                  Messages
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-fuchsia-500 transition-colors text-sm">
                  Community Guidelines
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 1980. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 text-gray-400 text-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-fuchsia-500 fill-current" />
            <span>for premium experiences</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
