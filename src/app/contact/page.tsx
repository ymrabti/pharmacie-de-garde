'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { Card, Button, Input, Textarea } from '@/components/ui';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(5, 'Le sujet doit contenir au moins 5 caractères'),
  message: z.string().min(20, 'Le message doit contenir au moins 20 caractères'),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log('Contact form submitted:', data);
    setIsSuccess(true);
    reset();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contactez-nous
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une question ? Une suggestion ? Notre équipe est à votre écoute.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600 mt-1">
                      contact@pharmacie-de-garde.ma
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Réponse sous 24-48h
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Téléphone</h3>
                    <p className="text-gray-600 mt-1">
                      +212 5XX XX XX XX
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Lun - Ven, 9h - 18h
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Adresse</h3>
                    <p className="text-gray-600 mt-1">
                      Casablanca, Maroc
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Siège social
                    </p>
                  </div>
                </div>
              </Card>

              {/* FAQ Link */}
              <Card className="bg-green-50 border-green-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Questions fréquentes
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Consultez notre FAQ pour des réponses rapides aux questions courantes.
                </p>
                <Button variant="outline" size="sm">
                  Voir la FAQ
                </Button>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                {isSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      Message envoyé !
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.
                    </p>
                    <Button onClick={() => setIsSuccess(false)}>
                      Envoyer un autre message
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Envoyez-nous un message
                    </h2>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label 
                            htmlFor="name" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Nom complet *
                          </label>
                          <Input
                            id="name"
                            placeholder="Votre nom"
                            {...register('name')}
                            error={errors.name?.message}
                          />
                        </div>

                        <div>
                          <label 
                            htmlFor="email" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Email *
                          </label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="votre@email.com"
                            {...register('email')}
                            error={errors.email?.message}
                          />
                        </div>
                      </div>

                      <div>
                        <label 
                          htmlFor="subject" 
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Sujet *
                        </label>
                        <Input
                          id="subject"
                          placeholder="Sujet de votre message"
                          {...register('subject')}
                          error={errors.subject?.message}
                        />
                      </div>

                      <div>
                        <label 
                          htmlFor="message" 
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Message *
                        </label>
                        <Textarea
                          id="message"
                          placeholder="Décrivez votre demande en détail..."
                          rows={6}
                          {...register('message')}
                          error={errors.message?.message}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          * Champs obligatoires
                        </p>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span>
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Envoyer le message
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
