export const load = async ({ fetch }) => {
	try {
		// Fetch pending (received) invitations
		const receivedResponse = await fetch('/api/getPendingInvitations');
		const receivedResult = await receivedResponse.json();

		// Fetch sent invitations
		const sentResponse = await fetch('/api/getSentInvitations');
		const sentResult = await sentResponse.json();

		return {
			receivedInvitations: receivedResult.success ? receivedResult.data : [],
			sentInvitations: sentResult.success ? sentResult.data : []
		};
	} catch (error) {
		console.error('Failed to fetch invitations:', error);
		return {
			receivedInvitations: [],
			sentInvitations: []
		};
	}
};
