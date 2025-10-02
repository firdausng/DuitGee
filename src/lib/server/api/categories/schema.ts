import * as v from "valibot";

export const categorySchema = v.object({
    id: v.string(),
    name: v.pipe(v.string(), v.minLength(1, 'Name must be 1 or more characters long.')),
    description: v.nullable(v.string()),
    keywords: v.nullable(v.string()),
    color: v.pipe(v.string(), v.minLength(1, 'Color must be 1 or more characters long.'), v.regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')),
    icon: v.nullable(v.string()),
    iconType: v.nullable(v.string()),
    groupId: v.nullable(v.string()),
    isPublic: v.boolean(),
    vaultId: v.string(),
});

export const addCategorySchema =  v.partial(categorySchema, ["name", "color"]);

export const updateCategorySchema = v.partial(categorySchema);