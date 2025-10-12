<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
    import {authClientBase} from "$lib/auth-client-base";

    let {data} = $props();
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let firstName = $state('');
	let lastName = $state('');
	let isLoading = $state(false);
	let errorMessage = $state('');

    let {basePath, callbackPath} = data;
    let authClient = authClientBase({basePath: data.basePath});

	async function handleEmailAuth() {
		errorMessage = '';

		if (!email || !password) {
			errorMessage = 'Email and password are required';
			return;
		}

		if (password !== confirmPassword) {
			errorMessage = 'Passwords do not match';
			return;
		}

		if (!firstName || !lastName) {
			errorMessage = 'First name and last name are required';
			return;
		}

		try {
			// TODO: Implement authentication logic
			console.log('Register', { email, password, firstName, lastName });
            const { data, error } = await authClient.signUp.email({
                email, // user email address
                password, // user password -> min 8 characters by default
                name: `${firstName} ${lastName}`, // user display name
                //image, // User image URL (optional)
                callbackURL: callbackPath // A URL to redirect to after the user verifies their email (optional)
            }, {
                onRequest: (ctx) => {
                    isLoading = true;
                },
                onSuccess: (ctx) => {
                    //redirect to the dashboard or sign in page
                },
                onError: (ctx) => {
                    // display the error message
                    alert(ctx.error.message);
                },
            });
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Registration failed';
		} finally {
			isLoading = false;
		}
	}

	async function handleGoogleSignup() {
		isLoading = true;
		try {
            const response = await authClient.signIn.social({
                provider: "google",
                callbackURL: callbackPath,
                errorCallbackURL: "/error",
            });
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Google signup failed';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign Up - DuitGee</title>
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
			<p class="text-muted-foreground">Create your account</p>
		</div>

		<!-- Main Card -->
		<div class="bg-card border border-border rounded-lg shadow-lg p-6 sm:p-8">
			<h2 class="text-2xl font-semibold text-center mb-6">Sign Up</h2>

			<!-- Error Message -->
			{#if errorMessage}
				<div class="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
					{errorMessage}
				</div>
			{/if}

			<!-- Google Signup Button -->
			<Button
				variant="outline"
				class="w-full mb-6"
				onclick={handleGoogleSignup}
				disabled={isLoading}
			>
				<svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					/>
					<path
						fill="currentColor"
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					/>
					<path
						fill="currentColor"
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
					/>
					<path
						fill="currentColor"
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					/>
				</svg>
				Sign up with Google
			</Button>

			<!-- Divider -->
			<div class="relative mb-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-border"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="px-2 bg-card text-muted-foreground">Or continue with email</span>
				</div>
			</div>

			<!-- Email/Password Form -->
			<form onsubmit={(e) => { e.preventDefault(); handleEmailAuth(); }}>
				<div class="grid grid-cols-2 gap-4 mb-4">
					<div>
						<label for="firstName" class="block text-sm font-medium text-foreground mb-1.5">
							First Name
						</label>
						<Input
							id="firstName"
							type="text"
							bind:value={firstName}
							placeholder="John"
							disabled={isLoading}
						/>
					</div>
					<div>
						<label for="lastName" class="block text-sm font-medium text-foreground mb-1.5">
							Last Name
						</label>
						<Input
							id="lastName"
							type="text"
							bind:value={lastName}
							placeholder="Doe"
							disabled={isLoading}
						/>
					</div>
				</div>

				<div class="mb-4">
					<label for="email" class="block text-sm font-medium text-foreground mb-1.5">
						Email Address
					</label>
					<Input
						id="email"
						type="email"
						bind:value={email}
						placeholder="you@example.com"
						disabled={isLoading}
					/>
				</div>

				<div class="mb-4">
					<label for="password" class="block text-sm font-medium text-foreground mb-1.5">
						Password
					</label>
					<Input
						id="password"
						type="password"
						bind:value={password}
						placeholder="••••••••"
						disabled={isLoading}
					/>
				</div>

				<div class="mb-6">
					<label for="confirmPassword" class="block text-sm font-medium text-foreground mb-1.5">
						Confirm Password
					</label>
					<Input
						id="confirmPassword"
						type="password"
						bind:value={confirmPassword}
						placeholder="••••••••"
						disabled={isLoading}
					/>
				</div>

				<Button
					type="submit"
					class="w-full"
					disabled={isLoading}
				>
					{#if isLoading}
						<div class="flex items-center justify-center">
							<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
							Creating account...
						</div>
					{:else}
						Create Account
					{/if}
				</Button>
			</form>

			<!-- Login Link -->
			<div class="mt-6 text-center">
				<p class="text-sm text-muted-foreground">
					Already have an account?
					<a href="/login" class="text-primary hover:underline font-medium">
						Login
					</a>
				</p>
			</div>
		</div>

		<!-- Footer -->
		<p class="text-center text-sm text-muted-foreground mt-6">
			By continuing, you agree to our
			<a href="/terms" class="text-primary hover:underline">Terms of Service</a>
			and
			<a href="/privacy" class="text-primary hover:underline">Privacy Policy</a>
		</p>
	</div>
</div>
