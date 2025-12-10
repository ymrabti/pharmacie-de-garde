'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search,
  MapPin,
  Phone
} from 'lucide-react';
import { Sidebar } from '@/components/layout';
import { Card, Button, Input, Badge, Modal } from '@/components/ui';

interface PharmacyWithUser {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  latitude: number;
  longitude: number;
  isApproved: boolean;
  description?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<PharmacyWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyWithUser | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const response = await fetch('/api/admin/pharmacies');
      if (response.ok) {
        const data = await response.json();
        setPharmacies(data);
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch('/api/admin/pharmacies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve' }),
      });

      if (response.ok) {
        fetchPharmacies();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error approving pharmacy:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch('/api/admin/pharmacies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reject' }),
      });

      if (response.ok) {
        fetchPharmacies();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error rejecting pharmacy:', error);
    }
  };

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const matchesSearch = 
      pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.user.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'pending') return matchesSearch && !pharmacy.isApproved;
    if (filter === 'approved') return matchesSearch && pharmacy.isApproved;
    return matchesSearch;
  });

  const pendingCount = pharmacies.filter(p => !p.isApproved).length;

  const viewPharmacy = (pharmacy: PharmacyWithUser) => {
    setSelectedPharmacy(pharmacy);
    setShowModal(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="ADMIN" />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestion des pharmacies
              </h1>
              <p className="text-gray-600">
                {pendingCount > 0 
                  ? `${pendingCount} pharmacie(s) en attente de validation`
                  : 'Toutes les pharmacies sont validées'
                }
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
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

              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  Toutes ({pharmacies.length})
                </Button>
                <Button
                  variant={filter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('pending')}
                >
                  En attente ({pendingCount})
                </Button>
                <Button
                  variant={filter === 'approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('approved')}
                >
                  Approuvées ({pharmacies.length - pendingCount})
                </Button>
              </div>
            </div>
          </Card>

          {/* Pharmacies List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredPharmacies.length > 0 ? (
            <div className="space-y-4">
              {filteredPharmacies.map((pharmacy) => (
                <Card key={pharmacy.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        pharmacy.isApproved ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        <Building2 className={`h-6 w-6 ${
                          pharmacy.isApproved ? 'text-green-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {pharmacy.name}
                          </h3>
                          <Badge variant={pharmacy.isApproved ? 'success' : 'warning'}>
                            {pharmacy.isApproved ? 'Approuvée' : 'En attente'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {pharmacy.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {pharmacy.phone}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Propriétaire: {pharmacy.user.name} ({pharmacy.user.email})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewPharmacy(pharmacy)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {!pharmacy.isApproved && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(pharmacy.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(pharmacy.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune pharmacie trouvée
              </h2>
              <p className="text-gray-600">
                Aucune pharmacie ne correspond à vos critères de recherche.
              </p>
            </Card>
          )}
        </div>
      </main>

      {/* Pharmacy Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Détails de la pharmacie"
      >
        {selectedPharmacy && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nom</label>
              <p className="text-gray-900">{selectedPharmacy.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Adresse</label>
              <p className="text-gray-900">
                {selectedPharmacy.address}, {selectedPharmacy.city} {selectedPharmacy.postalCode}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Téléphone</label>
              <p className="text-gray-900">{selectedPharmacy.phone}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Coordonnées</label>
              <p className="text-gray-900">
                {selectedPharmacy.latitude}, {selectedPharmacy.longitude}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Propriétaire</label>
              <p className="text-gray-900">
                {selectedPharmacy.user.name} ({selectedPharmacy.user.email})
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Créée le</label>
              <p className="text-gray-900">
                {new Date(selectedPharmacy.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>

            {!selectedPharmacy.isApproved && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => handleApprove(selectedPharmacy.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 hover:bg-red-50"
                  onClick={() => handleReject(selectedPharmacy.id)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
