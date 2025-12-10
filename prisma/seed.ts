/**
 * Prisma Database Seed Script
 * Seeds the database with initial data including admin user and sample pharmacies
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pharmacies-garde.fr' },
    update: {},
    create: {
      email: 'admin@pharmacies-garde.fr',
      password: adminPassword,
      name: 'Administrateur',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create sample pharmacy user
  const pharmacyPassword = await bcrypt.hash('Pharmacy123!', 12);
  const pharmacyUser = await prisma.user.upsert({
    where: { email: 'pharmacie@exemple.fr' },
    update: {},
    create: {
      email: 'pharmacie@exemple.fr',
      password: pharmacyPassword,
      name: 'Dr. Jean Dupont',
      role: 'PHARMACY',
    },
  });
  console.log('✅ Pharmacy user created:', pharmacyUser.email);

  // Create sample pharmacy
  const pharmacy = await prisma.pharmacy.upsert({
    where: { userId: pharmacyUser.id },
    update: {},
    create: {
      name: 'Pharmacie du Centre',
      address: '15 Rue de la République',
      city: 'Paris',
      district: '1er arrondissement',
      phone: '01 23 45 67 89',
      email: 'contact@pharmacie-centre.fr',
      description: 'Pharmacie de quartier ouverte depuis 1990. Large choix de produits pharmaceutiques et parapharmaceutiques.',
      latitude: 48.8606,
      longitude: 2.3376,
      openingHours: {
        monday: '08:30-19:30',
        tuesday: '08:30-19:30',
        wednesday: '08:30-19:30',
        thursday: '08:30-19:30',
        friday: '08:30-19:30',
        saturday: '09:00-13:00',
        sunday: 'Fermé',
      },
      status: 'APPROVED',
      userId: pharmacyUser.id,
    },
  });
  console.log('✅ Sample pharmacy created:', pharmacy.name);

  // Create additional sample pharmacies
  const samplePharmacies = [
    {
      name: 'Pharmacie Saint-Michel',
      address: '42 Boulevard Saint-Michel',
      city: 'Paris',
      district: '5ème arrondissement',
      phone: '01 44 32 18 90',
      latitude: 48.8503,
      longitude: 2.3441,
    },
    {
      name: 'Grande Pharmacie de Lyon',
      address: '78 Rue de la République',
      city: 'Lyon',
      district: 'Presqu\'île',
      phone: '04 78 42 15 63',
      latitude: 45.7640,
      longitude: 4.8357,
    },
    {
      name: 'Pharmacie du Vieux Port',
      address: '25 Quai des Belges',
      city: 'Marseille',
      district: '1er arrondissement',
      phone: '04 91 54 32 10',
      latitude: 43.2951,
      longitude: 5.3739,
    },
  ];

  for (const pharmacyData of samplePharmacies) {
    const user = await prisma.user.create({
      data: {
        email: `contact@${pharmacyData.name.toLowerCase().replace(/\s+/g, '-')}.fr`,
        password: await bcrypt.hash('Pharmacy123!', 12),
        name: `Propriétaire ${pharmacyData.name}`,
        role: 'PHARMACY',
      },
    });

    await prisma.pharmacy.create({
      data: {
        ...pharmacyData,
        status: 'APPROVED',
        userId: user.id,
      },
    });
    console.log('✅ Sample pharmacy created:', pharmacyData.name);
  }

  // Create sample duty periods
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  await prisma.dutyPeriod.create({
    data: {
      pharmacyId: pharmacy.id,
      startDate: new Date(now.setHours(20, 0, 0, 0)),
      endDate: new Date(tomorrow.setHours(8, 0, 0, 0)),
      notes: 'Garde de nuit',
    },
  });
  console.log('✅ Sample duty period created');

  // Create sample blog post
  await prisma.blogPost.upsert({
    where: { slug: 'comment-trouver-pharmacie-garde' },
    update: {},
    create: {
      title: 'Comment trouver une pharmacie de garde ?',
      slug: 'comment-trouver-pharmacie-garde',
      excerpt: 'Découvrez les différentes méthodes pour localiser rapidement une pharmacie de garde près de chez vous, de jour comme de nuit.',
      content: `
# Comment trouver une pharmacie de garde ?

Vous avez besoin d'un médicament en urgence et votre pharmacie habituelle est fermée ? Pas de panique ! Voici les différentes solutions pour trouver une pharmacie de garde.

## 1. Utilisez notre plateforme

Notre site web vous permet de localiser instantanément les pharmacies de garde près de chez vous. Grâce à la géolocalisation, vous pouvez :
- Voir les pharmacies sur une carte interactive
- Filtrer par ville ou code postal
- Obtenir l'itinéraire directement

## 2. Appelez le 3237

Le numéro 3237 est un service téléphonique payant (0,35€/min) qui vous indique la pharmacie de garde la plus proche.

## 3. Consultez la vitrine de votre pharmacie

Les pharmacies affichent généralement sur leur devanture les coordonnées de la pharmacie de garde.

## 4. Contactez le commissariat

En cas d'urgence, le commissariat de police peut vous indiquer la pharmacie de garde de votre secteur.

---

**Bon à savoir** : Les pharmacies de garde pratiquent parfois un tarif majoré pour les médicaments délivrés en dehors des heures d'ouverture habituelles.
      `,
      metaTitle: 'Comment trouver une pharmacie de garde - Guide complet',
      metaDescription: 'Découvrez toutes les méthodes pour trouver rapidement une pharmacie de garde ouverte près de chez vous, 24h/24 et 7j/7.',
      isPublished: true,
      publishedAt: new Date(),
      authorId: admin.id,
    },
  });
  console.log('✅ Sample blog post created');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
