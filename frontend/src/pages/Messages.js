import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import AuthModal from '../components/AuthModal';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
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
            <p className="text-gray-400 mb-6">You need to be signed in to view messages.</p>
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

  // Group messages by listing
  const groupedMessages = messages.reduce((acc, msg) => {
    if (!acc[msg.listing_id]) {
      acc[msg.listing_id] = [];
    }
    acc[msg.listing_id].push(msg);
    return acc;
  }, {});

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
        <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          <span className="text-gradient">Messages</span>
        </h1>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-gray-400 mb-4">No messages yet.</p>
            <Button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white px-8 py-3 rounded-full"
            >
              Browse Listings
            </Button>
          </div>
        ) : (
          <div className="space-y-6" data-testid="messages-list">
            {Object.entries(groupedMessages).map(([listingId, msgs]) => (
              <div key={listingId} className="glass rounded-2xl p-6" data-testid={`message-group-${listingId}`}>
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Listing: {listingId}
                </h3>
                <div className="space-y-3">
                  {msgs.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-bubble p-4 rounded-lg ${
                        msg.from_user_id === user.id
                          ? 'bg-fuchsia-500/20 ml-8'
                          : 'bg-white/5 mr-8'
                      }`}
                      data-testid={`message-${msg.id}`}
                    >
                      <p className="text-sm text-gray-400 mb-1">
                        {msg.from_user_id === user.id ? 'You' : 'Them'}
                      </p>
                      <p className="text-white">{msg.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
