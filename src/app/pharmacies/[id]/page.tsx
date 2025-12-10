'use client';

import { useState, useEffect, use, useCallback } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Navigation, 
  ArrowLeft,
  Shield,
  MessageSquare
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { PharmacyMap, RatingForm, FeedbackForm } from '@/components/pharmacy';
import { Button, Card, Badge, StarRating } from '@/components/ui';

interface Rating {
  id: string;
  score: number;
  comment?: string;
  createdAt: string;
  user: { name: string };
}

interface DutyPeriod {
  id: string;
  startDate: string;
  endDate: string;
}

interface PharmacyDetails {
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
  ratings: Rating[];
  dutyPeriods: DutyPeriod[];
  averageRating: number;
  totalRatings: number;
  isOnDuty: boolean;
}

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return phone;
}

export default function PharmacyDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  const [pharmacy, setPharmacy] = useState<PharmacyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'feedback'>('info');
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const fetchPharmacy = useCallback(async () => {
    try {
      const response = await fetch(`/api/pharmacies/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPharmacy(data);
      }
    } catch (error) {
      console.error('Error fetching pharmacy:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPharmacy();
  }, [fetchPharmacy]);

  const handleRatingSuccess = () => {
    setShowRatingForm(false);
    fetchPharmacy();
  };

  const openDirections = () => {
    if (pharmacy) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Pharmacie non trouvée
            </h1>
            <Link href="/pharmacies">
              <Button>Retour à la liste</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link 
            href="/pharmacies" 
            className="inline-flex items-center text-gray-600 hover:text-green-600 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <Card>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {pharmacy.name}
                      </h1>
                      {pharmacy.isApproved && (
                        <Shield className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {pharmacy.isOnDuty && (
                        <Badge variant="success">De garde</Badge>
                      )}
                      {pharmacy.isOpen24h && (
                        <Badge variant="info">Ouvert 24h/24</Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{pharmacy.address}, {pharmacy.city} {pharmacy.postalCode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <a 
                          href={`tel:${pharmacy.phone}`}
                          className="hover:text-green-600"
                        >
                          {formatPhoneNumber(pharmacy.phone)}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button onClick={openDirections}>
                      <Navigation className="h-4 w-4 mr-2" />
                      Itinéraire
                    </Button>
                    <a href={`tel:${pharmacy.phone}`}>
                      <Button variant="outline" className="w-full">
                        <Phone className="h-4 w-4 mr-2" />
                        Appeler
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Rating Summary */}
                <div className="mt-6 pt-6 border-t flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <StarRating value={pharmacy.averageRating} readonly size="lg" />
                    <span className="text-lg font-semibold">
                      {pharmacy.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    ({pharmacy.totalRatings} avis)
                  </span>
                </div>
              </Card>

              {/* Map Card */}
              <Card>
                <h2 className="text-lg font-semibold mb-4">Localisation</h2>
                <PharmacyMap
                  pharmacies={[pharmacy]}
                  center={[pharmacy.latitude, pharmacy.longitude]}
                  zoom={15}
                  height="300px"
                />
              </Card>

              {/* Tabs */}
              <div className="border-b">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                      activeTab === 'info'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Informations
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                      activeTab === 'reviews'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Avis ({pharmacy.totalRatings})
                  </button>
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                      activeTab === 'feedback'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Signalement
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'info' && (
                <Card>
                  <h3 className="font-semibold mb-4">Horaires de garde</h3>
                  {pharmacy.dutyPeriods.length > 0 ? (
                    <div className="space-y-2">
                      {pharmacy.dutyPeriods.map((period) => (
                        <div 
                          key={period.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>
                            {new Date(period.startDate).toLocaleDateString('fr-FR')} - {' '}
                            {new Date(period.endDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      Aucune période de garde programmée.
                    </p>
                  )}
                </Card>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Avis des utilisateurs</h3>
                    <Button 
                      size="sm" 
                      onClick={() => setShowRatingForm(true)}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Donner un avis
                    </Button>
                  </div>

                  {showRatingForm && (
                    <Card>
                      <RatingForm
                        pharmacyId={pharmacy.id}
                        pharmacyName={pharmacy.name}
                        onSuccess={handleRatingSuccess}
                      />
                      <div className="px-4 pb-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowRatingForm(false)}
                        >
                          Annuler
                        </Button>
                      </div>
                    </Card>
                  )}

                  {pharmacy.ratings.length > 0 ? (
                    pharmacy.ratings.map((rating) => (
                      <Card key={rating.id}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="font-medium">{rating.user.name}</span>
                            <div className="text-sm text-gray-500">
                              {new Date(rating.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          <StarRating value={rating.score} readonly size="sm" />
                        </div>
                        {rating.comment && (
                          <p className="text-gray-600">{rating.comment}</p>
                        )}
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <p className="text-gray-500 text-center py-4">
                        Aucun avis pour le moment. Soyez le premier à donner votre avis !
                      </p>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'feedback' && (
                <Card>
                  <div className="flex items-start gap-3 mb-4">
                    <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Signaler un problème</h3>
                      <p className="text-sm text-gray-500">
                        Informations incorrectes ? Pharmacie fermée ? Faites-le nous savoir.
                      </p>
                    </div>
                  </div>
                  
                  {showFeedbackForm ? (
                    <>
                      <FeedbackForm
                        pharmacyId={pharmacy.id}
                        pharmacyName={pharmacy.name}
                      />
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowFeedbackForm(false)}
                        >
                          Annuler
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowFeedbackForm(true)}
                    >
                      Signaler un problème
                    </Button>
                  )}
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <h3 className="font-semibold mb-4">Actions rapides</h3>
                <div className="space-y-2">
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={openDirections}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Obtenir l&apos;itinéraire
                  </Button>
                  <a href={`tel:${pharmacy.phone}`} className="block">
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Appeler
                    </Button>
                  </a>
                </div>
              </Card>

              {/* Nearby Pharmacies (placeholder) */}
              <Card>
                <h3 className="font-semibold mb-4">Pharmacies à proximité</h3>
                <p className="text-sm text-gray-500">
                  Fonctionnalité bientôt disponible
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
