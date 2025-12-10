/**
 * Blog Posts API Route
 * GET /api/blog - List published blog posts
 * POST /api/blog - Create a blog post (admin only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { blogPostSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    // Only admins can see unpublished posts
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';

    const where = includeUnpublished && isAdmin
      ? {}
      : { isPublished: true };

    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: { name: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.blogPost.count({ where });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = blogPostSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: validation.data.slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { message: 'Ce slug est déjà utilisé' },
        { status: 409 }
      );
    }

    // Create post
    const post = await prisma.blogPost.create({
      data: {
        ...validation.data,
        authorId: session.user.id,
        publishedAt: validation.data.isPublished ? new Date() : null,
      },
    });

    return NextResponse.json(
      { message: 'Article créé', post },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de l\'article' },
      { status: 500 }
    );
  }
}
