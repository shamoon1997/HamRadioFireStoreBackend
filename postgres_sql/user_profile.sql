CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  call_sign TEXT,
  country TEXT,
  state TEXT,
  city TEXT,
  address TEXT,
  email TEXT,
  phone_number TEXT,
  grid_square TEXT,
  bio TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  cq_zone TEXT,
  itu_zone TEXT,
  timestamp TIMESTAMP
);
