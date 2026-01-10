import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Eye, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import AuthModal from '../components/AuthModal';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
// const HEADER = `${process.env.TITLE}`;
// const TITLE = `Admin Dashboard - ${HEADER}`;

// document.title = TITLE;

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingListings, setPendingListings] = useState([]);
  const [approvedListings, setApprovedListings] = useState([]);
  const [rejectedListings, setRejectedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      if (user.role !== 'admin') {
        toast.error('Admin access required');
        navigate('/');
        return;
      }
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        axios.get(`${API}/admin/listings?status=pending`),
        axios.get(`${API}/admin/listings?status=approved`),
        axios.get(`${API}/admin/listings?status=rejected`)
      ]);
      setPendingListings(pendingRes.data);
      setApprovedListings(approvedRes.data);
      setRejectedListings(rejectedRes.data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.post(`${API}/admin/listings/${id}/status`, { status });
      toast.success(`Listing ${status}!`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      await axios.delete(`${API}/listings/${id}`);
      toast.success('Listing deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete listing');
    }
  };

  if (!user) {
    return (
      <>
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Admin Access Required
            </h2>
            <p className="text-gray-400 mb-6">You need admin privileges to access this page.</p>
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

  const renderListingCard = (listing, showActions = false) => (
    <div key={listing.id} className="glass rounded-xl overflow-hidden" data-testid={`admin-listing-${listing.id}`}>
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
        <p className="text-sm text-gray-400 mb-2 line-clamp-2">{listing.description}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-fuchsia-500 font-bold">${listing.price}</span>
          <span className="text-xs text-gray-500">
            {listing.location
            ? `${listing.location.city}, ${listing.location.country}`
            : 'Location not specified'}
          </span>
        </div>
        <div className="text-xs text-gray-500 mb-4">
          Posted by: {listing.user_name}
        </div>

        {showActions ? (
          <div className="flex space-x-2">
            <Button
              onClick={() => updateStatus(listing.id, 'approved')}
              className="flex-1 bg-green-500/20 border border-green-500/30 text-green-500 hover:bg-green-500/30"
              data-testid={`approve-${listing.id}`}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => updateStatus(listing.id, 'rejected')}
              className="flex-1 bg-red-500/20 border border-red-500/30 text-red-500 hover:bg-red-500/30"
              data-testid={`reject-${listing.id}`}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => navigate(`/listing/${listing.id}`)}
              className="bg-white/5 border border-white/10 text-white hover:bg-white/10"
              data-testid={`view-${listing.id}`}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Button
              onClick={() => navigate(`/listing/${listing.id}`)}
              className="flex-1 bg-white/5 border border-white/10 text-white hover:bg-white/10"
              data-testid={`view-approved-${listing.id}`}
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
            <Button
              onClick={() => deleteListing(listing.id)}
              className="bg-red-500/20 border border-red-500/30 text-red-500 hover:bg-red-500/30"
              data-testid={`delete-${listing.id}`}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <Shield className="w-10 h-10 text-fuchsia-500" />
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            <span className="text-gradient">Admin Dashboard</span>
          </h1>
        </div>

        <Tabs defaultValue="pending" className="w-full" data-testid="admin-tabs">
          <TabsList className="bg-white/5 border border-white/10 mb-8">
            <TabsTrigger value="pending" className="data-[state=active]:bg-fuchsia-500" data-testid="pending-tab">
              Pending ({pendingListings.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-fuchsia-500" data-testid="approved-tab">
              Approved ({approvedListings.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-fuchsia-500" data-testid="rejected-tab">
              Rejected ({rejectedListings.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending */}
          <TabsContent value="pending" data-testid="pending-content">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : pendingListings.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <p className="text-gray-400">No pending listings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingListings.map((listing) => renderListingCard(listing, true))}
              </div>
            )}
          </TabsContent>

          {/* Approved */}
          <TabsContent value="approved" data-testid="approved-content">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : approvedListings.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <p className="text-gray-400">No approved listings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedListings.map((listing) => renderListingCard(listing, false))}
              </div>
            )}
          </TabsContent>

          {/* Rejected */}
          <TabsContent value="rejected" data-testid="rejected-content">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : rejectedListings.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <p className="text-gray-400">No rejected listings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rejectedListings.map((listing) => renderListingCard(listing, false))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
