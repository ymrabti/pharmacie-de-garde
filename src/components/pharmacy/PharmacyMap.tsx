/**
 * Pharmacy Map Component
 * Interactive map using Leaflet/OpenStreetMap
 */
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Phone, Star } from 'lucide-react';
import { Button, Badge } from '@/components/ui';

// Fix for default marker icon
const defaultIcon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// On-duty pharmacy marker (green)
const onDutyIcon = L.icon({
  iconUrl: '/marker-green.png',
  iconRetinaUrl: '/marker-green-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  latitude: number;
  longitude: number;
  isOnDuty?: boolean;
  averageRating?: number;
  distance?: number;
}

interface PharmacyMapProps {
  pharmacies: Pharmacy[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedPharmacy?: string | null;
  onSelectPharmacy?: (id: string) => void;
}

// Component to recenter the map
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function PharmacyMap({
  pharmacies,
  center = [48.8566, 2.3522], // Paris default
  zoom = 12,
  height = '500px',
  onSelectPharmacy,
}: PharmacyMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [isClient, setIsClient] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    // Set client state after mount to avoid hydration issues
    Promise.resolve().then(() => {
      if (isMounted.current) {
        setIsClient(true);
      }
    });
    // Try to get user location
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isMounted.current) {
            setMapCenter([position.coords.latitude, position.coords.longitude]);
          }
        },
        () => {
          // Use default center if geolocation fails
        }
      );
    }
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleGetDirections = (pharmacy: Pharmacy) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
    window.open(url, '_blank');
  };

  if (!isClient) {
    return (
      <div className="w-full bg-gray-100 rounded-xl flex items-center justify-center" style={{ height }}>
        <div className="text-gray-500">Chargement de la carte...</div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter center={mapCenter} />
        
        {pharmacies.map((pharmacy) => (
          <Marker
            key={pharmacy.id}
            position={[pharmacy.latitude, pharmacy.longitude]}
            icon={pharmacy.isOnDuty ? onDutyIcon : defaultIcon}
            eventHandlers={{
              click: () => onSelectPharmacy?.(pharmacy.id),
            }}
          >
            <Popup>
              <div className="min-w-[250px] p-2">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{pharmacy.name}</h3>
                  {pharmacy.isOnDuty && (
                    <Badge variant="success">De garde</Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{pharmacy.address}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{pharmacy.phone}</span>
                  </div>
                  {(pharmacy.averageRating ?? 0) > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{pharmacy.averageRating?.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {pharmacy.distance && (
                  <p className="text-sm text-gray-500 mb-3">
                    À {pharmacy.distance.toFixed(1)} km
                  </p>
                )}

                <Button
                  size="sm"
                  onClick={() => handleGetDirections(pharmacy)}
                  className="w-full"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Itinéraire
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
