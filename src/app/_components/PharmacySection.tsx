/**
 * Pharmacy Section Component
 * Interactive map and pharmacy list with filters
 */
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Map, List, Grid } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { PharmacyCard, SearchFilters, type FilterValues } from '@/components/pharmacy';

// Dynamic import for map to avoid SSR issues
const PharmacyMap = dynamic(
  () => import('@/components/pharmacy/PharmacyMap').then((mod) => mod.PharmacyMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-gray-500">Chargement de la carte...</span>
      </div>
    ),
  }
);

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  latitude: number;
  longitude: number;
  isOnDuty: boolean;
  averageRating: number;
  ratingCount: number;
  distance?: number;
}

export function PharmacySection() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'grid'>('map');
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationFetched, setLocationFetched] = useState(false);

  // Get user location once
  useEffect(() => {
    if (locationFetched) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationFetched(true);
        },
        () => {
          // Location denied, continue without distance
          setLocationFetched(true);
        }
      );
    } else {
      setLocationFetched(true);
    }
  }, [locationFetched]);

  // Fetch pharmacies after location is fetched
  useEffect(() => {
    if (!locationFetched) return;

    const fetchPharmacies = async () => {
      try {
        const params = new URLSearchParams({
          onlyOnDuty: 'true',
          ...(userLocation && {
            lat: userLocation.lat.toString(),
            lng: userLocation.lng.toString(),
          }),
        });

        const response = await fetch(`/api/pharmacies?${params}`);
        const data = await response.json();

        setPharmacies(data.pharmacies || []);
        setFilteredPharmacies(data.pharmacies || []);

        // Extract unique cities
        const uniqueCities = [...new Set(data.pharmacies?.map((p: Pharmacy) => p.city) || [])];
        setCities(uniqueCities as string[]);
      } catch (error) {
        console.error('Error fetching pharmacies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPharmacies();
  }, [locationFetched, userLocation]);

  // Handle filters
  const handleFilter = async (filters: FilterValues) => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        ...(filters.search && { search: filters.search }),
        ...(filters.city && { city: filters.city }),
        ...(filters.date && { date: filters.date }),
        onlyOnDuty: filters.onlyOnDuty.toString(),
        sortBy: filters.sortBy,
        ...(userLocation && {
          lat: userLocation.lat.toString(),
          lng: userLocation.lng.toString(),
        }),
      });

      const response = await fetch(`/api/pharmacies?${params}`);
      const data = await response.json();

      setFilteredPharmacies(data.pharmacies || []);
    } catch (error) {
      console.error('Error filtering pharmacies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFilteredPharmacies(pharmacies);
  };

  return (
    <section id="pharmacies" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Pharmacies de Garde
          </h2>
          <p className="text-gray-600">
            {filteredPharmacies.length} pharmacie(s) actuellement de garde
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <SearchFilters
            cities={cities}
            onFilter={handleFilter}
            onReset={handleReset}
          />
        </div>

        {/* View Toggle */}
        <div className="flex justify-end gap-2 mb-4">
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
          >
            <Map className="w-4 h-4 mr-1" />
            Carte
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4 mr-1" />
            Liste
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4 mr-1" />
            Grille
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="h-[500px] bg-white rounded-xl animate-pulse flex items-center justify-center">
            <span className="text-gray-500">Chargement...</span>
          </div>
        ) : (
          <>
            {viewMode === 'map' && (
              <PharmacyMap
                pharmacies={filteredPharmacies}
                selectedPharmacy={selectedPharmacy}
                onSelectPharmacy={setSelectedPharmacy}
                center={userLocation ? [userLocation.lat, userLocation.lng] : undefined}
              />
            )}

            {viewMode === 'list' && (
              <div className="space-y-3">
                {filteredPharmacies.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      Aucune pharmacie trouvée
                    </CardContent>
                  </Card>
                ) : (
                  filteredPharmacies.map((pharmacy) => (
                    <PharmacyCard
                      key={pharmacy.id}
                      pharmacy={pharmacy}
                      isOnDuty={pharmacy.isOnDuty}
                      variant="compact"
                    />
                  ))
                )}
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPharmacies.length === 0 ? (
                  <div className="col-span-full">
                    <Card>
                      <CardContent className="py-12 text-center text-gray-500">
                        Aucune pharmacie trouvée
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  filteredPharmacies.map((pharmacy) => (
                    <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} isOnDuty={pharmacy.isOnDuty} />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
