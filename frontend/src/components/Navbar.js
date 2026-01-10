import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, User, Heart, Hand, Flame, Shield, Circle, 
  Menu, X, LogOut, LayoutDashboard, MessageCircle, 
  UserCircle, Star, Sparkles, Crown, Search, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AuthModal from './AuthModal';
import LanguageSelector from './LanguageSelector';
import { Button } from './ui/button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // EXOTIC ADULT CATEGORIES
  const categories = [
    {
      name: 'All Escorts',
      icon: Users,
      path: '/',
      subcategories: []
    },
    {
      name: 'Female Escorts',
      icon: User,
      path: '/category/female',
      subcategories: [
        { name: 'Independent', path: '/category/female/independent' },
        { name: 'Agency', path: '/category/female/agency' },
        { name: 'VIP & Elite', path: '/category/female/vip' },
        { name: 'Students', path: '/category/female/students' },
        { name: 'MILFs', path: '/category/female/milf' },
        { name: 'Pornstars', path: '/category/female/pornstar' }
      ]
    },
    {
      name: 'Male Escorts',
      icon: UserCircle,
      path: '/category/male',
      subcategories: [
        { name: 'For Women', path: '/category/male/women' },
        { name: 'For Men', path: '/category/male/men' },
        { name: 'For Couples', path: '/category/male/couples' },
        { name: 'Gigolos', path: '/category/male/gigolo' }
      ]
    },
    {
      name: 'Trans Escorts',
      icon: Star,
      path: '/category/trans',
      subcategories: [
        { name: 'TS Dating', path: '/category/trans/dating' },
        { name: 'Shemale', path: '/category/trans/shemale' },
        { name: 'Ladyboy', path: '/category/trans/ladyboy' }
      ]
    },
    {
      name: 'Lesbians & Gay',
      icon: Heart,
      path: '/category/lgbt',
      subcategories: [
        { name: 'Lesbian Escorts', path: '/category/lgbt/lesbian' },
        { name: 'Gay Escorts', path: '/category/lgbt/gay' },
        { name: 'Bisexual', path: '/category/lgbt/bisexual' }
      ]
    },
    {
      name: 'Massage',
      icon: Hand,
      path: '/category/massage',
      subcategories: [
        { name: 'Erotic Massage', path: '/category/massage/erotic' },
        { name: 'Tantric', path: '/category/massage/tantric' },
        { name: 'Nuru', path: '/category/massage/nuru' },
        { name: 'Thai Massage', path: '/category/massage/thai' },
        { name: 'Body2Body', path: '/category/massage/body2body' }
      ]
    },
    {
      name: 'Swingers',
      icon: Users,
      path: '/category/swingers',
      subcategories: [
        { name: 'Couples', path: '/category/swingers/couples' },
        { name: 'Party & Events', path: '/category/swingers/party' },
        { name: 'Threesome', path: '/category/swingers/threesome' }
      ]
    },
    {
      name: 'BDSM',
      icon: Shield,
      path: '/category/bdsm',
      subcategories: [
        { name: 'Dominatrix', path: '/category/bdsm/dominatrix' },
        { name: 'Submissive', path: '/category/bdsm/submissive' },
        { name: 'Fetish', path: '/category/bdsm/fetish' },
        { name: 'Bondage', path: '/category/bdsm/bondage' }
      ]
    },
    {
      name: 'Meet & Fuck',
      icon: Flame,
      path: '/category/meetfuck',
      subcategories: [
        { name: 'Casual Hookups', path: '/category/meetfuck/casual' },
        { name: 'One Night Stand', path: '/category/meetfuck/ons' },
        { name: 'Fuck Buddy', path: '/category/meetfuck/fuckbuddy' }
      ]
    },
    {
      name: 'VIP & Premium',
      icon: Crown,
      path: '/category/vip',
      subcategories: [
        { name: 'Elite Escorts', path: '/category/vip/elite' },
        { name: 'Luxury', path: '/category/vip/luxury' },
        { name: 'Travel Companions', path: '/category/vip/travel' }
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const TITLE = `${process.env.REACT_APP_TITLE}`;

  const handleCategoryClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  return (
    <>
      <nav className="glass-heavy fixed top-0 left-0 right-0 z-50 border-b border-white/5">
        {/* Top Bar */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3" data-testid="logo-link">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                <span className="text-gradient">{TITLE}</span>
              </span>
            </Link>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <LanguageSelector />
              
              {user ? (
                <>
                  <Link to="/post" data-testid="post-listing-link">
                    <Button className="bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white px-6 py-2 rounded-full hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all">
                      Post Ad
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
                  <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors" data-testid="logout-button">
                    <LogOut className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  <div className="flex items-center space-x-2" data-testid="user-info">
                    <User className="w-5 h-5 text-fuchsia-500" strokeWidth={1.5} />
                    <span className="text-sm text-gray-300">{user.name}</span>
                  </div>
                </>
              ) : (
                <Button onClick={() => setShowAuthModal(true)} className="bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white px-8 py-2 rounded-full" data-testid="login-button">
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-white" data-testid="mobile-menu-button">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Categories Bar - Desktop */}
        <div className="hidden lg:block bg-black/40 border-t border-white/5">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide py-2">
              {categories.map((category, idx) => {
                const Icon = category.icon;
                return (
                  <div 
                    key={idx} 
                    className="relative group"
                    onMouseEnter={() => setActiveDropdown(category.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      onClick={() => handleCategoryClick(category.path)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-fuchsia-500/20 transition-all text-sm font-medium text-gray-300 hover:text-white whitespace-nowrap"
                      data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                      <span>{category.name}</span>
                      {category.subcategories.length > 0 && (
                        <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
                      )}
                    </button>

                    {/* Dropdown Menu */}
                    {category.subcategories.length > 0 && activeDropdown === category.name && (
                      <div className="absolute top-full left-0 mt-1 min-w-[200px] glass rounded-xl shadow-2xl border border-white/10 py-2 z-50">
                        {category.subcategories.map((sub, subIdx) => (
                          <button
                            key={subIdx}
                            onClick={() => handleCategoryClick(sub.path)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-fuchsia-500/20 transition-colors"
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-black/95 border-t border-white/10 max-h-[80vh] overflow-y-auto" data-testid="mobile-menu">
            <div className="px-4 py-4 space-y-2">
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search escorts..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
              </div>

              {/* Categories */}
              {categories.map((category, idx) => {
                const Icon = category.icon;
                return (
                  <div key={idx} className="space-y-1">
                    <button
                      onClick={() => {
                        if (category.subcategories.length > 0) {
                          setActiveDropdown(activeDropdown === category.name ? null : category.name);
                        } else {
                          handleCategoryClick(category.path);
                        }
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-fuchsia-500/20 transition-all text-white"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-fuchsia-500" strokeWidth={1.5} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      {category.subcategories.length > 0 && (
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform ${activeDropdown === category.name ? 'rotate-180' : ''}`} 
                          strokeWidth={1.5} 
                        />
                      )}
                    </button>

                    {/* Mobile Subcategories */}
                    {category.subcategories.length > 0 && activeDropdown === category.name && (
                      <div className="pl-12 space-y-1">
                        {category.subcategories.map((sub, subIdx) => (
                          <button
                            key={subIdx}
                            onClick={() => handleCategoryClick(sub.path)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-fuchsia-500/10 rounded transition-colors"
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Mobile User Actions */}
              <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
                {user ? (
                  <>
                    <Link to="/post" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white rounded-lg text-center font-medium">
                      Post New Ad
                    </Link>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg">
                      Dashboard
                    </Link>
                    <Link to="/messages" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg">
                      Messages
                    </Link>
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg">
                      Logout
                    </button>
                  </>
                ) : (
                  <Button onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }} className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white py-3 rounded-lg">
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Navbar;
