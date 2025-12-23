import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Mail, Phone, Calendar, Award, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import ListingModal from '../components/ListingModal';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      // Fetch user listings to get user info
      const response = await axios.get(`${API}/listings?user_id=${userId}&status=approved`);
      if (response.data.length > 0) {
        setListings(response.data);
        // Extract user info from first listing
        setProfileUser({
          id: response.data[0].user_id,
          name: response.data[0].user_name,
          vip_status: false // This would come from user endpoint
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className=\"min-h-screen pt-20 flex items-center justify-center\">
        <div className=\"inline-block w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin\"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className=\"min-h-screen pt-20 flex items-center justify-center\">
        <div className=\"glass rounded-2xl p-8 text-center\">
          <p className=\"text-gray-400\">User not found</p>
          <Button onClick={() => navigate('/')} className=\"mt-4 bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white\">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className=\"min-h-screen pt-20 pb-16\">
        <div className=\"max-w-7xl mx-auto px-6 md:px-12 py-8\">
          {/* Profile Header */}
          <div className=\"glass rounded-2xl p-8 mb-8\" data-testid=\"profile-header\">
            <div className=\"flex items-start justify-between\">
              <div className=\"flex items-center space-x-6\">
                <div className=\"w-24 h-24 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 flex items-center justify-center text-4xl font-bold text-white\">
                  {profileUser.name.charAt(0)}
                </div>
                <div>
                  <div className=\"flex items-center space-x-3 mb-2\">
                    <h1 className=\"text-4xl font-bold\" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {profileUser.name}
                    </h1>
                    {profileUser.vip_status && (
                      <Badge className=\"bg-amber-500 text-black border-0\">
                        <Crown className=\"w-4 h-4 mr-1\" />
                        VIP
                      </Badge>
                    )}
                  </div>
                  <div className=\"flex items-center space-x-4 text-gray-400\">
                    <span>{listings.length} Active Listings</span>
                    <span>•</span>
                    <span>Member since 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Listings */}
          <div>
            <h2 className=\"text-3xl font-bold mb-6\" style={{ fontFamily: 'Playfair Display, serif' }}>
              Listings by {profileUser.name}
            </h2>
            
            {listings.length === 0 ? (
              <div className=\"glass rounded-2xl p-12 text-center\">
                <p className=\"text-gray-400\">No active listings</p>
              </div>
            ) : (
              <div className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6\">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => {
                      setSelectedListing(listing);
                      setShowModal(true);
                    }}
                    className=\"listing-card group relative overflow-hidden rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-fuchsia-500/30 transition-all duration-500 cursor-pointer\"
                    data-testid={`profile-listing-${listing.id}`}
                  >
                    <div className=\"relative h-64 overflow-hidden\">
                      <img
                        src={listing.images[0] || 'https://images.unsplash.com/photo-1759771716328-db403c219f56?crop=entropy&cs=srgb&fm=jpg&q=85'}
                        alt={listing.title}
                        className=\"listing-card-image w-full h-full object-cover blur-reveal\"
                      />
                      {listing.featured && (
                        <div className=\"absolute top-3 right-3 bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1\">
                          <Star className=\"w-3 h-3\" />
                          <span>Featured</span>
                        </div>
                      )}
                    </div>
                    <div className=\"p-4\">
                      <h3 className=\"text-lg font-semibold text-white mb-2 line-clamp-1\" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {listing.title}
                      </h3>
                      <div className=\"flex items-center space-x-2 text-sm text-gray-400 mb-2\">
                        <MapPin className=\"w-4 h-4\" strokeWidth={1.5} />
                        <span>{typeof listing.location === 'object' ? `${listing.location.city || ''}, ${listing.location.country || ''}` : listing.location}</span>
                      </div>
                      <div className=\"flex items-center justify-between\">
                        <span className=\"text-fuchsia-500 font-bold\">${listing.price}</span>
                        <span className=\"text-xs text-gray-500\">{listing.views} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ListingModal 
        listing={selectedListing} 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
};

export default UserProfile;
