begin;

-- Reset a predictable demo trip for quick flight-generation testing.
-- Run this file in Supabase SQL editor after schema.sql.

delete from booking_progress
where trip_id = '77777777-7777-7777-7777-777777777777';

delete from availability_windows
where participant_preference_id in (
  '99999999-9999-9999-9999-999999999991',
  '99999999-9999-9999-9999-999999999992',
  '99999999-9999-9999-9999-999999999993'
);

delete from participant_preferences
where id in (
  '99999999-9999-9999-9999-999999999991',
  '99999999-9999-9999-9999-999999999992',
  '99999999-9999-9999-9999-999999999993'
);

delete from trip_participants
where trip_id = '77777777-7777-7777-7777-777777777777';

delete from trip_options
where trip_id = '77777777-7777-7777-7777-777777777777';

delete from trips
where id = '77777777-7777-7777-7777-777777777777';

insert into trips (id, name, description, start_date, end_date, share_code)
values (
  '77777777-7777-7777-7777-777777777777',
  'Flight Demo Group Trip',
  'Ready-to-test trip with saved preferences for live flight generation.',
  '2026-07-10',
  '2026-07-14',
  'FLIGHT26'
);

insert into trip_participants (id, trip_id, name, email)
values
  ('88888888-8888-8888-8888-888888888881', '77777777-7777-7777-7777-777777777777', 'Alex', 'alex@example.com'),
  ('88888888-8888-8888-8888-888888888882', '77777777-7777-7777-7777-777777777777', 'Sam', 'sam@example.com'),
  ('88888888-8888-8888-8888-888888888883', '77777777-7777-7777-7777-777777777777', 'Riya', 'riya@example.com');

insert into participant_preferences (
  id,
  trip_id,
  participant_id,
  preferred_trip_length,
  flexibility_notes,
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
  residence_country,
  visa_notes
)
values
  (
    '99999999-9999-9999-9999-999999999991',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888881',
    4,
    'Can shift by one day if needed',
    'London Heathrow (LHR)',
    '{London Gatwick (LGW)}',
    9,
    'plane',
    950,
    '{city,culture,nightlife}',
    '{"step_free_access":true,"close_to_public_transport":true}'::jsonb,
    '{"vegetarian":true}'::jsonb,
    '{"prefer_train_over_plane":false,"willing_longer_for_lower_emissions":false,"prefer_eco_accommodation":true,"sustainable_activities":true}'::jsonb,
    'British',
    'United Kingdom',
    null
  ),
  (
    '99999999-9999-9999-9999-999999999992',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888882',
    4,
    null,
    'Manchester Airport (MAN)',
    '{Leeds Bradford (LBA)}',
    8,
    'plane',
    900,
    '{beach,relaxation,culture}',
    '{"lift_access":true}'::jsonb,
    '{"halal":true}'::jsonb,
    '{"prefer_train_over_plane":false,"willing_longer_for_lower_emissions":false,"prefer_eco_accommodation":false,"sustainable_activities":false}'::jsonb,
    'British',
    'United Kingdom',
    null
  ),
  (
    '99999999-9999-9999-9999-999999999993',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888883',
    4,
    null,
    'Bristol Airport (BRS)',
    '{Birmingham Airport (BHX)}',
    8,
    'either',
    850,
    '{nature,adventure,relaxation}',
    '{"reduced_walking":false}'::jsonb,
    '{"gluten_free":true}'::jsonb,
    '{"prefer_train_over_plane":false,"willing_longer_for_lower_emissions":false,"prefer_eco_accommodation":false,"sustainable_activities":false}'::jsonb,
    'Irish',
    'Ireland',
    null
  );

insert into availability_windows (participant_preference_id, start_date, end_date)
values
  ('99999999-9999-9999-9999-999999999991', '2026-07-10', '2026-07-16'),
  ('99999999-9999-9999-9999-999999999992', '2026-07-10', '2026-07-15'),
  ('99999999-9999-9999-9999-999999999993', '2026-07-09', '2026-07-14');

insert into booking_progress (trip_id, participant_id, transport_booked, accommodation_booked, visa_arranged, insurance_arranged)
values
  ('77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888881', false, false, false, false),
  ('77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888882', false, false, false, false),
  ('77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888883', false, false, false, false)
on conflict (trip_id, participant_id) do update set
  transport_booked = excluded.transport_booked,
  accommodation_booked = excluded.accommodation_booked,
  visa_arranged = excluded.visa_arranged,
  insurance_arranged = excluded.insurance_arranged;

commit;
