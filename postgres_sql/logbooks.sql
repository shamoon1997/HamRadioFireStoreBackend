CREATE TABLE IF NOT EXISTS logbooks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT,
    contact_count INTEGER,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    last_contact_time TIMESTAMP,
    created_at TIMESTAMP,
    my_antenna TEXT,
    my_radio TEXT,
    last_contact_timestamp TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);
