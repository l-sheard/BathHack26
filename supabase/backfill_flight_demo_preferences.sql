begin;

-- Backfill preferences for EVERY participant in the flight demo trip.
-- Run this in Supabase SQL Editor if people have joined but do not yet have saved preferences.

with target_trip as (
  select id, start_date, end_date
  from trips
  where id = '77777777-7777-7777-7777-777777777777' or share_code = 'FLIGHT26'
  order by created_at asc
  limit 1
), missing_preferences as (
  select
    p.id as participant_id,
    p.trip_id,
    p.name,
    row_number() over (order by p.joined_at, p.id) as rn,
    t.start_date,
    t.end_date
  from trip_participants p
  join target_trip t on t.id = p.trip_id
  left join participant_preferences pref on pref.participant_id = p.id
  where pref.id is null
), inserted_preferences as (
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
  select
    gen_random_uuid(),
    mp.trip_id,
    mp.participant_id,
    4,
    'Auto-generated defaults for demo testing',
    case
      when mp.rn % 3 = 1 then 'London Heathrow (LHR)'
      when mp.rn % 3 = 2 then 'Manchester Airport (MAN)'
      else 'Bristol Airport (BRS)'
    end,
    case
      when mp.rn % 3 = 1 then array['London Gatwick (LGW)']::text[]
      when mp.rn % 3 = 2 then array['Leeds Bradford (LBA)']::text[]
      else array['Birmingham Airport (BHX)']::text[]
    end,
    8,
    case when mp.rn % 3 = 0 then 'either' else 'plane' end,
    900,
    case
      when mp.rn % 3 = 1 then array['city','culture','nightlife']::text[]
      when mp.rn % 3 = 2 then array['beach','relaxation','culture']::text[]
      else array['nature','adventure','relaxation']::text[]
    end,
    '{"ground_floor":false,"lift_access":false,"step_free_access":false,"wheelchair_accessible":false,"accessible_bathroom":false,"reduced_walking":false,"close_to_public_transport":true,"notes":""}'::jsonb,
    '{"vegetarian":false,"vegan":false,"halal":false,"kosher":false,"gluten_free":false,"dairy_free":false,"nut_allergy":false,"notes":""}'::jsonb,
    '{"prefer_train_over_plane":false,"willing_longer_for_lower_emissions":false,"prefer_eco_accommodation":false,"sustainable_activities":false}'::jsonb,
    'British',
    'United Kingdom',
    null
  from missing_preferences mp
  returning id, trip_id
)
insert into availability_windows (participant_preference_id, start_date, end_date)
select
  ip.id,
  coalesce(t.start_date, (now() + interval '14 day')::date),
  coalesce(t.end_date, (coalesce(t.start_date, (now() + interval '14 day')::date) + interval '4 day')::date)
from inserted_preferences ip
join trips t on t.id = ip.trip_id;

-- Ensure all existing preferences in the trip have at least one availability window.
with target_trip as (
  select id, start_date, end_date
  from trips
  where id = '77777777-7777-7777-7777-777777777777' or share_code = 'FLIGHT26'
  order by created_at asc
  limit 1
)
insert into availability_windows (participant_preference_id, start_date, end_date)
select
  pref.id,
  coalesce(t.start_date, (now() + interval '14 day')::date),
  coalesce(t.end_date, (coalesce(t.start_date, (now() + interval '14 day')::date) + interval '4 day')::date)
from participant_preferences pref
join target_trip t on t.id = pref.trip_id
left join availability_windows aw on aw.participant_preference_id = pref.id
where aw.id is null;

commit;
