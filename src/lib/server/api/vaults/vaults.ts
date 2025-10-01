import { Hono } from 'hono';
import * as v from "valibot";
import { vValidator } from "@hono/valibot-validator";
import {
    getUserVaultsByEmail,
    getVaultByEmail,
    createVaultByEmail,
    updateVaultByEmail,
    deleteVaultByEmail,
    getVaultStatsByEmail
} from "$lib/server/api/vaults/handlers";
import { vaultSchema } from "$lib/server/api/vaults/schema";

const updateVaultSchema = v.partial(vaultSchema);

// Query schema for getUserVaultsByEmail
const getUserVaultsByEmailSchema = v.object({
    email: v.pipe(v.string(), v.email())
});

export const vaultsApi = new Hono<App.Api>()
    // GET /vaults - Get user's vaults
    .get('/', async (c) => {
        const userEmail = c.get('userEmail') as string;

        try {
            const vaults = await getUserVaultsByEmail(userEmail, c.env.DB);
            return c.json({
                success: true,
                data: vaults
            });
        } catch (error) {
            console.error('Error fetching vaults:', error);
            return c.json({
                success: false,
                error: 'Failed to fetch vaults'
            }, 500);
        }
    })

    // GET /vaults/by-email?email=user@example.com - Get vaults by user email
    .get('/by-email', vValidator('query', getUserVaultsByEmailSchema), async (c) => {
        const query = c.req.valid('query');

        try {
            const vaults = await getUserVaultsByEmail(query.email, c.env.DB);
            return c.json({
                success: true,
                data: vaults
            });
        } catch (error) {
            console.error('Error fetching vaults by email:', error);
            return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch vaults'
            }, error instanceof Error && error.message === 'User not found' ? 404 : 500);
        }
    })

    // POST /vaults - Create a new vault
    .post('/', vValidator('json', vaultSchema), async (c) => {
        const userEmail = c.get('userEmail') as string;
        const data = c.req.valid('json');

        try {
            const vault = await createVaultByEmail(userEmail, data, c.env.DB);
            return c.json({
                success: true,
                data: vault
            }, 201);
        } catch (error) {
            console.error('Error creating vault:', error);
            return c.json({
                success: false,
                error: 'Failed to create vault'
            }, 500);
        }
    })

    // GET /vaults/:id - Get specific vault with members
    .get('/:id', async (c) => {
        const userEmail = c.get('userEmail') as string;
        const vaultId = c.req.param('id');

        try {
            const vault = await getVaultByEmail(userEmail, vaultId, c.env.DB);
            return c.json({
                success: true,
                data: vault
            });
        } catch (error) {
            console.error('Error fetching vault:', error);
            const status = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch vault'
            }, status);
        }
    })

    // PUT /vaults/:id - Update vault
    .put('/:id', vValidator('json', updateVaultSchema), async (c) => {
        const userEmail = c.get('userEmail') as string;
        const vaultId = c.req.param('id');
        const data = c.req.valid('json');

        try {
            const vault = await updateVaultByEmail(userEmail, vaultId, data, c.env.DB);
            return c.json({
                success: true,
                data: vault
            });
        } catch (error) {
            console.error('Error updating vault:', error);
            const status = error instanceof Error && error.message.includes('Permission denied') ? 403 : 500;
            return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update vault'
            }, status);
        }
    })

    // DELETE /vaults/:id - Delete vault
    .delete('/:id', async (c) => {
        const userEmail = c.get('userEmail') as string;
        const vaultId = c.req.param('id');

        try {
            const vault = await deleteVaultByEmail(userEmail, vaultId, c.env.DB);
            return c.json({
                success: true,
                data: vault,
                message: 'Vault deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting vault:', error);
            const status = error instanceof Error && error.message.includes('Permission denied') ? 403 : 500;
            return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete vault'
            }, status);
        }
    })

    // GET /vaults/:id/stats - Get vault statistics
    .get('/:id/stats', async (c) => {
        const userEmail = c.get('userEmail') as string;
        const vaultId = c.req.param('id');

        try {
            const stats = await getVaultStatsByEmail(userEmail, vaultId, c.env.DB);
            return c.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error fetching vault stats:', error);
            const status = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch vault stats'
            }, status);
        }
    });