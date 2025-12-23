import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, DollarSign, Star, Sparkles } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import ListingModal from '../components/ListingModal';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  'Escorts',
  'Massage',
  'Adult Dating',
  'Virtual',
  'Other'
];

const Home = () => {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [stats, setStats] = useState({ total_listings: 0, total_users: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchListings();
    fetchStats();
  }, [category, location]);

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams();
      params.append('status', 'approved');
      if (category) params.append('category', category);
      if (location) params.append('location', location);
      if (search) params.append('search', search);

      const response = await axios.get(`${API}/listings?${params.toString()}`);
      setListings(response.data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
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
    fetchListings();
  };

  const handleListingClick = (listing) => {
    setSelectedListing(listing);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
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
            <div className="w-px h-6 bg-white/10"></div>
            <div>
              <span className="text-fuchsia-500 font-bold text-2xl">{stats.total_users}</span>
              <span className="text-gray-400 ml-2">Members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="glass rounded-2xl p-6 flex flex-wrap gap-4" data-testid="filters">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px] bg-black/20 border-white/10 text-white" data-testid="category-filter">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-white/10">
              <SelectItem value="all" className="text-white">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-white">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-[200px] bg-black/20 border-white/10 text-white"
            data-testid="location-filter"
          />

          {(category || location) && (
            <Button
              onClick={() => {
                setCategory('');
                setLocation('');
              }}
              className="bg-white/5 border border-white/10 text-white hover:bg-white/10"
              data-testid="clear-filters-button"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-16">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16" data-testid="no-listings">
            <p className="text-gray-400 text-lg">No listings found. Be the first to post!</p>
          </div>
        ) : (
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
                    className="listing-card-image w-full h-full object-cover blur-reveal"
                  />
                  {listing.featured && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 badge-verified">
                      <Sparkles className="w-3 h-3" />
                      <span>Featured</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {listing.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                    <MapPin className="w-4 h-4" strokeWidth={1.5} />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-fuchsia-500 font-bold">
                      <DollarSign className="w-4 h-4" strokeWidth={1.5} />
                      <span>{listing.price}</span>
                    </div>
                    <span className="text-xs text-gray-500">{listing.views} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
