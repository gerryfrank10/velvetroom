import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, User, Menu, X, LogOut, LayoutDashboard, MessageCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import LanguageSelector from './LanguageSelector';
import { Button } from './ui/button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="glass-heavy fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3" data-testid="logo-link">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <span className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                <span className="text-gradient">VelvetRoom</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <LanguageSelector />
              {user ? (
                <>
                  <Link to="/post" data-testid="post-listing-link">
                    <Button className="bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white px-6 py-2 rounded-full hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all duration-300">
                      Post Listing
                    </Button>
                  </Link>
                  <Link to="/messages" className="text-gray-400 hover:text-white transition-colors" data-testid="messages-link">
                    <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                  </Link>
                  <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors" data-testid="dashboard-link">
                    <LayoutDashboard className="w-5 h-5" strokeWidth={1.5} />
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="text-gray-400 hover:text-white transition-colors" data-testid="admin-link">
                      <Shield className="w-5 h-5" strokeWidth={1.5} />
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-white transition-colors"
                    data-testid="logout-button"
                  >
                    <LogOut className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  <div className="flex items-center space-x-2" data-testid="user-info">
                    <User className="w-5 h-5 text-fuchsia-500" strokeWidth={1.5} />
                    <span className="text-sm text-gray-300">{user.name}</span>
                  </div>
                </>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white px-8 py-2 rounded-full hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all duration-300"
                  data-testid="login-button"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-4" data-testid="mobile-menu">
              {user ? (
                <>
                  <Link
                    to="/post"
                    className="block text-white hover:text-fuchsia-500 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-post-link"
                  >
                    Post Listing
                  </Link>
                  <Link
                    to="/messages"
                    className="block text-white hover:text-fuchsia-500 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-messages-link"
                  >
                    Messages
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block text-white hover:text-fuchsia-500 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-dashboard-link"
                  >
                    Dashboard
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block text-white hover:text-fuchsia-500 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-admin-link"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block text-white hover:text-fuchsia-500 transition-colors"
                    data-testid="mobile-logout-button"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="block text-white hover:text-fuchsia-500 transition-colors"
                  data-testid="mobile-login-button"
                >
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Navbar;
