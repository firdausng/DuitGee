<script lang="ts">
	import EnvelopeSimple from 'phosphor-svelte/lib/EnvelopeSimple';
	import X from 'phosphor-svelte/lib/X';
	import PaperPlaneTilt from 'phosphor-svelte/lib/PaperPlaneTilt';
	import { authClientBase } from '$lib/auth-client-base';

	let { emailVerified = true, userEmail = '', basePath = '', callbackPath = '/' } = $props();

	let dismissed = $state(false);
	let isResending = $state(false);
	let resendSuccess = $state(false);
	let resendError = $state('');

	const authClient = authClientBase({ basePath });

	function handleDismiss() {
		dismissed = true;
		// Store dismissal in localStorage to remember across sessions
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('emailVerificationReminderDismissed', 'true');
		}
	}

	async function handleResendEmail() {
		if (!userEmail) return;

		resendError = '';
		resendSuccess = false;
		isResending = true;

		try {
			await authClient.sendVerificationEmail({
				email: userEmail,
				callbackURL: callbackPath
			});

			resendSuccess = true;

			// Auto-hide success message after 5 seconds
			setTimeout(() => {
				resendSuccess = false;
			}, 5000);
		} catch (error) {
			resendError = error instanceof Error ? error.message : 'Failed to send verification email';

			// Auto-hide error message after 5 seconds
			setTimeout(() => {
				resendError = '';
			}, 5000);
		} finally {
			isResending = false;
		}
	}

	// Check if user previously dismissed the reminder
	$effect(() => {
		if (typeof localStorage !== 'undefined') {
			const wasDismissed = localStorage.getItem('emailVerificationReminderDismissed');
			if (wasDismissed === 'true') {
				dismissed = true;
			}
		}
	});

	// Clear dismissal flag when email is verified
	$effect(() => {
		if (emailVerified && typeof localStorage !== 'undefined') {
			localStorage.removeItem('emailVerificationReminderDismissed');
		}
	});
</script>

<!-- Only show if email is not verified and user hasn't dismissed -->
{#if !emailVerified && !dismissed}
	<div
		class="w-full bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900"
	>
		<div class="max-w-7xl mx-auto px-4 py-3">
			<div class="flex items-center justify-between gap-4">
				<div class="flex items-center gap-3 flex-1 min-w-0">
					<div class="flex-shrink-0">
						<EnvelopeSimple class="w-5 h-5 text-amber-600 dark:text-amber-500" />
					</div>
					<div class="flex-1 min-w-0">
						{#if resendSuccess}
							<p class="text-sm text-green-700 dark:text-green-400">
								<span class="font-medium">Verification email sent!</span>
								<span class="hidden sm:inline">
									Check your inbox ({userEmail}) for the verification link.
								</span>
							</p>
						{:else if resendError}
							<p class="text-sm text-red-700 dark:text-red-400">
								<span class="font-medium">Error:</span> {resendError}
							</p>
						{:else}
							<p class="text-sm text-amber-800 dark:text-amber-200">
								<span class="hidden sm:inline">
									Please check your inbox ({userEmail}) and verify your email address to access
									all features.
								</span>
								<span class="sm:hidden"> Please verify your email to continue. </span>
							</p>
						{/if}
					</div>
				</div>

				<div class="flex items-center gap-2 flex-shrink-0">
					{#if !resendSuccess}
						<button
							onclick={handleResendEmail}
							disabled={isResending}
							class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
							title="Resend verification email"
						>
							{#if isResending}
								<div
									class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"
								></div>
								<span class="hidden sm:inline">Sending...</span>
							{:else}
								<PaperPlaneTilt class="w-3.5 h-3.5" />
								<span class="hidden sm:inline">Resend Email</span>
							{/if}
						</button>
					{/if}

					<button
						onclick={handleDismiss}
						class="p-1 rounded-md text-amber-600 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20"
						title="Dismiss reminder"
					>
						<X class="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
