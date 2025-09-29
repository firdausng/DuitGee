-- Categories and Category Groups Seed Data
-- Based on expense-categories.md
-- Note: Replace 'USER_ID_HERE' with actual user ID when running
-- This creates public categories (isPublic = true, vaultId = null) that can be used across all vaults

-- Insert Category Groups (Public categories available to all users)
INSERT INTO category_groups (id, name, description, color, icon, icon_type, is_public, vault_id, created_by) VALUES
('grp_housing_utilities', 'Housing & Utilities', 'Home-related expenses including rent, utilities, and maintenance', '#3B82F6', '🏠', 'emoji', true, null, 'USER_ID_HERE'),
('grp_transportation', 'Transportation', 'Vehicle and travel-related expenses', '#F59E0B', '🚗', 'emoji', true, null, 'USER_ID_HERE'),
('grp_food_groceries', 'Food & Groceries', 'Food, dining, and grocery expenses', '#10B981', '🍔', 'emoji', true, null, 'USER_ID_HERE'),
('grp_health_wellness', 'Health & Wellness', 'Healthcare, fitness, and wellness expenses', '#EF4444', '❤️', 'emoji', true, null, 'USER_ID_HERE'),
('grp_education', 'Education & Development', 'Learning, courses, and educational expenses', '#8B5CF6', '📚', 'emoji', true, null, 'USER_ID_HERE'),
('grp_bills_subscriptions', 'Bills & Subscriptions', 'Recurring bills and subscription services', '#EC4899', '⚡', 'emoji', true, null, 'USER_ID_HERE'),
('grp_family_children', 'Family & Children', 'Family and child-related expenses', '#06B6D4', '👶', 'emoji', true, null, 'USER_ID_HERE'),
('grp_debt_savings', 'Debt & Savings', 'Loan payments, savings, and investments', '#84CC16', '💰', 'emoji', true, null, 'USER_ID_HERE'),
('grp_insurance', 'Insurance', 'Insurance premiums and coverage', '#6B7280', '🛡️', 'emoji', true, null, 'USER_ID_HERE'),
('grp_leisure_entertainment', 'Leisure & Entertainment', 'Entertainment, hobbies, and leisure activities', '#F97316', '🎮', 'emoji', true, null, 'USER_ID_HERE'),
('grp_shopping_personal', 'Shopping & Personal Care', 'Personal shopping and care items', '#DB2777', '🛒', 'emoji', true, null, 'USER_ID_HERE'),
('grp_gifts_donations', 'Gifts & Donations', 'Gifts for others and charitable donations', '#F472B6', '🎁', 'emoji', true, null, 'USER_ID_HERE'),
('grp_miscellaneous', 'Miscellaneous', 'Other uncategorized expenses', '#9CA3AF', '📝', 'emoji', true, null, 'USER_ID_HERE');

-- Insert Categories for Housing & Utilities
INSERT INTO categories (id, name, description, keywords, color, icon, icon_type, group_id, is_public, vault_id, created_by) VALUES
('cat_rent_mortgage', 'Rent / Mortgage', 'Monthly housing payments', 'rent,mortgage,housing,home,apartment,house,payment,monthly', '#3B82F6', '🏠', 'emoji', 'grp_housing_utilities', true, null, 'USER_ID_HERE'),
('cat_electricity', 'Electricity', 'Electric bill and power costs', 'electricity,electric,power,bill,utilities,energy,lights', '#F59E0B', '💡', 'emoji', 'grp_housing_utilities', true, null, 'USER_ID_HERE'),
('cat_water', 'Water', 'Water bill and usage', 'water,bill,utilities,sewage,drainage', '#06B6D4', '💧', 'emoji', 'grp_housing_utilities', true, null, 'USER_ID_HERE'),
('cat_gas', 'Gas', 'Gas bill and heating costs', 'gas,heating,cooking,natural gas,propane,bill,utilities', '#F97316', '🔥', 'emoji', 'grp_housing_utilities', true, null, 'USER_ID_HERE'),
('cat_internet_phone', 'Internet & Phone', 'Internet and phone bills', 'internet,phone,wifi,broadband,mobile,cellular,data,plan', '#8B5CF6', '📶', 'emoji', 'grp_housing_utilities', true, null, 'USER_ID_HERE'),
('cat_maintenance_repairs', 'Maintenance / Repairs', 'Home maintenance and repairs', 'maintenance,repairs,fixing,plumber,electrician,handyman,home improvement', '#6B7280', '🔧', 'emoji', 'grp_housing_utilities', true, null, 'USER_ID_HERE');

