import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/server/db/schema';
import { invitation, vaults } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const getSentInvitations = async (
	session: App.AuthSession,
	env: Cloudflare.Env
) => {
	const client = drizzle(env.DB, { schema });

	// Get all invitations sent by the current user
	const invitations = await client
		.select({
			id: invitation.id,
			vaultId: invitation.vaultId,
			role: invitation.role,
			status: invitation.status,
			inviterId: invitation.inviterId,
			inviteeId: invitation.inviteeId,
			vaultName: vaults.name,
			vaultIcon: vaults.icon,
			vaultColor: vaults.color
		})
		.from(invitation)
		.leftJoin(vaults, eq(invitation.vaultId, vaults.id))
		.where(eq(invitation.inviterId, session.user.id))
		.orderBy(invitation.id);

	return invitations;
};
