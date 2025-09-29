-- Searchable Categories and Category Groups Seed Data
-- Enhanced with descriptions and keywords for better search functionality
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

-- Insert Searchable Categories

-- Housing & Utilities
INSERT INTO categories (id, name, description, keywords, color, icon, icon_type, group_id, is_public, vault_id, created_by) VALUES
('cat_rent_mortgage', 'Rent / Mortgage', 'Monthly housing payments', 'rent,mortgage,housing,home,apartment,house,payment,monthly,landlord', '#3B82F6', '🏠', 'emoji', 'grp_housing_utilities', true, null, 'USER_ID_HERE'),
('cat_electricity', 'Electricity', 'Electric bill and power costs', 'electricity,electric,power,bill,utilities,energy,lights,outlet', '#F59E0B', '💡', 'emoji', 'grp_housing_utilities', true, null, 'USER_ID_HERE'),
('cat_water', 'Water', 'Water bill and usage', 'water,bill,utilities,sewage,drainage,plumbing', '#06B6D4', '💧', 'emoji', 'grp_housing_utilities', true, null, 'USER_ID_HERE'),
('cat_gas', 'Gas', 'Gas bill and heating costs', 'gas,heating,cooking,natural gas,propane,bill,utilities,stove', '#F97316', '🔥', 'emoji', 'grp_housing_utilities', true, null, 'USER_ID_HERE'),
('cat_internet_phone', 'Internet & Phone', 'Internet and phone bills', 'internet,phone,wifi,broadband,mobile,cellular,data,plan,network', '#8B5CF6', '📶', 'emoji', 'grp_housing_utilities', true, null, 'USER_ID_HERE'),
('cat_maintenance_repairs', 'Maintenance / Repairs', 'Home maintenance and repairs', 'maintenance,repairs,fixing,plumber,electrician,handyman,home improvement,contractor', '#6B7280', '🔧', 'emoji', 'grp_housing_utilities', true, null, 'USER_ID_HERE'),

-- Transportation
('cat_fuel', 'Fuel', 'Gas and fuel for vehicles', 'fuel,gas,gasoline,petrol,diesel,tank,fill up,station,pump', '#F59E0B', '⛽', 'emoji', 'grp_transportation', true, null, 'USER_ID_HERE'),
('cat_public_transport', 'Public Transport', 'Bus, train, and public transit', 'bus,train,metro,subway,public transport,transit,ticket,pass,commute', '#10B981', '🚌', 'emoji', 'grp_transportation', true, null, 'USER_ID_HERE'),
('cat_car_loan', 'Car Loan / Lease', 'Vehicle financing and lease payments', 'car loan,lease,financing,vehicle payment,auto loan,monthly payment,dealership', '#EF4444', '🚗', 'emoji', 'grp_transportation', true, null, 'USER_ID_HERE'),
('cat_transport_insurance', 'Car Insurance', 'Vehicle insurance premiums', 'car insurance,auto insurance,vehicle insurance,coverage,premium,policy', '#6B7280', '🛡️', 'emoji', 'grp_transportation', true, null, 'USER_ID_HERE'),
('cat_transport_maintenance', 'Car Maintenance', 'Vehicle maintenance and repairs', 'car repair,maintenance,service,oil change,tire,brake,mechanic,garage', '#8B5CF6', '⚙️', 'emoji', 'grp_transportation', true, null, 'USER_ID_HERE'),
('cat_parking_tolls', 'Parking / Tolls', 'Parking fees and road tolls', 'parking,toll,meter,garage,valet,highway toll,bridge toll,fee', '#EC4899', '🅿️', 'emoji', 'grp_transportation', true, null, 'USER_ID_HERE'),

-- Food & Groceries
('cat_groceries', 'Groceries', 'Food shopping and household items', 'groceries,food,shopping,supermarket,store,market,produce,household items', '#10B981', '🛒', 'emoji', 'grp_food_groceries', true, null, 'USER_ID_HERE'),
('cat_dining_out', 'Dining Out', 'Restaurant meals and takeaway', 'restaurant,dining out,takeaway,delivery,fast food,meal,lunch,dinner', '#F59E0B', '🍽️', 'emoji', 'grp_food_groceries', true, null, 'USER_ID_HERE'),
('cat_coffee_snacks', 'Coffee / Snacks', 'Coffee shops and snack purchases', 'coffee,snacks,cafe,starbucks,drinks,tea,bakery,convenience store', '#8B5CF6', '☕', 'emoji', 'grp_food_groceries', true, null, 'USER_ID_HERE'),

