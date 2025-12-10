/**
 * Feedback Form Component
 * Allow public users to submit feedback and suggestions
 */
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { feedbackSchema, type FeedbackInput } from '@/lib/validations';

interface FeedbackFormProps {
  pharmacyId?: string;
  pharmacyName?: string;
}

export function FeedbackForm({ pharmacyId, pharmacyName }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      message: '',
      email: '',
      pharmacyId: pharmacyId || undefined,
    },
  });

  const onSubmit = async (data: FeedbackInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'envoi');
      }

      setSuccess(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Message envoyé !
          </h3>
          <p className="text-green-600">
            Merci pour votre retour. Nous l&apos;examinerons attentivement.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setSuccess(false)}
          >
            Envoyer un autre message
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {pharmacyName 
            ? `Signaler un problème - ${pharmacyName}`
            : 'Nous contacter'
          }
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email (optional) */}
          <Input
            label="Votre email (optionnel)"
            type="email"
            placeholder="votreemail@exemple.com"
            helperText="Pour recevoir une réponse à votre message"
            {...register('email')}
            error={errors.email?.message}
          />

          {/* Message */}
          <Textarea
            label="Votre message *"
            placeholder="Décrivez votre suggestion ou le problème rencontré..."
            rows={5}
            {...register('message')}
            error={errors.message?.message}
          />

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit button */}
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Envoyer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
