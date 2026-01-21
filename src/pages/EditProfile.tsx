import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [travelInterests, setTravelInterests] = useState<string[]>(user?.travel_interests || []);
  const [interestInput, setInterestInput] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(user?.profile_photo || '');
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(user?.cover_photo || '');
  
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    navigate('/login');
    return null;
  }

  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Use the raw axios client for FormData uploads
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/auth/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile updated successfully!');
      navigate('/profile');
    },
    onError: (error: any) => {
      console.error('Update profile error:', error);
      const message = error.message || 'Failed to update profile';
      toast.error(message);
    },
  });

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB');
        return;
      }
      setProfilePhoto(file);
      setProfilePhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB');
        return;
      }
      setCoverPhoto(file);
      setCoverPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddInterest = () => {
    const trimmed = interestInput.trim();
    if (trimmed && !travelInterests.includes(trimmed) && travelInterests.length < 10) {
      setTravelInterests([...travelInterests, trimmed]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setTravelInterests(travelInterests.filter(i => i !== interest));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    const formData = new FormData();
    formData.append('full_name', fullName.trim());
    formData.append('bio', bio.trim());
    formData.append('travel_interests', JSON.stringify(travelInterests));
    
    if (profilePhoto) {
      formData.append('profile_photo', profilePhoto);
    }
    
    if (coverPhoto) {
      formData.append('cover_photo', coverPhoto);
    }

    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/profile')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Profile
      </button>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Photo
              </label>
              <div className="relative">
                <div 
                  className="h-48 rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => coverPhotoInputRef.current?.click()}
                >
                  {coverPhotoPreview && (
                    <img
                      src={coverPhotoPreview.startsWith('http') 
                        ? coverPhotoPreview 
                        : `http://localhost:3001${coverPhotoPreview}`}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <input
                  ref={coverPhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoChange}
                  className="hidden"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Recommended: 1200x400px, max 5MB
              </p>
            </div>

            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <div className="flex items-center gap-4">
                <div 
                  className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => profilePhotoInputRef.current?.click()}
                >
                  {profilePhotoPreview ? (
                    <img
                      src={profilePhotoPreview.startsWith('http') 
                        ? profilePhotoPreview 
                        : `http://localhost:3001${profilePhotoPreview}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100">
                      <Camera className="w-12 h-12 text-blue-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => profilePhotoInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Change Photo
                  </button>
                  <p className="mt-1 text-sm text-gray-500">
                    Square image, max 5MB
                  </p>
                </div>
                <input
                  ref={profilePhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself and your travel experiences..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="mt-1 text-sm text-gray-500">
                {bio.length}/500 characters
              </p>
            </div>

            {/* Travel Interests */}
            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
                Travel Interests (max 10)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  id="interests"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                  placeholder="e.g., Beach, Mountains, Culture"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={30}
                  disabled={travelInterests.length >= 10}
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  disabled={!interestInput.trim() || travelInterests.length >= 10}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
              {travelInterests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {travelInterests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-5 h-5" />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
