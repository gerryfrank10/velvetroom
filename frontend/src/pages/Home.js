import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, MessageCircle, Sparkles, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import ListingModal from '../components/ListingModal';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const HEADER = `${process.env.REACT_APP_HEADER_TITLE}`;
const TITLE = `${process.env.REACT_APP_TITLE}`;

const CURRENCY_SYMBOL = process.env.REACT_APP_CURRENCY_SYMBOL || '$';
const CURRENCY_POSITION = process.env.REACT_APP_CURRENCY_POSITION || 'before';

const formatPrice = (amount) =>
  CURRENCY_POSITION === 'before'
    ? `${CURRENCY_SYMBOL}${amount}`
    : `${amount} ${CURRENCY_SYMBOL}`;

document.title = `${HEADER}`;

const openWhatsApp = (phone) => {
  if (!phone) return;
  const message = encodeURIComponent(
    `Hi, I saw your profile on ${TITLE} and I'd like to chat.`
  );
  const url = `https://wa.me/${phone}?text=${message}`;
  window.open(url, '_blank');
};

const CATEGORIES = ['Escorts', 'Massage', 'Adult Dating', 'Virtual', 'Other'];
const GENDERS = ['Female', 'Male', 'Trans'];
const RACES = ['African', 'Asian', 'Caucasian', 'Hispanic/Latina', 'Middle Eastern', 'Mixed', 'Other'];
const COUNTRY_CODE = process.env.REACT_APP_COUNTRY_CODE || 'TZ';
const REGIONS = process.env[`REACT_APP_${COUNTRY_CODE}_REGIONS`]?.split(',').map(r => r.trim()) || [];

// Map navbar category paths to filter values
const CATEGORY_MAP = {
  'female': { gender: 'Female' },
  'male': { gender: 'Male' },
  'trans': { gender: 'Trans' },
  'lgbt': { category: 'Adult Dating' },
  'massage': { category: 'Massage' },
  'swingers': { category: 'Adult Dating' },
  'bdsm': { category: 'Other' },
  'meetfuck': { category: 'Adult Dating' },
  'vip': { featured: true }
};

const ITEMS_PER_PAGE = 16;

