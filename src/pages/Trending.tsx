import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Eye, ThumbsUp, Star, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

interface Location {
  id: number;
  name: string;
  description: string;
  category: string;
  country: string;
  city: string;
  photos: string[];
  average_rating: number;
  upvotes: number;
  downvotes: number;
  views_count: number;
  total_reviews: number;
  created_at: string;
}

type TrendingPeriod = 'today' | 'week' | 'month' | 'all';

export default function Trending() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<TrendingPeriod>('week');

  const { data: locationsData, isLoading } = useQuery({
    queryKey: ['trending-locations', period],
    queryFn: async () => {
      const response = await api.get('/locations', {
        params: { 
          status: 'verified',
          limit: 50
        }
      });
      return response.data;
    },
  });

  const locations = locationsData?.locations || [];

  // Calculate trending score for sorting
  const sortedLocations = [...locations].sort((a, b) => {
    const scoreA = (a.views_count * 0.3) + (a.upvotes * 2) + (a.average_rating * 10) - (a.downvotes * 1);
    const scoreB = (b.views_count * 0.3) + (b.upvotes * 2) + (b.average_rating * 10) - (b.downvotes * 1);
    return scoreB - scoreA;
  });

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
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Trending Destinations</h1>
        </div>
        <p className="text-gray-600">
          Discover the most popular travel destinations based on community engagement
        </p>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2 mb-6">
        {(['today', 'week', 'month', 'all'] as TrendingPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === p
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Trending List */}
      <div className="space-y-4">
        {sortedLocations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No trending locations found</p>
          </div>
        ) : (
          sortedLocations.map((location, index) => {
            const trendingScore = Math.round(
              (location.views_count * 0.3) + 
              (location.upvotes * 2) + 
              (location.average_rating * 10) - 
              (location.downvotes * 1)
            );

            return (
              <div
                key={location.id}
                onClick={() => navigate(`/locations/${location.id}`)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              >
                <div className="flex gap-4 p-4">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                        index === 0
                          ? 'bg-yellow-500 text-white'
                          : index === 1
                          ? 'bg-gray-400 text-white'
                          : index === 2
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Photo */}
                  {location.photos && location.photos.length > 0 ? (
                    <img
                      src={location.photos[0].startsWith('http') 
                        ? location.photos[0] 
                        : `http://localhost:3001${location.photos[0]}`}
                      alt={location.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {location.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{location.city}, {location.country}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        <TrendingUp className="w-4 h-4" />
                        {trendingScore}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {location.description}
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{location.average_rating.toFixed(1)}</span>
                        <span className="text-gray-400">({location.total_reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{location.upvotes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{location.views_count}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span>{new Date(location.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {location.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
