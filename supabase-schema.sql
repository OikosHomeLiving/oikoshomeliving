-- Supabase Database Schema for OIKΩS Home Living
-- Run this script in the Supabase SQL Editor to configure your backend.

-- 1. DROP EXISTING TABLES/VIEWS IF RUNNING AGAIN (Clean Slate)
DROP VIEW IF EXISTS public_bookings CASCADE;
DROP VIEW IF EXISTS booking_stats CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS blocked_dates CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS seasonal_rates CASCADE;
DROP TABLE IF EXISTS promo_codes CASCADE;

-- 2. CREATE SETTINGS TABLE
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert Default Administrative Pricing Settings
INSERT INTO settings (key, value) VALUES
('price_per_night', '75'),
('cleaning_fee', '25'),
('service_fee_pct', '12'),
('min_nights', '2'),
('extra_guest_charge', '15')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2b. CREATE SEASONAL RATES TABLE
CREATE TABLE seasonal_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    price_per_night NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert Default Seasonal Rates for Preview
INSERT INTO seasonal_rates (name, date_from, date_to, price_per_night) VALUES
('High Season (July)', '2026-07-01', '2026-07-31', 110),
('Peak Season (August)', '2026-08-01', '2026-08-31', 130),
('September Promo', '2026-09-01', '2026-09-15', 95);

-- 2c. CREATE PROMO CODES TABLE
CREATE TABLE promo_codes (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value NUMERIC NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert Default Promo Codes for Preview
INSERT INTO promo_codes (code, type, value, is_active) VALUES
('WELCOME10', 'percentage', 10, true),
('DIRECT20', 'fixed', 20, true);

-- 3. CREATE BLOCKED DATES TABLE (For manual host blocks/maintenance)
CREATE TABLE blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    reason TEXT DEFAULT 'Μη διαθέσιμο',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CREATE BOOKINGS TABLE (Main reservation record)
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL DEFAULT 2,
    total_price NUMERIC NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    source TEXT NOT NULL DEFAULT 'website',
    promo_code TEXT,
    discount_amount NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. CREATE PUBLIC BOOKINGS VIEW (Security Filter)
-- Exposes check-in and check-out dates to the public calendar 
-- without leaking sensitive guest personal details (names, emails, phones).
CREATE VIEW public_bookings AS
SELECT check_in, check_out
FROM bookings
WHERE status = 'confirmed';

-- 6. CONFIGURE ROW LEVEL SECURITY (RLS) POLICIES
-- This secures your database endpoints so only authorized admins can see sensitive data.

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- A. Settings Policies
CREATE POLICY "Allow public read access to settings" 
ON settings FOR SELECT USING (true);

CREATE POLICY "Allow admin write access to settings" 
ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- B. Blocked Dates Policies
CREATE POLICY "Allow public read access to blocked dates" 
ON blocked_dates FOR SELECT USING (true);

CREATE POLICY "Allow admin write access to blocked dates" 
ON blocked_dates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- C. Bookings Policies
CREATE POLICY "Allow public to submit booking requests" 
ON bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin read/write access to bookings" 
ON bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- D. Seasonal Rates Policies
CREATE POLICY "Allow public read access to seasonal rates" 
ON seasonal_rates FOR SELECT USING (true);

CREATE POLICY "Allow admin write access to seasonal rates" 
ON seasonal_rates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- E. Promo Codes Policies
CREATE POLICY "Allow public read access to promo codes" 
ON promo_codes FOR SELECT USING (true);

CREATE POLICY "Allow admin write access to promo codes" 
ON promo_codes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Grant select permission on the public view to all API requests
GRANT SELECT ON public_bookings TO anon, authenticated;

-- 7. INSERT TEST PREVIEW BOOKINGS (Optional / Delete before going fully public)
INSERT INTO bookings (guest_name, guest_email, guest_phone, check_in, check_out, guests, total_price, status, source) VALUES
('Maria Konstantinou', 'maria@example.com', '+30693000001', '2026-07-10', '2026-07-14', 2, 325, 'confirmed', 'website'),
('James Wilson', 'james@example.com', '+447700000001', '2026-07-20', '2026-07-23', 2, 250, 'confirmed', 'airbnb'),
('Sophia Papadaki', 'sophia@example.com', '+30694000002', '2026-08-01', '2026-08-06', 3, 400, 'confirmed', 'website'),
('Thomas Bauer', 'thomas@example.com', '+49151000001', '2026-08-15', '2026-08-19', 2, 325, 'pending', 'booking'),
('Elena Georgiou', 'elena@example.com', '+30697000003', '2026-09-05', '2026-09-08', 2, 250, 'pending', 'website')
ON CONFLICT DO NOTHING;

