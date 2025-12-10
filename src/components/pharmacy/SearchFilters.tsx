/**
 * Search Filters Component
 * Filter pharmacies by city, date, and distance
 */
'use client';

import React, { useState } from 'react';
import { Search, MapPin, Calendar, Navigation2, X, Filter } from 'lucide-react';
import { Input, Select, Button } from '@/components/ui';

interface SearchFiltersProps {
  cities: string[];
  onFilter: (filters: FilterValues) => void;
  onReset: () => void;
}

export interface FilterValues {
  search: string;
  city: string;
  date: string;
  onlyOnDuty: boolean;
  sortBy: 'distance' | 'rating' | 'name';
}

export function SearchFilters({ cities, onFilter, onReset }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    city: '',
    date: new Date().toISOString().split('T')[0],
    onlyOnDuty: true,
    sortBy: 'distance',
  });

  const handleChange = (key: keyof FilterValues, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    const defaultFilters: FilterValues = {
      search: '',
      city: '',
      date: new Date().toISOString().split('T')[0],
      onlyOnDuty: true,
      sortBy: 'distance',
    };
    setFilters(defaultFilters);
    onReset();
  };

  const cityOptions = [
    { value: '', label: 'Toutes les villes' },
    ...cities.map((city) => ({ value: city, label: city })),
  ];

  const sortOptions = [
    { value: 'distance', label: 'Distance' },
    { value: 'rating', label: 'Note' },
    { value: 'name', label: 'Nom' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <form onSubmit={handleSubmit}>
        {/* Main search bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Rechercher une pharmacie..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" className="md:w-auto">
            <Search className="w-4 h-4 mr-2" />
            Rechercher
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
        </div>

        {/* Expanded filters */}
        {isExpanded && (
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* City filter */}
              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4" />
                  <span>Ville</span>
                </div>
                <Select
                  options={cityOptions}
                  value={filters.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>

              {/* Date filter */}
              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>Date de garde</span>
                </div>
                <Input
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                />
              </div>

              {/* Sort by */}
              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                  <Navigation2 className="w-4 h-4" />
                  <span>Trier par</span>
                </div>
                <Select
                  options={sortOptions}
                  value={filters.sortBy}
                  onChange={(e) => handleChange('sortBy', e.target.value as FilterValues['sortBy'])}
                />
              </div>

              {/* Only on duty */}
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.onlyOnDuty}
                    onChange={(e) => handleChange('onlyOnDuty', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Pharmacies de garde uniquement
                  </span>
                </label>
              </div>
            </div>

            {/* Reset button */}
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                className="text-gray-500"
              >
                <X className="w-4 h-4 mr-1" />
                Réinitialiser
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
