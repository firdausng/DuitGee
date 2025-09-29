<script lang="ts">
    import { Button } from "bits-ui";
    import HouseSimple from "phosphor-svelte/lib/HouseSimple";
    import SignIn from "phosphor-svelte/lib/SignIn";
    import {goto} from "$app/navigation";
</script>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center">
            <SignIn class="w-8 h-8 text-accent-foreground" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Successfully Logged Out
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
            You have been securely signed out of your account
        </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-background-alt py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            <div class="space-y-6">
                <div class="text-center">
                    <p class="text-sm text-gray-600 mb-6">
                        Thank you for using our platform. Your session has ended safely.
                    </p>
                    
                    <div class="space-y-3">
                        <Button.Root
                            class="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-accent-foreground bg-accent hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
                            onclick={() => goto('/login')}
                        >
                            <SignIn class="w-4 h-4" />
                            <span>Sign In Again</span>
                        </Button.Root>
                        
                        <Button.Root
                            class="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-border-input rounded-md shadow-sm text-sm font-medium text-foreground-alt bg-background-alt hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
                            onclick={() => goto('/')}
                        >
                            <HouseSimple class="w-4 h-4" />
                            <span>Go to Home</span>
                        </Button.Root>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