-- Health & Wellness
('cat_health_insurance', 'Health Insurance', 'Medical insurance premiums', 'health insurance,medical insurance,coverage,premium,policy,healthcare', '#EF4444', '🏥', 'emoji', 'grp_health_wellness', true, null, 'USER_ID_HERE'),
('cat_medical_bills', 'Medical Bills', 'Doctor and medical expenses', 'doctor,medical,hospital,clinic,dentist,checkup,appointment,treatment', '#F59E0B', '🩺', 'emoji', 'grp_health_wellness', true, null, 'USER_ID_HERE'),
('cat_pharmacy', 'Pharmacy', 'Medicine and pharmacy purchases', 'pharmacy,medicine,drugs,prescription,medication,pills,cvs,walgreens', '#10B981', '💊', 'emoji', 'grp_health_wellness', true, null, 'USER_ID_HERE'),
('cat_gym_fitness', 'Gym / Fitness', 'Fitness and sports expenses', 'gym,fitness,workout,sports,exercise,membership,personal trainer,equipment', '#8B5CF6', '💪', 'emoji', 'grp_health_wellness', true, null, 'USER_ID_HERE'),

-- Education & Development
('cat_tuition_fees', 'Tuition', 'School and university fees', 'tuition,school,university,college,education,fees,semester,academic', '#8B5CF6', '🎓', 'emoji', 'grp_education', true, null, 'USER_ID_HERE'),
('cat_books_materials', 'Books & Materials', 'Educational books and supplies', 'books,textbooks,materials,supplies,stationery,notebook,pen,school supplies', '#10B981', '📖', 'emoji', 'grp_education', true, null, 'USER_ID_HERE'),
('cat_online_courses', 'Online Courses', 'Online learning and courses', 'online course,udemy,coursera,learning,training,certification,skill development', '#F59E0B', '💻', 'emoji', 'grp_education', true, null, 'USER_ID_HERE'),
('cat_training_certs', 'Certifications', 'Professional training and certificates', 'certification,training,professional development,workshop,seminar,conference', '#EF4444', '📜', 'emoji', 'grp_education', true, null, 'USER_ID_HERE'),

-- Bills & Subscriptions
('cat_streaming', 'Streaming', 'Entertainment streaming services', 'netflix,spotify,streaming,subscription,entertainment,music,video,disney plus', '#EC4899', '📺', 'emoji', 'grp_bills_subscriptions', true, null, 'USER_ID_HERE'),
('cat_cloud_services', 'Cloud Services', 'Digital services and software', 'cloud,software,saas,storage,dropbox,google drive,office 365,adobe', '#06B6D4', '☁️', 'emoji', 'grp_bills_subscriptions', true, null, 'USER_ID_HERE'),
('cat_magazine_membership', 'Memberships', 'Magazine and membership fees', 'membership,magazine,subscription,club,association,annual fee,premium', '#8B5CF6', '📰', 'emoji', 'grp_bills_subscriptions', true, null, 'USER_ID_HERE'),

-- Family & Children
('cat_childcare', 'Childcare', 'Babysitting and daycare', 'childcare,babysitting,daycare,nanny,babysitter,kids,children', '#06B6D4', '👶', 'emoji', 'grp_family_children', true, null, 'USER_ID_HERE'),
('cat_school_fees', 'School Fees', 'Children education expenses', 'school fees,private school,tuition,education,children,kids,academic', '#10B981', '🏫', 'emoji', 'grp_family_children', true, null, 'USER_ID_HERE'),
('cat_toys_supplies', 'Toys & Supplies', 'Children toys and supplies', 'toys,children supplies,kids,games,baby supplies,diapers,formula', '#F59E0B', '🧸', 'emoji', 'grp_family_children', true, null, 'USER_ID_HERE'),

