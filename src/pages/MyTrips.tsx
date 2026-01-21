import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, MapPin, Trash2, Edit2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Trip {
  _id: string;
  user_id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  destinations: {
    location_id?: number;
    name: string;
    city: string;
    country: string;
    arrival_date: string;
    departure_date: string;
    activities: string[];
    notes: string;
  }[];
  budget?: number;
  currency?: string;
  travelers_count?: number;
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function MyTrips() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNewTripModal, setShowNewTripModal] = useState(false);

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const response = await api.get('/trips');
      return response.data as Trip[];
    },
  });

  const deleteTripMutation = useMutation({
    mutationFn: async (tripId: string) => {
      await api.delete(`/api/trips/${tripId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-trips'] });
      toast.success('Trip deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete trip');
    },
  });

  const handleDeleteTrip = (tripId: string, tripTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${tripTitle}"?`)) {
      deleteTripMutation.mutate(tripId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Trips</h1>
          <p className="text-gray-600">
            Plan your adventures and organize your travel itineraries
          </p>
        </div>
        <button
          onClick={() => navigate('/trips/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Trip
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Total Trips</p>
          <p className="text-2xl font-bold">{trips.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Planning</p>
          <p className="text-2xl font-bold text-yellow-600">
            {trips.filter(t => t.status === 'planning').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">
            {trips.filter(t => t.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-2xl font-bold text-blue-600">
            {trips.filter(t => t.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Trips Grid */}
      {trips.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
          <p className="text-gray-600 mb-6">
            Start planning your next adventure!
          </p>
          <button
            onClick={() => navigate('/trips/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Your First Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {trip.title}
                    </h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                      {getStatusLabel(trip.status)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {trip.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {trip.description}
                  </p>
                )}

                {/* Dates */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(trip.start_date).toLocaleDateString()} -{' '}
                    {new Date(trip.end_date).toLocaleDateString()}
                  </span>
                </div>

                {/* Destinations */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">
                      {trip.destinations.length} destination{trip.destinations.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {trip.destinations.length > 0 && (
                    <div className="space-y-1">
                      {trip.destinations.slice(0, 3).map((dest, index) => (
                        <p key={index} className="text-sm text-gray-600 truncate">
                          • {dest.name}, {dest.country}
                        </p>
                      ))}
                      {trip.destinations.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{trip.destinations.length - 3} more
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Budget */}
                {trip.budget && (
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Budget:</span>{' '}
                    {trip.currency || '$'}{trip.budget.toLocaleString()}
                  </p>
                )}

                {/* Travelers */}
                {trip.travelers_count && (
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Travelers:</span> {trip.travelers_count}
                  </p>
                )}
              </div>

              {/* Card Actions */}
              <div className="border-t p-4 flex gap-2">
                <button
                  onClick={() => navigate(`/trips/${trip._id}`)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => navigate(`/trips/${trip._id}/edit`)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTrip(trip._id, trip.title)}
                  className="px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
