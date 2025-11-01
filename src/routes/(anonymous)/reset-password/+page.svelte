<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { authClientBase } from "$lib/auth-client-base";
	import Numpad from 'phosphor-svelte/lib/Numpad';
	import ArrowLeft from 'phosphor-svelte/lib/ArrowLeft';

	let { data } = $props();

    const token = data.url.searchParams.get('token');
    if(!token) throw new Error(
        'Token not found in URL'
    );
	let authClient = authClientBase({ basePath: data.basePath });

	let password = $state('');
	let isLoading = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

    async function handleResetPassword() {
        errorMessage = '';
        successMessage = '';

        if (!password) {
            errorMessage = 'Email is required';
            return;
        }

        if (!token) {
            errorMessage = 'token is required';
            return;
        }

        isLoading = true;
        try {
            await authClient.resetPassword({
                newPassword: password,
                token
            });

            successMessage = `Password reset successful! You can now log in with your new password.`;
            password = ''; // Clear the password field

        } catch (error) {
            errorMessage = error instanceof Error ? error.message : 'Failed to send reset password. Please try again.';
        } finally {
            isLoading = false;
        }
    }

</script>

<svelte:head>
	<title>Reset Password - DuitGee</title>
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
            <p class="text-muted-foreground">Change your password</p>
        </div>

        <!-- Main Card -->
        <div class="bg-card border border-border rounded-lg shadow-lg p-6 sm:p-8">
            <div class="flex items-center justify-center mb-6">
                <div class="bg-primary/10 p-3 rounded-full">
                    <Numpad class="w-8 h-8 text-primary" />
                </div>
            </div>

            <h2 class="text-2xl font-semibold text-center mb-2">Reset Password</h2>
            <p class="text-sm text-muted-foreground text-center mb-6">
                Enter your new password below.
            </p>

            <!-- Success Message -->
            {#if successMessage}
                <div class="mb-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-md">
                    <a href="/login" class="text-sm text-green-700 dark:text-green-400">
                        {successMessage}
                    </a>
                </div>
            {/if}

            <!-- Error Message -->
            {#if errorMessage}
                <div class="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                    {errorMessage}
                </div>
            {/if}

            <!-- Email Form -->
            <form onsubmit={(e) => { e.preventDefault(); handleResetPassword(); }}>
                <div class="mb-6">
                    <label for="email" class="block text-sm font-medium text-foreground mb-1.5">
                        Password
                    </label>
                    <Input
                            id="password"
                            type="password"
                            bind:value={password}
                            placeholder="******"
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
                        Reset Password
                    {/if}
                </Button>
            </form>
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
