<script lang="ts">
    import { Avatar, DropdownMenu, Separator } from "bits-ui";
    import CaretDown from "phosphor-svelte/lib/CaretDown";
    import UserCircle from "phosphor-svelte/lib/UserCircle";
    import SignOut from "phosphor-svelte/lib/SignOut";
    import CheckCircle from "phosphor-svelte/lib/CheckCircle";

    let { activeUser, onLogout }: { activeUser: App.User, onLogout: ()=> void } = $props();

    // Generate avatar URL using ui-avatars service
    let avatar = $derived(() => {
        const name = encodeURIComponent(`${activeUser.name || ''}`.trim() || activeUser.email);
        return `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff&size=128`;
    });

    // Generate initials
    let initials = $derived(() => {
        if (activeUser.name) {
            return `${activeUser.name.charAt(0)}`.toUpperCase();
        }
        return activeUser.email.substring(0, 2).toUpperCase();
    });

    // Display name
    let displayName = $derived(() => {
        if (activeUser.name) {
            return `${activeUser.name}`;
        }
        return activeUser.email.split('@')[0];
    });
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger
        class="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/20"
    >
        <div class="flex items-center space-x-3">
            <!-- Avatar -->
            <div class="relative">
                <Avatar.Root
                    delayMs={200}
                    class="h-8 w-8 rounded-full border-2 border-background shadow-sm overflow-hidden"
                >
                    <Avatar.Image
                        src={avatar()}
                        class="h-full w-full object-cover rounded-full"
                        alt={displayName()}
                    />
                    <Avatar.Fallback
                        class="h-full w-full bg-accent text-accent-foreground text-sm font-medium flex items-center justify-center rounded-full"
                    >
                        {initials()}
                    </Avatar.Fallback>
                </Avatar.Root>

                <!-- Online status indicator -->
                <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
            </div>

            <!-- User info (hidden on mobile) -->
            <div class="hidden md:flex flex-col text-left min-w-0">
                <span class="text-sm font-medium text-foreground truncate">
                    {displayName()}
                </span>
                <span class="text-xs text-muted-foreground truncate">
                    {activeUser.email}
                </span>
            </div>

            <!-- Caret -->
            <CaretDown class="w-4 h-4 text-muted-foreground transition-transform hidden md:block" />
        </div>
    </DropdownMenu.Trigger>

    <DropdownMenu.Portal>
        <DropdownMenu.Content
            class="w-64 sm:w-72 rounded-xl border border-border bg-background shadow-lg p-2 z-[9999] min-w-0"
            sideOffset={8}
            align="end"
            avoidCollisions={true}
            collisionPadding={8}
            side="bottom"
        >
            <!-- User Info Header -->
            <div class="flex items-center space-x-3 p-3 mb-2">
                <Avatar.Root
                    delayMs={200}
                    class="h-10 w-10 rounded-full border-2 border-background shadow-sm overflow-hidden"
                >
                    <Avatar.Image
                        src={avatar()}
                        class="h-full w-full object-cover rounded-full"
                        alt={displayName()}
                    />
                    <Avatar.Fallback
                        class="h-full w-full bg-accent text-accent-foreground text-sm font-medium flex items-center justify-center rounded-full"
                    >
                        {initials()}
                    </Avatar.Fallback>
                </Avatar.Root>

                <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2">
                        <p class="text-sm font-semibold text-foreground truncate">
                            {displayName()}
                        </p>
                        <!-- Email verification indicator - assuming all users are verified for now -->
                        <CheckCircle class="w-4 h-4 text-green-500 flex-shrink-0" weight="fill" />
                    </div>
                    <p class="text-xs text-muted-foreground truncate">
                        {activeUser.email}
                    </p>
                    <!-- Verified badge -->
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 mt-1">
                        Verified
                    </span>
                </div>
            </div>

            <Separator.Root class="bg-border h-px w-full" />

            <!-- Menu Items -->
            <div class="py-2">
                <DropdownMenu.Item
                    class="flex items-center space-x-3 w-full p-3 text-sm rounded-lg hover:bg-muted focus:bg-muted transition-colors cursor-pointer focus:outline-none"
                >
                    <a href="/profile" class="flex items-center space-x-3 w-full">
                        <UserCircle class="w-4 h-4 text-muted-foreground" />
                        <div class="flex flex-col">
                            <span class="text-foreground font-medium">Profile</span>
                            <span class="text-xs text-muted-foreground">Manage your account</span>
                        </div>
                    </a>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                    class="flex items-center space-x-3 w-full p-3 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 transition-colors cursor-pointer focus:outline-none"
                >
                    <button onclick={()=> onLogout()} class="flex items-center space-x-3 w-full">
                        <SignOut class="w-4 h-4 text-red-600 dark:text-red-400" />
                        <div class="flex flex-col">
                            <span class="text-red-700 dark:text-red-400 font-medium">Sign out</span>
                            <span class="text-xs text-red-600 dark:text-red-500">End your session</span>
                        </div>
                    </button>
                </DropdownMenu.Item>
            </div>
        </DropdownMenu.Content>
    </DropdownMenu.Portal>
</DropdownMenu.Root>