import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '../lib/api';
import { toast } from 'sonner';

interface PhotoUploaderProps {
  onPhotosChange: (photos: string[]) => void;
  initialPhotos?: string[];
  maxPhotos?: number;
}

export default function PhotoUploader({
  onPhotosChange,
  initialPhotos = [],
  maxPhotos = 5,
}: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to get correct image URL
  const getImageUrl = (photoPath: string) => {
    if (!photoPath) return 'https://via.placeholder.com/300x200?text=Image+Not+Found';
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    if (photoPath.startsWith('/uploads')) {
      return `http://localhost:3001${photoPath}`;
    }
    return `http://localhost:3001/uploads/${photoPath}`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setUploading(true);
    const newPhotos: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        try {
          const result = await apiClient.uploadFile(file);
          newPhotos.push(result.filePath);
        } catch (error: any) {
          toast.error(`Failed to upload ${file.name}`);
          console.error(error);
        }
      }

      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      onPhotosChange(updatedPhotos);
      
      if (newPhotos.length > 0) {
        toast.success(`${newPhotos.length} photo(s) uploaded successfully`);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Photos ({photos.length}/{maxPhotos})
        </label>
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={handleBrowseClick}
            disabled={uploading}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            <Upload className="w-4 h-4 mr-1" />
            Upload Photos
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Area */}
      {photos.length === 0 && (
        <div
          onClick={handleBrowseClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            JPEG, PNG, WebP up to 5MB (Max {maxPhotos} photos)
          </p>
        </div>
      )}

      {/* Uploading State */}
      {uploading && (
        <div className="flex items-center justify-center py-8 bg-blue-50 rounded-lg">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-sm text-blue-600">Uploading photos...</span>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={getImageUrl(photo)}
                alt={`Photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/300x200?text=Image+Not+Found';
                }}
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add More Button */}
          {photos.length < maxPhotos && (
            <button
              type="button"
              onClick={handleBrowseClick}
              disabled={uploading}
              className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
            >
              <Upload className="w-6 h-6 mb-2" />
              <span className="text-sm">Add More</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
