-- First, check if there are any users in the system
-- Replace 'your_user_id_here' with an actual user ID from your users table

-- To find your user ID, run this first:
-- SELECT id, email, name FROM users LIMIT 1;

-- Then replace 'your_user_id_here' below with the actual ID

-- Insert Category Groups
INSERT INTO category_groups (name, description, color, icon, icon_type, user_id) VALUES
('Housing & Utilities', 'Home-related expenses including rent, utilities, and maintenance', '#3B82F6', 'house', 'phosphor', 'your_user_id_here'),
('Transportation', 'Vehicle and travel-related expenses', '#F59E0B', 'car', 'phosphor', 'your_user_id_here'),
('Food & Groceries', 'Food, dining, and grocery expenses', '#10B981', 'hamburger', 'phosphor', 'your_user_id_here'),
('Health & Wellness', 'Healthcare, fitness, and wellness expenses', '#EF4444', 'heart', 'phosphor', 'your_user_id_here'),
('Education & Personal Development', 'Learning, courses, and educational expenses', '#8B5CF6', 'book', 'phosphor', 'your_user_id_here'),
('Bills & Subscriptions', 'Recurring bills and subscription services', '#EC4899', 'lightning', 'phosphor', 'your_user_id_here'),
('Family & Children', 'Family and child-related expenses', '#06B6D4', 'baby', 'phosphor', 'your_user_id_here'),
('Debt & Savings', 'Loan payments, savings, and investments', '#84CC16', 'currency-dollar', 'phosphor', 'your_user_id_here'),
('Insurance', 'Insurance premiums and coverage', '#6B7280', 'shield', 'phosphor', 'your_user_id_here'),
('Leisure & Entertainment', 'Entertainment, hobbies, and leisure activities', '#F97316', 'gamepad', 'phosphor', 'your_user_id_here'),
('Shopping & Personal Care', 'Personal shopping and care items', '#DB2777', 'shopping-cart', 'phosphor', 'your_user_id_here');

-- Get the group IDs for inserting categories
-- Note: You'll need to run this after inserting groups to get their generated IDs
-- SELECT id, name FROM category_groups WHERE user_id = 'your_user_id_here' ORDER BY created_at;

-- Example for Housing & Utilities categories (replace group_id_here with actual ID):
-- INSERT INTO categories (name, color, icon, icon_type, group_id, user_id) VALUES
-- ('Rent / Mortgage', '#3B82F6', 'house', 'phosphor', 'group_id_here', 'your_user_id_here'),
-- ('Electricity', '#F59E0B', 'lightning', 'phosphor', 'group_id_here', 'your_user_id_here'),
-- ('Water', '#06B6D4', 'drop', 'phosphor', 'group_id_here', 'your_user_id_here'),
-- ('Gas', '#F97316', 'flame', 'phosphor', 'group_id_here', 'your_user_id_here'),
-- ('Internet & Phone', '#8B5CF6', 'wifi-high', 'phosphor', 'group_id_here', 'your_user_id_here'),
-- ('Maintenance / Repairs', '#6B7280', 'wrench', 'phosphor', 'group_id_here', 'your_user_id_here');