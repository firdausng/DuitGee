<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { slide,  } from "svelte/transition";

    type Props = {
        show: boolean;
        email: string;
        role: 'admin' | 'member';
        isInviting: boolean;
        onEmailChange: (value: string) => void;
        onRoleChange: (role: 'admin' | 'member') => void;
        onSubmit: () => void;
        onCancel: () => void;
    };

    let {
        show,
        email,
        role,
        isInviting,
        onEmailChange,
        onRoleChange,
        onSubmit,
        onCancel
    }: Props = $props();
</script>

{#if show}
    <div class="" in:slide={{ duration: 300 }}
         out:slide={{ duration: 100 }}>
        <Card class="mb-6">
            <CardHeader>
                <CardTitle>Invite User</CardTitle>
                <CardDescription>Send an invitation to collaborate on this vault</CardDescription>
            </CardHeader>
            <CardContent>
                <form onsubmit={(e) => { e.preventDefault(); onSubmit(); }} class="space-y-4">
                    <div class="space-y-2">
                        <Label for="inviteEmail">Email address</Label>
                        <Input
                                id="inviteEmail"
                                type="email"
                                placeholder="user@example.com"
                                value={email}
                                oninput={(e) => onEmailChange(e.currentTarget.value)}
                                required
                                disabled={isInviting}
                        />
                    </div>
                    <div class="space-y-2">
                        <Label for="inviteRole">Role</Label>
                        <select
                                id="inviteRole"
                                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={role}
                                onchange={(e) => onRoleChange(e.currentTarget.value as 'admin' | 'member')}
                                disabled={isInviting}
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div class="flex gap-2">
                        <Button type="submit" disabled={isInviting}>
                            {isInviting ? 'Sending...' : 'Send Invitation'}
                        </Button>
                        <Button type="button" variant="outline" onclick={onCancel} disabled={isInviting}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>

{/if}
