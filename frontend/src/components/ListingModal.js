import React, { useState } from 'react';
import { X, MapPin, DollarSign, Eye, Heart, Mail, Phone, Sparkles, Clock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import AuthModal from './AuthModal';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ListingModal = ({ listing, isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(0);

  if (!isOpen || !listing) return null;

  const images = listing.images?.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1759771716328-db403c219f56?crop=entropy&cs=srgb&fm=jpg&q=85'];
  const videos = listing.videos || [];
  const allMedia = [...images, ...videos];

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

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="listing-modal">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
        
        <div className="relative glass rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-sm text-white rounded-full p-2 hover:bg-black/80 transition-colors"
            data-testid="close-modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Left: Media */}
            <div>
              {/* Main Media */}
              <div className="relative h-[400px] rounded-xl overflow-hidden mb-4">
                {allMedia[selectedMedia]?.includes('.mp4') || allMedia[selectedMedia]?.includes('.mov') || allMedia[selectedMedia]?.includes('.webm') || allMedia[selectedMedia]?.includes('.avi') ? (
                  <video
                    src={allMedia[selectedMedia]}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={allMedia[selectedMedia] || images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover blur-reveal"
                  />
                )}
                {listing.featured && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 badge-verified">
                    <Sparkles className="w-3 h-3" />
                    <span>Featured</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allMedia.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {allMedia.map((media, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedMedia(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedMedia === idx ? 'border-fuchsia-500' : 'border-white/10'
                      }`}
                    >
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

            {/* Right: Details */}
            <div className="space-y-4">
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {listing.title}
                </h2>
                <div className="flex items-center space-x-3 text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 text-fuchsia-500" strokeWidth={1.5} />
                  <span>
                    {typeof listing.location === 'object'
                      ? [listing.location.district, listing.location.city, listing.location.region, listing.location.country]
                          .filter(Boolean)
                          .join(', ')
                      : listing.location}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Eye className="w-4 h-4" strokeWidth={1.5} />
                  <span>{listing.views} views</span>
                </div>
              </div>

              {/* Services */}
              {listing.services && listing.services.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Services Offered:</p>
                  <div className="flex flex-wrap gap-2">
                    {listing.services.map((service, idx) => (
                      <Badge key={idx} className="bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Tiers */}
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-3">Pricing:</p>
                {listing.pricing_tiers && listing.pricing_tiers.length > 0 ? (
                  <div className="space-y-2">
                    {listing.pricing_tiers.map((tier, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-fuchsia-500" strokeWidth={1.5} />
                          <span className="text-white">{tier.hours} {tier.hours === 1 ? 'hour' : 'hours'}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-fuchsia-500 font-bold">
                          <DollarSign className="w-4 h-4" strokeWidth={1.5} />
                          <span>{tier.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-fuchsia-500 font-bold text-xl">
                    <DollarSign className="w-5 h-5" strokeWidth={1.5} />
                    <span>{listing.price}</span>
                    <span className="text-sm text-gray-400 ml-2">per hour</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-gray-400 mb-2">About:</p>
                <p className="text-gray-300 text-sm leading-relaxed">{listing.description}</p>
              </div>

              {/* Contact */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-sm text-gray-400 mb-3">Posted by: {listing.user_name}</p>
                
                {listing.phone && (
                  <a 
                    href={`tel:${listing.phone}`}
                    className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg mb-3 hover:bg-white/10 transition-colors"
                    data-testid="phone-link"
                  >
                    <Phone className="w-5 h-5 text-fuchsia-500" strokeWidth={1.5} />
                    <span className="text-white font-medium">{listing.phone}</span>
                  </a>
                )}

                {listing.email && (
                  <a
                    href={`mailto:${listing.email}`}
                    className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg mb-3 hover:bg-white/10 transition-colors"
                    data-testid="email-link"
                  >
                    <Mail className="w-5 h-5 text-fuchsia-500" strokeWidth={1.5} />
                    <span className="text-white">{listing.email}</span>
                  </a>
                )}

                {/* Message */}
                <Textarea
                  placeholder="Send a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-black/20 border-white/10 text-white mb-3 resize-none"
                  rows={3}
                  data-testid="message-textarea"
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSendMessage}
                    className="flex-1 bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white rounded-full hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all duration-300"
                    data-testid="send-message-button"
                  >
                    <Mail className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    Send Message
                  </Button>
                  <Button
                    onClick={handleFavorite}
                    className="bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-full"
                    data-testid="favorite-button"
                  >
                    <Heart className="w-4 h-4" strokeWidth={1.5} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default ListingModal;
