import { drizzle } from 'drizzle-orm/d1';
import { createId } from '@paralleldrive/cuid2';

// This script should be run in your SvelteKit environment
// You can create an API endpoint or run it as a server script

export async function setupCategories(db, userId) {
    const client = drizzle(db);

    try {
        // Define category groups with their categories
        const groupsData = [
            {
                name: 'Housing & Utilities',
                description: 'Home-related expenses including rent, utilities, and maintenance',
                color: '#3B82F6',
                icon: 'house',
                iconType: 'phosphor',
                categories: [
                    { name: 'Rent / Mortgage', color: '#3B82F6', icon: 'house', iconType: 'phosphor' },
                    { name: 'Electricity', color: '#F59E0B', icon: 'lightning', iconType: 'phosphor' },
                    { name: 'Water', color: '#06B6D4', icon: 'drop', iconType: 'phosphor' },
                    { name: 'Gas', color: '#F97316', icon: 'flame', iconType: 'phosphor' },
                    { name: 'Internet & Phone', color: '#8B5CF6', icon: 'wifi-high', iconType: 'phosphor' },
                    { name: 'Maintenance / Repairs', color: '#6B7280', icon: 'wrench', iconType: 'phosphor' }
                ]
            },
            {
                name: 'Transportation',
                description: 'Vehicle and travel-related expenses',
                color: '#F59E0B',
                icon: 'car',
                iconType: 'phosphor',
                categories: [
                    { name: 'Fuel', color: '#F59E0B', icon: 'gas-pump', iconType: 'phosphor' },
                    { name: 'Public transport', color: '#10B981', icon: 'bus', iconType: 'phosphor' },
                    { name: 'Car loan / Lease', color: '#EF4444', icon: 'currency-dollar', iconType: 'phosphor' },
                    { name: 'Insurance', color: '#6B7280', icon: 'shield', iconType: 'phosphor' },
                    { name: 'Maintenance & Repairs', color: '#8B5CF6', icon: 'gear', iconType: 'phosphor' },
                    { name: 'Parking / Tolls', color: '#EC4899', icon: 'parking', iconType: 'phosphor' }
                ]
            },
            {
                name: 'Food & Groceries',
                description: 'Food, dining, and grocery expenses',
                color: '#10B981',
                icon: 'hamburger',
                iconType: 'phosphor',
                categories: [
                    { name: 'Groceries', color: '#10B981', icon: 'shopping-cart', iconType: 'phosphor' },
                    { name: 'Dining out / Takeaway', color: '#F59E0B', icon: 'fork-knife', iconType: 'phosphor' },
                    { name: 'Coffee / Snacks', color: '#8B5CF6', icon: 'coffee', iconType: 'phosphor' }
                ]
            },
            {
                name: 'Health & Wellness',
                description: 'Healthcare, fitness, and wellness expenses',
                color: '#EF4444',
                icon: 'heart',
                iconType: 'phosphor',
                categories: [
                    { name: 'Health insurance', color: '#EF4444', icon: 'shield-plus', iconType: 'phosphor' },
                    { name: 'Medical bills (doctor, dentist, etc.)', color: '#F59E0B', icon: 'stethoscope', iconType: 'phosphor' },
                    { name: 'Pharmacy / Medicine', color: '#10B981', icon: 'pill', iconType: 'phosphor' },
                    { name: 'Gym / Sports / Fitness', color: '#8B5CF6', icon: 'barbell', iconType: 'phosphor' }
                ]
            },
            {
                name: 'Education & Personal Development',
                description: 'Learning, courses, and educational expenses',
                color: '#8B5CF6',
                icon: 'book',
                iconType: 'phosphor',
                categories: [
                    { name: 'Tuition fees', color: '#8B5CF6', icon: 'graduation-cap', iconType: 'phosphor' },
                    { name: 'Books & Materials', color: '#10B981', icon: 'book', iconType: 'phosphor' },
                    { name: 'Online courses / Subscriptions', color: '#F59E0B', icon: 'monitor-play', iconType: 'phosphor' },
                    { name: 'Training / Certifications', color: '#EF4444', icon: 'certificate', iconType: 'phosphor' }
                ]
            },
            {
                name: 'Bills & Subscriptions',
                description: 'Recurring bills and subscription services',
                color: '#EC4899',
                icon: 'lightning',
                iconType: 'phosphor',
                categories: [
                    { name: 'Streaming (Netflix, Spotify, etc.)', color: '#EC4899', icon: 'play', iconType: 'phosphor' },
                    { name: 'Cloud services', color: '#06B6D4', icon: 'cloud', iconType: 'phosphor' },
                    { name: 'Magazine / Membership fees', color: '#8B5CF6', icon: 'newspaper', iconType: 'phosphor' }
                ]
            },
            {
                name: 'Family & Children',
                description: 'Family and child-related expenses',
                color: '#06B6D4',
                icon: 'baby',
                iconType: 'phosphor',
                categories: [
                    { name: 'Childcare / Babysitting', color: '#06B6D4', icon: 'baby', iconType: 'phosphor' },
                    { name: 'School fees', color: '#10B981', icon: 'student', iconType: 'phosphor' },
                    { name: 'Toys & Supplies', color: '#F59E0B', icon: 'teddy-bear', iconType: 'phosphor' }
                ]
            },
            {
                name: 'Debt & Savings',
                description: 'Loan payments, savings, and investments',
                color: '#84CC16',
                icon: 'currency-dollar',
                iconType: 'phosphor',
                categories: [
                    { name: 'Loan repayments', color: '#84CC16', icon: 'bank', iconType: 'phosphor' },
                    { name: 'Credit card payments', color: '#EF4444', icon: 'credit-card', iconType: 'phosphor' },
                    { name: 'Emergency fund', color: '#10B981', icon: 'piggy-bank', iconType: 'phosphor' },
                    { name: 'Investments', color: '#8B5CF6', icon: 'trending-up', iconType: 'phosphor' }
                ]
            },
            {
                name: 'Insurance',
                description: 'Insurance premiums and coverage',
                color: '#6B7280',
                icon: 'shield',
                iconType: 'phosphor',
                categories: [
                    { name: 'Life insurance', color: '#6B7280', icon: 'shield-check', iconType: 'phosphor' },
                    { name: 'Health insurance (if not under Health group)', color: '#EF4444', icon: 'shield-plus', iconType: 'phosphor' },
                    { name: 'Property / Car insurance', color: '#F59E0B', icon: 'shield-warning', iconType: 'phosphor' }
                ]
            },
            {
                name: 'Leisure & Entertainment',
                description: 'Entertainment, hobbies, and leisure activities',
                color: '#F97316',
                icon: 'gamepad',
                iconType: 'phosphor',
                categories: [
                    { name: 'Travel / Holidays', color: '#F97316', icon: 'airplane', iconType: 'phosphor' },
                    { name: 'Movies / Concerts', color: '#EC4899', icon: 'ticket', iconType: 'phosphor' },
                    { name: 'Hobbies', color: '#8B5CF6', icon: 'palette', iconType: 'phosphor' },
                    { name: 'Games', color: '#10B981', icon: 'gamepad', iconType: 'phosphor' }
                ]
            },
            {
                name: 'Shopping & Personal Care',
                description: 'Personal shopping and care items',
                color: '#DB2777',
                icon: 'shopping-cart',
                iconType: 'phosphor',
                categories: [
                    { name: 'Clothing & Accessories', color: '#DB2777', icon: 'tshirt', iconType: 'phosphor' },
                    { name: 'Personal Care', color: '#EC4899', icon: 'drop-half-bottom', iconType: 'phosphor' }
                ]
            }
        ];

        // Insert groups and their categories
        for (const groupData of groupsData) {
            // Insert category group
            const [group] = await client
                .insert(categoryGroups)
                .values({
                    id: createId(),
                    name: groupData.name,
                    description: groupData.description,
                    color: groupData.color,
                    icon: groupData.icon,
                    iconType: groupData.iconType,
                    userId: userId,
                    createdAt: new Date()
                })
                .returning();

            console.log(`Created group: ${group.name}`);

            // Insert categories for this group
            for (const categoryData of groupData.categories) {
                const [category] = await client
                    .insert(categories)
                    .values({
                        id: createId(),
                        name: categoryData.name,
                        color: categoryData.color,
                        icon: categoryData.icon,
                        iconType: categoryData.iconType,
                        groupId: group.id,
                        userId: userId,
                        createdAt: new Date()
                    })
                    .returning();

                console.log(`  - Created category: ${category.name}`);
            }
        }

        console.log('✅ Successfully created all category groups and categories!');
        return { success: true, message: 'Categories setup completed successfully' };

    } catch (error) {
        console.error('❌ Error setting up categories:', error);
        return { success: false, error: error.message };
    }
}