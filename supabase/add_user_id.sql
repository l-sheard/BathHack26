alter table trips
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table trip_participants
  add column if not exists user_id uuid references auth.users(id) on delete set null;
