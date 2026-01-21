import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MapPin, Trash2, Eye, Star, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface WishlistItem {
  id: number;
  user_id: number;
  item_type: 'location' | 'business';
  item_id: number;
  notes: string;
  created_at: string;
  item?: {
    id: number;
    name: string;
    description?: string;
    category?: string;
    type?: string;
    country?: string;
    city?: string;
    photos?: string[];
    average_rating?: number;
    rating?: number;
  };
}

export default function Wishlist() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'location' | 'business'>('all');

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const response = await api.get('/wishlist');
      return response.data as WishlistItem[];
    },
  });

  const wishlistItems = wishlistData || [];

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/wishlist/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to remove item');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    },
    onError: () => {
      toast.error('Failed to remove item');
    },
  });

  const handleRemove = (itemId: number, itemName: string) => {
    if (window.confirm(`Remove "${itemName}" from wishlist?`)) {
      removeFromWishlistMutation.mutate(itemId);
    }
  };

  const filteredItems = wishlistItems.filter(item => {
    if (filter === 'all') return true;
    return item.item_type === filter;
  });

  const handleItemClick = (item: WishlistItem) => {
    if (item.item_type === 'location') {
      navigate(`/locations/${item.item_id}`);
    } else {
      navigate(`/businesses/${item.item_id}`);
    }
  };

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
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold">My Wishlist</h1>
        </div>
        <p className="text-gray-600">
          Places and businesses you want to visit
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Total Items</p>
          <p className="text-2xl font-bold">{wishlistItems.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Locations</p>
          <p className="text-2xl font-bold text-blue-600">
            {wishlistItems.filter(i => i.item_type === 'location').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Businesses</p>
          <p className="text-2xl font-bold text-purple-600">
            {wishlistItems.filter(i => i.item_type === 'business').length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'location', 'business'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f === 'location' ? 'Locations' : 'Businesses'}
          </button>
        ))}
      </div>

      {/* Wishlist Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">
            {filter === 'all' ? 'Your wishlist is empty' : `No ${filter}s in wishlist`}
          </h3>
          <p className="text-gray-600 mb-6">
            Start adding places you want to visit!
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <MapPin className="w-5 h-5" />
            Explore Locations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Photo */}
              <div
                onClick={() => handleItemClick(item)}
                className="cursor-pointer relative"
              >
                {item.item?.photos && item.item.photos.length > 0 ? (
                  <img
                    src={item.item.photos[0].startsWith('http')
                      ? item.item.photos[0]
                      : `http://localhost:3001${item.item.photos[0]}`}
                    alt={item.item?.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    {item.item_type === 'location' ? (
                      <MapPin className="w-16 h-16 text-gray-400" />
                    ) : (
                      <Building2 className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                )}
                
                {/* Type Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.item_type === 'location'
                      ? 'bg-blue-500 text-white'
                      : 'bg-purple-500 text-white'
                  }`}>
                    {item.item_type === 'location' ? 'Location' : 'Business'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3
                  onClick={() => handleItemClick(item)}
                  className="text-lg font-bold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                >
                  {item.item?.name}
                </h3>

                {item.item?.city && item.item?.country && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{item.item.city}, {item.item.country}</span>
                  </div>
                )}

                {item.item?.category && (
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium mb-2">
                    {item.item.category}
                  </span>
                )}

                {item.item?.type && (
                  <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium mb-2">
                    {item.item.type}
                  </span>
                )}

                {item.item?.description && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {item.item.description}
                  </p>
                )}

                {(item.item?.average_rating || item.item?.rating) && (
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">
                      {(item.item.average_rating || item.item.rating || 0).toFixed(1)}
                    </span>
                  </div>
                )}

                {item.notes && (
                  <div className="p-3 bg-gray-50 rounded mb-3">
                    <p className="text-sm text-gray-700 italic">"{item.notes}"</p>
                  </div>
                )}

                <p className="text-xs text-gray-500 mb-3">
                  Added {new Date(item.created_at).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleItemClick(item)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleRemove(item.id, item.item?.name || 'this item')}
                    className="px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
