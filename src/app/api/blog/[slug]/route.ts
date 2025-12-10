/**
 * Single Blog Post API Route
 * GET /api/blog/[slug] - Get blog post by slug
 * PUT /api/blog/[slug] - Update blog post (admin only)
 * DELETE /api/blog/[slug] - Delete blog post (admin only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { blogPostSchema } from '@/lib/validations';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: { name: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { message: 'Article non trouvé' },
        { status: 404 }
      );
    }

    // Only show published posts to public
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';

    if (!post.isPublished && !isAdmin) {
      return NextResponse.json(
        { message: 'Article non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de l\'article' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post) {
      return NextResponse.json(
        { message: 'Article non trouvé' },
        { status: 404 }
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

    // Check if new slug is unique (if changed)
    if (validation.data.slug !== slug) {
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug: validation.data.slug },
      });

      if (existingPost) {
        return NextResponse.json(
          { message: 'Ce slug est déjà utilisé' },
          { status: 409 }
        );
      }
    }

    // Update post
    const updatedPost = await prisma.blogPost.update({
      where: { id: post.id },
      data: {
        ...validation.data,
        publishedAt: validation.data.isPublished && !post.publishedAt
          ? new Date()
          : post.publishedAt,
      },
    });

    return NextResponse.json({
      message: 'Article mis à jour',
      post: updatedPost,
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de l\'article' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    await prisma.blogPost.delete({
      where: { slug },
    });

    return NextResponse.json({
      message: 'Article supprimé',
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de l\'article' },
      { status: 500 }
    );
  }
}
