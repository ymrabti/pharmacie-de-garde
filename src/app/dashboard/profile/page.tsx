'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Building2, MapPin, Phone, Save, CheckCircle } from 'lucide-react';
import { Sidebar } from '@/components/layout';
import { Card, Button, Input, Textarea } from '@/components/ui';

const profileSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().optional(), // Email is read-only from session
    pharmacyName: z.string().min(2, 'Le nom de la pharmacie est requis'),
    address: z.string().min(5, 'Adresse requise'),
    city: z.string().min(2, 'Ville requise'),
    district: z.string().optional(),
    phone: z.string().min(8, 'Numéro de téléphone invalide'),
    description: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [pharmacy, setPharmacy] = useState<{ id: string } | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            email: '', // Will be set from session
        },
    });

    // Pre-fill email from session when it becomes available
    useEffect(() => {
        if (session?.user?.email) {
            reset((values) => ({
                ...values,
                name: values.name || session.user?.name || '',
                email: session.user?.email || '',
            }));
        }
    }, [session, reset]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!session?.user?.pharmacyId) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/pharmacies/${session.user.pharmacyId}`);
                if (response.ok) {
                    const data = await response.json();
                    setPharmacy(data);
                    reset({
                        name: session.user.name || '',
                        email: session.user.email || '',
                        pharmacyName: data.name,
                        address: data.address,
                        city: data.city,
                        district: data.district || '',
                        phone: data.phone,
                        description: data.description || '',
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [session, reset]);

    const onSubmit = async (data: ProfileForm) => {
        if (!pharmacy) return;

        setSaving(true);
        setSuccess(false);

        try {
            const response = await fetch(`/api/pharmacies/${pharmacy.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.pharmacyName,
                    address: data.address,
                    city: data.city,
                    district: data.district,
                    phone: data.phone,
                    description: data.description,
                }),
            });

            if (response.ok) {
                setSuccess(true);
                await update({ name: data.name });
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar role="PHARMACY" />
                <main className="flex-1 p-8">
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar role="PHARMACY" />

            <main className="flex-1 p-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Profil
                        </h1>
                        <p className="text-gray-600">
                            Gérez les informations de votre pharmacie
                        </p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-5 w-5" />
                            Profil mis à jour avec succès !
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Account Information */}
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <User className="h-5 w-5 text-green-600" />
                                </div>
                                <h2 className="text-lg font-semibold">Informations du compte</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom du responsable
                                    </label>
                                    <Input
                                        {...register('name')}
                                        error={errors.name?.message}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Email (lié à votre compte)
                                    </label>
                                    <Input
                                        type="email"
                                        {...register('email')}
                                        error={errors.email?.message}
                                        disabled
                                        className="bg-gray-100 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Email défini lors de l&apos;inscription</p>
                                </div>
                            </div>
                        </Card>

                        {/* Pharmacy Information */}
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Building2 className="h-5 w-5 text-green-600" />
                                </div>
                                <h2 className="text-lg font-semibold">Informations de la pharmacie</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom de la pharmacie
                                    </label>
                                    <Input
                                        {...register('pharmacyName')}
                                        error={errors.pharmacyName?.message}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <Textarea
                                        {...register('description')}
                                        rows={3}
                                        placeholder="Description de votre pharmacie..."
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Location Information */}
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <MapPin className="h-5 w-5 text-green-600" />
                                </div>
                                <h2 className="text-lg font-semibold">Adresse</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Adresse complète
                                    </label>
                                    <Input
                                        {...register('address')}
                                        error={errors.address?.message}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ville
                                        </label>
                                        <Input
                                            {...register('city')}
                                            error={errors.city?.message}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quartier
                                        </label>
                                        <Input
                                            {...register('district')}
                                            placeholder="Ex: Guéliz, Marrakech Médina..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Contact Information */}
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Phone className="h-5 w-5 text-green-600" />
                                </div>
                                <h2 className="text-lg font-semibold">Contact</h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Numéro de téléphone
                                </label>
                                <Input
                                    {...register('phone')}
                                    error={errors.phone?.message}
                                    placeholder="+212 5XX XX XX XX"
                                />
                            </div>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <>
                                        <span className="animate-spin mr-2">⏳</span>
                                        Enregistrement..
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Enregistrer les modifications
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
