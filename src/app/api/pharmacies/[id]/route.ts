/**
 * Single Pharmacy API Route
 * GET /api/pharmacies/[id] - Get pharmacy details
 * PUT /api/pharmacies/[id] - Update pharmacy (owner or admin)
 * DELETE /api/pharmacies/[id] - Delete pharmacy (admin only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { pharmacySchema } from '@/lib/validations';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id },
      include: {
        ratings: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        dutyPeriods: {
          where: {
            endDate: { gte: new Date() },
          },
          orderBy: { startDate: 'asc' },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { message: 'Pharmacie non trouvée' },
        { status: 404 }
      );
    }

    // Only show approved pharmacies to public
    const session = await getServerSession(authOptions);
    const isOwner = session?.user?.id === pharmacy.userId;
    const isAdmin = session?.user?.role === 'ADMIN';

    if (pharmacy.status !== 'APPROVED' && !isOwner && !isAdmin) {
      return NextResponse.json(
        { message: 'Pharmacie non trouvée' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.pharmacy.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // Calculate average rating
    const avgRating =
      pharmacy.ratings.length > 0
        ? pharmacy.ratings.reduce((sum: number, r: { score: number }) => sum + r.score, 0) / pharmacy.ratings.length
        : 0;

    // Check if currently on duty
    const now = new Date();
    const isOnDuty = pharmacy.dutyPeriods.some(
      (period: { startDate: Date; endDate: Date }) => new Date(period.startDate) <= now && new Date(period.endDate) >= now
    );

    return NextResponse.json({
      ...pharmacy,
      averageRating: Math.round(avgRating * 10) / 10,
      ratingCount: pharmacy.ratings.length,
      isOnDuty,
    });
  } catch (error) {
    console.error('Error fetching pharmacy:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de la pharmacie' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { message: 'Pharmacie non trouvée' },
        { status: 404 }
      );
    }

    // Check authorization
    const isOwner = session.user.id === pharmacy.userId;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = pharmacySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Update pharmacy
    const updatedPharmacy = await prisma.pharmacy.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({
      message: 'Pharmacie mise à jour',
      pharmacy: updatedPharmacy,
    });
  } catch (error) {
    console.error('Error updating pharmacy:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    await prisma.pharmacy.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Pharmacie supprimée',
    });
  } catch (error) {
    console.error('Error deleting pharmacy:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
