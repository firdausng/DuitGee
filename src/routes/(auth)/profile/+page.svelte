<script lang="ts">
    import { superForm } from 'sveltekit-superforms';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import { User, Mailbox, AddressBook } from 'phosphor-svelte';

    let { data } = $props();

    const { form, errors, enhance, submitting } = superForm(data.form);

    // Extract display name from user data
    const displayName = $derived(() => {
        if (data.user.firstName && data.user.lastName) {
            return `${data.user.firstName} ${data.user.lastName}`;
        }
        if (data.user.firstName) {
            return data.user.firstName;
        }
        if (data.user.lastName) {
            return data.user.lastName;
        }
        return data.user.email.split('@')[0];
    });

    // Get user initials for avatar
    const userInitials = $derived(() => {
        if (data.user.firstName && data.user.lastName) {
            return `${data.user.firstName.charAt(0)}${data.user.lastName.charAt(0)}`.toUpperCase();
        }
        if (data.user.firstName) {
            return data.user.firstName.substring(0, 2).toUpperCase();
        }
        if (data.user.lastName) {
            return data.user.lastName.substring(0, 2).toUpperCase();
        }
        return data.user.email.substring(0, 2).toUpperCase();
    });
</script>

<svelte:head>
    <title>Profile - Duitgee</title>
</svelte:head>

<div class="min-h-screen bg-background">
    <div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <!-- Page Header -->
        <div class="mb-8">
            <div class="md:flex md:items-center md:justify-between">
                <div class="min-w-0 flex-1">
                    <h1 class="text-2xl font-bold text-foreground sm:text-3xl">Profile</h1>
                    <p class="mt-1 text-muted-foreground">
                        Manage your account settings and personal information
                    </p>
                </div>
            </div>
        </div>

        <div class="space-y-8">
            <!-- Profile Header Card -->
            <div class="overflow-hidden rounded-lg bg-card shadow">
                <div class="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
                    <div class="flex items-center space-x-4">
                        <!-- Avatar -->
                        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white">
                            <span class="text-xl font-semibold">{userInitials()}</span>
                        </div>

                        <!-- User Info -->
                        <div>
                            <h2 class="text-xl font-semibold text-white">{displayName()}</h2>
                            <p class="text-blue-100">{data.user.email}</p>
                            <p class="text-sm text-blue-200">Member since {new Date().getFullYear()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Profile Form -->
            <div class="overflow-hidden rounded-lg bg-card shadow">
                <div class="px-6 py-4 border-b border-border">
                    <h3 class="text-lg font-medium text-foreground">Personal Information</h3>
                    <p class="mt-1 text-sm text-muted-foreground">
                        Update your personal details and contact information.
                    </p>
                </div>

                <form method="POST" use:enhance class="px-6 py-6">
                    <div class="grid gap-6 md:grid-cols-2">
                        <!-- First Name -->
                        <div>
                            <label for="firstName" class="block text-sm font-medium text-foreground mb-2">
                                First Name
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User class="h-4 w-4 text-muted-foreground" />
                                </div>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    bind:value={$form.firstName}
                                    class="pl-10"
                                    placeholder="Enter your first name"
                                    aria-invalid={$errors.firstName ? 'true' : undefined}
                                />
                            </div>
                            {#if $errors.firstName}
                                <p class="mt-2 text-sm text-destructive">{$errors.firstName}</p>
                            {/if}
                        </div>

                        <!-- Last Name -->
                        <div>
                            <label for="lastName" class="block text-sm font-medium text-foreground mb-2">
                                Last Name
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User class="h-4 w-4 text-muted-foreground" />
                                </div>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    bind:value={$form.lastName}
                                    class="pl-10"
                                    placeholder="Enter your last name"
                                    aria-invalid={$errors.lastName ? 'true' : undefined}
                                />
                            </div>
                            {#if $errors.lastName}
                                <p class="mt-2 text-sm text-destructive">{$errors.lastName}</p>
                            {/if}
                        </div>

                        <!-- Email (Read-only) -->
                        <div class="md:col-span-2">
                            <label for="email" class="block text-sm font-medium text-foreground mb-2">
                                Email Address
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mailbox class="h-4 w-4 text-muted-foreground" />
                                </div>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={data.user.email}
                                    class="pl-10 bg-muted cursor-not-allowed"
                                    readonly
                                    disabled
                                />
                            </div>
                            <p class="mt-2 text-sm text-muted-foreground">
                                Email cannot be changed. Contact support if you need to update your email address.
                            </p>
                        </div>
                    </div>

                    <!-- Form Errors -->
                    {#if $errors._errors}
                        <div class="mt-6 rounded-md bg-destructive/10 p-4">
                            <div class="text-sm text-destructive">
                                {#each $errors._errors as error}
                                    <p>{error}</p>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Submit Button -->
                    <div class="mt-8 flex justify-end">
                        <Button
                            type="submit"
                            disabled={$submitting}
                            class="flex items-center space-x-2"
                        >
                            <AddressBook class="h-4 w-4" />
                            <span>{$submitting ? 'Saving...' : 'Save Changes'}</span>
                        </Button>
                    </div>
                </form>
            </div>

            <!-- Account Statistics -->
            <div class="overflow-hidden rounded-lg bg-card shadow">
                <div class="px-6 py-4 border-b border-border">
                    <h3 class="text-lg font-medium text-foreground">Account Overview</h3>
                </div>
                <div class="px-6 py-6">
                    <dl class="grid gap-6 md:grid-cols-3">
                        <div>
                            <dt class="text-sm font-medium text-muted-foreground">User ID</dt>
                            <dd class="mt-1 text-sm text-foreground font-mono">{data.user.id}</dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-muted-foreground">Account Status</dt>
                            <dd class="mt-1">
                                <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    Active
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt class="text-sm font-medium text-muted-foreground">Member Type</dt>
                            <dd class="mt-1 text-sm text-foreground">Standard User</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    </div>
</div>