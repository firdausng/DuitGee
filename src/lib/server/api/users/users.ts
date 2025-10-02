import { Hono } from 'hono';
import * as v from "valibot";
import { vValidator } from "@hono/valibot-validator";
import {
	createUser,
	deleteUser,
	getUsers,
	getUser,
	updateUser
} from "$lib/server/api/users/handlers";
import {userSchema} from "$lib/schemas/expense";
import {updateUserSchema} from "$lib/server/api/users/schema";



export const usersApi = new Hono<App.Api>()
	.get('/', async (c) => {
		const page = parseInt(c.req.query('page') || '1');
		const limit = parseInt(c.req.query('limit') || '10');

		console.log('fetching users');
		const result = await getUsers(c.env.DB, {
			page,
			limit
		});

		return c.json(result);
	})
	.post('/', vValidator('json', userSchema), async (c) => {
		const data = c.req.valid('json');

		const user = await createUser(data, c.env.DB);

		if (!user) {
			return c.json({ error: 'Failed to create user' }, 500);
		}

		return c.json(user, 201);
	})
	.get('/:id', async (c) => {
		const id = c.req.param('id');

		const user = await getUser(id, c.env.DB);

		if (!user) {
			return c.json({ error: 'User not found' }, 404);
		}

		return c.json(user);
	})
	.put('/:id', vValidator('json', updateUserSchema), async (c) => {
		const id = c.req.param('id');
		const data = c.req.valid('json');

		const user = await updateUser(id, data, c.env.DB, c.env.KV);

		if (!user) {
			return c.json({ error: 'User not found' }, 404);
		}

		return c.json(user);
	})
	.delete('/:id', async (c) => {
		const id = c.req.param('id');

		const isDeleted = await deleteUser(id, c.env.DB);

		if (!isDeleted) {
			return c.json({ error: 'User not found' }, 404);
		}

		return c.json({ message: 'User deleted successfully' });
	});