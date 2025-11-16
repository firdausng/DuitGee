import * as v from 'valibot';
import {createSelectSchema, createInsertSchema} from "drizzle-valibot";
import {vaults} from "$lib/server/db/schema";

export const selectVaultSchema = createSelectSchema(vaults);
export type SelectVault = v.InferOutput<typeof selectVaultSchema>;

export const createVaultSchema = createInsertSchema(vaults);
export type CreateVault = v.InferOutput<typeof createVaultSchema>;