<script lang="ts">
    import { Tween } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import { formatCurrency } from '$lib/utils'; // Adjust path to your utils

    let { value, duration = 500 } = $props();

    // 1. Initialize Tween
    const displayedAmount = new Tween(value, {
        duration,
        easing: cubicOut
    });

    // 2. Sync Tween when prop changes
    $effect(() => {
        displayedAmount.target = value;
    });
</script>

<span>
    {formatCurrency(displayedAmount.current)}
</span>

<!--<style>-->
<!--    /* Ensures all numbers have equal width so they don't wiggle */-->
<!--    .tabular-nums {-->
<!--        font-variant-numeric: tabular-nums;-->
<!--    }-->
<!--</style>-->