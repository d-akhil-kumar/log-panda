-- PostgreSQL initialization script for log-panda database
-- This script creates the logs table and related objects

-- Create the log_level enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE log_level AS ENUM ('INFO', 'WARN', 'ERROR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_name VARCHAR(255) NOT NULL,
    level log_level NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP NULL,
    context JSONB NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_logs_app_name ON logs (app_name);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs (level);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs (timestamp);

-- Create a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_logs_app_level_created ON logs (app_name, level, created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE logs IS 'Table to store application logs from various services';
COMMENT ON COLUMN logs.id IS 'Unique identifier for each log entry';
COMMENT ON COLUMN logs.app_name IS 'Name of the application that generated the log';
COMMENT ON COLUMN logs.level IS 'Log level (INFO, WARN, ERROR)';
COMMENT ON COLUMN logs.message IS 'Log message content';
COMMENT ON COLUMN logs.timestamp IS 'Optional timestamp from the log source';
COMMENT ON COLUMN logs.context IS 'Additional context data in JSON format';
COMMENT ON COLUMN logs.created_at IS 'Timestamp when the log was inserted into the database';