const Home = () => {
  const { categoryType, subCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('');
  const [race, setRace] = useState('');
  const [location, setLocation] = useState('');
  const [ageRange, setAgeRange] = useState([18, 60]);
  const [stats, setStats] = useState({ total_listings: 0, total_users: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalListings, setTotalListings] = useState(0);
  const totalPages = Math.ceil(totalListings / ITEMS_PER_PAGE);

  // Apply category from URL params
  useEffect(() => {
    if (categoryType && CATEGORY_MAP[categoryType]) {
      const mapping = CATEGORY_MAP[categoryType];
      if (mapping.gender) setGender(mapping.gender);
      if (mapping.category) setCategory(mapping.category);
    } else {
      // Reset filters when going to home
      if (!categoryType) {
        setGender('');
        setCategory('');
      }
    }
  }, [categoryType, subCategory]);

  useEffect(() => {
    fetchListings();
    fetchStats();
    fetchTotalCount();
  }, [category, gender, race, location, ageRange, currentPage, categoryType]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('status', 'approved');
      params.append('page', currentPage.toString());
      params.append('limit', ITEMS_PER_PAGE.toString());
      
      if (category) params.append('category', category);
      if (gender) params.append('gender', gender);
      if (race) params.append('race', race);
      if (location) params.append('location', location);
      if (search) params.append('search', search);
      if (ageRange[0] > 18) params.append('min_age', ageRange[0].toString());
      if (ageRange[1] < 60) params.append('max_age', ageRange[1].toString());
      
      // Handle special category mappings
      if (categoryType && CATEGORY_MAP[categoryType]?.featured) {
        params.append('featured', 'true');
      }

      const response = await axios.get(`${API}/listings?${params.toString()}`);
      setListings(response.data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalCount = async () => {
    try {
      const params = new URLSearchParams();
      params.append('status', 'approved');
      if (category) params.append('category', category);
      if (gender) params.append('gender', gender);
      if (race) params.append('race', race);
      if (ageRange[0] > 18) params.append('min_age', ageRange[0].toString());
      if (ageRange[1] < 60) params.append('max_age', ageRange[1].toString());

      const response = await axios.get(`${API}/listings/count?${params.toString()}`);
      setTotalListings(response.data.total);
    } catch (error) {
      console.error('Failed to fetch count:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchListings();
    fetchTotalCount();
  };

  const handleListingClick = (listing) => {
    setSelectedListing(listing);
    setShowModal(true);
  };

  const clearFilters = () => {
    setCategory('');
    setGender('');
    setRace('');
    setLocation('');
    setAgeRange([18, 60]);
    setSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters = category || gender || race || location || ageRange[0] > 18 || ageRange[1] < 60;

  const getCategoryTitle = () => {
    if (categoryType) {
      const titles = {
        'female': 'Female Escorts',
        'male': 'Male Escorts',
        'trans': 'Trans Escorts',
        'lgbt': 'LGBT+ Escorts',
        'massage': 'Massage Services',
        'swingers': 'Swingers',
        'bdsm': 'BDSM',
        'meetfuck': 'Casual Encounters',
        'vip': 'VIP & Premium'
      };
      return titles[categoryType] || 'All Listings';
    }
    return null;
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section - Only show on main page */}
      {!categoryType && (
        <div className="relative h-[70vh] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1760999850496-1c6bd237dd25?crop=entropy&cs=srgb&fm=jpg&q=85)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-[#050505]"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
              data-testid="hero-heading"
            >
              <span className="text-gradient">Exclusive Encounters</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-12 max-w-2xl">
              Discover premium companions in your city. Discreet, verified, and sophisticated.
            </p>

            {/* Search Bar */}
            <div className="glass rounded-full p-2 flex items-center space-x-2 max-w-3xl w-full" data-testid="search-bar">
              <Input
                type="text"
                placeholder="Search by name, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-transparent border-0 text-white flex-1 focus:ring-0"
                data-testid="search-input"
              />
              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white px-8 rounded-full"
                data-testid="search-button"
              >
                <Search className="w-5 h-5" strokeWidth={1.5} />
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 flex items-center space-x-8 text-sm" data-testid="stats">
              <div>
                <span className="text-fuchsia-500 font-bold text-2xl">{stats.total_listings}</span>
                <span className="text-gray-400 ml-2">Active Listings</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Header */}
      {categoryType && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <span className="text-gradient">{getCategoryTitle()}</span>
              </h1>
              <p className="text-gray-400">{totalListings} listings found</p>
            </div>
            <Link to="/">
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                View All
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="glass rounded-2xl p-6" data-testid="filters">
          {/* Filter Toggle for Mobile */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <span className="text-white font-medium">Filters</span>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-white/10 text-white"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'}
            </Button>
          </div>

          {/* Filter Controls */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Category */}
              <Select value={category} onValueChange={(v) => { setCategory(v === 'all' ? '' : v); setCurrentPage(1); }}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white" data-testid="category-filter">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10">
                  <SelectItem value="all" className="text-white">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-white">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Gender */}
              <Select value={gender} onValueChange={(v) => { setGender(v === 'all' ? '' : v); setCurrentPage(1); }}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white" data-testid="gender-filter">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10">
                  <SelectItem value="all" className="text-white">All Genders</SelectItem>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g} className="text-white">{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Race/Ethnicity */}
              <Select value={race} onValueChange={(v) => { setRace(v === 'all' ? '' : v); setCurrentPage(1); }}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white" data-testid="race-filter">
                  <SelectValue placeholder="Ethnicity" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10">
                  <SelectItem value="all" className="text-white">All Ethnicities</SelectItem>
                  {RACES.map((r) => (
                    <SelectItem key={r} value={r} className="text-white">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location */}
              <Select value={location} onValueChange={(v) => { setLocation(v === 'all' ? '' : v); setCurrentPage(1); }}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white" data-testid="location-filter">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10">
                  <SelectItem value="all" className="text-white">All Locations</SelectItem>
                  {REGIONS.map(region => (
                    <SelectItem key={region} value={region} className="text-white">{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Age Range */}
              <div className="flex flex-col justify-center">
                <span className="text-xs text-gray-400 mb-2">Age: {ageRange[0]} - {ageRange[1]}</span>
                <Slider
                  value={ageRange}
                  onValueChange={(v) => { setAgeRange(v); setCurrentPage(1); }}
                  min={18}
                  max={60}
                  step={1}
                  className="w-full"
                  data-testid="age-slider"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-white/10 text-white hover:bg-white/10"
                data-testid="clear-filters-button"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16" data-testid="no-listings">
            <p className="text-gray-400 text-lg">No listings found. Be the first to post!</p>
            <Link to="/post">
              <Button className="mt-4 bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white">
                Post a Listing
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="listings-grid">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  onClick={() => handleListingClick(listing)}
                  className="listing-card group relative overflow-hidden rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-fuchsia-500/30 transition-all duration-500 cursor-pointer"
                  data-testid={`listing-card-${listing.id}`}
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={listing.images[0] || 'https://images.unsplash.com/photo-1759771716328-db403c219f56?crop=entropy&cs=srgb&fm=jpg&q=85'}
                      alt={listing.title}
                      className="listing-card-image w-full h-full object-cover"
                    />
                    {listing.featured && (
                      <div className="absolute top-3 right-3 bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 badge-verified">
                        <Sparkles className="w-3 h-3" />
                        <span>Featured</span>
                      </div>
                    )}
                    {/* Age Badge */}
                    {listing.age && (
                      <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {listing.age} yrs
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {listing.title}
                    </h3>
                    
                    {/* Gender & Race Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {listing.gender && (
                        <span className="text-xs bg-fuchsia-500/20 text-fuchsia-400 px-2 py-0.5 rounded">
                          {listing.gender}
                        </span>
                      )}
                      {listing.race && (
                        <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded">
                          {listing.race}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                      <MapPin className="w-4 h-4" strokeWidth={1.5} />
                      <span className="line-clamp-1">
                        {typeof listing.location === 'object'
                          ? `${listing.location.district || listing.location.city || ''}, ${listing.location.country || ''}`
                          : listing.location}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div
                        onClick={(e) => { e.stopPropagation(); openWhatsApp(listing.phone); }}
                        className="flex items-center space-x-2 text-green-500 font-bold cursor-pointer hover:opacity-80"
                      >
                        <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                        <span className="text-sm">{listing.phone || 'Contact'}</span>
                      </div>
                      <span className="text-fuchsia-500 font-bold">{formatPrice(listing.price)}/hr</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-12" data-testid="pagination">
                <Button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
                  data-testid="prev-page"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </Button>

                <div className="flex items-center space-x-2">
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        className={currentPage === pageNum 
                          ? 'bg-fuchsia-500 text-white' 
                          : 'border-white/10 text-white hover:bg-white/10'}
                        data-testid={`page-${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
                  data-testid="next-page"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Results Info */}
            <div className="text-center text-gray-500 text-sm mt-4">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalListings)} of {totalListings} listings
            </div>
          </>
        )}
      </div>

      <ListingModal
        listing={selectedListing}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default Home;