-- Insert Categories for Transportation
INSERT INTO categories (id, name, description, keywords, color, icon, icon_type, group_id, is_public, vault_id, created_by) VALUES
('cat_fuel', 'Fuel', 'Gas and fuel for vehicles', 'fuel,gas,gasoline,petrol,diesel,tank,fill up,station', '#F59E0B', '⛽', 'emoji', 'grp_transportation', true, null, 'USER_ID_HERE'),
('cat_public_transport', 'Public Transport', 'Bus, train, and public transit', 'bus,train,metro,subway,public transport,transit,ticket,pass', '#10B981', '🚌', 'emoji', 'grp_transportation', true, null, 'USER_ID_HERE'),
('cat_car_loan', 'Car Loan / Lease', 'Vehicle financing and lease payments', 'car loan,lease,financing,vehicle payment,auto loan,monthly payment', '#EF4444', '🚗', 'emoji', 'grp_transportation', true, null, 'USER_ID_HERE'),
('cat_transport_insurance', 'Insurance', 'Vehicle insurance premiums', 'car insurance,auto insurance,vehicle insurance,coverage,premium', '#6B7280', '🛡️', 'emoji', 'grp_transportation', true, null, 'USER_ID_HERE'),
('cat_transport_maintenance', 'Maintenance & Repairs', 'Vehicle maintenance and repairs', 'car repair,maintenance,service,oil change,tire,brake,mechanic', '#8B5CF6', '⚙️', 'emoji', 'grp_transportation', true, null, 'USER_ID_HERE'),
('cat_parking_tolls', 'Parking / Tolls', 'Parking fees and road tolls', 'parking,toll,meter,garage,valet,highway toll,bridge toll', '#EC4899', '🅿️', 'emoji', 'grp_transportation', true, null, 'USER_ID_HERE');

-- Insert Categories for Food & Groceries
INSERT INTO categories (id, name, color, icon, icon_type, group_id, is_public, vault_id, created_by) VALUES
('cat_groceries', 'Groceries', '#10B981', '🛒', 'emoji', 'grp_food_groceries', true, null, 'USER_ID_HERE'),
('cat_dining_out', 'Dining Out / Takeaway', '#F59E0B', '🍽️', 'emoji', 'grp_food_groceries', true, null, 'USER_ID_HERE'),
('cat_coffee_snacks', 'Coffee / Snacks', '#8B5CF6', '☕', 'emoji', 'grp_food_groceries', true, null, 'USER_ID_HERE');

-- Insert Categories for Health & Wellness
INSERT INTO categories (id, name, color, icon, icon_type, group_id, is_public, vault_id, created_by) VALUES
('cat_health_insurance', 'Health Insurance', '#EF4444', '🏥', 'emoji', 'grp_health_wellness', true, null, 'USER_ID_HERE'),
('cat_medical_bills', 'Medical Bills', '#F59E0B', '🩺', 'emoji', 'grp_health_wellness', true, null, 'USER_ID_HERE'),
('cat_pharmacy', 'Pharmacy / Medicine', '#10B981', '💊', 'emoji', 'grp_health_wellness', true, null, 'USER_ID_HERE'),
('cat_gym_fitness', 'Gym / Fitness', '#8B5CF6', '💪', 'emoji', 'grp_health_wellness', true, null, 'USER_ID_HERE');

-- Insert Categories for Education & Personal Development
INSERT INTO categories (id, name, color, icon, icon_type, group_id, is_public, vault_id, created_by) VALUES
('cat_tuition_fees', 'Tuition Fees', '#8B5CF6', '🎓', 'emoji', 'grp_education', true, null, 'USER_ID_HERE'),
('cat_books_materials', 'Books & Materials', '#10B981', '📖', 'emoji', 'grp_education', true, null, 'USER_ID_HERE'),
('cat_online_courses', 'Online Courses', '#F59E0B', '💻', 'emoji', 'grp_education', true, null, 'USER_ID_HERE'),
('cat_training_certs', 'Training / Certifications', '#EF4444', '📜', 'emoji', 'grp_education', true, null, 'USER_ID_HERE');

-- Insert Categories for Bills & Subscriptions
INSERT INTO categories (id, name, color, icon, icon_type, group_id, is_public, vault_id, created_by) VALUES
('cat_streaming', 'Streaming Services', '#EC4899', '📺', 'emoji', 'grp_bills_subscriptions', true, null, 'USER_ID_HERE'),
('cat_cloud_services', 'Cloud Services', '#06B6D4', '☁️', 'emoji', 'grp_bills_subscriptions', true, null, 'USER_ID_HERE'),
('cat_magazine_membership', 'Memberships', '#8B5CF6', '📰', 'emoji', 'grp_bills_subscriptions', true, null, 'USER_ID_HERE');

