import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Card } from '@/components/ui';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Blog Santé | Pharmacie de Garde',
  description: 'Découvrez nos articles sur la santé, les médicaments et les conseils de nos pharmaciens.',
};

// Dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  createdAt: Date;
  author: {
    name: string | null;
  };
}

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });
    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Blog Santé
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conseils santé, informations sur les médicaments et actualités 
              pharmaceutiques par nos experts.
            </p>
          </div>

          {/* Blog Posts Grid */}
          {posts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    {/* Featured Image Placeholder */}
                    <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-green-600 text-4xl">📰</span>
                    </div>
                    
                    <div className="space-y-3">
                      <h2 className="text-xl font-semibold text-gray-900 line-clamp-2 hover:text-green-600 transition-colors">
                        {post.title}
                      </h2>
                      
                      {post.excerpt && (
                        <p className="text-gray-600 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{post.author.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-green-600 font-medium">
                        Lire la suite
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun article pour le moment
              </h2>
              <p className="text-gray-600">
                Revenez bientôt pour découvrir nos articles sur la santé !
              </p>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
