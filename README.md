# Pharmacie de Garde 🏥

Application web complète pour trouver les pharmacies de garde au Maroc. Ce projet permet au grand public de localiser facilement les pharmacies de garde, aux pharmacies de gérer leurs plannings, et aux administrateurs de valider et contrôler l'écosystème.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC)

## 🚀 Fonctionnalités

### Pour le Grand Public
- 🗺️ Carte interactive des pharmacies (OpenStreetMap/Leaflet)
- 🔍 Recherche par ville, nom ou proximité
- ⭐ Système de notation et d'avis
- 📱 Interface responsive (mobile-first)
- 🕐 Filtrage par pharmacies de garde actuellement

### Pour les Pharmacies
- 📝 Inscription et gestion du profil
- 📅 Gestion des périodes de garde
- 📊 Tableau de bord avec statistiques
- 🔔 Notifications et alertes

### Pour les Administrateurs
- ✅ Validation des inscriptions de pharmacies
- 📰 Gestion du blog santé
- 📩 Traitement des signalements
- 📈 Tableau de bord administratif

## 🛠️ Stack Technique

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Base de données**: PostgreSQL avec Prisma ORM
- **Authentification**: NextAuth.js (Credentials Provider)
- **Cartographie**: Leaflet + OpenStreetMap
- **Validation**: Zod + React Hook Form
- **Icons**: Lucide React
- **Conteneurisation**: Docker + Docker Compose

## 📋 Prérequis

- Node.js 18+
- npm ou yarn
- PostgreSQL 15+ (ou Docker)
- Docker & Docker Compose (optionnel)

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/pharmacie-de-garde.git
cd pharmacie-de-garde
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

Créez un fichier `.env.local` à la racine du projet:

```env
# Base de données
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pharmacie_de_garde?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3328"
NEXTAUTH_SECRET="votre-secret-super-securise-32-caracteres-minimum"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3328"
```

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:push

# (Optionnel) Peupler avec des données de test
npm run db:seed
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3328](http://localhost:3328) dans votre navigateur.

## 🐳 Déploiement avec Docker

### Développement

```bash
docker-compose up -d
```

### Production

```bash
docker-compose -f docker-compose.yml up -d --build
```

## 📁 Structure du Projet

```
pharmacie-de-garde/
├── prisma/
│   ├── schema.prisma      # Schéma de base de données
│   └── seed.ts            # Script de seed
├── public/                # Assets statiques
├── scripts/
│   └── init-db.sql        # Script d'initialisation PostgreSQL
├── src/
│   ├── app/
│   │   ├── _components/   # Composants de la page d'accueil
│   │   ├── admin/         # Pages administrateur
│   │   ├── api/           # Routes API
│   │   ├── auth/          # Pages d'authentification
│   │   ├── blog/          # Pages du blog
│   │   ├── contact/       # Page de contact
│   │   ├── dashboard/     # Tableau de bord pharmacie
│   │   └── pharmacies/    # Pages des pharmacies
│   ├── components/
│   │   ├── layout/        # Header, Footer, Sidebar
│   │   ├── pharmacy/      # Composants spécifiques pharmacies
│   │   └── ui/            # Composants UI réutilisables
│   ├── lib/
│   │   ├── auth.ts        # Configuration NextAuth
│   │   ├── prisma.ts      # Client Prisma
│   │   ├── utils.ts       # Fonctions utilitaires
│   │   └── validations.ts # Schémas Zod
│   └── types/
│       └── next-auth.d.ts # Types NextAuth
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## 📝 Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Vérification ESLint
npm run db:generate  # Générer le client Prisma
npm run db:push      # Synchroniser le schéma avec la DB
npm run db:migrate   # Créer une migration
npm run db:seed      # Peupler la base de données
npm run db:studio    # Interface visuelle Prisma
```

## 🔐 Rôles Utilisateurs

| Rôle | Description | Accès |
|------|-------------|-------|
| **Public** | Visiteurs non connectés | Recherche, consultation, avis |
| **PHARMACY** | Pharmacies inscrites | Dashboard, gestion garde, profil |
| **ADMIN** | Administrateurs | Tout + validation, blog, modération |

## 🗃️ Modèles de Données

- **User**: Utilisateurs (pharmacies et admins)
- **Pharmacy**: Informations des pharmacies
- **DutyPeriod**: Périodes de garde
- **Rating**: Notes et avis
- **Feedback**: Signalements
- **BlogPost**: Articles du blog
- **Invitation**: Codes d'invitation admin

## 🌐 API Endpoints

### Publics
- `GET /api/pharmacies` - Liste des pharmacies
- `GET /api/pharmacies/[id]` - Détails d'une pharmacie
- `GET /api/blog` - Articles du blog
- `GET /api/blog/[slug]` - Article spécifique

### Authentifiés
- `POST /api/auth/register` - Inscription
- `POST /api/ratings` - Ajouter un avis
- `POST /api/feedbacks` - Signaler un problème
- `POST /api/duty-periods` - Ajouter une garde

### Admin
- `GET /api/admin/pharmacies` - Toutes les pharmacies
- `PUT /api/admin/pharmacies` - Approuver/Rejeter

## 🎨 Personnalisation

### Thème de couleurs

Les couleurs principales sont configurées dans `src/app/globals.css`:

```css
:root {
  --color-primary: #16a34a;    /* Vert pharmacie */
  --color-secondary: #0ea5e9;  /* Bleu santé */
}
```

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📞 Support

Pour toute question, contactez-nous à contact@pharmacie-de-garde.ma

---

Fait avec ❤️ pour la communauté marocaine

