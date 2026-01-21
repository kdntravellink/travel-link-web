import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
import { Map as MapIcon, Grid, Loader2, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import LocationCard from '../components/LocationCard';
import FilterPanel from '../components/FilterPanel';
import { apiClient } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

// Component to update map view when location changes
function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// Component to handle map clicks for setting center location
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Fix Leaflet default marker icons
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

export default function Explore() {
  const { user } = useAuth();
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('-created_at');
  const [useNearbySearch, setUseNearbySearch] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(50);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [centerSelectionMode, setCenterSelectionMode] = useState(false);

  const { data: locationsData, isLoading, error } = useQuery({
    queryKey: ['locations', selectedCategory, selectedStatus, sortBy, useNearbySearch, userLocation, nearbyRadius],
    queryFn: () => {
      if (useNearbySearch && userLocation) {
        return apiClient.getNearbyLocations(userLocation.latitude, userLocation.longitude, nearbyRadius);
      }
      return apiClient.getLocations({
        category: selectedCategory || undefined,
        status: selectedStatus || undefined,
        sortBy,
        limit: 100,
      });
    },
  });

  const locations = locationsData?.locations || [];

  const handleGetMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          console.log('User location obtained:', coords);
          setUserLocation(coords);
          setManualLat(coords.latitude.toFixed(6));
          setManualLng(coords.longitude.toFixed(6));
          setUseNearbySearch(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          if (error.code === 1) {
            alert('Location permission denied. Please enable location access in your browser settings.');
          } else if (error.code === 2) {
            alert('Location information unavailable.');
          } else if (error.code === 3) {
            alert('Location request timed out.');
          } else {
            alert('Unable to get your location. Please enable location services.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (centerSelectionMode) {
      setUserLocation({ latitude: lat, longitude: lng });
      setManualLat(lat.toFixed(6));
      setManualLng(lng.toFixed(6));
      setCenterSelectionMode(false);
    }
  };

  const handleManualLocationSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid latitude and longitude values');
      return;
    }
    
    if (lat < -90 || lat > 90) {
      alert('Latitude must be between -90 and 90');
      return;
    }
    
    if (lng < -180 || lng > 180) {
      alert('Longitude must be between -180 and 180');
      return;
    }
    
    setUserLocation({ latitude: lat, longitude: lng });
    setUseNearbySearch(true);
  };

  // Filter by search query locally
  const filteredLocations = locations.filter((location: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      location.name.toLowerCase().includes(query) ||
      location.description?.toLowerCase().includes(query) ||
      location.country?.toLowerCase().includes(query) ||
      location.city?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Explore Locations</h1>
            <p className="text-gray-600 mt-1">
              Discover amazing travel destinations around the world
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setView('grid')}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                view === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-4 h-4 mr-2" />
              Grid
            </button>
            <button
              onClick={() => setView('map')}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                view === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MapIcon className="w-4 h-4 mr-2" />
              Map
            </button>
          </div>
        </div>

        {/* Call-to-Action Banner for Non-Logged-In Users */}
        {!user && (
          <div className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <UserPlus className="w-6 h-6" />
                  Join TravelLink to Unlock More Features!
                </h2>
                <p className="text-blue-50 mb-3">
                  Create an account to add your own locations, save favorites to your wishlist, 
                  plan trips, join forum discussions, and connect with fellow travelers.
                </p>
                <div className="flex gap-3">
                  <Link
                    to="/register"
                    className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Sign Up Free
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-2 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors border border-blue-400"
                  >
                    Login
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block ml-6">
                <MapIcon className="w-24 h-24 text-blue-200 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <FilterPanel
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          useNearbySearch={useNearbySearch}
          onNearbySearchToggle={setUseNearbySearch}
          nearbyRadius={nearbyRadius}
          onRadiusChange={setNearbyRadius}
          onGetMyLocation={handleGetMyLocation}
          manualLat={manualLat}
          manualLng={manualLng}
          onManualLatChange={setManualLat}
          onManualLngChange={setManualLng}
          onManualLocationSubmit={handleManualLocationSubmit}
          centerSelectionMode={centerSelectionMode}
          onCenterSelectionModeToggle={setCenterSelectionMode}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading locations...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Failed to load locations. Please try again later.
          </div>
        )}

        {/* Results Count */}
        {!isLoading && !error && (
          <div className="mb-4 text-sm text-gray-600">
            Found {filteredLocations.length} location{filteredLocations.length === 1 ? '' : 's'}
            {useNearbySearch && userLocation && (
              <span className="ml-2 text-blue-600">
                within {nearbyRadius} km of your location
              </span>
            )}
          </div>
        )}

        {/* Grid View */}
        {view === 'grid' && !isLoading && !error && (
          <>
            {filteredLocations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No locations found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLocations.map((location: any) => (
                  <LocationCard key={location.id} location={location} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Map View */}
        {view === 'map' && !isLoading && !error && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
            <MapContainer
              center={userLocation ? [userLocation.latitude, userLocation.longitude] : [7.8731, 80.7718]}
              zoom={useNearbySearch ? 10 : 7}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              {/* Update map view when location changes */}
              {userLocation && (
                <ChangeMapView 
                  center={[userLocation.latitude, userLocation.longitude]} 
                  zoom={useNearbySearch ? 10 : 7} 
                />
              )}
              
              {/* Map click handler for center selection */}
              {centerSelectionMode && <MapClickHandler onLocationSelect={handleMapClick} />}
              
              {/* Tile Layer */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
                maxZoom={20}
              />
              
              {/* Search radius circle */}
              {userLocation && useNearbySearch && (
                <Circle
                  center={[userLocation.latitude, userLocation.longitude]}
                  radius={nearbyRadius * 1000} // Convert km to meters
                  pathOptions={{
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1,
                    weight: 2,
                  }}
                />
              )}
              
              {/* User location marker - distinctive red marker */}
              {userLocation && useNearbySearch && (
                <Marker
                  position={[userLocation.latitude, userLocation.longitude]}
                  icon={new L.Icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: shadowUrl,
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-sm text-red-600">📍 Your Location</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Search center point
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Location markers */}
              {filteredLocations.map((location: any) => (
                location.latitude && location.longitude && (
                  <Marker
                    key={location.id}
                    position={[location.latitude, location.longitude]}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-sm">{location.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {location.category.replace('_', ' ')}
                        </p>
                        {location.description && (
                          <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                            {location.description}
                          </p>
                        )}
                        {location.distance && (
                          <p className="text-xs text-blue-600 mt-1 font-medium">
                            {location.distance} km away
                          </p>
                        )}
                        <a
                          href={`/locations/${location.id}`}
                          className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                        >
                          View Details →
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
}
