import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, DollarSign, Eye, Heart, Mail, Phone, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import AuthModal from '../components/AuthModal';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await axios.get(`${API}/listings/${id}`);
      setListing(response.data);
    } catch (error) {
      console.error('Failed to fetch listing:', error);
      toast.error('Listing not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('listing_id', listing.id);
      await axios.post(`${API}/favorites`, formData);
      toast.success('Added to favorites!');
    } catch (error) {
      toast.error('Failed to add to favorites');
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      await axios.post(`${API}/messages`, {
        to_user_id: listing.user_id,
        listing_id: listing.id,
        content: message
      });
      toast.success('Message sent!');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!listing) return null;

  const images = listing.images.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1759771716328-db403c219f56?crop=entropy&cs=srgb&fm=jpg&q=85'];
  const videos = listing.videos || [];
  const allMedia = [...images, ...videos];

  return (
    <>
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
          {/* Back Button */}
          <Button
            onClick={() => navigate('/')}
            className="mb-6 bg-white/5 border border-white/10 text-white hover:bg-white/10"
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Images */}
            <div className="lg:col-span-2">
              <div className="glass rounded-2xl overflow-hidden" data-testid="listing-images">
                {/* Main Media */}
                <div className="relative h-[500px] overflow-hidden">
                  {allMedia[selectedImage] && allMedia[selectedImage].includes('.mp4') || allMedia[selectedImage]?.includes('.mov') || allMedia[selectedImage]?.includes('.webm') || allMedia[selectedImage]?.includes('.avi') ? (
                    <video
                      src={allMedia[selectedImage]}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={allMedia[selectedImage] || images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover blur-reveal"
                    />
                  )}
                  {listing.featured && (
                    <div className="absolute top-4 right-4 bg-amber-500 text-black px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2 badge-verified">
                      <Sparkles className="w-4 h-4" />
                      <span>Featured</span>
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {allMedia.length > 1 && (
                  <div className="p-4 flex space-x-2 overflow-x-auto">
                    {allMedia.map((media, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === idx ? 'border-fuchsia-500' : 'border-white/10'
                        }`}
                        data-testid={`thumbnail-${idx}`}>
                        {media.includes('.mp4') || media.includes('.mov') || media.includes('.webm') || media.includes('.avi') ? (
                          <video src={media} className="w-full h-full object-cover" />
                        ) : (
                          <img src={media} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="glass rounded-2xl p-8 mt-6" data-testid="listing-description">
                <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  About
                </h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              </div>
            </div>

            {/* Right: Details & Contact */}
            <div>
              <div className="glass rounded-2xl p-8 sticky top-24" data-testid="listing-details">
                <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {listing.title}
                </h1>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <MapPin className="w-5 h-5 text-fuchsia-500" strokeWidth={1.5} />
                    <span>
                      {listing.location
                      ? `${listing.location.city || ''}, ${listing.location.country || ''}`
                      : 'Location not specified'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-fuchsia-500" strokeWidth={1.5} />
                    <span className="text-2xl font-bold text-fuchsia-500">${listing.price}</span>
                    <span className="text-gray-400 text-sm">per hour</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400 text-sm">
                    <Eye className="w-4 h-4" strokeWidth={1.5} />
                    <span>{listing.views} views</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6 mb-6">
                  <p className="text-sm text-gray-400 mb-2">Posted by</p>
                  <p className="text-white font-medium">{listing.user_name}</p>
                </div>

                {/* Contact Info */}
                {listing.phone && (
                  <div className="mb-4 p-4 bg-white/5 rounded-lg flex items-center space-x-3" data-testid="phone-info">
                    <Phone className="w-5 h-5 text-fuchsia-500" strokeWidth={1.5} />
                    <span className="text-white">{listing.phone}</span>
                  </div>
                )}

                {listing.email && (
                  <div className="mb-6 p-4 bg-white/5 rounded-lg flex items-center space-x-3" data-testid="email-info">
                    <Mail className="w-5 h-5 text-fuchsia-500" strokeWidth={1.5} />
                    <span className="text-white">{listing.email}</span>
                  </div>
                )}

                {/* Message */}
                <div className="mb-4" data-testid="message-section">
                  <Textarea
                    placeholder="Send a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-black/20 border-white/10 text-white mb-3 resize-none"
                    rows={4}
                    data-testid="message-textarea"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white py-3 rounded-full hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all duration-300"
                    data-testid="send-message-button"
                  >
                    <Mail className="w-5 h-5 mr-2" strokeWidth={1.5} />
                    Send Message
                  </Button>
                </div>

                {/* Favorite Button */}
                <Button
                  onClick={handleFavorite}
                  className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 py-3 rounded-full"
                  data-testid="favorite-button"
                >
                  <Heart className="w-5 h-5 mr-2" strokeWidth={1.5} />
                  Add to Favorites
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default ListingDetail;
