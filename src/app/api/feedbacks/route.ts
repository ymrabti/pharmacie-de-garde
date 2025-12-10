/**
 * Feedbacks API Route
 * POST /api/feedbacks - Submit feedback (public)
 * GET /api/feedbacks - List feedbacks (admin only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { feedbackSchema } from '@/lib/validations';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isRead = searchParams.get('isRead');
    const isResolved = searchParams.get('isResolved');

    const where: Record<string, unknown> = {};
    if (isRead !== null) where.isRead = isRead === 'true';
    if (isResolved !== null) where.isResolved = isResolved === 'true';

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        pharmacy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.feedback.count({ where });

    return NextResponse.json({
      feedbacks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des retours' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = feedbackSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { message, email, pharmacyId } = validation.data;

    // If pharmacyId provided, verify it exists
    if (pharmacyId) {
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { id: pharmacyId },
      });

      if (!pharmacy) {
        return NextResponse.json(
          { message: 'Pharmacie non trouvée' },
          { status: 404 }
        );
      }
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        message,
        email: email || null,
        pharmacyId: pharmacyId || null,
      },
    });

    return NextResponse.json(
      { message: 'Merci pour votre retour', feedback },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
