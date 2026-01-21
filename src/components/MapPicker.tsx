import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Navigation } from 'lucide-react';
import L from 'leaflet';

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

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

function LocationMarker({ onLocationSelect, initialPosition }: { onLocationSelect: (lat: number, lng: number) => void; initialPosition: [number, number] }) {
  const [position, setPosition] = useState<[number, number]>(initialPosition);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ onLocationSelect, initialLat = 7.8731, initialLng = 80.7718 }: MapPickerProps) {
  const [selectedCoords, setSelectedCoords] = useState<[number, number]>([initialLat, initialLng]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedCoords([lat, lng]);
    onLocationSelect(lat, lng);
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-blue-50 p-3 border-b">
          <div className="flex items-center text-sm text-gray-700">
            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
            <span>
              Click on the map to select location coordinates
              {selectedCoords && (
                <span className="ml-2 font-medium text-blue-600">
                  ({selectedCoords[0].toFixed(6)}, {selectedCoords[1].toFixed(6)})
                </span>
              )}
            </span>
          </div>
        </div>
        
        <div style={{ height: '400px', width: '100%' }}>
          <MapContainer
            center={selectedCoords}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={20}
            />
            <LocationMarker
              onLocationSelect={handleLocationSelect}
              initialPosition={selectedCoords}
            />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
