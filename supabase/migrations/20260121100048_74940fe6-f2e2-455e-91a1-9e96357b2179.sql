-- Seed sample luxury service inventory across all categories
-- This provides demonstration data for the marketplace

-- Private Aviation
INSERT INTO public.service_inventory (partner_id, category, subcategory, title, description, location, base_price, currency, price_unit, availability_status, max_guests, lead_time_hours, featured, specifications, images, special_offers)
SELECT 
  p.id,
  'aviation',
  'Heavy Jet',
  'Gulfstream G650ER Charter',
  'Ultra-long-range business jet with transcontinental capability. Luxury cabin with full bedroom, shower, and galley.',
  'London, UK',
  45000,
  'USD',
  'per_flight',
  'available',
  16,
  48,
  true,
  '{"Aircraft Type": "Gulfstream G650ER", "Range": "7500 nm", "Passengers": "16", "Luggage Capacity": "195 cu ft", "WiFi": "Yes", "Catering": "Included"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800'],
  'Complimentary ground transportation included'
FROM public.partners p
WHERE p.status = 'approved'
LIMIT 1;

INSERT INTO public.service_inventory (partner_id, category, subcategory, title, description, location, base_price, currency, price_unit, availability_status, max_guests, lead_time_hours, featured, specifications, images)
SELECT 
  p.id,
  'aviation',
  'Light Jet',
  'Citation CJ4 - European Shuttle',
  'Perfect for short European hops. Fast, efficient, and luxuriously appointed.',
  'Paris, France',
  12000,
  'EUR',
  'per_flight',
  'available',
  8,
  24,
  false,
  '{"Aircraft Type": "Cessna Citation CJ4", "Range": "2165 nm", "Passengers": "8", "WiFi": "Yes"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800']
FROM public.partners p
WHERE p.status = 'approved'
LIMIT 1;

-- Yacht Charter
INSERT INTO public.service_inventory (partner_id, category, subcategory, title, description, location, base_price, currency, price_unit, availability_status, max_guests, lead_time_hours, featured, specifications, images, special_offers)
SELECT 
  p.id,
  'yacht',
  'Superyacht',
  'M/Y Serenity - 85m Superyacht',
  'Magnificent superyacht featuring 8 staterooms, helipad, infinity pool, and full spa. Crew of 24 ensures impeccable service.',
  'Monaco',
  350000,
  'EUR',
  'per_day',
  'on_request',
  16,
  168,
  true,
  '{"Length": "85m", "Cabins": "8", "Crew": "24", "Cruising Speed": "15 knots", "Built Year": "2019", "Builder": "Lürssen"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800'],
  'Summer Mediterranean special: 7 nights for the price of 6'
FROM public.partners p
WHERE p.status = 'approved'
LIMIT 1;

INSERT INTO public.service_inventory (partner_id, category, subcategory, title, description, location, base_price, currency, price_unit, availability_status, max_guests, lead_time_hours, featured, specifications, images)
SELECT 
  p.id,
  'yacht',
  'Sailing Yacht',
  'S/Y Azure Dreams - Classic Sailing',
  'Elegant 45m sailing yacht combining classic design with modern amenities. Perfect for intimate Mediterranean adventures.',
  'Sardinia, Italy',
  48000,
  'EUR',
  'per_day',
  'available',
  10,
  72,
  false,
  '{"Length": "45m", "Cabins": "5", "Crew": "8", "Built Year": "2017"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800']
FROM public.partners p
WHERE p.status = 'approved'
LIMIT 1;

-- Luxury Hotels
INSERT INTO public.service_inventory (partner_id, category, subcategory, title, description, location, base_price, currency, price_unit, availability_status, max_guests, lead_time_hours, featured, specifications, images, special_offers)
SELECT 
  p.id,
  'hospitality',
  'Palace Hotel',
  'Royal Suite at The Ritz Paris',
  'The legendary 188 sqm Royal Suite featuring Versailles-inspired décor, private terrace overlooking Place Vendôme, and personal butler.',
  'Paris, France',
  25000,
  'EUR',
  'per_night',
  'limited',
  4,
  24,
  true,
  '{"Room Type": "Royal Suite", "Size (sqm)": "188", "View": "Place Vendôme", "Beds": "King", "Bathrooms": "2", "Star Rating": "5", "Butler Service": "Yes", "Club Access": "Yes"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'],
  'Includes Michelin dining experience'