-- Insert Categories for Family & Children
INSERT INTO categories (id, name, color, icon, icon_type, group_id, is_public, vault_id, created_by) VALUES
('cat_childcare', 'Childcare / Babysitting', '#06B6D4', '👶', 'emoji', 'grp_family_children', true, null, 'USER_ID_HERE'),
('cat_school_fees', 'School Fees', '#10B981', '🏫', 'emoji', 'grp_family_children', true, null, 'USER_ID_HERE'),
('cat_toys_supplies', 'Toys & Supplies', '#F59E0B', '🧸', 'emoji', 'grp_family_children', true, null, 'USER_ID_HERE');

-- Insert Categories for Debt & Savings
INSERT INTO categories (id, name, color, icon, icon_type, group_id, is_public, vault_id, created_by) VALUES
('cat_loan_repayments', 'Loan Repayments', '#84CC16', '🏦', 'emoji', 'grp_debt_savings', true, null, 'USER_ID_HERE'),
('cat_credit_card', 'Credit Card Payments', '#EF4444', '💳', 'emoji', 'grp_debt_savings', true, null, 'USER_ID_HERE'),
('cat_emergency_fund', 'Emergency Fund', '#10B981', '🐷', 'emoji', 'grp_debt_savings', true, null, 'USER_ID_HERE'),
('cat_investments', 'Investments', '#8B5CF6', '📈', 'emoji', 'grp_debt_savings', true, null, 'USER_ID_HERE');

-- Insert Categories for Insurance
INSERT INTO categories (id, name, color, icon, icon_type, group_id, is_public, vault_id, created_by) VALUES
('cat_life_insurance', 'Life Insurance', '#6B7280', '🛡️', 'emoji', 'grp_insurance', true, null, 'USER_ID_HERE'),
('cat_property_insurance', 'Property Insurance', '#F59E0B', '🏠', 'emoji', 'grp_insurance', true, null, 'USER_ID_HERE');

-- Insert Categories for Leisure & Entertainment
INSERT INTO categories (id, name, color, icon, icon_type, group_id, is_public, vault_id, created_by) VALUES
('cat_travel_holidays', 'Travel / Holidays', '#F97316', '✈️', 'emoji', 'grp_leisure_entertainment', true, null, 'USER_ID_HERE'),
('cat_movies_concerts', 'Movies / Concerts', '#EC4899', '🎬', 'emoji', 'grp_leisure_entertainment', true, null, 'USER_ID_HERE'),
('cat_hobbies', 'Hobbies', '#8B5CF6', '🎨', 'emoji', 'grp_leisure_entertainment', true, null, 'USER_ID_HERE'),
('cat_games', 'Games', '#10B981', '🎮', 'emoji', 'grp_leisure_entertainment', true, null, 'USER_ID_HERE');

-- Insert Categories for Shopping & Personal Care
INSERT INTO categories (id, name, color, icon, icon_type, group_id, is_public, vault_id, created_by) VALUES
('cat_clothing', 'Clothing & Accessories', '#DB2777', '👕', 'emoji', 'grp_shopping_personal', true, null, 'USER_ID_HERE'),
('cat_personal_care', 'Personal Care', '#EC4899', '🧴', 'emoji', 'grp_shopping_personal', true, null, 'USER_ID_HERE'),
('cat_electronics', 'Electronics / Gadgets', '#3B82F6', '📱', 'emoji', 'grp_shopping_personal', true, null, 'USER_ID_HERE');

-- Insert Categories for Gifts & Donations
INSERT INTO categories (id, name, color, icon, icon_type, group_id, is_public, vault_id, created_by) VALUES
('cat_gifts', 'Gifts', '#F472B6', '🎁', 'emoji', 'grp_gifts_donations', true, null, 'USER_ID_HERE'),
('cat_donations', 'Charity / Donations', '#10B981', '❤️', 'emoji', 'grp_gifts_donations', true, null, 'USER_ID_HERE');

-- Insert Categories for Miscellaneous
INSERT INTO categories (id, name, color, icon, icon_type, group_id, is_public, vault_id, created_by) VALUES
('cat_unexpected', 'Unexpected Expenses', '#9CA3AF', '❓', 'emoji', 'grp_miscellaneous', true, null, 'USER_ID_HERE'),
('cat_cash_withdrawals', 'Cash Withdrawals', '#6B7280', '💵', 'emoji', 'grp_miscellaneous', true, null, 'USER_ID_HERE'),
('cat_other', 'Other', '#9CA3AF', '📝', 'emoji', 'grp_miscellaneous', true, null, 'USER_ID_HERE');