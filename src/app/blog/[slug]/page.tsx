import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { prisma } from '@/lib/prisma';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getBlogPost(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: {
      slug,
      published: true,
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });
  return post;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: 'Article non trouvé | Pharmacie de Garde',
    };
  }

  return {
    title: `${post.title} | Blog Pharmacie de Garde`,
    description: post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      authors: [post.author.name || 'Pharmacie de Garde'],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pharmacie de Garde',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Back Link */}
            <Link 
              href="/blog" 
              className="inline-flex items-center text-gray-600 hover:text-green-600 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au blog
            </Link>

            {/* Article */}
            <article>
              {/* Header */}
              <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {post.title}
                </h1>
                
                {post.excerpt && (
                  <p className="text-xl text-gray-600 mb-6">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {post.author.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Partager
                  </Button>
                </div>
              </header>

              {/* Featured Image Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 rounded-xl mb-8 flex items-center justify-center">
                <span className="text-green-600 text-6xl">📰</span>
              </div>

              {/* Content */}
              <Card>
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-green-600"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </Card>

              {/* Share & Navigation */}
              <div className="mt-8 pt-8 border-t">
                <div className="flex items-center justify-between">
                  <Link href="/blog">
                    <Button variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Tous les articles
                    </Button>
                  </Link>

                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager cet article
                  </Button>
                </div>
              </div>
            </article>

            {/* Related Articles Placeholder */}
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Articles similaires
              </h2>
              <Card>
                <p className="text-gray-500 text-center py-4">
                  Fonctionnalité bientôt disponible
                </p>
              </Card>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
