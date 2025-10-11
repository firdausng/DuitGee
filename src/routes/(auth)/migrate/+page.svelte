<script lang="ts">
    import { createAuthClient } from 'better-auth/client';
    import { adminClient } from "better-auth/client/plugins";
    import { onMount } from 'svelte';
    import type {UserWithRole} from "better-auth/plugins/admin";


    let {data} = $props()

    const authClient = createAuthClient({
        baseURL: data.basePath,
        plugins: [
            adminClient()
        ],
        session: {
            cookieCache: {
                enabled: true,
                maxAge: 5 * 60 // Cache duration in seconds
            }
        }
    });

    let userList = $state<UserWithRole[]>([]);

    onMount(async ()=>{
        const { data: users, error } = await authClient.admin.listUsers({
            query: {
                searchValue: "some name",
                searchField: "name",
                searchOperator: "contains",
                limit: 100,
                offset: 100,
                sortBy: "name",
                sortDirection: "desc",
                filterField: "email",
                filterValue: "hello@example.com",
                filterOperator: "eq",
            },
        });
        console.log(users);

        if(users){
            userList = users.users;
        }

    })
    

    const session = authClient.useSession;

</script>

<svelte:head>
    <title>Migrate - DuitGee</title>
</svelte:head>

{#each userList as user}
    {user.name}
{/each}
