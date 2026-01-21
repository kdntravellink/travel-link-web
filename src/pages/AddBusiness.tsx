import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Save, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import MapPicker from '../components/MapPicker';
import PhotoUploader from '../components/PhotoUploader';

const BUSINESS_TYPES = [
  'Hotel',
  'Restaurant',
  'Tour Operator',
  'Transport Service',
  'Travel Agency',
  'Attraction',
  'Rental Service',
  'Guide Service',
  'Shop',
  'Entertainment',
  'Other'
];

const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'Mobile Payment', 'Bank Transfer'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic', 'Portuguese'];

export default function AddBusiness() {
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    contact_phone: '',
    contact_email: '',
    website: '',
    address: '',
    latitude: '',
    longitude: '',
    pricing_info: '',
    opening_hours: '',
    payment_methods: [] as string[],
    languages: [] as string[],
    facilities: '',
  });

  const createBusinessMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/businesses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create business');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Business submitted successfully! It will be reviewed by our team.');
      navigate('/businesses');
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to create business';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.type || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const businessData = {
      ...formData,
      latitude: formData.latitude ? Number.parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? Number.parseFloat(formData.longitude) : null,
      facilities: formData.facilities ? formData.facilities.split(',').map(f => f.trim()) : [],
      photos: photos,
    };

    createBusinessMutation.mutate(businessData);
  };

  const handlePaymentMethodToggle = (method: string) => {
    setFormData(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(method)
        ? prev.payment_methods.filter(m => m !== method)
        : [...prev.payment_methods, method]
    }));
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/businesses')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Businesses
        </button>
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Add New Business</h1>
        </div>
        <p className="text-gray-600 mt-2">
          List your tourism-related business on TravelLink
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter business name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a type</option>
                {BUSINESS_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your business, services, and what makes it special..."
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contact@business.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.yourbusiness.com"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Location</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Street address, city, country"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 40.7128"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., -74.0060"
                />
              </div>
            </div>

            {/* Map Picker */}
            <div>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                {showMap ? 'Hide Map' : 'Select Location on Map'}
              </button>

              {showMap && (
                <div className="mt-4">
                  <MapPicker
                    initialLat={
                      formData.latitude ? Number.parseFloat(formData.latitude) : 6.9271
                    }
                    initialLng={
                      formData.longitude ? Number.parseFloat(formData.longitude) : 79.8612
                    }
                    onLocationSelect={(lat, lng) => {
                      setFormData({
                        ...formData,
                        latitude: lat.toString(),
                        longitude: lng.toString(),
                      });
                    }}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Click on the map to select the business location
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Business Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Photos
              </label>
              <PhotoUploader
                onPhotosChange={setPhotos}
                initialPhotos={photos}
                maxPhotos={10}
              />
              <p className="text-sm text-gray-500 mt-1">
                Add up to 10 photos of your business (exterior, interior, services, etc.)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Information
              </label>
              <input
                type="text"
                value={formData.pricing_info}
                onChange={(e) => setFormData({ ...formData, pricing_info: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., $50-200 per night, $$ - $$$"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Hours
              </label>
              <input
                type="text"
                value={formData.opening_hours}
                onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Mon-Fri 9AM-5PM, 24/7"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facilities (comma-separated)
              </label>
              <input
                type="text"
                value={formData.facilities}
                onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., WiFi, Parking, Restaurant, Pool"
              />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Accepted Payment Methods
          </label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method}
                type="button"
                onClick={() => handlePaymentMethodToggle(method)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  formData.payment_methods.includes(method)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Languages Spoken
          </label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(language => (
              <button
                key={language}
                type="button"
                onClick={() => handleLanguageToggle(language)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  formData.languages.includes(language)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                }`}
              >
                {language}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/businesses')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createBusinessMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          >
            {createBusinessMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Submit Business
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
