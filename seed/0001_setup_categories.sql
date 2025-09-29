-- Setup Category Groups and Categories
-- Note: Replace 'USER_ID_HERE' with actual user ID when running

-- Insert Category Groups
INSERT INTO category_groups (id, name, description, color, icon, icon_type, user_id, created_at) VALUES
('cuid_housing_utilities', 'Housing & Utilities', 'Home-related expenses including rent, utilities, and maintenance', '#3B82F6', 'house', 'phosphor', 'USER_ID_HERE', datetime('now')),
('cuid_transportation', 'Transportation', 'Vehicle and travel-related expenses', '#F59E0B', 'car', 'phosphor', 'USER_ID_HERE', datetime('now')),
('cuid_food_groceries', 'Food & Groceries', 'Food, dining, and grocery expenses', '#10B981', 'hamburger', 'phosphor', 'USER_ID_HERE', datetime('now')),
('cuid_health_wellness', 'Health & Wellness', 'Healthcare, fitness, and wellness expenses', '#EF4444', 'heart', 'phosphor', 'USER_ID_HERE', datetime('now')),
('cuid_education', 'Education & Personal Development', 'Learning, courses, and educational expenses', '#8B5CF6', 'book', 'phosphor', 'USER_ID_HERE', datetime('now')),
('cuid_bills_subscriptions', 'Bills & Subscriptions', 'Recurring bills and subscription services', '#EC4899', 'lightning', 'phosphor', 'USER_ID_HERE', datetime('now')),
('cuid_family_children', 'Family & Children', 'Family and child-related expenses', '#06B6D4', 'baby', 'phosphor', 'USER_ID_HERE', datetime('now')),
('cuid_debt_savings', 'Debt & Savings', 'Loan payments, savings, and investments', '#84CC16', 'currency-dollar', 'phosphor', 'USER_ID_HERE', datetime('now')),
('cuid_insurance', 'Insurance', 'Insurance premiums and coverage', '#6B7280', 'shield', 'phosphor', 'USER_ID_HERE', datetime('now')),
('cuid_leisure_entertainment', 'Leisure & Entertainment', 'Entertainment, hobbies, and leisure activities', '#F97316', 'gamepad', 'phosphor', 'USER_ID_HERE', datetime('now')),
('cuid_shopping_personal', 'Shopping & Personal Care', 'Personal shopping and care items', '#DB2777', 'shopping-cart', 'phosphor', 'USER_ID_HERE', datetime('now'));

-- Insert Categories for Housing & Utilities
INSERT INTO categories (id, name, color, icon, icon_type, group_id, user_id, created_at) VALUES
('cuid_rent_mortgage', 'Rent / Mortgage', '#3B82F6', 'house', 'phosphor', 'cuid_housing_utilities', 'USER_ID_HERE', datetime('now')),
('cuid_electricity', 'Electricity', '#F59E0B', 'lightning', 'phosphor', 'cuid_housing_utilities', 'USER_ID_HERE', datetime('now')),
('cuid_water', 'Water', '#06B6D4', 'drop', 'phosphor', 'cuid_housing_utilities', 'USER_ID_HERE', datetime('now')),
('cuid_gas', 'Gas', '#F97316', 'flame', 'phosphor', 'cuid_housing_utilities', 'USER_ID_HERE', datetime('now')),
('cuid_internet_phone', 'Internet & Phone', '#8B5CF6', 'wifi-high', 'phosphor', 'cuid_housing_utilities', 'USER_ID_HERE', datetime('now')),
('cuid_maintenance_repairs', 'Maintenance / Repairs', '#6B7280', 'wrench', 'phosphor', 'cuid_housing_utilities', 'USER_ID_HERE', datetime('now'));

