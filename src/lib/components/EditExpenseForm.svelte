<script lang="ts">
    import {superForm, type SuperValidated} from 'sveltekit-superforms';
    import Button from '$lib/components/ui/Button.svelte';
    import { goto } from '$app/navigation';
    import {type Category, type CreateExpense} from "$lib/schemas/expense";
    import type {PaymentProvider, PaymentType} from "$lib/configuration/paymentTypes";
    import {Combobox, Select} from "bits-ui";
    import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
    import Check from "phosphor-svelte/lib/Check";
    import Cards from "phosphor-svelte/lib/Cards";
    import CaretDoubleUp from "phosphor-svelte/lib/CaretDoubleUp";
    import CaretDoubleDown from "phosphor-svelte/lib/CaretDoubleDown";
    import Bank from "phosphor-svelte/lib/Bank";
    import Wallet from "phosphor-svelte/lib/Wallet";
    import User from "phosphor-svelte/lib/User";
    import CalendarBlank from "phosphor-svelte/lib/CalendarBlank";
    import CurrencyCircleDollar from "phosphor-svelte/lib/CurrencyCircleDollar";
    import Note from "phosphor-svelte/lib/Note";
    import CaretDown from "phosphor-svelte/lib/CaretDown";
    import IconDisplay from '$lib/components/IconDisplay.svelte';

    type Member = {
        userId: string;
        firstName?: string;
        lastName?: string;
        email: string;
        role: string;
        status: string;
    };

    interface Props {
        data: SuperValidated<CreateExpense>;
        categories: Category[];
        paymentTypes: PaymentType[];
        paymentProviders: PaymentProvider[];
        members?: Member[];
        currentUserId: string;
        vaultId: string;
        onCancel?: () => void;
    }

    let {
        data,
        categories,
        paymentTypes,
        paymentProviders,
        members = [],
        currentUserId,
        vaultId,
        onCancel
    }: Props = $props();

    const { form, errors, enhance, submitting } = superForm(data);

    // State for searchable categories
    let allCategories = $state(categories.map(cat => ({
        ...cat,
        value: cat.name,
        label: cat.name,
    })));

    let category = $state($form.categoryName ?? "");
    const selectedCategory = $derived(
        allCategories.find(opt => opt.value === category)
    );

    function getCategory() {
        return $form.categoryName ?? '';
    }

    function setCategory(newValue: string) {
        $form.categoryName = newValue;
        category = newValue;
    }

    // User/Member selection
    let selectedUserId = $state($form.userId ?? "");
    const selectedUserLabel = $derived(
        selectedUserId === ""
            ? "Vault Expense"
            : members.find(m => m.userId === selectedUserId)
                ? `${members.find(m => m.userId === selectedUserId)?.firstName} ${members.find(m => m.userId === selectedUserId)?.lastName}`
                : "Select a user"
    );

    function getUserId() {
        return selectedUserId;
    }

    function setUserId(newValue: string) {
        $form.userId = newValue;
        selectedUserId = newValue;
    }

    // Payment type
    let paymentType = $state($form.paymentType || "");
    const selectedPaymentType = $derived(
        paymentType
            ? paymentTypes.find((type) => type.code === paymentType)
            : null
    );

    function getPaymentType() {
        return paymentType;
    }

    function setPaymentType(newValue: string) {
        $form.paymentType = newValue;
        paymentType = newValue;
        setPaymentProvider("");
    }

    // Payment provider
    let paymentProviderForPaymentType = $derived.by(()=>{
        if(!selectedPaymentType){
            return [];
        }

        if(selectedPaymentType?.code === 'cash'){
            return [];
        }
        if(selectedPaymentType?.code === 'e_wallet' ){
            return paymentProviders.filter(p => p.type === 'e_wallet').map(p => ({
                ...p,
                value: p.id,
                label: p.name,
            }));
        }
        return paymentProviders.filter(p => p.type === 'bank').map(p => ({
            ...p,
            value: p.id,
            label: p.name,
        }));
    })

    let paymentProvider = $state($form.paymentProvider ?? "");
    const selectedPaymentProvider = $derived(
        paymentProviderForPaymentType.find(opt => opt.id === paymentProvider)
    );

    function getPaymentProvider() {
        return $form.paymentProvider ?? "";
    }

    function setPaymentProvider(newValue: string) {
        $form.paymentProvider = newValue;
        paymentProvider = newValue;
    }

    // Show advanced options by default if payment info exists
    let showAdvancedOptions = $state($form.paymentType?.length > 0 || $form.paymentProvider?.length > 0);

    function handleCancel() {
        if (onCancel) {
            onCancel();
        } else {
            goto(`/vaults/${vaultId}/expenses`);
        }
    }

    function formatDateForInput(date: Date | string): string {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Format existing date for editing
    if ($form.date) {
        $form.date = formatDateForInput($form.date);
    }
</script>

<form method="POST" use:enhance class="space-y-4">
    <!-- Hidden fields for payment -->
    <input type="hidden" name="paymentType" value={paymentType} />
    <input type="hidden" name="paymentProvider" value={$form.paymentProvider} />

    <!-- Amount -->
    <div>
        <label for="amount" class="block text-sm font-medium text-foreground mb-1">
            Amount <span class="text-destructive">*</span>
        </label>
        <div class="relative">
            <CurrencyCircleDollar class="text-muted-foreground absolute start-3 top-1/2 size-6 -translate-y-1/2" />
            <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                bind:value={$form.amount}
                placeholder="0.00"
                required
                class="h-input rounded-9px border-border-input bg-background placeholder:text-foreground-alt/50 focus:ring-foreground focus:ring-offset-background focus:outline-hidden inline-flex w-full touch-none border px-11 text-base transition-colors focus:ring-2 focus:ring-offset-2 sm:text-sm"
                aria-invalid={$errors.amount ? 'true' : undefined}
            />
        </div>
        {#if $errors.amount}
            <p class="mt-0.5 text-xs text-destructive">{$errors.amount}</p>
        {/if}
    </div>

    <!-- Category -->
    <div>
        <label for="categoryName" class="block text-sm font-medium text-foreground mb-1">
            Category <span class="text-destructive">*</span>
        </label>
        <Select.Root
                type="single"
                name="categoryName"
                bind:value={getCategory, setCategory}
                items={allCategories}
                allowDeselect={false}
        >
            <Select.Trigger
                    class="h-input rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-full touch-none select-none items-center border px-[11px] text-sm transition-colors"
                    aria-label="Select category"
            >
                <Cards class="text-muted-foreground mr-[9px] size-6" />
                {#if selectedCategory}
                    <div class="flex items-center gap-4">
                        <p>{selectedCategory.name}</p>
                        <IconDisplay icon={selectedCategory.icon} iconType={selectedCategory.iconType} size="sm" />
                    </div>
                {:else}
                    <span class="text-foreground-alt/50">Select a category</span>
                {/if}
                <CaretUpDown class="text-muted-foreground ml-auto size-6" />
            </Select.Trigger>
            <Select.Portal>
                <Select.Content
                        class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden z-50 h-96 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] select-none rounded-xl border px-1 py-3 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
                        sideOffset={10}
                >
                    <Select.ScrollUpButton class="flex w-full items-center justify-center">
                        <CaretDoubleUp class="size-3" />
                    </Select.ScrollUpButton>
                    <Select.Viewport class="p-1">
                        {#each allCategories as option}
                            <Select.Item
                                    class="rounded-button data-highlighted:bg-muted outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm"
                                    value={option.value}
                                    label={option.label}
                            >
                                {#snippet children({ selected })}
                                    <div class="flex items-center gap-4">
                                        <IconDisplay icon={option.icon} iconType={option.iconType} size="sm" />
                                        <p>{option.name}</p>
                                    </div>
                                    {#if selected}
                                        <div class="ml-auto">
                                            <Check aria-label="check" />
                                        </div>
                                    {/if}
                                {/snippet}
                            </Select.Item>
                        {/each}
                    </Select.Viewport>
                    <Select.ScrollDownButton class="flex w-full items-center justify-center">
                        <CaretDoubleDown class="size-3" />
                    </Select.ScrollDownButton>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
        {#if $errors.categoryName}
            <p class="mt-0.5 text-xs text-destructive">{$errors.categoryName}</p>
        {/if}
    </div>

    <!-- Date -->
    <div>
        <label for="date" class="block text-sm font-medium text-foreground mb-1">
            When <span class="text-destructive">*</span>
        </label>
        <div class="relative">
            <CalendarBlank class="text-muted-foreground absolute start-3 top-1/2 size-6 -translate-y-1/2" />
            <input
                id="date"
                name="date"
                type="datetime-local"
                bind:value={$form.date}
                required
                class="h-input rounded-9px border-border-input bg-background placeholder:text-foreground-alt/50 focus:ring-foreground focus:ring-offset-background focus:outline-hidden inline-flex w-full touch-none border px-11 text-base transition-colors focus:ring-2 focus:ring-offset-2 sm:text-sm dark:[color-scheme:dark]"
                aria-invalid={$errors.date ? 'true' : undefined}
            />
        </div>
        {#if $errors.date}
            <p class="mt-0.5 text-xs text-destructive">{$errors.date}</p>
        {/if}
    </div>

    <!-- Who Spent -->
    <div>
        <label class="block text-sm font-medium text-foreground mb-1">
            Who spent? <span class="text-xs text-muted-foreground/60">(optional)</span>
        </label>
        <Select.Root
            type="single"
            name="userId"
            bind:value={getUserId, setUserId}
            items={[
                { value: '', label: 'Vault Expense' },
                ...members.map(m => ({
                    value: m.userId,
                    label: `${m.firstName} ${m.lastName}` + (m.role === 'owner' ? ' (Owner)' : '')
                }))
            ]}
            allowDeselect={false}
        >
            <Select.Trigger
                class="h-input rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-full touch-none select-none items-center border px-[11px] text-sm transition-colors"
                aria-label="Select who spent"
            >
                <User class="text-muted-foreground mr-[9px] size-6" />
                {selectedUserLabel}
                <CaretUpDown class="text-muted-foreground ml-auto size-6" />
            </Select.Trigger>
            <Select.Portal>
                <Select.Content
                    class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden z-50 h-96 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] select-none rounded-xl border px-1 py-3 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
                    sideOffset={10}
                >
                    <Select.ScrollUpButton class="flex w-full items-center justify-center">
                        <CaretDoubleUp class="size-3" />
                    </Select.ScrollUpButton>
                    <Select.Viewport class="p-1">
                        <Select.Item
                            class="rounded-button data-highlighted:bg-muted outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm"
                            value=""
                            label="Vault Expense"
                        >
                            {#snippet children({ selected })}
                                Vault Expense
                                {#if selected}
                                    <div class="ml-auto">
                                        <Check aria-label="check" />
                                    </div>
                                {/if}
                            {/snippet}
                        </Select.Item>
                        {#each members as member}
                            <Select.Item
                                class="rounded-button data-highlighted:bg-muted outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm"
                                value={member.userId}
                                label={`${member.firstName} ${member.lastName}`}
                            >
                                {#snippet children({ selected })}
                                    <div class="flex gap-4 border-b border-border-input pb-2">
                                        <p>{member.email} {member.role === 'owner' ? '(Owner)' : '(member)'}</p>
                                    </div>

                                    {#if selected}
                                        <div class="ml-auto">
                                            <Check aria-label="check" />
                                        </div>
                                    {/if}
                                {/snippet}
                            </Select.Item>
                        {/each}
                    </Select.Viewport>
                    <Select.ScrollDownButton class="flex w-full items-center justify-center">
                        <CaretDoubleDown class="size-3" />
                    </Select.ScrollDownButton>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
        {#if $errors.userId}
            <p class="mt-0.5 text-xs text-destructive">{$errors.userId}</p>
        {/if}
    </div>

    <!-- Note -->
    <div>
        <label for="note" class="block text-sm font-medium text-foreground mb-1">
            What did you spend on?
        </label>
        <div class="relative">
            <Note class="text-muted-foreground absolute start-3 top-3 size-6" />
            <textarea
                id="note"
                name="note"
                bind:value={$form.note}
                placeholder="e.g., Grocery shopping at Whole Foods, Gas station fill-up, Coffee with friends..."
                rows="3"
                class="rounded-9px border-border-input bg-background placeholder:text-foreground-alt/50 focus:ring-foreground focus:ring-offset-background focus:outline-hidden inline-flex w-full touch-none border px-11 py-2 text-base transition-colors focus:ring-2 focus:ring-offset-2 sm:text-sm resize-none"
            ></textarea>
        </div>
        {#if $errors.note}
            <p class="mt-0.5 text-xs text-destructive">{$errors.note}</p>
        {/if}
    </div>

    <!-- Advanced Options (collapsible) -->
    <div class="border-t pt-3">
        <button
            type="button"
            onclick={() => showAdvancedOptions = !showAdvancedOptions}
            class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
            <CaretDown class="w-4 h-4 transition-transform {showAdvancedOptions ? 'rotate-180' : ''}" />
            <span>Payment Options</span>
        </button>

        {#if showAdvancedOptions}
            <div class="space-y-4">
                <!-- Payment Type -->
                <div>
                    <label for="paymentType" class="block text-sm font-medium text-foreground mb-1">
                        Payment Type
                    </label>
                    <Select.Root
                        type="single"
                        name="paymentType"
                        bind:value={getPaymentType, setPaymentType}
                        items={paymentTypes.map(type => ({
                            value: type.code,
                            label: type.name,
                        }))}
                        allowDeselect={true}
                    >
                        <Select.Trigger
                            class="h-input rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-full touch-none select-none items-center border px-[11px] text-sm transition-colors"
                            aria-label="Select payment type"
                        >
                            <Wallet class="text-muted-foreground mr-[9px] size-6" />
                            {selectedPaymentType?.name ?? 'Select a payment type'}
                            <CaretUpDown class="text-muted-foreground ml-auto size-6" />
                        </Select.Trigger>
                        <Select.Portal>
                            <Select.Content
                                class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden z-50 h-96 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] select-none rounded-xl border px-1 py-3 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
                                sideOffset={10}
                            >
                                <Select.ScrollUpButton class="flex w-full items-center justify-center">
                                    <CaretDoubleUp class="size-3" />
                                </Select.ScrollUpButton>
                                <Select.Viewport class="p-1">
                                    {#each paymentTypes as type}
                                        <Select.Item
                                            class="rounded-button data-highlighted:bg-muted outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm"
                                            value={type.code}
                                            label={type.name}
                                        >
                                            {#snippet children({ selected })}
                                                <div class="flex items-center gap-4">
                                                    <IconDisplay icon={type.icon} iconType={type.iconType} size="sm" />
                                                    <p>{type.name}</p>
                                                </div>
                                                {#if selected}
                                                    <div class="ml-auto">
                                                        <Check aria-label="check" />
                                                    </div>
                                                {/if}
                                            {/snippet}
                                        </Select.Item>
                                    {/each}
                                </Select.Viewport>
                                <Select.ScrollDownButton class="flex w-full items-center justify-center">
                                    <CaretDoubleDown class="size-3" />
                                </Select.ScrollDownButton>
                            </Select.Content>
                        </Select.Portal>
                    </Select.Root>
                </div>

                <!-- Payment Provider -->
                {#if paymentProviderForPaymentType?.length > 0}
                    <div>
                        <label for="paymentProvider" class="block text-sm font-medium text-foreground mb-1">
                            Payment Provider
                        </label>
                        <Select.Root
                                type="single"
                                name="paymentProvider"
                                bind:value={getPaymentProvider, setPaymentProvider}
                                items={paymentProviderForPaymentType}
                                allowDeselect={true}
                        >
                            <Select.Trigger
                                    class="h-input rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-full touch-none select-none items-center border px-[11px] text-sm transition-colors"
                                    aria-label="Select payment provider"
                            >
                                <Bank class="text-muted-foreground mr-[9px] size-6" />
                                {selectedPaymentProvider?.name ?? 'Select a payment provider'}
                                <CaretUpDown class="text-muted-foreground ml-auto size-6" />
                            </Select.Trigger>
                            <Select.Portal>
                                <Select.Content
                                        class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden z-50 h-96 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] select-none rounded-xl border px-1 py-3 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
                                        sideOffset={10}
                                >
                                    <Select.ScrollUpButton class="flex w-full items-center justify-center">
                                        <CaretDoubleUp class="size-3" />
                                    </Select.ScrollUpButton>
                                    <Select.Viewport class="p-1">
                                        {#each paymentProviderForPaymentType as option}
                                            <Select.Item
                                                    class="rounded-button data-highlighted:bg-muted outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm"
                                                    value={option.value}
                                                    label={option.label}
                                            >
                                                {#snippet children({ selected })}
                                                    <div class="flex items-center gap-4">
                                                        <IconDisplay icon={option.icon} iconType={option.iconType} size="sm" />
                                                        <p>{option.name}</p>
                                                    </div>
                                                    {#if selected}
                                                        <div class="ml-auto">
                                                            <Check aria-label="check" />
                                                        </div>
                                                    {/if}
                                                {/snippet}
                                            </Select.Item>
                                        {/each}
                                    </Select.Viewport>
                                    <Select.ScrollDownButton class="flex w-full items-center justify-center">
                                        <CaretDoubleDown class="size-3" />
                                    </Select.ScrollDownButton>
                                </Select.Content>
                            </Select.Portal>
                        </Select.Root>
                    </div>
                {/if}
            </div>
        {/if}
    </div>

    <!-- Actions -->
    <div class="flex gap-3 pt-4">
        <Button type="submit" variant="default" disabled={$submitting} class="flex-1">
            {$submitting ? 'Updating...' : 'Update Expense'}
        </Button>
        <Button type="button" variant="outline" onclick={handleCancel} disabled={$submitting}>
            Cancel
        </Button>
    </div>
</form>
