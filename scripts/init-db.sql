-- Initial Database Setup Script
-- Creates admin user and seeds sample data

-- Note: This script runs automatically when the database container starts for the first time
-- The actual data will be inserted via Prisma migrations and seed scripts

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better search performance (will be created after Prisma migration)
-- These are just placeholders showing what will be optimized
