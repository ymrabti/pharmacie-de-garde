/**
 * Ratings API Route
 * POST /api/ratings - Submit a rating (public, anonymous)
 */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ratingSchema } from '@/lib/validations';
import { generateAnonymousId, getClientIp } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = ratingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { pharmacyId, score, comment } = validation.data;

    // Check if pharmacy exists and is approved
    const pharmacy = await prisma.pharmacy.findFirst({
      where: {
        id: pharmacyId,
        status: 'APPROVED',
      },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { message: 'Pharmacie non trouvée' },
        { status: 404 }
      );
    }

    // Generate anonymous ID from IP
    const clientIp = getClientIp(request);
    const anonymousId = generateAnonymousId(clientIp);

    // Check if user already rated this pharmacy
    const existingRating = await prisma.rating.findUnique({
      where: {
        pharmacyId_anonymousId: {
          pharmacyId,
          anonymousId,
        },
      },
    });

    if (existingRating) {
      // Update existing rating
      const updatedRating = await prisma.rating.update({
        where: { id: existingRating.id },
        data: { score, comment },
      });

      return NextResponse.json({
        message: 'Votre avis a été mis à jour',
        rating: updatedRating,
      });
    }

    // Create new rating
    const rating = await prisma.rating.create({
      data: {
        pharmacyId,
        score,
        comment,
        anonymousId,
      },
    });

    return NextResponse.json(
      { message: 'Merci pour votre avis', rating },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating rating:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'envoi de l\'avis' },
      { status: 500 }
    );
  }
}
