'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search,
  AlertTriangle,
  Clock,
  Building2
} from 'lucide-react';
import { Sidebar } from '@/components/layout';
import { Card, Button, Input, Badge, Modal } from '@/components/ui';

interface Feedback {
  id: string;
  type: string;
  message: string;
  status: string;
  createdAt: string;
  pharmacy: {
    id: string;
    name: string;
    city: string;
  };
  user?: {
    name: string;
    email: string;
  };
}

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('/api/feedbacks');
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const response = await fetch(`/api/feedbacks?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' }),
      });

      if (response.ok) {
        fetchFeedbacks();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error resolving feedback:', error);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      const response = await fetch(`/api/feedbacks?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DISMISSED' }),
      });

      if (response.ok) {
        fetchFeedbacks();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error dismissing feedback:', error);
    }
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch = 
      feedback.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'pending') return matchesSearch && feedback.status === 'PENDING';
    if (filter === 'resolved') return matchesSearch && feedback.status !== 'PENDING';
    return matchesSearch;
  });

  const pendingCount = feedbacks.filter(f => f.status === 'PENDING').length;

  const getFeedbackTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'WRONG_INFO': 'Informations incorrectes',
      'CLOSED': 'Pharmacie fermée',
      'OTHER': 'Autre',
    };
    return types[type] || type;
  };

  const getFeedbackTypeColor = (type: string) => {
    const colors: Record<string, 'warning' | 'danger' | 'default'> = {
      'WRONG_INFO': 'warning',
      'CLOSED': 'danger',
      'OTHER': 'default',
    };
    return colors[type] || 'default';
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
                Gestion des signalements
              </h1>
              <p className="text-gray-600">
                {pendingCount > 0 
                  ? `${pendingCount} signalement(s) en attente de traitement`
                  : 'Tous les signalements sont traités'
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
                  placeholder="Rechercher un signalement..."
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
                  Tous ({feedbacks.length})
                </Button>
                <Button
                  variant={filter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('pending')}
                >
                  En attente ({pendingCount})
                </Button>
                <Button
                  variant={filter === 'resolved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('resolved')}
                >
                  Traités ({feedbacks.length - pendingCount})
                </Button>
              </div>
            </div>
          </Card>

          {/* Feedbacks List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredFeedbacks.length > 0 ? (
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => (
                <Card key={feedback.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        feedback.status === 'PENDING' ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <AlertTriangle className={`h-6 w-6 ${
                          feedback.status === 'PENDING' ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getFeedbackTypeColor(feedback.type)}>
                            {getFeedbackTypeLabel(feedback.type)}
                          </Badge>
                          <Badge variant={feedback.status === 'PENDING' ? 'warning' : 'success'}>
                            {feedback.status === 'PENDING' ? 'En attente' : 'Traité'}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-900 mb-2 line-clamp-2">
                          {feedback.message}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {feedback.pharmacy.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(feedback.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setShowModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {feedback.status === 'PENDING' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleResolve(feedback.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Résolu
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDismiss(feedback.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Ignorer
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
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun signalement
              </h2>
              <p className="text-gray-600">
                Aucun signalement ne correspond à vos critères de recherche.
              </p>
            </Card>
          )}
        </div>
      </main>

      {/* Feedback Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Détails du signalement"
      >
        {selectedFeedback && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <p className="text-gray-900">{getFeedbackTypeLabel(selectedFeedback.type)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Pharmacie concernée</label>
              <p className="text-gray-900">
                {selectedFeedback.pharmacy.name} - {selectedFeedback.pharmacy.city}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Message</label>
              <p className="text-gray-900">{selectedFeedback.message}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Date</label>
              <p className="text-gray-900">
                {new Date(selectedFeedback.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {selectedFeedback.user && (
              <div>
                <label className="text-sm font-medium text-gray-500">Signalé par</label>
                <p className="text-gray-900">
                  {selectedFeedback.user.name} ({selectedFeedback.user.email})
                </p>
              </div>
            )}

            {selectedFeedback.status === 'PENDING' && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => handleResolve(selectedFeedback.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marquer comme résolu
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDismiss(selectedFeedback.id)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Ignorer
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
