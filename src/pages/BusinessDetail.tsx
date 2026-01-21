import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  ArrowLeft, MapPin, Phone, Mail, Globe, Star, Eye, 
  Clock, DollarSign, CheckCircle, Building2, X 
} from 'lucide-react';

interface Business {
  id: number;
  name: string;
  type: string;
  description: string;
  location_id?: number;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  logo?: string;
  cover_photo?: string;
  photos: string[];
  pricing_info?: string;
  facilities: string[];
  opening_hours?: string;
  verified: boolean;
  rating: number | null;
  total_reviews: number;
  views_count: number;
  payment_methods: string[];
  languages: string[];
  created_at: string;
}

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const { data: business, isLoading } = useQuery({
    queryKey: ['business', id],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/businesses/${id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch business');
      return response.json() as Promise<Business>;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Business not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/businesses')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Businesses
      </button>

      {/* Cover Photo */}
      <div className="relative h-96 rounded-xl overflow-hidden mb-8">
        {business.cover_photo ? (
          <img
            src={business.cover_photo.startsWith('http')
              ? business.cover_photo
              : `http://localhost:3001${business.cover_photo}`}
            alt={business.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Building2 className="w-32 h-32 text-white opacity-50" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{business.name}</h1>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-medium">
                  {business.type}
                </span>
                {business.verified && (
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2 fill-yellow-500" />
              <p className="text-2xl font-bold">{(business.rating && typeof business.rating === 'number') ? business.rating.toFixed(1) : '0.0'}</p>
              <p className="text-sm text-gray-600">{business.total_reviews || 0} reviews</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{business.views_count || 0}</p>
              <p className="text-sm text-gray-600">Views</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <Building2 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{business.type}</p>
              <p className="text-sm text-gray-600">Category</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{business.description}</p>
          </div>

          {/* Photos */}
          {business.photos && business.photos.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Photos ({business.photos.length})</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {business.photos.map((photo, index) => (
                  <button
                    key={photo}
                    onClick={() => setSelectedPhoto(photo)}
                    className="relative overflow-hidden rounded-lg hover:opacity-90 transition-opacity cursor-pointer group"
                  >
                    <img
                      src={photo.startsWith('http') ? photo : `http://localhost:3001${photo}`}
                      alt={`${business.name} - ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Facilities */}
          {business.facilities && business.facilities.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Facilities & Services</h2>
              <div className="flex flex-wrap gap-2">
                {business.facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <div className="space-y-3">
              {business.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-sm text-gray-700">Address</p>
                    <p className="text-gray-600">{business.address}</p>
                  </div>
                </div>
              )}
              {business.contact_phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-sm text-gray-700">Phone</p>
                    <a href={`tel:${business.contact_phone}`} className="text-blue-600 hover:underline">
                      {business.contact_phone}
                    </a>
                  </div>
                </div>
              )}
              {business.contact_email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-sm text-gray-700">Email</p>
                    <a href={`mailto:${business.contact_email}`} className="text-blue-600 hover:underline">
                      {business.contact_email}
                    </a>
                  </div>
                </div>
              )}
              {business.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-sm text-gray-700">Website</p>
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {business.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Business Hours */}
          {business.opening_hours && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Opening Hours</h2>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                <p className="text-gray-700">{business.opening_hours}</p>
              </div>
            </div>
          )}

          {/* Pricing */}
          {business.pricing_info && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Pricing</h2>
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                <p className="text-gray-700">{business.pricing_info}</p>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          {business.payment_methods && business.payment_methods.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
              <div className="flex flex-wrap gap-2">
                {business.payment_methods.map((method, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {business.languages && business.languages.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Languages Spoken</h2>
              <div className="flex flex-wrap gap-2">
                {business.languages.map((language, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={selectedPhoto.startsWith('http') ? selectedPhoto : `http://localhost:3001${selectedPhoto}`}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
