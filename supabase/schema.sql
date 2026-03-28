create extension if not exists "pgcrypto";

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date,
  end_date date,
  share_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists trip_participants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  email text,
  role text not null default 'participant',
  joined_at timestamptz not null default now()
);
create index if not exists idx_trip_participants_trip_id on trip_participants(trip_id);

create table if not exists participant_preferences (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  participant_id uuid not null unique references trip_participants(id) on delete cascade,
  preferred_trip_length int not null,
  flexibility_notes text,
  departure_location text not null,
  alternative_locations text[] not null default '{}',
  max_travel_time_hours int not null,
  transport_preference text not null check (transport_preference in ('plane', 'train', 'either')),
  total_budget numeric(10,2) not null,
  trip_preferences text[] not null default '{}',
  accessibility jsonb not null default '{}'::jsonb,
  dietary jsonb not null default '{}'::jsonb,
  sustainability jsonb not null default '{}'::jsonb,
  passport_nationality text not null,
  residence_country text not null,
  visa_notes text,
  updated_at timestamptz not null default now()
);
create index if not exists idx_participant_preferences_trip on participant_preferences(trip_id);

create table if not exists availability_windows (
  id uuid primary key default gen_random_uuid(),
  participant_preference_id uuid not null references participant_preferences(id) on delete cascade,
  start_date date not null,
  end_date date not null
);
create index if not exists idx_availability_pref on availability_windows(participant_preference_id);

create table if not exists trip_options (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  option_rank int not null check (option_rank between 1 and 3),
  theme text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  summary text not null,
  rationale text not null,
  estimated_total numeric(10,2) not null,
  estimated_per_person numeric(10,2) not null,
  image_url text,
  tradeoffs text[] not null default '{}',
  validation_notes text[] not null default '{}',
  budget_breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (trip_id, option_rank)
);
create index if not exists idx_trip_options_trip on trip_options(trip_id);

create table if not exists transport_plans (
  id uuid primary key default gen_random_uuid(),
  trip_option_id uuid not null references trip_options(id) on delete cascade,
  participant_id uuid not null references trip_participants(id) on delete cascade,
  mode text not null check (mode in ('plane', 'train')),
  departure text not null,
  duration_hours numeric(5,2) not null,
  details text not null,
  estimated_cost numeric(10,2) not null,
  emissions_level text not null check (emissions_level in ('low', 'medium', 'high'))
);
create index if not exists idx_transport_option on transport_plans(trip_option_id);

create table if not exists accommodation_options (
  id uuid primary key default gen_random_uuid(),
  trip_option_id uuid not null references trip_options(id) on delete cascade,
  name text not null,
  description text not null,
  nightly_cost numeric(10,2) not null,
  accessibility_features text[] not null default '{}',
  eco_rating int not null
);
create index if not exists idx_accommodation_option on accommodation_options(trip_option_id);

create table if not exists restaurant_recommendations (
  id uuid primary key default gen_random_uuid(),
  trip_option_id uuid not null references trip_options(id) on delete cascade,
  name text not null,
  cuisine text not null,
  price_band text not null,
  dietary_tags text[] not null default '{}',
  explanation text not null,
  estimated_cost_pp numeric(10,2) not null
);
create index if not exists idx_restaurants_option on restaurant_recommendations(trip_option_id);

create table if not exists visa_assessments (
  id uuid primary key default gen_random_uuid(),
  trip_option_id uuid not null references trip_options(id) on delete cascade,
  nationality text not null,
  outcome text not null check (outcome in ('visa_free', 'evisa', 'check_required')),
  summary text not null
);
create index if not exists idx_visa_option on visa_assessments(trip_option_id);

create table if not exists itinerary_days (
  id uuid primary key default gen_random_uuid(),
  trip_option_id uuid not null references trip_options(id) on delete cascade,
  day_number int not null,
  title text not null,
  description text not null,
  activity_type text not null,
  is_sustainable boolean not null default false,
  accessibility_level text not null check (accessibility_level in ('high', 'medium', 'low')),
  estimated_cost numeric(10,2) not null
);
create index if not exists idx_itinerary_option on itinerary_days(trip_option_id);

create table if not exists activity_recommendations (
  id uuid primary key default gen_random_uuid(),
  trip_option_id uuid not null references trip_options(id) on delete cascade,
  title text not null,
  category text not null,
  sustainability_score int not null,
  accessibility_notes text
);
create index if not exists idx_activity_option on activity_recommendations(trip_option_id);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  participant_id uuid not null references trip_participants(id) on delete cascade,
  trip_option_id uuid not null references trip_options(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(trip_id, participant_id)
);
create index if not exists idx_votes_trip on votes(trip_id);

create table if not exists booking_progress (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  participant_id uuid not null references trip_participants(id) on delete cascade,
  transport_booked boolean not null default false,
  accommodation_booked boolean not null default false,
  visa_arranged boolean not null default false,
  insurance_arranged boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(trip_id, participant_id)
);
create index if not exists idx_booking_trip on booking_progress(trip_id);
