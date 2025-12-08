-- Update expenses with null or empty category to "Others"
-- This ensures all expenses have a valid category

UPDATE expenses
SET category_id = 'Others'
WHERE category_id IS NULL OR category_id = '';

-- Verify the update
SELECT COUNT(*) as updated_count
FROM expenses
WHERE category_id = 'Others';
