'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Search, Filter, MapPin, List } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { PharmacyCard } from '@/components/pharmacy';
import { Button, Input } from '@/components/ui';

// Dynamic import for map to avoid SSR issues with Leaflet
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

interface PharmacyWithDetails {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  latitude: number;
  longitude: number;
  isOpen24h: boolean;
  isApproved: boolean;
  isOnDuty?: boolean;
  averageRating?: number;
  totalRatings?: number;
}

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<PharmacyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    onDutyOnly: false,
    open24h: false,
  });

  const fetchPharmacies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.onDutyOnly) params.append('onDuty', 'true');
      if (filters.open24h) params.append('open24h', 'true');

      const response = await fetch(`/api/pharmacies?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPharmacies(data);
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPharmacies();
  }, [fetchPharmacies]);

  const filteredPharmacies = pharmacies.filter((pharmacy) =>
    pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pharmacy.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Toutes les pharmacies
            </h1>
            <p className="text-gray-600">
              Trouvez une pharmacie près de chez vous
            </p>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher une pharmacie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4 mr-1" />
                  Liste
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Carte
                </Button>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filtres
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <Input
                    type="text"
                    placeholder="Filtrer par ville..."
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.onDutyOnly}
                      onChange={(e) => setFilters({ ...filters, onDutyOnly: e.target.checked })}
                      className="rounded border-gray-300 text-green-600"
                    />
                    <span className="text-sm">De garde uniquement</span>
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.open24h}
                      onChange={(e) => setFilters({ ...filters, open24h: e.target.checked })}
                      className="rounded border-gray-300 text-green-600"
                    />
                    <span className="text-sm">Ouvert 24h/24</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600">
            {filteredPharmacies.length} pharmacie(s) trouvée(s)
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : viewMode === 'list' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPharmacies.map((pharmacy) => (
                <PharmacyCard
                  key={pharmacy.id}
                  pharmacy={pharmacy}
                  isOnDuty={pharmacy.isOnDuty}
                />
              ))}
              {filteredPharmacies.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  Aucune pharmacie trouvée pour votre recherche.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <PharmacyMap
                pharmacies={filteredPharmacies}
                height="600px"
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
