import * as v from "valibot";

// Twitter-style tag schema - tags are identified by name (normalized, lowercase)
export const tagSchema = v.object({
    name: v.pipe(
        v.string(),
        v.minLength(1, 'Tag name must not be empty'),
        v.maxLength(50, 'Tag name must be 50 characters or less')
    ),
    usageCount: v.number(),
    createdAt: v.string(),
    createdBy: v.string(),
});

// Tag normalization helper - convert to lowercase and trim
export const normalizeTagName = (name: string): string => {
    return name.trim().toLowerCase();
};

// Schema for creating/using tags (auto-creates if doesn't exist)
export const useTagSchema = v.object({
    name: v.pipe(
        v.string(),
        v.minLength(1, 'Tag name must not be empty'),
        v.maxLength(50, 'Tag name must be 50 characters or less')
    ),
});
export type useTagCommand = v.InferInput<typeof useTagSchema>;

// Schema for searching/suggesting tags
export const searchTagsSchema = v.object({
    query: v.optional(v.string()),
    limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100))),
});
export type searchTagsCommand = v.InferInput<typeof searchTagsSchema>;