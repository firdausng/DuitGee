import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/server/db/schema';
import { invitation } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const declineVaultInvitation = async (
	invitationId: string,
	session: App.AuthSession,
	env: Cloudflare.Env
) => {
	const client = drizzle(env.DB, { schema });

	// Get the invitation
	const [existingInvitation] = await client
		.select()
		.from(invitation)
		.where(
			and(
				eq(invitation.id, invitationId),
				eq(invitation.inviteeId, session.user.id),
				eq(invitation.status, 'pending')
			)
		)
		.limit(1);

	if (!existingInvitation) {
		throw new Error('Invitation not found or already processed');
	}

	// Update invitation status to declined
	const [updatedInvitation] = await client
		.update(invitation)
		.set({ status: 'declined' })
		.where(eq(invitation.id, invitationId))
		.returning();

	return {
		invitation: updatedInvitation
	};
};
