/**
 * Hero Section Component
 * Landing section with search functionality
 */
'use client';

import React from 'react';
import { MapPin, Search, Clock } from 'lucide-react';
import { Button } from '@/components/ui';

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Service disponible 24h/24</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Trouvez une pharmacie de garde
            <span className="text-green-300"> près de chez vous</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Localisez rapidement les pharmacies ouvertes à proximité. 
            Service gratuit et disponible partout en France.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto">
            <form className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Entrez votre ville ou code postal"
                  className="w-full h-12 pl-12 pr-4 text-gray-900 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <Button type="submit" size="lg" className="md:w-auto">
                <Search className="w-5 h-5 mr-2" />
                Rechercher
              </Button>
            </form>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold">1500+</div>
              <div className="text-green-200 text-sm">Pharmacies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-green-200 text-sm">Disponibilité</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-green-200 text-sm">Gratuit</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#f9fafb"
          />
        </svg>
      </div>
    </section>
  );
}
