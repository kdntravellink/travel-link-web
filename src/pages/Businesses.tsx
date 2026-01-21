import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Search, Filter, MapPin, Star, Eye, Phone, Globe, Plus, UserPlus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Business {
  id: number;
  name: string;
  type: string;
  description: string;
  location_id?: number;
  owner_id: number;
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
  rating: number;
  total_reviews: number;
  views_count: number;
  status: string;
  created_at: string;
}

const BUSINESS_TYPES = [
  'All',
  'Hotel',
  'Restaurant',
  'Tour Operator',
  'Travel Agency',
  'Transport Service',
  'Car Rental',
  'Guide Service',
  'Equipment Rental',
  'Spa & Wellness',
  'Activity Provider',
  'Other'
];

export default function Businesses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['businesses', selectedType],
    queryFn: async () => {
      const params: any = { limit: 50 };
      if (selectedType !== 'All') {
        params.type = selectedType;
      }
      const response = await api.get('/businesses', { params });
      return response.data as Business[];
    },
  });

  // Filter businesses by search query
  const filteredBusinesses = businesses.filter(business =>
    searchQuery === '' ||
    business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl font-bold">Travel Businesses</h1>
          </div>
          {user ? (
            <button
              onClick={() => navigate('/businesses/new')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Business
            </button>
          ) : (
            <Link
              to="/register"
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Sign Up to Add Business
            </Link>
          )}
        </div>
        <p className="text-gray-600">
          Find hotels, restaurants, tour operators, and more
        </p>
      </div>

      {/* Call-to-Action Banner for Non-Logged-In Users */}
      {!user && (
        <div className="mb-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <UserPlus className="w-6 h-6" />
                List Your Business on TravelLink!
              </h2>
              <p className="text-purple-50 mb-3">
                Join our community and showcase your hotel, restaurant, or tour service to thousands of travelers. 
                Sign up to add your business listing with photos, contact details, and more.
              </p>
              <div className="flex gap-3">
                <Link
                  to="/register"
                  className="px-6 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-2 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-800 transition-colors border border-purple-400"
                >
                  Login
                </Link>
              </div>
            </div>
            <div className="hidden lg:block ml-6">
              <Building2 className="w-24 h-24 text-purple-200 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
          {BUSINESS_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedType === type
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Businesses Grid */}
      {filteredBusinesses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No businesses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <div
              key={business.id}
              onClick={() => navigate(`/businesses/${business.id}`)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
            >
              {/* Cover Photo */}
              {business.cover_photo || business.photos?.[0] ? (
                <img
                  src={(business.cover_photo || business.photos[0]).startsWith('http')
                    ? (business.cover_photo || business.photos[0])
                    : `http://localhost:3001${business.cover_photo || business.photos[0]}`}
                  alt={business.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-white opacity-50" />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {business.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        {business.type}
                      </span>
                      {business.status === 'pending' && (
                        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                          Pending Review
                        </span>
                      )}
                    </div>
                  </div>
                  {business.verified && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      ✓ Verified
                    </span>
                  )}
                </div>

                {business.description && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {business.description}
                  </p>
                )}

                {business.address && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{business.address}</span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm mb-3">
                  {business.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{business.rating.toFixed(1)}</span>
                      <span className="text-gray-400">({business.total_reviews})</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>{business.views_count}</span>
                  </div>
                </div>

                {/* Contact */}
                <div className="flex gap-2 pt-3 border-t">
                  {business.contact_phone && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Phone className="w-3 h-3" />
                      <span>{business.contact_phone}</span>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Globe className="w-3 h-3" />
                      <span>Website</span>
                    </div>
                  )}
                </div>

                {/* Facilities */}
                {business.facilities && business.facilities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {business.facilities.slice(0, 3).map((facility, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {facility}
                      </span>
                    ))}
                    {business.facilities.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{business.facilities.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