-- Insert Categories for Transportation
INSERT INTO categories (id, name, color, icon, icon_type, group_id, user_id, created_at) VALUES
('cuid_fuel', 'Fuel', '#F59E0B', 'gas-pump', 'phosphor', 'cuid_transportation', 'USER_ID_HERE', datetime('now')),
('cuid_public_transport', 'Public transport', '#10B981', 'bus', 'phosphor', 'cuid_transportation', 'USER_ID_HERE', datetime('now')),
('cuid_car_loan', 'Car loan / Lease', '#EF4444', 'currency-dollar', 'phosphor', 'cuid_transportation', 'USER_ID_HERE', datetime('now')),
('cuid_transport_insurance', 'Insurance', '#6B7280', 'shield', 'phosphor', 'cuid_transportation', 'USER_ID_HERE', datetime('now')),
('cuid_transport_maintenance', 'Maintenance & Repairs', '#8B5CF6', 'gear', 'phosphor', 'cuid_transportation', 'USER_ID_HERE', datetime('now')),
('cuid_parking_tolls', 'Parking / Tolls', '#EC4899', 'parking', 'phosphor', 'cuid_transportation', 'USER_ID_HERE', datetime('now'));

-- Insert Categories for Food & Groceries
INSERT INTO categories (id, name, color, icon, icon_type, group_id, user_id, created_at) VALUES
('cuid_groceries', 'Groceries', '#10B981', 'shopping-cart', 'phosphor', 'cuid_food_groceries', 'USER_ID_HERE', datetime('now')),
('cuid_dining_out', 'Dining out / Takeaway', '#F59E0B', 'fork-knife', 'phosphor', 'cuid_food_groceries', 'USER_ID_HERE', datetime('now')),
('cuid_coffee_snacks', 'Coffee / Snacks', '#8B5CF6', 'coffee', 'phosphor', 'cuid_food_groceries', 'USER_ID_HERE', datetime('now'));

-- Insert Categories for Health & Wellness
INSERT INTO categories (id, name, color, icon, icon_type, group_id, user_id, created_at) VALUES
('cuid_health_insurance', 'Health insurance', '#EF4444', 'shield-plus', 'phosphor', 'cuid_health_wellness', 'USER_ID_HERE', datetime('now')),
('cuid_medical_bills', 'Medical bills (doctor, dentist, etc.)', '#F59E0B', 'stethoscope', 'phosphor', 'cuid_health_wellness', 'USER_ID_HERE', datetime('now')),
('cuid_pharmacy', 'Pharmacy / Medicine', '#10B981', 'pill', 'phosphor', 'cuid_health_wellness', 'USER_ID_HERE', datetime('now')),
('cuid_gym_fitness', 'Gym / Sports / Fitness', '#8B5CF6', 'barbell', 'phosphor', 'cuid_health_wellness', 'USER_ID_HERE', datetime('now'));

-- Insert Categories for Education & Personal Development
INSERT INTO categories (id, name, color, icon, icon_type, group_id, user_id, created_at) VALUES
('cuid_tuition_fees', 'Tuition fees', '#8B5CF6', 'graduation-cap', 'phosphor', 'cuid_education', 'USER_ID_HERE', datetime('now')),
('cuid_books_materials', 'Books & Materials', '#10B981', 'book', 'phosphor', 'cuid_education', 'USER_ID_HERE', datetime('now')),
('cuid_online_courses', 'Online courses / Subscriptions', '#F59E0B', 'monitor-play', 'phosphor', 'cuid_education', 'USER_ID_HERE', datetime('now')),
('cuid_training_certs', 'Training / Certifications', '#EF4444', 'certificate', 'phosphor', 'cuid_education', 'USER_ID_HERE', datetime('now'));

-- Insert Categories for Bills & Subscriptions
INSERT INTO categories (id, name, color, icon, icon_type, group_id, user_id, created_at) VALUES
('cuid_streaming', 'Streaming (Netflix, Spotify, etc.)', '#EC4899', 'play', 'phosphor', 'cuid_bills_subscriptions', 'USER_ID_HERE', datetime('now')),
('cuid_cloud_services', 'Cloud services', '#06B6D4', 'cloud', 'phosphor', 'cuid_bills_subscriptions', 'USER_ID_HERE', datetime('now')),
('cuid_magazine_membership', 'Magazine / Membership fees', '#8B5CF6', 'newspaper', 'phosphor', 'cuid_bills_subscriptions', 'USER_ID_HERE', datetime('now'));

