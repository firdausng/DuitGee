-- Fix expense dates and audit timestamps to use UTC format instead of timezone offset
-- This migration converts dates from format '2025-09-30T16:04:00+08:00' to '2025-09-30T08:04:00.000Z'
--
-- IMPORTANT: This script assumes dates with +08:00 offset (Asia/Singapore timezone)
-- Adjust the offset if your dates use a different timezone

-- Backup the original dates (optional - comment out if not needed)
-- CREATE TABLE expenses_date_backup AS
-- SELECT id, date, createdAt, updatedAt FROM expenses WHERE date LIKE '%+%';

-- Convert expense dates with +08:00 timezone to UTC
-- SQLite's datetime() function automatically handles ISO 8601 with timezone
UPDATE expenses
SET date = datetime(substr(date, 1, 19), substr(date, 20)) || 'Z'
WHERE date LIKE '%+__:__';

-- Convert createdAt timestamps to UTC
UPDATE expenses
SET createdAt = datetime(substr(createdAt, 1, 19), substr(createdAt, 20)) || 'Z'
WHERE createdAt LIKE '%+__:__';

-- Convert updatedAt timestamps to UTC
UPDATE expenses
SET updatedAt = datetime(substr(updatedAt, 1, 19), substr(updatedAt, 20)) || 'Z'
WHERE updatedAt LIKE '%+__:__';

-- Fix other tables that use audit fields
-- Categories
UPDATE categories
SET createdAt = datetime(substr(createdAt, 1, 19), substr(createdAt, 20)) || 'Z'
WHERE createdAt LIKE '%+__:__';

UPDATE categories
SET updatedAt = datetime(substr(updatedAt, 1, 19), substr(updatedAt, 20)) || 'Z'
WHERE updatedAt LIKE '%+__:__';

-- Category Groups
UPDATE category_groups
SET createdAt = datetime(substr(createdAt, 1, 19), substr(createdAt, 20)) || 'Z'
WHERE createdAt LIKE '%+__:__';

UPDATE category_groups
SET updatedAt = datetime(substr(updatedAt, 1, 19), substr(updatedAt, 20)) || 'Z'
WHERE updatedAt LIKE '%+__:__';

-- Vaults
UPDATE vaults
SET createdAt = datetime(substr(createdAt, 1, 19), substr(createdAt, 20)) || 'Z'
WHERE createdAt LIKE '%+__:__';

UPDATE vaults
SET updatedAt = datetime(substr(updatedAt, 1, 19), substr(updatedAt, 20)) || 'Z'
WHERE updatedAt LIKE '%+__:__';

-- Vault Members
UPDATE vault_members
SET createdAt = datetime(substr(createdAt, 1, 19), substr(createdAt, 20)) || 'Z'
WHERE createdAt LIKE '%+__:__';

UPDATE vault_members
SET updatedAt = datetime(substr(updatedAt, 1, 19), substr(updatedAt, 20)) || 'Z'
WHERE updatedAt LIKE '%+__:__';

-- Verify the changes
SELECT
    'Expenses' as table_name,
    COUNT(*) as total_fixed
FROM expenses
WHERE date LIKE '%Z' OR createdAt LIKE '%Z' OR updatedAt LIKE '%Z'

UNION ALL

SELECT
    'Categories' as table_name,
    COUNT(*) as total_fixed
FROM categories
WHERE createdAt LIKE '%Z' OR updatedAt LIKE '%Z'

UNION ALL

SELECT
    'Category Groups' as table_name,
    COUNT(*) as total_fixed
FROM category_groups
WHERE createdAt LIKE '%Z' OR updatedAt LIKE '%Z'

UNION ALL

SELECT
    'Vaults' as table_name,
    COUNT(*) as total_fixed
FROM vaults
WHERE createdAt LIKE '%Z' OR updatedAt LIKE '%Z';

-- Show sample of fixed expenses
SELECT
    id,
    date,
    createdAt,
    updatedAt,
    'Fixed to UTC' as status
FROM expenses
ORDER BY createdAt DESC
LIMIT 5;
