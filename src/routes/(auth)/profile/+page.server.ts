import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types.js';
import {updateUserSchema} from "$lib/schemas/expense";

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