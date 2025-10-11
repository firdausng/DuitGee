<script lang="ts">
    import { onMount } from 'svelte';

    let query = '';
    let showDropdown = false;
    let selected = null;

    let items = $state<string[]>([
        'Apple', 'Banana', 'Cherry', 'Grape', 'Mango', 'Orange', 'Pineapple', 'Strawberry'
    ]);

    let filtered = $derived(items.filter(item => item.toLowerCase().includes(query.toLowerCase())));

    function selectItem(item: string) {
        selected = item;
        query = item;
        showDropdown = false;
    }

    function handleFocus() {
        showDropdown = true;
    }

    function handleBlur() {
        // Delay hiding to allow click selection
        setTimeout(() => (showDropdown = false), 100);
    }
</script>

<div class="relative w-64">
    <input
            type="text"
            class="w-full border rounded px-3 py-2"
            bind:value={query}
            on:focus={handleFocus}
            on:blur={handleBlur}
            placeholder="Search..."
    />

    {#if showDropdown && filtered.length > 0}
        <ul class="absolute z-10 bg-white border rounded w-full mt-1 max-h-48 overflow-y-auto shadow">
            {#each filtered as item}
                <li
                        class="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                        on:mousedown={() => selectItem(item)}
                >
                {item}
                </li>
            {/each}
        </ul>
    {/if}
</div>