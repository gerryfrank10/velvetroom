import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Eye, Shield, Users, Edit2, Trash2, UserX, UserCheck, Star, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import AuthModal from '../components/AuthModal';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = ['Escorts', 'Massage', 'Adult Dating', 'Virtual', 'Other'];
const GENDERS = ['Female', 'Male', 'Trans', 'Non-Binary', 'Other'];
const RACES = ['African', 'Asian', 'Caucasian', 'Hispanic/Latina', 'Middle Eastern', 'Mixed', 'Other'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingListings, setPendingListings] = useState([]);
  const [approvedListings, setApprovedListings] = useState([]);
  const [rejectedListings, setRejectedListings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [editForm, setEditForm] = useState({});

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
      const [pendingRes, approvedRes, rejectedRes, usersRes] = await Promise.all([
        axios.get(`${API}/admin/listings?status=pending`),
        axios.get(`${API}/admin/listings?status=approved`),
        axios.get(`${API}/admin/listings?status=rejected`),
        axios.get(`${API}/admin/users`)
      ]);
      setPendingListings(pendingRes.data);
      setApprovedListings(approvedRes.data);
      setRejectedListings(rejectedRes.data);
      setAllUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

  const updateUserStatus = async (userId, status) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/status?status=${status}`);
      toast.success(`User status updated to ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their data?')) return;
    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      toast.success('User deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const toggleVIP = async (userId) => {
    try {
      await axios.post(`${API}/admin/users/${userId}/vip?days=30`);
      toast.success('VIP status granted for 30 days');
      fetchData();
    } catch (error) {
      toast.error('Failed to toggle VIP status');
    }
  };

  const openEditModal = (listing) => {
    setEditingListing(listing);
    setEditForm({
      title: listing.title || '',
      description: listing.description || '',
      price: listing.price || '',
      age: listing.age || '',
      race: listing.race || '',
      gender: listing.gender || '',
      category: listing.category || '',
      status: listing.status || 'pending',
      featured: listing.featured || false
    });
    setEditModalOpen(true);
  };

  const saveListingEdit = async () => {
    try {
      const formData = new FormData();
      Object.entries(editForm).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      await axios.put(`${API}/admin/listings/${editingListing.id}/edit`, formData);
      toast.success('Listing updated successfully');
      setEditModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update listing');
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
        {listing.featured && (
          <div className="absolute top-2 right-2 bg-amber-500 text-black px-2 py-1 rounded text-xs font-bold">
            Featured
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          {listing.title}
        </h3>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {listing.gender && <Badge variant="secondary" className="text-xs">{listing.gender}</Badge>}
          {listing.race && <Badge variant="secondary" className="text-xs">{listing.race}</Badge>}
          {listing.age && <Badge variant="secondary" className="text-xs">{listing.age} yrs</Badge>}
        </div>
        
        <p className="text-sm text-gray-400 mb-2 line-clamp-2">{listing.description}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-fuchsia-500 font-bold">${listing.price}</span>
          <span className="text-xs text-gray-500">
            {listing.location
              ? `${listing.location.city || ''}, ${listing.location.country || ''}`
              : 'Location not specified'}
          </span>
        </div>
        <div className="text-xs text-gray-500 mb-4">
          Posted by: {listing.user_name}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {showActions ? (
            <div className="flex space-x-2">
              <Button
                onClick={() => updateStatus(listing.id, 'approved')}
                className="flex-1 bg-green-500/20 border border-green-500/30 text-green-500 hover:bg-green-500/30"
                data-testid={`approve-${listing.id}`}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                onClick={() => updateStatus(listing.id, 'rejected')}
                className="flex-1 bg-red-500/20 border border-red-500/30 text-red-500 hover:bg-red-500/30"
                data-testid={`reject-${listing.id}`}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          ) : null}
          
          <div className="flex space-x-2">
            <Button
              onClick={() => openEditModal(listing)}
              className="flex-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
              data-testid={`edit-${listing.id}`}
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              onClick={() => navigate(`/listing/${listing.id}`)}
              className="bg-white/5 border border-white/10 text-white hover:bg-white/10"
              data-testid={`view-${listing.id}`}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => deleteListing(listing.id)}
              className="bg-red-500/20 border border-red-500/30 text-red-500 hover:bg-red-500/30"
              data-testid={`delete-${listing.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserCard = (userItem) => (
    <div key={userItem.id} className="glass rounded-xl p-4" data-testid={`admin-user-${userItem.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{userItem.name}</h3>
          <p className="text-sm text-gray-400">{userItem.email}</p>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <Badge className={userItem.role === 'admin' ? 'bg-amber-500' : 'bg-fuchsia-500'}>
            {userItem.role}
          </Badge>
          {userItem.vip_status && (
            <Badge className="bg-purple-500">VIP</Badge>
          )}
          <Badge className={
            userItem.status === 'active' ? 'bg-green-500' : 
            userItem.status === 'suspended' ? 'bg-red-500' : 'bg-yellow-500'
          }>
            {userItem.status || 'active'}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {userItem.status !== 'suspended' && (
          <Button
            onClick={() => updateUserStatus(userItem.id, 'suspended')}
            className="bg-red-500/20 border border-red-500/30 text-red-500 hover:bg-red-500/30"
            size="sm"
            data-testid={`suspend-user-${userItem.id}`}
          >
            <UserX className="w-4 h-4 mr-1" />
            Suspend
          </Button>
        )}
        {userItem.status === 'suspended' && (
          <Button
            onClick={() => updateUserStatus(userItem.id, 'active')}
            className="bg-green-500/20 border border-green-500/30 text-green-500 hover:bg-green-500/30"
            size="sm"
            data-testid={`activate-user-${userItem.id}`}
          >
            <UserCheck className="w-4 h-4 mr-1" />
            Activate
          </Button>
        )}
        {userItem.status !== 'pending' && userItem.status !== 'suspended' && (
          <Button
            onClick={() => updateUserStatus(userItem.id, 'pending')}
            className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/30"
            size="sm"
            data-testid={`pending-user-${userItem.id}`}
          >
            Set Pending
          </Button>
        )}
        <Button
          onClick={() => toggleVIP(userItem.id)}
          className="bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30"
          size="sm"
          data-testid={`vip-user-${userItem.id}`}
        >
          <Star className="w-4 h-4 mr-1" />
          {userItem.vip_status ? 'Extend VIP' : 'Grant VIP'}
        </Button>
        {userItem.role !== 'admin' && (
          <Button
            onClick={() => deleteUser(userItem.id)}
            className="bg-red-500/20 border border-red-500/30 text-red-500 hover:bg-red-500/30"
            size="sm"
            data-testid={`delete-user-${userItem.id}`}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-fuchsia-500">{pendingListings.length}</p>
            <p className="text-gray-400 text-sm">Pending</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-500">{approvedListings.length}</p>
            <p className="text-gray-400 text-sm">Approved</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-500">{rejectedListings.length}</p>
            <p className="text-gray-400 text-sm">Rejected</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-500">{allUsers.length}</p>
            <p className="text-gray-400 text-sm">Users</p>
          </div>
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
            <TabsTrigger value="users" className="data-[state=active]:bg-fuchsia-500" data-testid="users-tab">
              <Users className="w-4 h-4 mr-2" />
              Users ({allUsers.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Listings */}
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

          {/* Approved Listings */}
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

          {/* Rejected Listings */}
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

          {/* Users */}
          <TabsContent value="users" data-testid="users-content">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : allUsers.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <p className="text-gray-400">No users found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allUsers.map((userItem) => renderUserCard(userItem))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Listing Modal */}
      {editModalOpen && editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditModalOpen(false)}></div>
          
          <div className="relative glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" data-testid="edit-listing-modal">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Edit Listing
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Title</label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="bg-black/20 border-white/10 text-white"
                  data-testid="edit-title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 text-white rounded-md p-3 min-h-[100px]"
                  data-testid="edit-description"
                />
              </div>

              {/* Price, Age, Gender, Race */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Price</label>
                  <Input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="bg-black/20 border-white/10 text-white"
                    data-testid="edit-price"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Age</label>
                  <Input
                    type="number"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    className="bg-black/20 border-white/10 text-white"
                    data-testid="edit-age"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Gender</label>
                  <Select value={editForm.gender} onValueChange={(v) => setEditForm({ ...editForm, gender: v })}>
                    <SelectTrigger className="bg-black/20 border-white/10 text-white" data-testid="edit-gender">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10">
                      {GENDERS.map((g) => (
                        <SelectItem key={g} value={g} className="text-white">{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Ethnicity</label>
                  <Select value={editForm.race} onValueChange={(v) => setEditForm({ ...editForm, race: v })}>
                    <SelectTrigger className="bg-black/20 border-white/10 text-white" data-testid="edit-race">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10">
                      {RACES.map((r) => (
                        <SelectItem key={r} value={r} className="text-white">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Category</label>
                  <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
                    <SelectTrigger className="bg-black/20 border-white/10 text-white" data-testid="edit-category">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10">
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Status</label>
                  <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                    <SelectTrigger className="bg-black/20 border-white/10 text-white" data-testid="edit-status">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10">
                      <SelectItem value="pending" className="text-white">Pending</SelectItem>
                      <SelectItem value="approved" className="text-white">Approved</SelectItem>
                      <SelectItem value="rejected" className="text-white">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={editForm.featured}
                  onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                  className="w-5 h-5 rounded border-white/10 bg-black/20"
                  data-testid="edit-featured"
                />
                <label htmlFor="featured" className="text-white">Featured Listing</label>
              </div>

              {/* Save Button */}
              <Button
                onClick={saveListingEdit}
                className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white py-3 rounded-full"
                data-testid="save-listing-edit"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default AdminDashboard;
