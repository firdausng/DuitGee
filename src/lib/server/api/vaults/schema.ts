import * as v from "valibot";

export const vaultSchema = v.object({
    name: v.pipe(v.string(), v.minLength(1, 'Name must be 1 or more characters long.')),
    description: v.pipe(v.string(), v.minLength(1, 'description must be 1 or more characters long.')),
    color: v.pipe(v.string(), v.minLength(1, 'Color must be 1 or more characters long.'), v.regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')),
    icon: v.pipe(v.string(), v.minLength(1, 'description must be 1 or more characters long.')),
    iconType: v.pipe(v.string(), v.minLength(1, 'description must be 1 or more characters long.')),
    isPersonal: v.pipe(v.boolean()),
});

export type Vault = v.InferOutput<typeof vaultSchema>;