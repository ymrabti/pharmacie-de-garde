'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Calendar, Clock, Trash2, Edit } from 'lucide-react';
import { Sidebar } from '@/components/layout';
import { Card, Button, Input, Modal } from '@/components/ui';

interface DutyPeriod {
  id: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export default function DutyPeriodsPage() {
  const { } = useSession();
  const [dutyPeriods, setDutyPeriods] = useState<DutyPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<DutyPeriod | null>(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchDutyPeriods();
  }, []);

  const fetchDutyPeriods = async () => {
    try {
      const response = await fetch('/api/duty-periods');
      if (response.ok) {
        const data = await response.json();
        setDutyPeriods(data);
      }
    } catch (error) {
      console.error('Error fetching duty periods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingPeriod ? 'PUT' : 'POST';
      const url = editingPeriod 
        ? `/api/duty-periods?id=${editingPeriod.id}`
        : '/api/duty-periods';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchDutyPeriods();
        setShowModal(false);
        setFormData({ startDate: '', endDate: '', notes: '' });
        setEditingPeriod(null);
      }
    } catch (error) {
      console.error('Error saving duty period:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette période de garde ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/duty-periods?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDutyPeriods();
      }
    } catch (error) {
      console.error('Error deleting duty period:', error);
    }
  };

  const openEditModal = (period: DutyPeriod) => {
    setEditingPeriod(period);
    setFormData({
      startDate: period.startDate.split('T')[0],
      endDate: period.endDate.split('T')[0],
      notes: period.notes || '',
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingPeriod(null);
    setFormData({ startDate: '', endDate: '', notes: '' });
    setShowModal(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="PHARMACY" />
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Périodes de garde
              </h1>
              <p className="text-gray-600">
                Gérez vos périodes de garde programmées
              </p>
            </div>
            <Button onClick={openAddModal}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une période
            </Button>
          </div>

          {/* Duty Periods List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : dutyPeriods.length > 0 ? (
            <div className="space-y-4">
              {dutyPeriods.map((period) => {
                const startDate = new Date(period.startDate);
                const endDate = new Date(period.endDate);
                const isActive = new Date() >= startDate && new Date() <= endDate;
                const isPast = new Date() > endDate;

                return (
                  <Card 
                    key={period.id}
                    className={`${isActive ? 'border-green-500 bg-green-50' : ''} ${isPast ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Calendar className={`h-6 w-6 ${isActive ? 'text-green-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {startDate.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="font-medium">
                              {endDate.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          {period.notes && (
                            <p className="text-sm text-gray-500 mt-1">
                              {period.notes}
                            </p>
                          )}
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-sm text-green-600 mt-1">
                              <Clock className="h-3 w-3" />
                              En cours
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(period)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(period.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune période de garde
              </h2>
              <p className="text-gray-600 mb-4">
                Commencez par ajouter vos prochaines périodes de garde.
              </p>
              <Button onClick={openAddModal}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une période
              </Button>
            </Card>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPeriod ? 'Modifier la période' : 'Ajouter une période de garde'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début *
            </label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin *
            </label>
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optionnel)
            </label>
            <Input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ex: Garde de nuit uniquement"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              {editingPeriod ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
