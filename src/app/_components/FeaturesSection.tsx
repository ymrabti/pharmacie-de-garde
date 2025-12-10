/**
 * Features Section Component
 * Highlights key features of the service
 */
import React from 'react';
import { MapPin, Clock, Star, Navigation, Shield, Phone } from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Géolocalisation',
    description: 'Trouvez les pharmacies de garde les plus proches de votre position actuelle.',
  },
  {
    icon: Clock,
    title: 'Disponible 24h/24',
    description: 'Accédez à notre service à tout moment, de jour comme de nuit.',
  },
  {
    icon: Navigation,
    title: 'Itinéraire GPS',
    description: 'Obtenez l\'itinéraire vers la pharmacie de votre choix en un clic.',
  },
  {
    icon: Star,
    title: 'Avis et Notes',
    description: 'Consultez les avis des autres utilisateurs pour choisir la meilleure pharmacie.',
  },
  {
    icon: Shield,
    title: 'Données Vérifiées',
    description: 'Toutes les pharmacies sont vérifiées et validées par notre équipe.',
  },
  {
    icon: Phone,
    title: 'Contact Direct',
    description: 'Appelez directement la pharmacie depuis notre plateforme.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pourquoi utiliser notre service ?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nous facilitons l&apos;accès aux soins en vous aidant à trouver rapidement une pharmacie ouverte.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <feature.icon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
