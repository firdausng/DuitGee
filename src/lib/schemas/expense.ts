import * as v from 'valibot';

export const expenseSchema = v.object({
    id: v.string(), // cuid-like id
    note: v.optional(v.string()), // nullable in DB
    amount: v.number(), // real, required
    categoryName: v.string(), // notNull
    userId: v.optional(v.nullable(v.string())), // optional - vault-level expense
    vaultId: v.string(), // required, FK
    date: v.string(), // ISO string date

    // Payment info
    paymentType: v.optional(v.nullable(v.string())),
    paymentProvider: v.optional(v.nullable(v.string())),

    // Audit fields
    createdAt: v.string(),
    createdBy: v.string(), // required
    updatedAt: v.string(),
    updatedBy: v.optional(v.nullable(v.string())),
    deletedAt: v.optional(v.nullable(v.string())),
    deletedBy: v.optional(v.nullable(v.string())),
});

export type Expense = v.InferOutput<typeof expenseSchema>;

export const createExpenseSchema = v.object({
    ...v.pick(expenseSchema, ['note', 'amount', 'categoryName', 'userId', 'vaultId', 'date', 'paymentType', 'paymentProvider']).entries,
    templateId: v.string(),
})

export type CreateExpense = v.InferOutput<typeof createExpenseSchema>;

export const updateExpenseSchema = v.object({
    ...v.pick(createExpenseSchema, ['note', 'amount', 'categoryName', 'userId', 'date', 'paymentType', 'paymentProvider']).entries,
    templateId: v.string(),
})

