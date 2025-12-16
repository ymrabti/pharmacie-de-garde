/**
 * Duty Periods API Route
 * GET /api/duty-periods - List duty periods
 * POST /api/duty-periods - Create a duty period (pharmacy owner)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { dutyPeriodSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pharmacyId = searchParams.get('pharmacyId');
    const date = searchParams.get('date');
    const upcoming = searchParams.get('upcoming') === 'true';

    const where: Record<string, unknown> = {};

    if (pharmacyId) {
      where.pharmacyId = pharmacyId;
    }

    if (date) {
      const filterDate = new Date(date);
      where.startDate = { lte: filterDate };
      where.endDate = { gte: filterDate };
    }

    if (upcoming) {
      where.endDate = { gte: new Date() };
    }

    const dutyPeriods = await prisma.dutyPeriod.findMany({
      where,
      include: {
        pharmacy: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            phone: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json({ dutyPeriods });
  } catch (error) {
    console.error('Error fetching duty periods:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des gardes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Get user's pharmacy
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { userId: session.user.id },
    });

    if (!pharmacy && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Vous devez avoir une pharmacie pour créer une garde' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // For admins, allow specifying pharmacyId
    const pharmacyId = session.user.role === 'ADMIN' && body.pharmacyId
      ? body.pharmacyId
      : pharmacy?.id;

    if (!pharmacyId) {
      return NextResponse.json(
        { message: 'Pharmacie non spécifiée' },
        { status: 400 }
      );
    }

    // Validate input
    const validation = dutyPeriodSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { startDate, endDate, notes } = validation.data;

    // Check for overlapping duty periods
    const overlapping = await prisma.dutyPeriod.findFirst({
      where: {
        pharmacyId,
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { message: 'Cette période de garde chevauche une période existante' },
        { status: 409 }
      );
    }

    // Create duty period
    const dutyPeriod = await prisma.dutyPeriod.create({
      data: {
        pharmacyId,
        startDate,
        endDate,
        notes,
      },
    });

    return NextResponse.json(
      { message: 'Période de garde créée', dutyPeriod },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating duty period:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de la garde' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { message: 'ID de garde manquant' },
        { status: 400 }
      );
    }

    const existing = await prisma.dutyPeriod.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { message: 'Période de garde non trouvée' },
        { status: 404 }
      );
    }

    // Authorization: owner of pharmacy or admin
    const pharmacy = await prisma.pharmacy.findUnique({ where: { id: existing.pharmacyId } });
    const isOwner = pharmacy?.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = dutyPeriodSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { startDate, endDate, notes } = validation.data;

    // Overlap check excluding current period
    const overlapping = await prisma.dutyPeriod.findFirst({
      where: {
        pharmacyId: existing.pharmacyId,
        id: { not: id },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { message: 'Cette période de garde chevauche une période existante' },
        { status: 409 }
      );
    }

    const updated = await prisma.dutyPeriod.update({
      where: { id },
      data: { startDate, endDate, notes },
    });

    return NextResponse.json({ message: 'Période de garde mise à jour', dutyPeriod: updated });
  } catch (error) {
    console.error('Error updating duty period:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de la garde' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { message: 'ID de garde manquant' },
        { status: 400 }
      );
    }

    const existing = await prisma.dutyPeriod.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { message: 'Période de garde non trouvée' },
        { status: 404 }
      );
    }

    const pharmacy = await prisma.pharmacy.findUnique({ where: { id: existing.pharmacyId } });
    const isOwner = pharmacy?.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    await prisma.dutyPeriod.delete({ where: { id } });
    return NextResponse.json({ message: 'Période de garde supprimée' });
  } catch (error) {
    console.error('Error deleting duty period:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de la garde' },
      { status: 500 }
    );
  }
}
