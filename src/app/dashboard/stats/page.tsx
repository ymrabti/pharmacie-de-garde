'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  TrendingUp, 
  Star, 
  Eye, 
  Calendar,
  BarChart3,
  Users,
  MessageSquare
} from 'lucide-react';
import { Sidebar } from '@/components/layout';
import { Card } from '@/components/ui';

interface StatsData {
  totalViews: number;
  averageRating: number;
  totalRatings: number;
  totalFeedbacks: number;
  dutyPeriods: number;
  monthlyViews: { month: string; views: number }[];
}

export default function StatsPage() {
  const { } = useSession();
  const [stats, setStats] = useState<StatsData>({
    totalViews: 0,
    averageRating: 0,
    totalRatings: 0,
    totalFeedbacks: 0,
    dutyPeriods: 0,
    monthlyViews: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated stats data - in production, fetch from API
    setTimeout(() => {
      setStats({
        totalViews: 1247,
        averageRating: 4.5,
        totalRatings: 32,
        totalFeedbacks: 5,
        dutyPeriods: 8,
        monthlyViews: [
          { month: 'Jan', views: 120 },
          { month: 'Fév', views: 145 },
          { month: 'Mar', views: 180 },
          { month: 'Avr', views: 210 },
          { month: 'Mai', views: 195 },
          { month: 'Juin', views: 230 },
        ],
      });
      setLoading(false);
    }, 500);
  }, []);

  const statCards = [
    {
      title: 'Vues totales',
      value: stats.totalViews.toLocaleString(),
      change: '+12%',
      icon: Eye,
      color: 'blue',
    },
    {
      title: 'Note moyenne',
      value: stats.averageRating.toFixed(1),
      change: '+0.2',
      icon: Star,
      color: 'yellow',
    },
    {
      title: 'Avis reçus',
      value: stats.totalRatings,
      change: '+5',
      icon: Users,
      color: 'green',
    },
    {
      title: 'Signalements',
      value: stats.totalFeedbacks,
      change: '-2',
      icon: MessageSquare,
      color: 'red',
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar role="PHARMACY" />
        <main className="flex-1 p-8">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="PHARMACY" />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Statistiques
            </h1>
            <p className="text-gray-600">
              Suivez les performances de votre pharmacie
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              const colors = colorClasses[stat.color];

              return (
                <Card key={stat.title}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {stat.value}
                      </p>
                      <p className={`text-sm mt-1 ${
                        stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change} ce mois
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${colors.bg}`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Views Chart */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Évolution des vues</h2>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>

              <div className="h-64 flex items-end justify-between gap-2">
                {stats.monthlyViews.map((item) => {
                  const maxViews = Math.max(...stats.monthlyViews.map(m => m.views));
                  const height = (item.views / maxViews) * 100;

                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-green-500 rounded-t-lg transition-all hover:bg-green-600"
                        style={{ height: `${height}%` }}
                        title={`${item.views} vues`}
                      />
                      <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Activity Summary */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Résumé d&apos;activité</h2>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">Périodes de garde</span>
                  </div>
                  <span className="font-semibold">{stats.dutyPeriods}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-gray-700">Meilleur mois</span>
                  </div>
                  <span className="font-semibold">Juin (230 vues)</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-700">Taux de conversion</span>
                  </div>
                  <span className="font-semibold">8.5%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-purple-500" />
                    <span className="text-gray-700">Vues moyennes/jour</span>
                  </div>
                  <span className="font-semibold">42</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Tips Card */}
          <Card className="mt-6 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Conseils pour améliorer votre visibilité
                </h3>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• Mettez à jour régulièrement vos périodes de garde</li>
                  <li>• Répondez aux avis de vos clients</li>
                  <li>• Complétez toutes les informations de votre profil</li>
                  <li>• Ajoutez une description détaillée de vos services</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