export type UpdateExpense = v.InferOutput<typeof updateExpenseSchema>;
export const categoryGroupSchema = v.object({
    name: v.pipe(v.string(), v.minLength(1, 'Name must be 1 or more characters long.')),
    description: v.nullable(v.string()),
    color: v.pipe(v.string(), v.minLength(1, 'Color must be 1 or more characters long.'), v.regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')),
    icon: v.nullable(v.string()),
    iconType: v.nullable(v.string()),
    isPublic: v.boolean(),
});

export type CategoryGroup = v.InferOutput<typeof categoryGroupSchema>;

export const categoryGroupListSchema = v.pick(categoryGroupSchema,
    ['name', 'description', 'color', 'icon', 'iconType', 'isPublic'],
);

export const categoryGroupWithCategoriesSchema = v.object({
    name: v.pipe(v.string(), v.minLength(1, 'Name must be 1 or more characters long.')),
    description: v.nullable(v.string()),
    color: v.pipe(v.string(), v.minLength(1, 'Color must be 1 or more characters long.'), v.regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')),
    icon: v.nullable(v.string()),
    iconType: v.nullable(v.string()),
    isPublic: v.boolean(),
    categories: v.array(categoryGroupListSchema)
})

export type CategoryGroupWithCategories = v.InferOutput<typeof categoryGroupWithCategoriesSchema>
export const categorySchema = v.object({
    name: v.pipe(v.string(), v.minLength(1, 'name is required')),
    description: v.string(),
    icon: v.string(),
    iconType: v.string(),
    color: v.string(),
    isPublic: v.boolean(),
    group: v.string(),
});

export type Category = v.InferOutput<typeof categorySchema>;

export const userSchema = v.object({
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

export const vaultSchema = v.object({
    id: v.string(), // cuid-like id
    name: v.string(), // notNull
    description: v.nullable(v.string()), // nullable
    color: v.string(), // default "#3B82F6"
    icon: v.nullable(v.string()), // default "🏦"
    iconType: v.nullable(v.picklist(["emoji", "phosphor"])), // DB default 'emoji'
    ownerId: v.string(), // notNull, user id string
    isPersonal: v.boolean(), // boolean, notNull, default true

    // Audit fields
    createdAt: v.string(),
    createdBy: v.string(),
    updatedAt: v.string(),
    updatedBy: v.nullable(v.string()),
    deletedAt: v.nullable(v.string()),
    deletedBy: v.nullable(v.string()),
});

export type Vault = v.InferOutput<typeof vaultSchema>;
export const createVaultSchema = v.object({
    ...v.omit(vaultSchema, ["createdAt", "createdBy", "id", "updatedAt", "updatedBy", "deletedAt", "deletedBy"]).entries
})

export type CreateVault = v.InferOutput<typeof createVaultSchema>;
export const updateVaultSchema = v.partial(createVaultSchema);

export type Updateault = v.InferOutput<typeof updateVaultSchema>;

export const getUserVaultsByEmailSchema = v.object({
    email: v.pipe(v.string(), v.email())
});


export const vaultMemberSchema = v.object({
	email: v.pipe(v.string(), v.email('Please enter a valid email address')),
	role: v.pipe(v.string(), v.picklist(['member', 'admin']))
});

// Notification types
export const notificationTypes = [
    'vault_invitation',
    'expense_added',
    'vault_member_joined',
    'vault_member_left',
    'category_created',
    'vault_created',
    'vault_updated',
    'system_announcement'
] as const;

export type NotificationType = typeof notificationTypes[number];

// Base notification schema
const notificationSchema = v.object({
    id: v.pipe(v.string()),
    userId: v.pipe(v.string()),
    type: v.pipe(v.string(), v.picklist(notificationTypes)),
    title: v.pipe(v.string(), v.minLength(1, 'Title is required')),
    message: v.pipe(v.string(), v.minLength(1, 'Message is required')),
    isRead: v.boolean(),
    relatedId: v.nullable(v.string()), // Related vault, expense, etc.
    relatedType: v.nullable(v.string()), // 'vault', 'expense', 'user', etc.
    actionUrl: v.nullable(v.string()), // URL to navigate to when clicked
    metadata: v.nullable(v.string()), // JSON string for additional data
    createdAt: v.pipe(v.string()),
    readAt: v.nullable(v.string()),
});

export const createNotificationSchema = v.omit(notificationSchema, ['id', 'createdAt', 'readAt']);
export const updateNotificationSchema = v.partial(
    v.pick(notificationSchema, ['isRead', 'readAt'])
);

export const expenseTemplateSchema = v.object({
    id: v.string(), // cuid-like id
    userId: v.string(), // notNull, owner
    vaultId: v.string(), // required, FK
    name: v.string(), // notNull
    description: v.nullable(v.string()), // nullable
    categoryName: v.nullable(v.string()), // nullable
    defaultAmount: v.nullable(v.number()), // real, nullable
    paymentType: v.nullable(v.string()), // nullable
    paymentProvider: v.nullable(v.string()), // nullable
    note: v.nullable(v.string()), // nullable
    icon: v.nullable(v.string()), // default 📝
    iconType: v.nullable(v.string()), // default emoji
    defaultUserId: v.nullable(v.string()), // nullable, "__creator__" | null | user ID

    // Usage tracking
    usageCount: v.number(), // integer, notNull, default(0)
    lastUsedAt: v.nullable(v.string()), // nullable

});

export type ExpenseTemplate = v.InferOutput<typeof expenseTemplateSchema>;

export const createExpenseTemplateSchema = v.object({
    ...v.omit(expenseTemplateSchema, ["usageCount", "lastUsedAt", "id"]).entries,
})

export type CreateExpenseTemplate = v.InferOutput<typeof createExpenseTemplateSchema>;

export const updateExpenseTemplateSchema = v.intersect([
    v.partial(createExpenseTemplateSchema),
    v.object({
        templateId: v.string(),
    }),
]);
export type UpdateExpenseTemplate = v.InferOutput<typeof updateExpenseTemplateSchema>;


// Schema for inviting a user to a vault
export const inviteUserSchema = v.object({
    email: v.pipe(v.string(), v.email()),
    role: v.picklist(['member', 'admin']),
    permissions: v.picklist(['read', 'write', 'admin'])
});

// Schema for updating member role/permissions
export const updateMemberSchema = v.object({
    role: v.optional(v.picklist(['member', 'admin'])),
    permissions: v.optional(v.picklist(['read', 'write', 'admin']))
});

// Query schema for getUserVaultInvitationsByEmail
export const getInvitationsByEmailSchema = v.object({
    email: v.pipe(v.string(), v.email())
});

export type Notification = v.InferOutput<typeof notificationSchema>;
export type CreateNotification = v.InferOutput<typeof createNotificationSchema>;
export type UpdateNotification = v.InferOutput<typeof updateNotificationSchema>;

export type ExpenseSchema = typeof expenseSchema;
export type CategoryGroupSchema = typeof categoryGroupSchema;
export type CategorySchema = typeof categorySchema;
export type UserSchema = typeof userSchema;
export type VaultSchema = typeof vaultSchema;
export type VaultMemberSchema = typeof vaultMemberSchema;