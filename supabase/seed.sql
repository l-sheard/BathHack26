-- Demo trip with participants and preferences
insert into trips (id, name, description, start_date, end_date, share_code)
values (
  '11111111-1111-1111-1111-111111111111',
  'Hack Weekend Escape',
  'Demo group trip for MVP walkthrough',
  '2026-06-12',
  '2026-06-16',
  'DEMO2026'
)
on conflict (id) do nothing;

insert into trip_participants (id, trip_id, name, email)
values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Traveler One', 'traveler.one@example.com'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Traveler Two', 'traveler.two@example.com'),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Traveler Three', 'traveler.three@example.com')
on conflict (id) do nothing;

insert into participant_preferences (
  id,
  trip_id,
  participant_id,
  preferred_trip_length,
  departure_location,
  alternative_locations,
  max_travel_time_hours,
  transport_preference,
  total_budget,
  trip_preferences,
  accessibility,
  dietary,
  sustainability,
  passport_nationality,
  residence_country
)
values
  (
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    4,
    'London Heathrow',
    '{London Gatwick}',
    8,
    'either',
    900,
    '{city,culture,relaxation}',
    '{"step_free_access":true,"close_to_public_transport":true}'::jsonb,
    '{"vegetarian":true}'::jsonb,
    '{"prefer_train_over_plane":true,"willing_longer_for_lower_emissions":true,"prefer_eco_accommodation":true,"sustainable_activities":true}'::jsonb,
    'British',
    'United Kingdom'
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    4,
    'Bristol Temple Meads',
    '{London Paddington}',
    10,
    'train',
    750,
    '{nature,adventure,culture}',
    '{"reduced_walking":true}'::jsonb,
    '{"halal":true,"nut_allergy":true}'::jsonb,
    '{"prefer_train_over_plane":true,"willing_longer_for_lower_emissions":true,"prefer_eco_accommodation":false,"sustainable_activities":true}'::jsonb,
    'British',
    'United Kingdom'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222223',
    4,
    'Manchester Airport',
    '{Liverpool Lime Street}',
    7,
    'plane',
    850,
    '{beach,nightlife,relaxation}',
    '{"lift_access":true}'::jsonb,
    '{"gluten_free":true,"dairy_free":true}'::jsonb,
    '{"prefer_train_over_plane":false,"willing_longer_for_lower_emissions":false,"prefer_eco_accommodation":false,"sustainable_activities":false}'::jsonb,
    'Irish',
    'Ireland'
  )
on conflict (id) do nothing;

insert into availability_windows (participant_preference_id, start_date, end_date)
values
  ('33333333-3333-3333-3333-333333333331', '2026-06-12', '2026-06-17'),
  ('33333333-3333-3333-3333-333333333332', '2026-06-11', '2026-06-16'),
  ('33333333-3333-3333-3333-333333333333', '2026-06-12', '2026-06-16')
on conflict do nothing;

insert into booking_progress (trip_id, participant_id, transport_booked, accommodation_booked, visa_arranged, insurance_arranged)
values
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', true, false, false, true),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', false, false, false, false),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222223', true, true, false, false)
on conflict (trip_id, participant_id) do nothing;
