/**
 * Dashboard Sidebar Component
 * Navigation for pharmacy and admin dashboards
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Star,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  role?: 'ADMIN' | 'PHARMACY';
}

// Navigation items for pharmacy users
const pharmacyNavItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'Mon profil', icon: Building2 },
  { href: '/dashboard/duty-periods', label: 'Périodes de garde', icon: Calendar },
  { href: '/dashboard/stats', label: 'Statistiques', icon: Star },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
];

// Navigation items for admin users
const adminNavItems = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/pharmacies', label: 'Pharmacies', icon: Building2 },
  { href: '/admin/feedbacks', label: 'Signalements', icon: MessageSquare },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
];

export function Sidebar({ isCollapsed = false, onToggle, role }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = role === 'ADMIN' || session?.user?.role === 'ADMIN';
  const navItems = isAdmin ? adminNavItems : pharmacyNavItems;

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">+</span>
            </div>
            <span className="font-semibold text-gray-900">
              {isAdmin ? 'Admin' : 'Pharmacie'}
            </span>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-2 rounded-lg hover:bg-gray-100 transition-colors',
            isCollapsed && 'mx-auto'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Role Badge */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
            isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
          )}>
            <Shield className="w-4 h-4" />
            <span>{isAdmin ? 'Administrateur' : 'Pharmacie'}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              isCollapsed && 'justify-center'
            )}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
        {!isCollapsed && session?.user && (
          <div className="mb-3 px-3 py-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session.user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session.user.email}
            </p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium',
            'text-red-600 hover:bg-red-50 transition-colors',
            isCollapsed && 'justify-center'
          )}
          title={isCollapsed ? 'Déconnexion' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
