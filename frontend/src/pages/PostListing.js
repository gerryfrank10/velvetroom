import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, X, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import AuthModal from '../components/AuthModal';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = ['Escorts', 'Massage', 'Adult Dating', 'Virtual', 'Other'];

const AVAILABLE_SERVICES = [
  'Companionship',
  'Massage Therapy',
  'Travel Companion',
  'Dinner Dates',
  'Events & Parties',
  'Virtual Sessions',
  'Photography',
  'Dance',
  'Other Services'
];

const PostListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category: '',
    phone: '',
    email: ''
  });
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

  if (!user) {
    return (
      <>
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="glass rounded-2xl p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Sign In Required
            </h2>
            <p className="text-gray-400 mb-6">You need to be signed in to post a listing.</p>
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${API}/upload`, formData);
        return response.data;
      });

      const results = await Promise.all(uploadPromises);
      
      // Separate images and videos
      results.forEach(result => {
        if (result.type === 'video') {
          setVideos(prev => [...prev, result.url]);
        } else {
          setImages(prev => [...prev, result.url]);
        }
      });
      
      toast.success('Files uploaded with watermark!');
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0 && videos.length === 0) {
      toast.error('Please upload at least one image or video');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });
      images.forEach((img) => {
        submitData.append('images', img);
      });
      videos.forEach((vid) => {
        submitData.append('videos', vid);
      });

      const response = await axios.post(`${API}/listings`, submitData);
      toast.success('Listing submitted for review!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
        <div className="glass rounded-2xl p-8" data-testid="post-listing-form">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            <span className="text-gradient">Create Listing</span>
          </h1>
          <p className="text-gray-400 mb-8">Your listing will be reviewed before going live.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-gray-300">Title</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="bg-black/20 border-white/10 text-white mt-2"
                placeholder="Enter a catchy title"
                data-testid="title-input"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-gray-300">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="bg-black/20 border-white/10 text-white mt-2 resize-none"
                rows={6}
                placeholder="Describe your service in detail..."
                data-testid="description-textarea"
              />
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-gray-300">Price (per hour)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="bg-black/20 border-white/10 text-white mt-2"
                  placeholder="100"
                  data-testid="price-input"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-gray-300">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger className="bg-black/20 border-white/10 text-white mt-2" data-testid="category-select">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/10">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-white">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="text-gray-300">Location</Label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="bg-black/20 border-white/10 text-white mt-2"
                placeholder="City, State"
                data-testid="location-input"
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-gray-300">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-black/20 border-white/10 text-white mt-2"
                  placeholder="+1 234 567 8900"
                  data-testid="phone-input"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-300">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-black/20 border-white/10 text-white mt-2"
                  placeholder="your@email.com"
                  data-testid="email-input"
                />
              </div>
            </div>

            {/* Image & Video Upload */}
            <div>
              <Label className="text-gray-300 mb-3 block">Images & Videos (Automatic watermark will be added)</Label>
              
              {/* Images */}
              {images.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Images ({images.length})</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group" data-testid={`image-preview-${idx}`}>
                        <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`remove-image-${idx}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {videos.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Videos ({videos.length})</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos.map((vid, idx) => (
                      <div key={idx} className="relative group" data-testid={`video-preview-${idx}`}>
                        <video src={vid} className="w-full h-48 object-cover rounded-lg" controls />
                        <button
                          type="button"
                          onClick={() => removeVideo(idx)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`remove-video-${idx}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="grid grid-cols-2 gap-4">
                <label
                  className="h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-fuchsia-500/50 transition-colors"
                  data-testid="upload-media-label"
                >
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  {uploadingImage ? (
                    <div className="w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Plus className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-400">Add Media</span>
                      <span className="text-xs text-gray-500 mt-1">(Images & Videos)</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white py-4 rounded-full hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all duration-300 text-lg font-semibold"
              data-testid="submit-listing-button"
            >
              {loading ? 'Submitting...' : 'Submit Listing'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostListing;