-- Insert Categories for Family & Children
INSERT INTO categories (id, name, color, icon, icon_type, group_id, user_id, created_at) VALUES
('cuid_childcare', 'Childcare / Babysitting', '#06B6D4', 'baby', 'phosphor', 'cuid_family_children', 'USER_ID_HERE', datetime('now')),
('cuid_school_fees', 'School fees', '#10B981', 'student', 'phosphor', 'cuid_family_children', 'USER_ID_HERE', datetime('now')),
('cuid_toys_supplies', 'Toys & Supplies', '#F59E0B', 'teddy-bear', 'phosphor', 'cuid_family_children', 'USER_ID_HERE', datetime('now'));

-- Insert Categories for Debt & Savings
INSERT INTO categories (id, name, color, icon, icon_type, group_id, user_id, created_at) VALUES
('cuid_loan_repayments', 'Loan repayments', '#84CC16', 'bank', 'phosphor', 'cuid_debt_savings', 'USER_ID_HERE', datetime('now')),
('cuid_credit_card', 'Credit card payments', '#EF4444', 'credit-card', 'phosphor', 'cuid_debt_savings', 'USER_ID_HERE', datetime('now')),
('cuid_emergency_fund', 'Emergency fund', '#10B981', 'piggy-bank', 'phosphor', 'cuid_debt_savings', 'USER_ID_HERE', datetime('now')),
('cuid_investments', 'Investments', '#8B5CF6', 'trending-up', 'phosphor', 'cuid_debt_savings', 'USER_ID_HERE', datetime('now'));

-- Insert Categories for Insurance
INSERT INTO categories (id, name, color, icon, icon_type, group_id, user_id, created_at) VALUES
('cuid_life_insurance', 'Life insurance', '#6B7280', 'shield-check', 'phosphor', 'cuid_insurance', 'USER_ID_HERE', datetime('now')),
('cuid_general_health_insurance', 'Health insurance (if not under Health group)', '#EF4444', 'shield-plus', 'phosphor', 'cuid_insurance', 'USER_ID_HERE', datetime('now')),
('cuid_property_car_insurance', 'Property / Car insurance', '#F59E0B', 'shield-warning', 'phosphor', 'cuid_insurance', 'USER_ID_HERE', datetime('now'));

-- Insert Categories for Leisure & Entertainment
INSERT INTO categories (id, name, color, icon, icon_type, group_id, user_id, created_at) VALUES
('cuid_travel_holidays', 'Travel / Holidays', '#F97316', 'airplane', 'phosphor', 'cuid_leisure_entertainment', 'USER_ID_HERE', datetime('now')),
('cuid_movies_concerts', 'Movies / Concerts', '#EC4899', 'ticket', 'phosphor', 'cuid_leisure_entertainment', 'USER_ID_HERE', datetime('now')),
('cuid_hobbies', 'Hobbies', '#8B5CF6', 'palette', 'phosphor', 'cuid_leisure_entertainment', 'USER_ID_HERE', datetime('now')),
('cuid_games', 'Games', '#10B981', 'gamepad', 'phosphor', 'cuid_leisure_entertainment', 'USER_ID_HERE', datetime('now'));

-- Insert Categories for Shopping & Personal Care
INSERT INTO categories (id, name, color, icon, icon_type, group_id, user_id, created_at) VALUES
('cuid_clothing_accessories', 'Clothing & Accessories', '#DB2777', 'tshirt', 'phosphor', 'cuid_shopping_personal', 'USER_ID_HERE', datetime('now')),
('cuid_personal_care', 'Personal Care', '#EC4899', 'drop-half-bottom', 'phosphor', 'cuid_shopping_personal', 'USER_ID_HERE', datetime('now'));