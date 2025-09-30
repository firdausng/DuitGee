import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { updateUserSchema } from '$lib/server/api/users/schema';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.currentUser) {
        throw new Error('User not authenticated');
    }

    const form = await superValidate(locals.currentUser, valibot(updateUserSchema));

    return {
        user: locals.currentUser,
        form
    };
};

export const actions: Actions = {
    default: async ({ request, locals, platform }) => {
        if (!platform?.env?.DB) {
            throw new Error('Database not available');
        }

        if (!locals.currentUser) {
            throw new Error('User not authenticated');
        }

        const form = await superValidate(request, valibot(updateUserSchema));

        if (!form.valid) {
            return { form };
        }

        try {
            // For now, we'll just return the form as we don't have an update user API yet
            // In a real implementation, you would call an updateUser function here
            console.log('Profile update requested:', form.data);

            // TODO: Implement user update in the database
            // const updatedUser = await updateUser(locals.currentUser.id, form.data, platform.env.DB);

            return { form };
        } catch (error) {
            console.error('Error updating profile:', error);
            form.errors._errors = ['Failed to update profile. Please try again.'];
            return { form };
        }
    }
};