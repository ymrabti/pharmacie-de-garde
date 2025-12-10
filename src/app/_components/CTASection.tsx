/**
 * CTA Section Component
 * Call to action for pharmacy registration
 */
import React from 'react';
import Link from 'next/link';
import { Building2, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';

const benefits = [
  'Visibilité auprès de milliers d\'utilisateurs',
  'Gestion facile de vos périodes de garde',
  'Statistiques de fréquentation',
  'Système de notation et avis',
  'Interface intuitive et moderne',
];

export function CTASection() {
  return (
    <section className="py-16 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">Espace Pharmacie</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Vous êtes pharmacien ?
              <br />
              <span className="text-green-300">Rejoignez notre réseau</span>
            </h2>

            <p className="text-lg text-green-100 mb-8">
              Inscrivez votre pharmacie gratuitement et permettez aux utilisateurs 
              de vous trouver facilement pendant vos périodes de garde.
            </p>

            <ul className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-white text-green-700 hover:bg-green-50 w-full sm:w-auto"
                >
                  Inscrire ma pharmacie
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
                >
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Stats Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-6">Notre réseau en chiffres</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">1500+</div>
                <div className="text-green-200">Pharmacies inscrites</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">50k+</div>
                <div className="text-green-200">Recherches / mois</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">4.8</div>
                <div className="text-green-200">Note moyenne</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-green-200">Gratuit</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/10 rounded-xl">
              <p className="text-sm text-green-100 text-center">
                &quot;Ce service m&apos;a permis d&apos;augmenter significativement 
                ma visibilité pendant mes gardes.&quot;
                <br />
                <span className="text-white font-medium mt-2 block">
                  — Dr. Martin, Pharmacie du Centre
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
