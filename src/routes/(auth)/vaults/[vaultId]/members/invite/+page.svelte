<script lang="ts">
    import { superForm } from 'sveltekit-superforms';
    import { valibot } from 'sveltekit-superforms/adapters';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';
	import Mailbox from 'phosphor-svelte/lib/Mailbox';
	import Shield from 'phosphor-svelte/lib/Shield';
	import User from 'phosphor-svelte/lib/User';
	import UserPlus from 'phosphor-svelte/lib/UserPlus';
	import ArrowLeft from 'phosphor-svelte/lib/ArrowLeft';
	import Crown from 'phosphor-svelte/lib/Crown';
    import * as v from 'valibot';

    let { data } = $props();

    // Schema for form validation
    const inviteUserSchema = v.object({
        email: v.pipe(
            v.string(),
            v.email('Please enter a valid email address'),
            v.minLength(1, 'Email is required')
        ),
        role: v.pipe(
            v.string(),
            v.picklist(['admin', 'member'], 'Please select a valid role')
        ),
        message: v.optional(v.string(), '')
    });

    const { form, errors, enhance, submitting } = superForm(data.form, {
        validators: valibot(inviteUserSchema)
    });

    // Role options
    const roleOptions = [
        {
            value: 'member',
            label: 'Member',
            description: 'Can view and add expenses, manage categories',
            icon: User,
            color: 'text-gray-600 dark:text-gray-400'
        },
        {
            value: 'admin',
            label: 'Admin',
            description: 'Can manage vault settings and invite other users',
            icon: Shield,
            color: 'text-blue-600 dark:text-blue-400'
        }
    ];
</script>

<svelte:head>
    <title>Invite User - {data.vault.name} - Duitgee</title>
</svelte:head>

<div class="min-h-screen bg-background">
    <div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <!-- Back Button -->
        <div class="mb-6">
            <a
                href={`/vaults/${data.vault.id}/members`}
                class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft class="h-4 w-4 mr-1" />
                Back to Members
            </a>
        </div>

        <!-- Page Header -->
        <div class="mb-8">
            <div class="flex items-center space-x-3 mb-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <UserPlus class="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-foreground">Invite User</h1>
                    <p class="text-muted-foreground">Add someone to {data.vault.name}</p>
                </div>
            </div>
        </div>

        <!-- Invitation Form -->
        <div class="overflow-hidden rounded-lg bg-card shadow">
            <div class="px-6 py-4 border-b border-border">
                <h3 class="text-lg font-medium text-foreground">Invitation Details</h3>
                <p class="mt-1 text-sm text-muted-foreground">
                    Send an invitation to collaborate on this vault
                </p>
            </div>

            <form method="POST" use:enhance class="px-6 py-6 space-y-6">
                <!-- Email Field -->
                <div>
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
                            bind:value={$form.email}
                            class="pl-10"
                            placeholder="user@example.com"
                            aria-invalid={$errors.email ? 'true' : undefined}
                            required
                        />
                    </div>
                    {#if $errors.email}
                        <p class="mt-2 text-sm text-destructive">{$errors.email}</p>
                    {/if}
                </div>

                <!-- Role Selection -->
                <div>
                    <label class="block text-sm font-medium text-foreground mb-3">
                        Role
                    </label>
                    <div class="space-y-3">
                        {#each roleOptions as role}
                            <label class="relative flex items-start p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer">
                                <div class="flex items-center h-5">
                                    <input
                                        type="radio"
                                        name="role"
                                        value={role.value}
                                        bind:group={$form.role}
                                        class="h-4 w-4 text-primary border-border focus:ring-primary focus:ring-2"
                                    />
                                </div>
                                <div class="ml-3 flex-1">
                                    <div class="flex items-center space-x-2">
                                        <svelte:component this={role.icon} class="h-4 w-4 {role.color}" />
                                        <span class="text-sm font-medium text-foreground">
                                            {role.label}
                                        </span>
                                    </div>
                                    <p class="text-sm text-muted-foreground mt-1">
                                        {role.description}
                                    </p>
                                </div>
                            </label>
                        {/each}
                    </div>
                    {#if $errors.role}
                        <p class="mt-2 text-sm text-destructive">{$errors.role}</p>
                    {/if}
                </div>

                <!-- Optional Message -->
                <div>
                    <label for="message" class="block text-sm font-medium text-foreground mb-2">
                        Personal Message (Optional)
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        bind:value={$form.message}
                        rows={3}
                        class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Hi! I'd like to invite you to collaborate on this vault..."
                    ></textarea>
                    {#if $errors.message}
                        <p class="mt-2 text-sm text-destructive">{$errors.message}</p>
                    {/if}
                </div>

                <!-- Form Errors -->
                {#if $errors._errors}
                    <div class="rounded-md bg-destructive/10 p-4">
                        <div class="text-sm text-destructive">
                            {#each $errors._errors as error}
                                <p>{error}</p>
                            {/each}
                        </div>
                    </div>
                {/if}

                <!-- Action Buttons -->
                <div class="flex items-center justify-end space-x-3 pt-4 border-t border-border">
                    <a href={`/vaults/${data.vault.id}/members`}>
                        <Button variant="outline">
                            Cancel
                        </Button>
                    </a>
                    <Button
                        type="submit"
                        disabled={$submitting}
                        class="flex items-center space-x-2"
                    >
                        <UserPlus class="h-4 w-4" />
                        <span>{$submitting ? 'Sending...' : 'Send Invitation'}</span>
                    </Button>
                </div>
            </form>
        </div>

        <!-- Info Card -->
        <div class="mt-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
            <div class="flex items-start space-x-3">
                <div class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                    <Crown class="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h4 class="text-sm font-medium text-blue-900 dark:text-blue-300">
                        About Vault Permissions
                    </h4>
                    <div class="mt-1 text-sm text-blue-700 dark:text-blue-400">
                        <ul class="list-disc list-inside space-y-1">
                            <li><strong>Members</strong> can view the vault, add expenses, and manage categories</li>
                            <li><strong>Admins</strong> can do everything members can do, plus invite users and modify vault settings</li>
                            <li><strong>Owners</strong> have full control and can transfer ownership</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
