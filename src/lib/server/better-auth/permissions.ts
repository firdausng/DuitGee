import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";
/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const statement = {
    ...defaultStatements,
    vault: ["create", "share", "update", "delete"],
} as const;

const ac = createAccessControl(statement);

export const user = ac.newRole({
    vault: ["create"],
});
export const admin = ac.newRole({
    vault: ["create", "update"],
});
export const vaultOwner = ac.newRole({
    vault: ["create", "update", "delete"],
    user: ["ban"],
});

export const vaultAdmin = ac.newRole({
    vault: ["update"],
    user: ["ban"],
});

export const vaultMember = ac.newRole({
    vault: ["share"],
});