FROM public.partners p
WHERE p.status = 'approved'
LIMIT 1;

INSERT INTO public.service_inventory (partner_id, category, subcategory, title, description, location, base_price, currency, price_unit, availability_status, max_guests, lead_time_hours, featured, specifications, images)
SELECT 
  p.id,
  'hospitality',
  'Private Villa',
  'Villa Paradiso - Amalfi Coast',
  'Stunning cliff-side villa with infinity pool, private beach access, and dedicated staff. 6 bedrooms with panoramic sea views.',
  'Amalfi, Italy',
  8500,
  'EUR',
  'per_night',
  'seasonal',
  12,
  48,
  true,
  '{"Room Type": "Private Villa", "Size (sqm)": "650", "View": "Sea", "Beds": "6 King Suites", "Bathrooms": "7", "Star Rating": "5", "Butler Service": "Yes"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800']
FROM public.partners p
WHERE p.status = 'approved'
LIMIT 1;

INSERT INTO public.service_inventory (partner_id, category, subcategory, title, description, location, base_price, currency, price_unit, availability_status, max_guests, lead_time_hours, featured, specifications, images)
SELECT 
  p.id,
  'hospitality',
  'Ski Chalet',
  'Chalet Zermatt Peak',
  'Ultimate ski-in ski-out chalet with Matterhorn views. Private spa, indoor pool, and dedicated chef.',
  'Zermatt, Switzerland',
  15000,
  'CHF',
  'per_night',
  'available',
  14,
  72,
  false,
  '{"Room Type": "Chalet", "Size (sqm)": "1200", "View": "Matterhorn", "Beds": "7 Suites", "Star Rating": "5", "Butler Service": "Yes"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=800']
FROM public.partners p
WHERE p.status = 'approved'
LIMIT 1;

-- Private Dining
INSERT INTO public.service_inventory (partner_id, category, subcategory, title, description, location, base_price, currency, price_unit, availability_status, max_guests, lead_time_hours, featured, specifications, images, special_offers)
SELECT 
  p.id,
  'dining',
  'Private Chef',
  'Chef Massimo - Private Dining Experience',
  'Three Michelin-starred Chef Massimo Bottura''s protégé brings exceptional Italian cuisine to your residence or yacht.',
  'Flexible',
  2500,
  'EUR',
  'per_person',
  'on_request',
  20,
  72,
  true,
  '{"Cuisine": "Modern Italian", "Michelin Stars": "Trained by 3-star", "Courses": "10-course tasting", "Dietary Options": "All accommodated", "Wine Pairing": "Optional"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
  'Wine pairing with rare vintages available'
FROM public.partners p
WHERE p.status = 'approved'
LIMIT 1;

-- Exclusive Events
INSERT INTO public.service_inventory (partner_id, category, subcategory, title, description, location, base_price, currency, price_unit, availability_status, max_guests, lead_time_hours, featured, specifications, images)
SELECT 
  p.id,
  'events',
  'Fashion Week',
  'Paris Fashion Week - Front Row Access',
  'Exclusive front row seats at top designers shows including Chanel, Dior, and Louis Vuitton. Includes after-party access.',
  'Paris, France',
  75000,
  'EUR',
  'per_service',
  'limited',
  2,
  336,
  true,
  '{"Event Type": "Fashion Week", "Access Level": "Front Row + Backstage", "Includes": "5 Shows + After-parties", "Dress Code": "Black Tie", "Duration": "3 Days"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800']
FROM public.partners p
WHERE p.status = 'approved'
LIMIT 1;

-- Security Services
INSERT INTO public.service_inventory (partner_id, category, subcategory, title, description, location, base_price, currency, price_unit, availability_status, max_guests, lead_time_hours, featured, specifications, images)
SELECT 
  p.id,
  'security',
  'Executive Protection',
  'Elite Close Protection Team',
  'Former SAS and Secret Service operatives providing discrete 24/7 executive protection for high-profile individuals.',
  'Global',
  5000,
  'USD',
  'per_day',
  'available',
  1,
  24,
  false,
  '{"Team Size": "2-6 operators", "Languages": "English, French, Arabic, Mandarin", "Vehicle Type": "Armored available", "Armed/Unarmed": "Jurisdiction dependent", "Experience": "15+ years average"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800']
FROM public.partners p
WHERE p.status = 'approved'
LIMIT 1;

