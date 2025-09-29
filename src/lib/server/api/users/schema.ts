import * as v from "valibot";

const userSchema = v.object({
    id: v.pipe(v.string()),
    firstName: v.nullable(v.string()),
    lastName: v.nullable(v.string()),
    email: v.pipe(v.string(), v.email('Please enter a valid email address'))
});

export const updateUserSchema = v.partial(userSchema);

const createUserSchema = v.omit(
    userSchema,
    ['id']
);

export type User = v.InferOutput<typeof userSchema>;
export type UpdateUser = v.InferOutput<typeof updateUserSchema>;
export type CreateUser = v.InferOutput<typeof createUserSchema>;
