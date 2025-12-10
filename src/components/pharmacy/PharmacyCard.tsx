/**
 * Pharmacy Card Component
 * Display pharmacy information in list/grid view
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Clock, Navigation, ChevronRight } from 'lucide-react';
import { Card, CardContent, Badge, Button, StarRating } from '@/components/ui';

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  latitude: number;
  longitude: number;
  averageRating?: number;
  totalRatings?: number;
  distance?: number;
}

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  isOnDuty?: boolean;
  variant?: 'default' | 'compact';
}

export function PharmacyCard({
  pharmacy,
  isOnDuty = false,
  variant = 'default',
}: PharmacyCardProps) {
  const {
    id,
    name,
    address,
    city,
    phone,
    latitude,
    longitude,
    averageRating = 0,
    totalRatings = 0,
    distance,
  } = pharmacy;

  const handleGetDirections = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `tel:${phone}`;
  };

  if (variant === 'compact') {
    return (
      <Link href={`/pharmacies/${id}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 truncate">{name}</h3>
                  {isOnDuty && <Badge variant="success">De garde</Badge>}
                </div>
                <p className="text-sm text-gray-500 truncate">{address}, {city}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                {distance && (
                  <span className="text-sm text-gray-500">{distance.toFixed(1)} km</span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/pharmacies/${id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">{name}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{city}</span>
              </div>
            </div>
            {isOnDuty && (
              <Badge variant="success" className="flex-shrink-0">
                <Clock className="w-3 h-3 mr-1" />
                De garde
              </Badge>
            )}
          </div>

          {/* Address */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{address}</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <StarRating value={averageRating} readonly size="sm" />
            <span className="text-sm text-gray-500">
              ({totalRatings} avis)
            </span>
          </div>

          {/* Distance */}
          {distance && (
            <div className="flex items-center gap-1 text-sm text-green-600 mb-4">
              <Navigation className="w-4 h-4" />
              <span>{distance.toFixed(1)} km</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCall}
              className="flex-1"
            >
              <Phone className="w-4 h-4 mr-1" />
              Appeler
            </Button>
            <Button
              size="sm"
              onClick={handleGetDirections}
              className="flex-1"
            >
              <Navigation className="w-4 h-4 mr-1" />
              Y aller
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
