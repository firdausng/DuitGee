<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
    import {createAuthClient} from "better-auth/client";
    import {oneTapClient} from "better-auth/client/plugins";

    let {data} = $props();
	let isLogin = $state(true); // true = login, false = register
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let firstName = $state('');
	let lastName = $state('');
	let isLoading = $state(false);
	let errorMessage = $state('');

    const authClient = createAuthClient({
        baseURL: data.basePath,
        session: {
            cookieCache: {
                enabled: true,
                maxAge: 5 * 60 // Cache duration in seconds
            }
        }
    });

	async function handleEmailAuth() {
		errorMessage = '';

		if (!email || !password) {
			errorMessage = 'Email and password are required';
			return;
		}

		if (!isLogin) {
			if (password !== confirmPassword) {
				errorMessage = 'Passwords do not match';
				return;
			}
			if (!firstName || !lastName) {
				errorMessage = 'First name and last name are required';
				return;
			}
		}

		isLoading = true;
		try {
			// TODO: Implement authentication logic
			console.log(isLogin ? 'Login' : 'Register', { email, password, firstName, lastName });
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Authentication failed';
		} finally {
			isLoading = false;
		}
	}

	async function handleGoogleLogin() {
		isLoading = true;
		try {
            const response = await authClient.signIn.social({
                provider: "google",
                callbackURL: "/callback",
                errorCallbackURL: "/error",
                // newUserCallbackURL: "/",
                // disableRedirect: true,
            });
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Google login failed';
		} finally {
			isLoading = false;
		}
	}

	function resetForm() {
		errorMessage = '';
		password = '';
		confirmPassword = '';
	}
</script>

<svelte:head>
	<title>{isLogin ? 'Login' : 'Sign Up'} - DuitGee</title>
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
			<p class="text-muted-foreground">Track your expenses with ease</p>
		</div>

		<!-- Main Card -->
		<div class="bg-card border border-border rounded-lg shadow-lg p-6 sm:p-8">
			<!-- Tab Headers -->
			<div class="flex gap-2 mb-6">
				<button
					onclick={() => { isLogin = true; resetForm(); }}
					class="flex-1 py-2 px-4 rounded-md font-medium transition-all {
						isLogin
							? 'bg-primary text-primary-foreground shadow-sm'
							: 'bg-muted text-muted-foreground hover:bg-muted/80'
					}"
				>
					Login
				</button>
				<button
					onclick={() => { isLogin = false; resetForm(); }}
					class="flex-1 py-2 px-4 rounded-md font-medium transition-all {
						!isLogin
							? 'bg-primary text-primary-foreground shadow-sm'
							: 'bg-muted text-muted-foreground hover:bg-muted/80'
					}"
				>
					Sign Up
				</button>
			</div>

			<!-- Error Message -->
			{#if errorMessage}
				<div class="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
					{errorMessage}
				</div>
			{/if}

			<!-- Google Login Button -->
			<Button
				variant="outline"
				class="w-full mb-6"
				onclick={handleGoogleLogin}
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
				{isLogin ? 'Login' : 'Sign up'} with Google
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
				{#if !isLogin}
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
				{/if}

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

				{#if !isLogin}
					<div class="mb-4">
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
				{/if}

				{#if isLogin}
					<div class="flex items-center justify-between mb-6">
						<label class="flex items-center">
							<input type="checkbox" class="mr-2 h-4 w-4 rounded border-border text-primary" />
							<span class="text-sm text-muted-foreground">Remember me</span>
						</label>
						<a href="/forgot-password" class="text-sm text-primary hover:underline">
							Forgot password?
						</a>
					</div>
				{/if}

				<Button
					type="submit"
					class="w-full"
					disabled={isLoading}
				>
					{#if isLoading}
						<div class="flex items-center justify-center">
							<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
							{isLogin ? 'Logging in...' : 'Creating account...'}
						</div>
					{:else}
						{isLogin ? 'Login' : 'Create Account'} with Email
					{/if}
				</Button>
			</form>
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
