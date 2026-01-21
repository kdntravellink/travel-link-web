import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, MapPin, Star, TrendingUp, Mail, Calendar, CheckCircle, Award, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import LocationCard from '../components/LocationCard';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'locations' | 'stats'>('stats');

  const { data: userLocations } = useQuery({
    queryKey: ['user-locations', user?.id],
    queryFn: () => apiClient.getLocations({ created_by: user?.id }),
    enabled: !!user?.id,
  });

  if (!user) return null;

  const locations = userLocations?.locations || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-600 relative">
            {user.cover_photo && (
              <img
                src={user.cover_photo.startsWith('http') 
                  ? user.cover_photo 
                  : `http://localhost:3001${user.cover_photo}`}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            <button
              onClick={() => navigate('/profile/edit')}
              className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 shadow-md transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6 pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-start gap-6">
              {/* Avatar */}
              <div className="relative -mt-20">
                <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg">
                  {user.profile_photo ? (
                    <img
                      src={user.profile_photo.startsWith('http') 
                        ? user.profile_photo 
                        : `http://localhost:3001${user.profile_photo}`}
                      alt={user.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-16 h-16 text-blue-600" />
                    </div>
                  )}
                </div>
                {user.verified && (
                  <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>

              {/* User Details */}
              <div className="flex-1">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
                  {user.verified && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      Verified
                    </span>
                  )}
                </div>
                
                <div className="flex items-center text-gray-600 mt-2">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{user.email}</span>
                </div>

                {user.bio && (
                  <p className="text-gray-700 mt-3 max-w-2xl">{user.bio}</p>
                )}

                <div className="flex items-center text-sm text-gray-500 mt-3">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    Joined {format(new Date(user.created_at), 'MMMM yyyy')}
                  </span>
                </div>

                {/* Travel Interests */}
                {user.travel_interests && user.travel_interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {user.travel_interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Locations</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {user.locations_added}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contribution Points</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {user.contribution_points}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trust Score</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {user.trust_score}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {Math.floor(user.contribution_points / 100) + 1}
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'stats'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('locations')}
                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === 'locations'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                My Locations ({user.locations_added})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Full Name:</span>
                      <span className="ml-2 font-medium text-gray-900">{user.full_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium text-gray-900">{user.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Verification Status:</span>
                      <span className={`ml-2 font-medium ${user.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                        {user.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Member Since:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Achievements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.locations_added >= 1 && (
                      <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                        <Award className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                          <div className="font-semibold text-gray-900">First Contribution</div>
                          <div className="text-xs text-gray-600">Added your first location</div>
                        </div>
                      </div>
                    )}
                    
                    {user.locations_added >= 5 && (
                      <div className="flex items-center p-4 bg-green-50 rounded-lg">
                        <Award className="w-8 h-8 text-green-600 mr-3" />
                        <div>
                          <div className="font-semibold text-gray-900">Explorer</div>
                          <div className="text-xs text-gray-600">Added 5+ locations</div>
                        </div>
                      </div>
                    )}
                    
                    {user.locations_added >= 10 && (
                      <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                        <Award className="w-8 h-8 text-purple-600 mr-3" />
                        <div>
                          <div className="font-semibold text-gray-900">Veteran Explorer</div>
                          <div className="text-xs text-gray-600">Added 10+ locations</div>
                        </div>
                      </div>
                    )}

                    {user.verified && (
                      <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
                        <CheckCircle className="w-8 h-8 text-yellow-600 mr-3" />
                        <div>
                          <div className="font-semibold text-gray-900">Verified Member</div>
                          <div className="text-xs text-gray-600">Account verified</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'locations' && (
              <div>
                {locations.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No locations yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start sharing amazing travel destinations with the community!
                    </p>
                    <a
                      href="/add-location"
                      className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Your First Location
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {locations.map((location: any) => (
                      <LocationCard key={location.id} location={location} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
