<script lang="ts">
    import ShieldWarning from "phosphor-svelte/lib/ShieldWarning";
    
    let { data } = $props();
</script>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldWarning class="w-8 h-8 text-red-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Access Denied
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
            You don't have permission to access this application
        </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-background-alt py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            <div class="space-y-6">
                <div class="text-center">
                    <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <ShieldWarning class="w-5 h-5 text-red-400" />
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-red-800">
                                    Unauthorized Access
                                </h3>
                                <div class="mt-2 text-sm text-red-700 flex flex-col gap-4">
                                    <p>You are not authorized to view this page. Please sign in with an account that has the necessary permissions.</p>
                                    <p class="font-semibold">{data.error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-3">
<!--                        <Button.Root-->
<!--                            class="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"-->
<!--                            onclick={() => goto('/login')}-->
<!--                        >-->
<!--                            <SignIn class="w-4 h-4" />-->
<!--                            <span>Sign In</span>-->
<!--                        </Button.Root>-->
<!--                        -->
<!--                        <Button.Root-->
<!--                            class="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-primary-50 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"-->
<!--                            onclick={() => goto('/')}-->
<!--                        >-->
<!--                            <HouseSimple class="w-4 h-4" />-->
<!--                            <span>Go to Home</span>-->
<!--                        </Button.Root>-->
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
