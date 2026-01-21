import { Filter, X, MapPin as MapPinIcon, Navigation, Target } from 'lucide-react';

interface FilterPanelProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  useNearbySearch: boolean;
  onNearbySearchToggle: (enabled: boolean) => void;
  nearbyRadius: number;
  onRadiusChange: (radius: number) => void;
  onGetMyLocation?: () => void;
  manualLat?: string;
  manualLng?: string;
  onManualLatChange?: (value: string) => void;
  onManualLngChange?: (value: string) => void;
  onManualLocationSubmit?: () => void;
  centerSelectionMode?: boolean;
  onCenterSelectionModeToggle?: (enabled: boolean) => void;
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'beach', label: 'Beach' },
  { value: 'waterfall', label: 'Waterfall' },
  { value: 'mountain', label: 'Mountain' },
  { value: 'historical_site', label: 'Historical Site' },
  { value: 'temple', label: 'Temple' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Café' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'hiking_trail', label: 'Hiking Trail' },
  { value: 'viewpoint', label: 'Viewpoint' },
  { value: 'park', label: 'Park' },
  { value: 'museum', label: 'Museum' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'wildlife', label: 'Wildlife' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'other', label: 'Other' },
];

const statuses = [
  { value: '', label: 'All Locations' },
  { value: 'verified', label: 'Verified Only' },
  { value: 'pending', label: 'Pending Verification' },
];

const sortOptions = [
  { value: '-created_at', label: 'Newest First' },
  { value: 'created_at', label: 'Oldest First' },
  { value: '-average_rating', label: 'Highest Rated' },
  { value: '-upvotes', label: 'Most Upvoted' },
  { value: '-views_count', label: 'Most Viewed' },
];

export default function FilterPanel({
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  useNearbySearch,
  onNearbySearchToggle,
  nearbyRadius,
  onRadiusChange,
  onGetMyLocation,
  manualLat,
  manualLng,
  onManualLatChange,
  onManualLngChange,
  onManualLocationSubmit,
  centerSelectionMode,
  onCenterSelectionModeToggle,
}: FilterPanelProps) {
  const hasActiveFilters = selectedCategory || selectedStatus || searchQuery || useNearbySearch;

  const clearFilters = () => {
    onCategoryChange('');
    onStatusChange('');
    onSearchChange('');
    onNearbySearchToggle(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      {/* Nearby Search Toggle */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="nearbySearch"
              checked={useNearbySearch}
              onChange={(e) => onNearbySearchToggle(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="nearbySearch" className="ml-2 text-sm font-medium text-gray-900">
              Search nearby locations
            </label>
          </div>
          {onGetMyLocation && (
            <button
              type="button"
              onClick={onGetMyLocation}
              className="flex items-center text-xs text-blue-600 hover:text-blue-700"
            >
              <MapPinIcon className="w-3 h-3 mr-1" />
              Use my location
            </button>
          )}
        </div>

        {useNearbySearch && (
          <div className="space-y-3">
            {/* Radius Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Radius: {nearbyRadius} km
              </label>
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={nearbyRadius}
                onChange={(e) => onRadiusChange(Number(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>5 km</span>
                <span>200 km</span>
              </div>
            </div>

            {/* Manual Coordinate Input */}
            {onManualLatChange && onManualLngChange && onManualLocationSubmit && (
              <div className="bg-white p-3 rounded border border-gray-300">
                <p className="text-xs font-medium text-gray-700 mb-2">Set Center Location:</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Latitude"
                    value={manualLat}
                    onChange={(e) => onManualLatChange(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Longitude"
                    value={manualLng}
                    onChange={(e) => onManualLngChange(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={onManualLocationSubmit}
                  className="w-full px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Set Location
                </button>
              </div>
            )}

            {/* Click on Map Mode */}
            {onCenterSelectionModeToggle && (
              <div className="bg-white p-3 rounded border border-gray-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={centerSelectionMode}
                    onChange={(e) => onCenterSelectionModeToggle(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Click on map to set center
                  </span>
                </label>
                {centerSelectionMode && (
                  <p className="text-xs text-gray-600 mt-2">
                    ℹ️ Click anywhere on the map to set the search center location
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search locations..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
