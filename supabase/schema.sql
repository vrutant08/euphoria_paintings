-- ===============================
-- EUPHORIA PAINTINGS - DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ===============================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================
-- ARTWORKS TABLE
-- Stores all artwork information
-- ===============================
CREATE TABLE IF NOT EXISTS artworks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  image_filename TEXT,
  year VARCHAR(10),
  price DECIMAL(10,2),
  dimensions VARCHAR(100),
  medium VARCHAR(255),
  is_sold BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- COMMISSIONS TABLE
-- Stores commission requests
-- ===============================
CREATE TABLE IF NOT EXISTS commissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  project_type VARCHAR(100),
  budget VARCHAR(100),
  description TEXT,
  reference_images TEXT[],
  timeline VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- CONTACTS TABLE
-- Stores contact form submissions
-- ===============================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  project_type VARCHAR(100),
  budget VARCHAR(100),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- SITE SETTINGS TABLE
-- Stores configurable site settings
-- ===============================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- INSERT DEFAULT SETTINGS
-- ===============================
INSERT INTO site_settings (key, value) VALUES
  ('artist_name', 'Jasmine Konsoula'),
  ('site_title', 'Euphoria Paintings'),
  ('tagline', 'Exploring the ethereal boundary between reality and imagination through digital oil & light.'),
  ('email', 'hello@euphoriapaintings.com'),
  ('instagram', 'https://instagram.com/euphoria_paintings'),
  ('artstation', 'https://artstation.com/euphoria_paintings'),
  ('is_open_for_commissions', 'true'),
  ('response_time', 'Within 48 hours')
ON CONFLICT (key) DO NOTHING;

-- ===============================
-- ROW LEVEL SECURITY (RLS)
-- ===============================

-- Enable RLS on all tables
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Artworks: Public read, public write (protected by app-level password)
CREATE POLICY "Artworks are viewable by everyone" ON artworks
  FOR SELECT USING (true);

CREATE POLICY "Artworks are insertable by anyone" ON artworks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Artworks are updatable by anyone" ON artworks
  FOR UPDATE USING (true);

CREATE POLICY "Artworks are deletable by anyone" ON artworks
  FOR DELETE USING (true);

-- Commissions: Anyone can insert, only authenticated can view/update
CREATE POLICY "Anyone can submit commissions" ON commissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Commissions viewable by authenticated users" ON commissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Commissions editable by authenticated users" ON commissions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Contacts: Anyone can insert, only authenticated can view
CREATE POLICY "Anyone can submit contact forms" ON contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Contacts viewable by authenticated users" ON contacts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Contacts editable by authenticated users" ON contacts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Site Settings: Public read, authenticated write
CREATE POLICY "Site settings are viewable by everyone" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Site settings editable by authenticated users" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- ===============================
-- CREATE STORAGE BUCKET
-- Run this separately in Supabase Dashboard > Storage
-- ===============================
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create a new bucket called "artworks"
-- 3. Make it public (allow public access)
-- 4. Add policies for upload (authenticated users only)

-- ===============================
-- SAMPLE ARTWORKS (Optional)
-- ===============================
INSERT INTO artworks (title, description, category, year, price, is_featured) VALUES
  ('Ethereal Dreams', 'A journey through color and emotion, capturing the essence of dreams.', 'abstract', 2024, 850.00, true),
  ('Golden Hour', 'The magic of sunset painted in warm, glowing tones.', 'landscapes', 2024, 1200.00, true),
  ('Soul Portrait', 'Capturing the inner beauty and depth of the human spirit.', 'portraits', 2023, 950.00, false),
  ('Abstract Flow', 'Movement and energy frozen in time on canvas.', 'abstract', 2024, 750.00, true),
  ('Mountain Serenity', 'Peace and tranquility found in nature''s grandeur.', 'landscapes', 2024, 1100.00, false),
  ('Gentle Spirit', 'A window to the soul, painted with love and care.', 'portraits', 2023, 900.00, false);
