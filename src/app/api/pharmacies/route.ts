/**
 * Pharmacies API Route
 * GET /api/pharmacies - List all approved pharmacies with filters
 * POST /api/pharmacies - Create a new pharmacy (authenticated)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { pharmacySchema } from '@/lib/validations';
import { calculateDistance } from '@/lib/utils';

// Type for pharmacy with extras
interface PharmacyWithExtras {
  id: string;
  name: string;
  address: string;
  city: string;
  district: string | null;
  phone: string;
  email: string | null;
  latitude: number;
  longitude: number;
  openingHours: string | null;
  isOnDuty: boolean;
  averageRating: number;
  ratingCount: number;
  distance: number | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const city = searchParams.get('city');
    const district = searchParams.get('district');
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');
    const onlyOnDuty = searchParams.get('onlyOnDuty') === 'true';
    const sortBy = searchParams.get('sortBy') || 'name';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: Record<string, unknown> = {
      status: 'APPROVED',
    };

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (district) {
      where.district = { contains: district, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by on-duty status for a specific date
    const filterDate = date ? new Date(date) : new Date();
    if (onlyOnDuty) {
      where.dutyPeriods = {
        some: {
          startDate: { lte: filterDate },
          endDate: { gte: filterDate },
        },
      };
    }

    // Get pharmacies with ratings
    const pharmacies = await prisma.pharmacy.findMany({
      where,
      include: {
        ratings: {
          where: { isApproved: true },
          select: { score: true },
        },
        dutyPeriods: {
          where: {
            startDate: { lte: filterDate },
            endDate: { gte: filterDate },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate average ratings and distances
    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;

    const pharmaciesWithExtras: PharmacyWithExtras[] = pharmacies.map((pharmacy) => {
      const avgRating =
        pharmacy.ratings.length > 0
          ? pharmacy.ratings.reduce((sum: number, r: { score: number }) => sum + r.score, 0) / pharmacy.ratings.length
          : 0;

      const distance =
        userLat && userLng
          ? calculateDistance(userLat, userLng, pharmacy.latitude, pharmacy.longitude)
          : null;

      return {
        id: pharmacy.id,
        name: pharmacy.name,
        address: pharmacy.address,
        city: pharmacy.city,
        district: pharmacy.district,
        phone: pharmacy.phone,
        email: pharmacy.email,
        latitude: pharmacy.latitude,
        longitude: pharmacy.longitude,
        openingHours: pharmacy.openingHours,
        isOnDuty: pharmacy.dutyPeriods.length > 0,
        averageRating: Math.round(avgRating * 10) / 10,
        ratingCount: pharmacy.ratings.length,
        distance,
      };
    });

    // Sort results
    if (sortBy === 'distance' && userLat && userLng) {
      pharmaciesWithExtras.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (sortBy === 'rating') {
      pharmaciesWithExtras.sort((a, b) => b.averageRating - a.averageRating);
    } else {
      pharmaciesWithExtras.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Filter by radius if provided
    const radiusKm = radius ? parseFloat(radius) : null;
    const filteredPharmacies = radiusKm
      ? pharmaciesWithExtras.filter((p) => p.distance !== null && p.distance <= radiusKm)
      : pharmaciesWithExtras;

    // Get total count for pagination
    const totalCount = await prisma.pharmacy.count({ where });

    return NextResponse.json({
      pharmacies: filteredPharmacies,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des pharmacies' },
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

    // Check if user already has a pharmacy
    const existingPharmacy = await prisma.pharmacy.findUnique({
      where: { userId: session.user.id },
    });

    if (existingPharmacy) {
      return NextResponse.json(
        { message: 'Vous avez déjà une pharmacie enregistrée' },
        { status: 409 }
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

    // Create pharmacy
    const pharmacy = await prisma.pharmacy.create({
      data: {
        ...validation.data,
        userId: session.user.id,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      { message: 'Pharmacie créée avec succès. En attente d\'approbation.', pharmacy },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating pharmacy:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de la pharmacie' },
      { status: 500 }
    );
  }
}
