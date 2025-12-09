<script lang="ts">
    import { authClientBase } from "$lib/client/auth-client-base";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";

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
            await authClient.requestPasswordReset({
                email,
                redirectTo: data.basePath + '/reset-password',
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

<div class="flex min-h-screen items-center justify-center bg-muted/40 p-4">
    <Card class="w-full max-w-md">
        <CardHeader class="space-y-1">
            <CardTitle class="text-2xl font-bold tracking-tight">Forgot Password?</CardTitle>
            <CardDescription>Enter your email address and we'll send you instructions to reset your password</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
            {#if successMessage}
                <div class="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900 rounded-md border px-4 py-3 text-sm">
                    {successMessage}
                </div>
            {/if}

            {#if errorMessage}
                <div class="bg-destructive/10 text-destructive border-destructive/20 rounded-md border px-4 py-3 text-sm">
                    {errorMessage}
                </div>
            {/if}

            <form onsubmit={(e) => { e.preventDefault(); handleForgotPassword(); }} class="space-y-4">
                <div class="space-y-2">
                    <Label for="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        bind:value={email}
                        disabled={isLoading}
                        autocomplete="email"
                    />
                </div>

                <Button type="submit" class="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                </Button>
            </form>
        </CardContent>
        <CardFooter class="flex flex-col gap-4">
            <div class="text-muted-foreground text-center text-sm">
                Remember your password?
                <a href="/login" class="text-primary hover:underline font-medium">
                    Sign in
                </a>
            </div>
            <div class="text-muted-foreground text-center text-xs">
                <a href="/privacy" class="hover:underline">
                    Privacy Policy
                </a>
                <span class="mx-2">·</span>
                <a href="/terms" class="hover:underline">
                    Terms of Service
                </a>
            </div>
        </CardFooter>
    </Card>
</div>