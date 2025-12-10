/**
 * Rating Form Component
 * Allow public users to rate pharmacies
 */
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star } from 'lucide-react';
import { Button, Textarea, StarRating, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ratingSchema, type RatingInput } from '@/lib/validations';

interface RatingFormProps {
  pharmacyId: string;
  pharmacyName: string;
  onSuccess?: () => void;
}

export function RatingForm({ pharmacyId, pharmacyName, onSuccess }: RatingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RatingInput>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      pharmacyId,
      score: 0,
      comment: '',
    },
  });

  const onSubmit = async (data: RatingInput) => {
    if (rating === 0) {
      setError('Veuillez sélectionner une note');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, score: rating }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'envoi');
      }

      setSuccess(true);
      reset();
      setRating(0);
      onSuccess?.();
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
            <Star className="w-8 h-8 text-green-600 fill-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Merci pour votre avis !
          </h3>
          <p className="text-green-600">
            Votre évaluation a été enregistrée avec succès.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setSuccess(false)}
          >
            Modifier mon avis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évaluer {pharmacyName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre note *
            </label>
            <StarRating value={rating} onChange={setRating} size="lg" />
            {error && rating === 0 && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Comment */}
          <Textarea
            label="Votre commentaire (optionnel)"
            placeholder="Partagez votre expérience avec cette pharmacie..."
            {...register('comment')}
            error={errors.comment?.message}
          />

          {/* Error message */}
          {error && rating > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit button */}
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Envoyer mon avis
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