-- Wellness
INSERT INTO public.service_inventory (partner_id, category, subcategory, title, description, location, base_price, currency, price_unit, availability_status, max_guests, lead_time_hours, featured, specifications, images, special_offers)
SELECT 
  p.id,
  'wellness',
  'Wellness Retreat',
  'Aman Wellness Immersion',
  'Seven-day transformative wellness program combining ancient healing traditions with modern science. Includes private consultations, treatments, and personalized nutrition.',
  'Aman Tokyo, Japan',
  35000,
  'USD',
  'per_session',
  'available',
  2,
  168,
  true,
  '{"Treatment Type": "Holistic Wellness", "Duration": "7 Days", "Therapist": "Master practitioners", "Products Used": "Aman Skincare", "Package": "All-inclusive"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'],
  'Includes airport transfers and dedicated wellness concierge'
FROM public.partners p
WHERE p.status = 'approved'
LIMIT 1;

-- Luxury Automotive
INSERT INTO public.service_inventory (partner_id, category, subcategory, title, description, location, base_price, currency, price_unit, availability_status, max_guests, lead_time_hours, featured, specifications, images)
SELECT 
  p.id,
  'automotive',
  'Supercar',
  'Ferrari SF90 Stradale - Weekend Rental',
  'Experience Ferrari''s most powerful road car. 1000hp hybrid hypercar available for self-drive or chauffeur.',
  'Dubai, UAE',
  3500,
  'USD',
  'per_day',
  'available',
  2,
  24,
  true,
  '{"Make": "Ferrari", "Model": "SF90 Stradale", "Year": "2023", "Engine": "V8 Hybrid 1000hp", "Transmission": "8-speed DCT", "Mileage Limit": "200km/day"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800']
FROM public.partners p
WHERE p.status = 'approved'
LIMIT 1;

-- Real Estate
INSERT INTO public.service_inventory (partner_id, category, subcategory, title, description, location, base_price, currency, price_unit, availability_status, max_guests, lead_time_hours, featured, specifications, images)
SELECT 
  p.id,
  'real_estate',
  'Seasonal Rental',
  'Penthouse at One Hyde Park',
  'London''s most exclusive address. 6-bedroom penthouse with 360° views, private cinema, and wine cellar. Staff included.',
  'London, UK',
  150000,
  'GBP',
  'per_service',
  'on_request',
  12,
  168,
  true,
  '{"Property Type": "Penthouse", "Size": "10,000 sqft", "Bedrooms": "6", "Location": "Knightsbridge", "View": "Hyde Park + City", "Amenities": "Pool, Spa, Cinema, Gym"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800']
FROM public.partners p
WHERE p.status = 'approved'
LIMIT 1;

-- Art & Collectibles
INSERT INTO public.service_inventory (partner_id, category, subcategory, title, description, location, base_price, currency, price_unit, availability_status, max_guests, lead_time_hours, featured, specifications, images)
SELECT 
  p.id,
  'art_collectibles',
  'Contemporary Art',
  'Private Art Advisory - Collection Building',
  'Personalized art advisory service with access to off-market works from blue-chip artists. Includes provenance research and installation.',
  'Global',
  50000,
  'USD',
  'per_service',
  'available',
  1,
  48,
  false,
  '{"Artist": "Multiple", "Period": "Contemporary", "Medium": "Mixed", "Provenance": "Full documentation", "Authentication": "Included", "Insurance": "Arranged"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800']
FROM public.partners p
WHERE p.status = 'approved'
LIMIT 1;

-- Technology
INSERT INTO public.service_inventory (partner_id, category, subcategory, title, description, location, base_price, currency, price_unit, availability_status, max_guests, lead_time_hours, featured, specifications, images)
SELECT 
  p.id,
  'technology',
  'Smart Home',
  'Complete Smart Home Integration',
  'Full home automation with Crestron, Lutron, and bespoke AI integration. Voice control, security, climate, and entertainment.',
  'Global',
  250000,
  'USD',
  'per_service',
  'available',
  1,
  72,
  false,
  '{"Service Type": "Smart Home", "Coverage": "Whole Property", "Support Level": "24/7 Priority", "Integration": "All Major Platforms", "Training": "Full staff training included"}'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1558002038-1055907df827?w=800']
FROM public.partners p
WHERE p.status = 'approved'
LIMIT 1;