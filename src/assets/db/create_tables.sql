-- Cars table
CREATE TABLE cars (
    uid UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    game_id VARCHAR(255) NOT NULL
);

-- Drivers table
CREATE TABLE drivers (
    uid UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    game VARCHAR(50) NOT NULL
);

-- Tracks table
CREATE TABLE tracks (
    uid UUID PRIMARY KEY,
    game_id VARCHAR(255),
    track VARCHAR(255) NOT NULL,
    game VARCHAR(50) NOT NULL,
    variants JSONB NOT NULL
);

-- Times table (laptimes)
CREATE TABLE times (
    uid UUID PRIMARY KEY,
    date VARCHAR(50) NOT NULL,
    car_id UUID NOT NULL,
    braking_line BOOLEAN NOT NULL DEFAULT false,
    controls VARCHAR(50) NOT NULL,
    date_string VARCHAR(20) NOT NULL,
    driver_id UUID NOT NULL,
    game VARCHAR(50) NOT NULL,
    laptime VARCHAR(20) NOT NULL,
    notes TEXT,
    start_type VARCHAR(50) NOT NULL,
    track_id UUID NOT NULL,
    track_variant VARCHAR(100),
    transmission VARCHAR(50) NOT NULL,
    weather VARCHAR(50) NOT NULL,
    
    -- Foreign key constraints
    CONSTRAINT fk_times_car FOREIGN KEY (car_id) REFERENCES cars(uid) ON DELETE CASCADE,
    CONSTRAINT fk_times_driver FOREIGN KEY (driver_id) REFERENCES drivers(uid) ON DELETE CASCADE,
    CONSTRAINT fk_times_track FOREIGN KEY (track_id) REFERENCES tracks(uid) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX idx_times_car ON times(car_id);
CREATE INDEX idx_times_driver ON times(driver_id);
CREATE INDEX idx_times_track ON times(track_id);
CREATE INDEX idx_times_date ON times(date);
CREATE INDEX idx_times_game ON times(game);