import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { updateUserSchema } from '$lib/server/api/users/schema';
import { updateUser } from '$lib/server/api/users/handlers';
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
            console.log('Profile update requested:', form.data);

            // Update user in the database
            const updatedUser = await updateUser(locals.currentUser.id, form.data, platform.env.DB);

            if (!updatedUser) {
                form.errors._errors = ['Failed to update profile. User not found.'];
                return { form };
            }

            console.log('Profile updated successfully:', updatedUser);

            // Update the session with new user data
            locals.currentUser = updatedUser;

            return { form };
        } catch (error) {
            console.error('Error updating profile:', error);
            form.errors._errors = ['Failed to update profile. Please try again.'];
            return { form };
        }
    }
};