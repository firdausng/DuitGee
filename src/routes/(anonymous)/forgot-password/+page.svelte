<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { authClientBase } from "$lib/auth-client-base";
	import EnvelopeSimple from 'phosphor-svelte/lib/EnvelopeSimple';
	import ArrowLeft from 'phosphor-svelte/lib/ArrowLeft';

	let { data } = $props();

	let authClient = authClientBase({ basePath: data.basePath });

	let email = $state('');
	let isLoading = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	async function handleForgotPassword() {
		errorMessage = '';
		successMessage = '';

		if (!email) {
			errorMessage = 'Email is required';
			return;
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			errorMessage = 'Please enter a valid email address';
			return;
		}

		isLoading = true;
		try {
			await authClient.forgetPassword({
				email,
				redirectTo: data.callbackPath || '/'
			});

			successMessage = `Password reset instructions have been sent to ${email}. Please check your inbox and spam folder.`;
			email = ''; // Clear the email field
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Failed to send reset email. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Forgot Password - DuitGee</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4 sm:px-6 lg:px-8">
	<div class="w-full max-w-md">
		<!-- Logo/Brand -->
		<div class="text-center mb-8">
			<div class="flex justify-center mb-4">
				<div class="bg-primary/10 p-4 rounded-2xl">
					<img src="/favicon.svg" alt="DuitGee" class="w-16 h-16" />
				</div>
			</div>
			<h1 class="text-4xl font-bold text-primary mb-2">DuitGee</h1>
			<p class="text-muted-foreground">Reset your password</p>
		</div>

		<!-- Main Card -->
		<div class="bg-card border border-border rounded-lg shadow-lg p-6 sm:p-8">
			<div class="flex items-center justify-center mb-6">
				<div class="bg-primary/10 p-3 rounded-full">
					<EnvelopeSimple class="w-8 h-8 text-primary" />
				</div>
			</div>

			<h2 class="text-2xl font-semibold text-center mb-2">Forgot Password?</h2>
			<p class="text-sm text-muted-foreground text-center mb-6">
				No worries! Enter your email address and we'll send you instructions to reset your password.
			</p>

			<!-- Success Message -->
			{#if successMessage}
				<div class="mb-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-md">
					<p class="text-sm text-green-700 dark:text-green-400">
						{successMessage}
					</p>
				</div>
			{/if}

			<!-- Error Message -->
			{#if errorMessage}
				<div class="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
					{errorMessage}
				</div>
			{/if}

			<!-- Email Form -->
			<form onsubmit={(e) => { e.preventDefault(); handleForgotPassword(); }}>
				<div class="mb-6">
					<label for="email" class="block text-sm font-medium text-foreground mb-1.5">
						Email Address
					</label>
					<Input
						id="email"
						type="email"
						bind:value={email}
						placeholder="you@example.com"
						disabled={isLoading}
						autofocus
					/>
				</div>

				<Button
					type="submit"
					class="w-full mb-4"
					disabled={isLoading}
				>
					{#if isLoading}
						<div class="flex items-center justify-center">
							<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
							Sending...
						</div>
					{:else}
						Send Reset Instructions
					{/if}
				</Button>
			</form>

			<!-- Back to Login -->
			<div class="mt-6 text-center">
				<a
					href="/login"
					class="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
				>
					<ArrowLeft class="w-4 h-4" />
					Back to Login
				</a>
			</div>
		</div>

		<!-- Footer -->
		<p class="text-center text-sm text-muted-foreground mt-6">
			Remember your password?
			<a href="/login" class="text-primary hover:underline font-medium">
				Login here
			</a>
		</p>
	</div>
</div>
