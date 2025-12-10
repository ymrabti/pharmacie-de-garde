/**
 * Admin Dashboard Page
 * Main dashboard view for administrators
 */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Star,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';

interface AdminStats {
  totalPharmacies: number;
  pendingPharmacies: number;
  approvedPharmacies: number;
  totalRatings: number;
  totalFeedbacks: number;
  unreadFeedbacks: number;
  totalBlogPosts: number;
}

interface PendingPharmacy {
  id: string;
  name: string;
  city: string;
  createdAt: string;
  user: { name: string; email: string };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingPharmacies, setPendingPharmacies] = useState<PendingPharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch pharmacies stats
        const pharmaciesRes = await fetch('/api/admin/pharmacies');
        const pharmaciesData = await pharmaciesRes.json();

        // Fetch feedbacks
        const feedbacksRes = await fetch('/api/feedbacks?isRead=false');
        const feedbacksData = await feedbacksRes.json();

        // Fetch blog posts
        const blogRes = await fetch('/api/blog?includeUnpublished=true');
        const blogData = await blogRes.json();

        setStats({
          totalPharmacies: pharmaciesData.pagination?.total || 0,
          pendingPharmacies: pharmaciesData.statusCounts?.PENDING || 0,
          approvedPharmacies: pharmaciesData.statusCounts?.APPROVED || 0,
          totalRatings: 0, // Would need additional API
          totalFeedbacks: feedbacksData.pagination?.total || 0,
          unreadFeedbacks: feedbacksData.feedbacks?.length || 0,
          totalBlogPosts: blogData.pagination?.total || 0,
        });

        // Filter pending pharmacies
        const pending = pharmaciesData.pharmacies?.filter(
          (p: { status: string }) => p.status === 'PENDING'
        ).slice(0, 5);
        setPendingPharmacies(pending || []);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await fetch('/api/admin/pharmacies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id], action: 'approve' }),
      });

      setPendingPharmacies((prev) => prev.filter((p) => p.id !== id));
      setStats((prev) => prev ? {
        ...prev,
        pendingPharmacies: prev.pendingPharmacies - 1,
        approvedPharmacies: prev.approvedPharmacies + 1,
      } : null);
    } catch (error) {
      console.error('Error approving pharmacy:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetch('/api/admin/pharmacies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id], action: 'reject' }),
      });

      setPendingPharmacies((prev) => prev.filter((p) => p.id !== id));
      setStats((prev) => prev ? {
        ...prev,
        pendingPharmacies: prev.pendingPharmacies - 1,
      } : null);
    } catch (error) {
      console.error('Error rejecting pharmacy:', error);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de bord administrateur
        </h1>
        <p className="text-gray-600">
          Vue d&apos;ensemble de la plateforme
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pharmacies</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalPharmacies}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingPharmacies}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Retours non lus</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.unreadFeedbacks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Articles blog</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalBlogPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Pharmacies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Pharmacies en attente d&apos;approbation
          </CardTitle>
          <Link href="/admin/pharmacies?status=PENDING">
            <Button variant="ghost" size="sm">
              Voir tout
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {pendingPharmacies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500 opacity-50" />
              <p>Aucune pharmacie en attente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPharmacies.map((pharmacy) => (
                <div
                  key={pharmacy.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{pharmacy.name}</p>
                    <p className="text-sm text-gray-500">
                      {pharmacy.city} • {pharmacy.user.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(pharmacy.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approuver
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(pharmacy.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/pharmacies">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="py-6 text-center">
              <Building2 className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900">Gérer les pharmacies</h3>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/feedbacks">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="py-6 text-center">
              <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900">Retours utilisateurs</h3>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/ratings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="py-6 text-center">
              <Star className="w-8 h-8 text-amber-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900">Modérer les avis</h3>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/blog">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="py-6 text-center">
              <FileText className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900">Gérer le blog</h3>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