-- Debt & Savings
('cat_loan_repayments', 'Loan Payments', 'Personal and other loan payments', 'loan,payment,debt,personal loan,student loan,bank,repayment', '#84CC16', '🏦', 'emoji', 'grp_debt_savings', true, null, 'USER_ID_HERE'),
('cat_credit_card', 'Credit Card', 'Credit card payments', 'credit card,payment,visa,mastercard,debt,balance,minimum payment', '#EF4444', '💳', 'emoji', 'grp_debt_savings', true, null, 'USER_ID_HERE'),
('cat_emergency_fund', 'Emergency Fund', 'Emergency savings contributions', 'emergency fund,savings,emergency,rainy day,backup fund,safety net', '#10B981', '🐷', 'emoji', 'grp_debt_savings', true, null, 'USER_ID_HERE'),
('cat_investments', 'Investments', 'Investment contributions', 'investment,stocks,bonds,mutual funds,retirement,401k,ira,portfolio', '#8B5CF6', '📈', 'emoji', 'grp_debt_savings', true, null, 'USER_ID_HERE'),

-- Insurance
('cat_life_insurance', 'Life Insurance', 'Life insurance premiums', 'life insurance,insurance,premium,policy,coverage,beneficiary', '#6B7280', '🛡️', 'emoji', 'grp_insurance', true, null, 'USER_ID_HERE'),
('cat_property_insurance', 'Property Insurance', 'Home and property insurance', 'property insurance,home insurance,house insurance,coverage,premium,policy', '#F59E0B', '🏠', 'emoji', 'grp_insurance', true, null, 'USER_ID_HERE'),

-- Leisure & Entertainment
('cat_travel_holidays', 'Travel', 'Vacation and travel expenses', 'travel,vacation,holiday,trip,flight,hotel,accommodation,tourism', '#F97316', '✈️', 'emoji', 'grp_leisure_entertainment', true, null, 'USER_ID_HERE'),
('cat_movies_concerts', 'Movies / Events', 'Entertainment events and movies', 'movies,cinema,concert,show,theater,event,tickets,entertainment', '#EC4899', '🎬', 'emoji', 'grp_leisure_entertainment', true, null, 'USER_ID_HERE'),
('cat_hobbies', 'Hobbies', 'Hobby and craft expenses', 'hobbies,crafts,art,creative,hobby supplies,materials,projects', '#8B5CF6', '🎨', 'emoji', 'grp_leisure_entertainment', true, null, 'USER_ID_HERE'),
('cat_games', 'Games', 'Gaming and entertainment', 'games,gaming,video games,board games,entertainment,console,pc games', '#10B981', '🎮', 'emoji', 'grp_leisure_entertainment', true, null, 'USER_ID_HERE'),

-- Shopping & Personal Care
('cat_clothing', 'Clothing', 'Clothes and accessories', 'clothing,clothes,fashion,shoes,accessories,apparel,wardrobe,outfit', '#DB2777', '👕', 'emoji', 'grp_shopping_personal', true, null, 'USER_ID_HERE'),
('cat_personal_care', 'Personal Care', 'Beauty and hygiene products', 'personal care,beauty,cosmetics,toiletries,hygiene,skincare,haircare,makeup', '#EC4899', '🧴', 'emoji', 'grp_shopping_personal', true, null, 'USER_ID_HERE'),
('cat_electronics', 'Electronics', 'Electronic devices and gadgets', 'electronics,gadgets,phone,computer,laptop,tablet,tech,device', '#3B82F6', '📱', 'emoji', 'grp_shopping_personal', true, null, 'USER_ID_HERE'),

-- Gifts & Donations
('cat_gifts', 'Gifts', 'Gifts for family and friends', 'gifts,present,birthday,christmas,anniversary,celebration,surprise', '#F472B6', '🎁', 'emoji', 'grp_gifts_donations', true, null, 'USER_ID_HERE'),
('cat_donations', 'Donations', 'Charitable contributions', 'donations,charity,giving,contribution,nonprofit,cause,fundraising', '#10B981', '❤️', 'emoji', 'grp_gifts_donations', true, null, 'USER_ID_HERE'),

-- Miscellaneous
('cat_unexpected', 'Unexpected', 'Unplanned expenses', 'unexpected,emergency,surprise,unplanned,urgent,sudden', '#9CA3AF', '❓', 'emoji', 'grp_miscellaneous', true, null, 'USER_ID_HERE'),
('cat_cash_withdrawals', 'Cash', 'ATM withdrawals and cash', 'cash,atm,withdrawal,money,bills,change,pocket money', '#6B7280', '💵', 'emoji', 'grp_miscellaneous', true, null, 'USER_ID_HERE'),
('cat_other', 'Other', 'Miscellaneous expenses', 'other,miscellaneous,various,different,random,general', '#9CA3AF', '📝', 'emoji', 'grp_miscellaneous', true, null, 'USER_ID_HERE');