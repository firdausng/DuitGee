<script lang="ts">
    import { createAuthClient } from 'better-auth/client';
    import { oneTapClient } from "better-auth/client/plugins";
    import {goto} from "$app/navigation";

    let {data} = $props()

    const authClient = createAuthClient({
        baseURL: data.basePath,
        plugins: [
            oneTapClient({
                clientId: data.googleClientId,
                // Optional client configuration:
                autoSelect: false,
                cancelOnTapOutside: true,
                context: "signin",
                additionalOptions: {
                    // Any extra options for the Google initialize method
                },
                // Configure prompt behavior and exponential backoff:
                promptOptions: {
                    baseDelay: 1000,   // Base delay in ms (default: 1000)
                    maxAttempts: 5     // Maximum number of attempts before triggering onPromptNotification (default: 5)
                }
            })
        ],
        session: {
            cookieCache: {
                enabled: true,
                maxAge: 5 * 60 // Cache duration in seconds
            }
        }
    });

    async function signUp() {
        console.log("signUp");
        await authClient.signUp.email({
            email: 'user@example.com',
            password: 'password123',
            name: 'John Doe',
        });
    }

    async function signInGoogle() {
        const response = await authClient.signIn.social({
            provider: "google",
            callbackURL: "/",
            errorCallbackURL: "/error",
            // newUserCallbackURL: "/",
            // disableRedirect: true,
        });

        console.log("response", response);
    }

    async function signOut() {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    goto("/logged-out"); // redirect to login page
                },
            },
        });
    }

    async function getUserData() {
        const data = await fetch("/api/users", {});
        console.log("getUserData",data);
    }

    async function getAccessToken() {
        const data = await authClient.getAccessToken({
            providerId: "google", // or any other provider id
            //accountId: "accountId", // optional, if you want to get the access token for a specific account
        });
        console.log("getAccessToken",data);
        if (data.error) {
            return data.error;
        }

        accessToken = data.data.accessToken;
    }

    const oneTapGoogle = async ()=> await authClient.oneTap();

    const session = authClient.useSession;
    let accessToken = $state<string | null>(null);

</script>

<svelte:head>
    <title>Test - DuitGee</title>
</svelte:head>

<div class="flex flex-col gap-4">
    <button class="p-2 bg-metal-500" onclick={()=>signUp()}>
        Sign Up
    </button>

    <button onclick={()=>signInGoogle()}>
        Google Sign In
    </button>

    <button onclick={()=>signOut()}>
        Sign Out
    </button>

    <button onclick={()=>getAccessToken()}>
        Access Token
    </button>

    <button onclick={()=> oneTapGoogle()}>
        one tap google
    </button>

    <button onclick={()=>getUserData()}>
        Get User Data
    </button>

    <div class="flex flex-col gap-4 border-2 border-metal-500 p-4">
        <pre>
            {JSON.stringify($session, null, 2)}
        </pre>
        <p>
            {accessToken}
        </p>
    </div>
</div>
