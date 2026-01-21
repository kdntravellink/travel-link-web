import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Star,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Clock,
  DollarSign,
  Calendar,
  Info,
  Bus,
  Shield,
  Home,
  Heart,
  Share2,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { toast } from 'sonner';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function LocationDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');

  const { data: location, isLoading, error } = useQuery({
    queryKey: ['location', id],
    queryFn: () => apiClient.getLocation(parseInt(id!)),
    enabled: !!id,
  });

  const voteMutation = useMutation({
    mutationFn: (voteType: 'upvote' | 'downvote') =>
      apiClient.voteLocation(parseInt(id!), voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['location', id] });
      toast.success('Vote recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to vote');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading location...</span>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Location Not Found</h1>
          <p className="text-gray-600 mb-6">
            The location you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const defaultPhoto = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop';
  
  // Helper function to get correct image URL
  const getImageUrl = (photoPath: string) => {
    if (!photoPath) return defaultPhoto;
    // If already a full URL, return as is
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    // If starts with /uploads, use base URL
    if (photoPath.startsWith('/uploads')) {
      return `http://localhost:3001${photoPath}`;
    }
    // Otherwise assume it needs /uploads prefix
    return `http://localhost:3001/uploads/${photoPath}`;
  };
  
  const coverPhoto = location.photos && location.photos.length > 0 
    ? getImageUrl(location.photos[0])
    : defaultPhoto;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo */}
      <div className="relative h-96 bg-gray-900">
        <img
          src={coverPhoto}
          alt={location.name}
          className="w-full h-full object-cover opacity-90"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultPhoto;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back Button */}
        <Link
          to="/explore"
          className="absolute top-4 left-4 flex items-center px-4 py-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 bg-blue-600 rounded-full text-sm font-semibold">
                {location.category.replace('_', ' ')}
              </span>
              {location.status === 'verified' && (
                <span className="px-3 py-1 bg-green-500 rounded-full text-sm font-semibold">
                  ✓ Verified
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-2">{location.name}</h1>
            <div className="flex items-center text-white/90">
              <MapPin className="w-5 h-5 mr-2" />
              <span>
                {[location.city, location.region, location.country]
                  .filter(Boolean)
                  .join(', ') || 'Location not specified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Bar */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center text-yellow-500 mb-1">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {location.average_rating > 0 ? location.average_rating.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {location.total_reviews} reviews
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-center text-green-600 mb-1">
                    <ThumbsUp className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{location.upvotes}</div>
                  <div className="text-xs text-gray-500">upvotes</div>
                </div>

                <div>
                  <div className="flex items-center justify-center text-red-600 mb-1">
                    <ThumbsDown className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{location.downvotes}</div>
                  <div className="text-xs text-gray-500">downvotes</div>
                </div>

                <div>
                  <div className="flex items-center justify-center text-blue-600 mb-1">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{location.views_count}</div>
                  <div className="text-xs text-gray-500">views</div>
                </div>
              </div>

              {/* Vote Buttons */}
              {user && (
                <div className="flex items-center justify-center space-x-4 mt-6 pt-6 border-t">
                  <button
                    onClick={() => voteMutation.mutate('upvote')}
                    disabled={voteMutation.isPending}
                    className="flex items-center px-4 py-2 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Upvote
                  </button>
                  <button
                    onClick={() => voteMutation.mutate('downvote')}
                    disabled={voteMutation.isPending}
                    className="flex items-center px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Downvote
                  </button>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="border-b">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                      activeTab === 'overview'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                      activeTab === 'reviews'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Reviews ({location.total_reviews})
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Description */}
                    {location.description && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          About This Location
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {location.description}
                        </p>
                      </div>
                    )}

                    {/* Practical Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {location.entry_fee && (
                        <div className="flex items-start">
                          <DollarSign className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900">Entry Fee</div>
                            <div className="text-sm text-gray-600">{location.entry_fee}</div>
                          </div>
                        </div>
                      )}

                      {location.opening_hours && (
                        <div className="flex items-start">
                          <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900">Opening Hours</div>
                            <div className="text-sm text-gray-600">{location.opening_hours}</div>
                          </div>
                        </div>
                      )}

                      {location.best_time_to_visit && (
                        <div className="flex items-start">
                          <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900">Best Time to Visit</div>
                            <div className="text-sm text-gray-600">{location.best_time_to_visit}</div>
                          </div>
                        </div>
                      )}

                      {location.estimated_duration && (
                        <div className="flex items-start">
                          <Info className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900">Estimated Duration</div>
                            <div className="text-sm text-gray-600">{location.estimated_duration}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Transport Options */}
                    {location.transport_options && location.transport_options.length > 0 && (
                      <div>
                        <div className="flex items-center mb-3">
                          <Bus className="w-5 h-5 text-gray-400 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Transport Options
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {location.transport_options.map((option: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                            >
                              {option}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Facilities */}
                    {location.facilities && location.facilities.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Facilities</h3>
                        <div className="flex flex-wrap gap-2">
                          {location.facilities.map((facility: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {facility}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Safety Notes */}
                    {location.safety_notes && (
                      <div>
                        <div className="flex items-center mb-3">
                          <Shield className="w-5 h-5 text-gray-400 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">Safety Notes</h3>
                        </div>
                        <p className="text-gray-700">{location.safety_notes}</p>
                      </div>
                    )}

                    {/* Nearby Accommodations */}
                    {location.nearby_accommodations && (
                      <div>
                        <div className="flex items-center mb-3">
                          <Home className="w-5 h-5 text-gray-400 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Nearby Accommodations
                          </h3>
                        </div>
                        <p className="text-gray-700">{location.nearby_accommodations}</p>
                      </div>
                    )}

                    {/* Local Culture Tips */}
                    {location.local_culture_tips && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Local Culture Tips
                        </h3>
                        <p className="text-gray-700">{location.local_culture_tips}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="text-center py-8 text-gray-500">
                    Reviews feature coming soon!
                  </div>
                )}
              </div>
            </div>

            {/* Photo Gallery */}
            {location.photos && location.photos.length > 1 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Photo Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {location.photos.slice(1).map((photo: string, index: number) => (
                    <img
                      key={index}
                      src={getImageUrl(photo)}
                      alt={`${location.name} ${index + 2}`}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = defaultPhoto;
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Map */}
            {location.latitude && location.longitude && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div style={{ height: '300px' }}>
                  <MapContainer
                    center={[Number(location.latitude), Number(location.longitude)]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      subdomains="abcd"
                      maxZoom={20}
                    />
                    <Marker position={[Number(location.latitude), Number(location.longitude)]} />
                  </MapContainer>
                </div>
                <div className="p-4 bg-gray-50 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>
                      {Number(location.latitude).toFixed(6)}, {Number(location.longitude).toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Heart className="w-4 h-4 mr-2" />
                  Add to Wishlist
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Location
                </button>
              </div>
            </div>

            {/* Accessibility */}
            {location.accessibility && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Accessibility</h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    location.accessibility === 'easy'
                      ? 'bg-green-100 text-green-800'
                      : location.accessibility === 'moderate'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {location.accessibility.charAt(0).toUpperCase() +
                    location.accessibility.slice(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
