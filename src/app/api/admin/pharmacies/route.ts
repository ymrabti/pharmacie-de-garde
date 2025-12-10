/**
 * Admin Pharmacies API Route
 * GET /api/admin/pharmacies - List all pharmacies (admin only)
 * PATCH /api/admin/pharmacies - Bulk actions (approve/reject)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pharmacies = await prisma.pharmacy.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true },
        },
        _count: {
          select: {
            ratings: true,
            dutyPeriods: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.pharmacy.count({ where });

    // Get status counts
    const statusCounts = await prisma.pharmacy.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json({
      pharmacies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statusCounts: statusCounts.reduce((acc: Record<string, number>, item: { status: string; _count: number }) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des pharmacies' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { ids, action } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: 'Aucune pharmacie sélectionnée' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { message: 'Action invalide' },
        { status: 400 }
      );
    }

    const status = action === 'approve' ? 'APPROVED' : 'REJECTED';

    await prisma.pharmacy.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    return NextResponse.json({
      message: `${ids.length} pharmacie(s) ${action === 'approve' ? 'approuvée(s)' : 'rejetée(s)'}`,
    });
  } catch (error) {
    console.error('Error updating pharmacies:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
