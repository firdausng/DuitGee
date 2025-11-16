import * as v from 'valibot';
import {createSelectSchema, createInsertSchema} from "drizzle-valibot";
import {vaults} from "$lib/server/db/schema";

export const vaultSelectSchema = createSelectSchema(vaults);
export type SelectVault = v.InferOutput<typeof vaultSelectSchema>;

export const vaultCreateSchema = createInsertSchema(vaults);
export type CreateVault = v.InferOutput<typeof vaultCreateSchema>;