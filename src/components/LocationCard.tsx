import { MapPin, Star, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LocationCardProps {
  location: {
    id: number;
    name: string;
    description?: string;
    category: string;
    country?: string;
    city?: string;
    photos?: string[];
    average_rating: number;
    total_reviews: number;
    upvotes: number;
    downvotes: number;
    views_count: number;
    status: string;
  };
}

const categoryColors: Record<string, string> = {
  beach: 'bg-blue-100 text-blue-800',
  waterfall: 'bg-cyan-100 text-cyan-800',
  mountain: 'bg-gray-100 text-gray-800',
  historical_site: 'bg-amber-100 text-amber-800',
  temple: 'bg-purple-100 text-purple-800',
  restaurant: 'bg-orange-100 text-orange-800',
  cafe: 'bg-brown-100 text-brown-800',
  hotel: 'bg-indigo-100 text-indigo-800',
  hiking_trail: 'bg-green-100 text-green-800',
  viewpoint: 'bg-pink-100 text-pink-800',
  park: 'bg-lime-100 text-lime-800',
  museum: 'bg-violet-100 text-violet-800',
  shopping: 'bg-fuchsia-100 text-fuchsia-800',
  entertainment: 'bg-rose-100 text-rose-800',
  adventure: 'bg-red-100 text-red-800',
  wildlife: 'bg-emerald-100 text-emerald-800',
  cultural: 'bg-yellow-100 text-yellow-800',
  other: 'bg-slate-100 text-slate-800',
};

export default function LocationCard({ location }: LocationCardProps) {
  const defaultPhoto = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
  
  // Helper function to get correct image URL
  const getImageUrl = (photoPath: string | undefined) => {
    if (!photoPath) return defaultPhoto;
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    if (photoPath.startsWith('/uploads')) {
      return `http://localhost:3001${photoPath}`;
    }
    return `http://localhost:3001/uploads/${photoPath}`;
  };
  
  // Get the first photo
  let photoUrl = defaultPhoto;
  if (location.photos && Array.isArray(location.photos) && location.photos.length > 0) {
    photoUrl = getImageUrl(location.photos[0]);
  }
  
  const categoryClass = categoryColors[location.category] || categoryColors.other;

  return (
    <Link to={`/locations/${location.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={photoUrl}
            alt={location.name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultPhoto;
            }}
          />
          
          {/* Category Badge */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${categoryClass}`}>
              {location.category.replace('_', ' ')}
            </span>
          </div>

          {/* Status Badge */}
          {location.status === 'verified' && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                ✓ Verified
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
            {location.name}
          </h3>
          
          {/* Location */}
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="line-clamp-1">
              {[location.city, location.country].filter(Boolean).join(', ') || 'Location not specified'}
            </span>
          </div>

          {/* Description */}
          {location.description && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {location.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-3">
              {/* Rating */}
              <div className="flex items-center text-yellow-500">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span className="text-gray-900 font-medium">
                  {location.average_rating > 0 ? location.average_rating.toFixed(1) : 'N/A'}
                </span>
                <span className="text-gray-500 ml-1">
                  ({location.total_reviews})
                </span>
              </div>

              {/* Votes */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-green-600">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  <span className="font-medium">{location.upvotes}</span>
                </div>
                <div className="flex items-center text-red-600">
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  <span className="font-medium">{location.downvotes}</span>
                </div>
              </div>
            </div>

            {/* Views */}
            <div className="flex items-center text-gray-500">
              <Eye className="w-4 h-4 mr-1" />
              <span>{location.views_count}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
