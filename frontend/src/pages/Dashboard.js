import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import AuthModal from '../components/AuthModal';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [myListings, setMyListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [listingsRes, favoritesRes] = await Promise.all([
        axios.get(`${API}/listings/user/me`),
        axios.get(`${API}/favorites`)
      ]);
      setMyListings(listingsRes.data);
      setFavorites(favoritesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      await axios.delete(`${API}/listings/${id}`);
      setMyListings(myListings.filter((l) => l.id !== id));
      toast.success('Listing deleted');
    } catch (error) {
      toast.error('Failed to delete listing');
    }
  };

  const removeFavorite = async (id) => {
    try {
      await axios.delete(`${API}/favorites/${id}`);
      setFavorites(favorites.filter((l) => l.id !== id));
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove favorite');
    }
  };

  if (!user) {
    return (
      <>
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Sign In Required
            </h2>
            <p className="text-gray-400 mb-6">You need to be signed in to access your dashboard.</p>
            <Button
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white px-8 py-3 rounded-full"
            >
              Sign In
            </Button>
          </div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  const getStatusIcon = (status) => {
    if (status === 'approved') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'rejected') return <XCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-amber-500" />;
  };

  const getStatusText = (status) => {
    if (status === 'approved') return 'Approved';
    if (status === 'rejected') return 'Rejected';
    return 'Pending Review';
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          <span className="text-gradient">My Dashboard</span>
        </h1>

        <Tabs defaultValue="listings" className="w-full" data-testid="dashboard-tabs">
          <TabsList className="bg-white/5 border border-white/10 mb-8">
            <TabsTrigger value="listings" className="data-[state=active]:bg-fuchsia-500" data-testid="listings-tab">
              My Listings ({myListings.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-fuchsia-500" data-testid="favorites-tab">
              Favorites ({favorites.length})
            </TabsTrigger>
          </TabsList>

          {/* My Listings */}
          <TabsContent value="listings" data-testid="listings-content">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : myListings.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <p className="text-gray-400 mb-4">You haven't posted any listings yet.</p>
                <Button
                  onClick={() => navigate('/post')}
                  className="bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white px-8 py-3 rounded-full"
                >
                  Create Your First Listing
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((listing) => (
                  <div key={listing.id} className="glass rounded-xl overflow-hidden" data-testid={`my-listing-${listing.id}`}>
                    <div className="relative h-48">
                      <img
                        src={listing.images[0] || 'https://images.unsplash.com/photo-1759771716328-db403c219f56?crop=entropy&cs=srgb&fm=jpg&q=85'}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/80 px-3 py-1 rounded-full text-xs">
                        {getStatusIcon(listing.status)}
                        <span>{getStatusText(listing.status)}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {listing.title}
                      </h3>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-fuchsia-500 font-bold">${listing.price}</span>
                        <span className="text-xs text-gray-500">{listing.views} views</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => navigate(`/listing/${listing.id}`)}
                          className="flex-1 bg-white/5 border border-white/10 text-white hover:bg-white/10"
                          data-testid={`view-listing-${listing.id}`}
                        >
                          View
                        </Button>
                        <Button
                          onClick={() => deleteListing(listing.id)}
                          className="bg-red-500/20 border border-red-500/30 text-red-500 hover:bg-red-500/30"
                          data-testid={`delete-listing-${listing.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Favorites */}
          <TabsContent value="favorites" data-testid="favorites-content">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : favorites.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">You haven't favorited any listings yet.</p>
                <Button
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white px-8 py-3 rounded-full"
                >
                  Browse Listings
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((listing) => (
                  <div key={listing.id} className="glass rounded-xl overflow-hidden" data-testid={`favorite-${listing.id}`}>
                    <div className="relative h-48">
                      <img
                        src={listing.images[0] || 'https://images.unsplash.com/photo-1759771716328-db403c219f56?crop=entropy&cs=srgb&fm=jpg&q=85'}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {listing.title}
                      </h3>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-fuchsia-500 font-bold">${listing.price}</span>
                        <span className="text-xs text-gray-500">
                          {listing.location
                          ? `${listing.location.city}, ${listing.location.country}`
                          : 'Location not specified'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => navigate(`/listing/${listing.id}`)}
                          className="flex-1 bg-white/5 border border-white/10 text-white hover:bg-white/10"
                          data-testid={`view-favorite-${listing.id}`}
                        >
                          View
                        </Button>
                        <Button
                          onClick={() => removeFavorite(listing.id)}
                          className="bg-red-500/20 border border-red-500/30 text-red-500 hover:bg-red-500/30"
                          data-testid={`remove-favorite-${listing.id}`}
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
