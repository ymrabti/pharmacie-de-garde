/**
 * Pharmacy Dashboard Page
 * Main dashboard view for pharmacy owners
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Eye,
  Star,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';

interface DashboardStats {
  viewCount: number;
  averageRating: number;
  ratingCount: number;
  upcomingDutyPeriods: number;
  status: string;
}

interface DutyPeriod {
  id: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dutyPeriods, setDutyPeriods] = useState<DutyPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.pharmacyId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch pharmacy details
        const pharmacyRes = await fetch(`/api/pharmacies/${session.user.pharmacyId}`);
        const pharmacyData = await pharmacyRes.json();

        // Fetch duty periods
        const dutyRes = await fetch(`/api/duty-periods?pharmacyId=${session.user.pharmacyId}&upcoming=true`);
        const dutyData = await dutyRes.json();

        setStats({
          viewCount: pharmacyData.viewCount || 0,
          averageRating: pharmacyData.averageRating || 0,
          ratingCount: pharmacyData.ratingCount || 0,
          upcomingDutyPeriods: dutyData.dutyPeriods?.length || 0,
          status: pharmacyData.status,
        });

        setDutyPeriods(dutyData.dutyPeriods?.slice(0, 5) || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [session]);

  // No pharmacy registered yet
  if (!isLoading && !session?.user?.pharmacyId) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Complétez votre profil pharmacie
            </h2>
            <p className="text-gray-600 mb-6">
              Pour accéder à toutes les fonctionnalités, veuillez d&apos;abord 
              enregistrer les informations de votre pharmacie.
            </p>
            <Link href="/dashboard/profile">
              <Button>
                Créer mon profil pharmacie
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const statusBadge = {
    PENDING: { label: 'En attente', variant: 'warning' as const },
    APPROVED: { label: 'Approuvée', variant: 'success' as const },
    REJECTED: { label: 'Rejetée', variant: 'danger' as const },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {session?.user?.name} 👋
          </h1>
          <p className="text-gray-600">
            Voici un aperçu de votre pharmacie
          </p>
        </div>
        <Badge variant={statusBadge[stats?.status as keyof typeof statusBadge]?.variant}>
          {statusBadge[stats?.status as keyof typeof statusBadge]?.label}
        </Badge>
      </div>

      {/* Pending Approval Notice */}
      {stats?.status === 'PENDING' && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-4 flex items-center gap-4">
            <Clock className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800">
                Votre pharmacie est en cours de validation
              </p>
              <p className="text-sm text-amber-600">
                Un administrateur examinera votre inscription prochainement.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Vues totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.viewCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Note moyenne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.averageRating.toFixed(1)} 
                  <span className="text-sm font-normal text-gray-500">
                    ({stats?.ratingCount} avis)
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Gardes à venir</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.upcomingDutyPeriods}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <div className="flex items-center gap-2">
                  {stats?.status === 'APPROVED' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-600" />
                  )}
                  <span className="font-medium">
                    {stats?.status === 'APPROVED' ? 'Active' : 'En attente'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Duty Periods */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Prochaines gardes</CardTitle>
          <Link href="/dashboard/duty-periods">
            <Button variant="ghost" size="sm">
              Voir tout
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {dutyPeriods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune garde programmée</p>
              <Link href="/dashboard/duty-periods">
                <Button variant="outline" size="sm" className="mt-4">
                  Planifier une garde
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {dutyPeriods.map((period) => (
                <div
                  key={period.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDate(period.startDate)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(period.startDate, { hour: '2-digit', minute: '2-digit' })} - 
                        {formatDate(period.endDate, { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  {period.notes && (
                    <span className="text-sm text-gray-500">{period.notes}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="py-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Modifier mon profil</h3>
              <p className="text-sm text-gray-500 mt-1">
                Mettez à jour vos informations
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/duty-periods">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="py-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Gérer mes gardes</h3>
              <p className="text-sm text-gray-500 mt-1">
                Planifiez vos périodes de garde
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/invitations">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="py-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Inviter des confrères</h3>
              <p className="text-sm text-gray-500 mt-1">
                Partagez notre plateforme
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
