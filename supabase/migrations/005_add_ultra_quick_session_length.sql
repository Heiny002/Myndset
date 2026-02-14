-- Migration: Add ultra_quick to session_length enum
-- Date: 2026-01-28
-- Description: Adds 1-minute "ultra_quick" option for short, punchy motivational scripts

-- Add 'ultra_quick' to the session_length enum
ALTER TYPE session_length ADD VALUE IF NOT EXISTS 'ultra_quick';

-- Note: In PostgreSQL, you can't reorder enum values after they're created.
-- The new value will be appended to the end of the enum, but this doesn't
-- affect functionality - it only affects the internal storage order.
-- If you need a specific order, you would need to:
-- 1. Create a new enum with all values in desired order
-- 2. Migrate the column to the new enum type
-- 3. Drop the old enum

-- For our purposes, the append order is fine since we're just adding a new option.
