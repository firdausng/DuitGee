<script lang="ts">
    import Button from '$lib/components/ui/Button.svelte';
    import IconPicker from '$lib/components/ui/IconPicker.svelte';
    import type {Category, CreateExpenseTemplate} from "$lib/schemas/expense";
    import type {PaymentProvider, PaymentType} from "$lib/configuration/paymentTypes";
    import {Combobox} from "bits-ui";
    import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
    import Check from "phosphor-svelte/lib/Check";
    import Cards from "phosphor-svelte/lib/Cards";
    import CaretDoubleUp from "phosphor-svelte/lib/CaretDoubleUp";
    import CaretDoubleDown from "phosphor-svelte/lib/CaretDoubleDown";
    import Bank from "phosphor-svelte/lib/Bank";
    import Wallet from "phosphor-svelte/lib/Wallet";
    import User from "phosphor-svelte/lib/User";
    import { Select } from "bits-ui";
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
        categories: Category[];
        paymentTypes: PaymentType[];
        paymentProviders: PaymentProvider[];
        members?: Member[];
        currentUserId: string;
        vaultId: string;
        onSubmit: (data: CreateExpenseTemplate) => void;
        onCancel: () => void;
        isSubmitting?: boolean;
    }

    let {
        categories,
        paymentTypes,
        paymentProviders,
        members = [],
        currentUserId,
        vaultId,
        onSubmit,
        onCancel,
        isSubmitting = false
    }: Props = $props();

    // Form state
    let formData: CreateExpenseTemplate = $state({
        name: '',
        description: '',
        defaultAmount: 0,
        paymentType: '',
        paymentProvider: '',
        note: '',
        icon: '📝',
        iconType: 'emoji',
        defaultUserId: '__creator__', // Default to expense creator
        userId: currentUserId,
        categoryName: null,
        vaultId: vaultId,
    });

    // State for searchable categories
    let allCategories = $state(categories.map(cat => ({
        ...cat,
        value: cat.name,
        label: cat.name,
    })));

    let category = $state("");
    const selectedCategory = $derived(
        allCategories.find(opt => opt.value === category)
    );


    function getCategory() {
        return formData.categoryName ?? '';
    }

    function setCategory(newValue: string) {
        formData.categoryName = newValue;
        category = newValue;
    }

    // Default user options
    const defaultUserOptions = [
        { value: '__creator__', label: 'User who creates the expense (Default)' },
        { value: '', label: 'Vault Expense' },
        { value: currentUserId, label: 'Myself' },
        ...members.filter(m => m.userId !== currentUserId).map(m => ({
            value: m.userId,
            label: `${m.firstName} ${m.lastName} (${m.email})`
        }))
    ];

    let defaultUser = $state('__creator__');
    const selectedDefaultUser = $derived(
        defaultUserOptions.find(opt => opt.value === defaultUser)?.label ?? "Select default User"
    );

    function getDefaultUser() {
        return defaultUser;
    }

    function setDefaultUser(newValue: string) {
        formData.defaultUserId = newValue;
        defaultUser = newValue;
    }

    // Payment type
    let paymentType = $state("");
    const selectedPaymentType = $derived(
        paymentType
            ? paymentTypes.find((type) => type.code === paymentType)
            : null
    );

    function getPaymentType() {
        return paymentType;
    }

    function setPaymentType(newValue: string) {
        formData.paymentType = newValue;
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

    let paymentProvider = $state("");
    const selectedPaymentProvider = $derived(
        paymentProviderForPaymentType.find(opt => opt.id === paymentProvider)
    );

    function getPaymentProvider() {
        return formData.paymentProvider ?? "";
    }

    function setPaymentProvider(newValue: string) {
        formData.paymentProvider = newValue;
        paymentProvider = newValue;
    }

    // Icon
    let iconValue = $state("📝");
    function getIcon() {
        return iconValue;
    }

    function setIcon(newValue: string) {
        formData.icon = newValue;
        iconValue = newValue;
    }

    function handleSubmit(e: Event) {
        e.preventDefault();

        const submitData: CreateExpenseTemplate = {
            ...formData,
        };

        onSubmit(submitData);
    }
</script>

<form onsubmit={handleSubmit} class="space-y-4 pr-8 md:pr-2">
    <!-- Template Name -->
    <div class="pr-18">
        <label for="name" class="block text-sm font-medium text-foreground mb-1">
            Template Name <span class="text-destructive">*</span>
        </label>
        <input
            type="text"
            id="name"
            bind:value={formData.name}
            required
            placeholder="e.g., Morning Coffee, Lunch at Office"
            class="w-full px-3 py-2 border rounded-md bg-background text-foreground"
        />
    </div>

    <!-- Icon -->
    <div>
        <label class="block text-sm font-medium text-foreground mb-1">
            Icon
        </label>
        <IconPicker bind:value={getIcon, setIcon}/>
    </div>

    <!-- Description -->
    <div class="pr-18">
        <label for="description" class="block text-sm font-medium text-foreground mb-1">
            Description
        </label>
        <textarea
            id="description"
            bind:value={formData.description}
            rows="2"
            placeholder="Optional description..."
            class="w-full px-3 py-2 border rounded-md bg-background text-foreground resize-none"
        ></textarea>
    </div>

    <!-- Category -->
    <div class="pr-18">
        <label for="categoryName" class="block text-sm font-medium text-foreground mb-1">
            Category
        </label>
        <Select.Root
                type="single"
                name="categoryName"
                bind:value={getCategory, setCategory}
                items={allCategories}
                allowDeselect={true}
        >
            <Select.Trigger
                    class="h-input rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-full touch-none select-none items-center border px-[11px] text-sm transition-colors"
                    aria-label="Select default category"
            >
                <Cards class="text-muted-foreground mr-[9px] size-6" />
                {#if selectedCategory}
                    <div class="flex items-center gap-4">
                        <p>{selectedCategory.name}</p>
                        <IconDisplay icon={selectedCategory.icon} iconType={selectedCategory.iconType} size="sm" />
                    </div>

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
    </div>

    <!-- Default User -->
    <div class="pr-18">
        <label class="block text-sm font-medium text-foreground mb-1">
            Default User
        </label>
        <Select.Root
            type="single"
            name="defaultUserId"
            bind:value={getDefaultUser, setDefaultUser}
            items={defaultUserOptions}
            allowDeselect={false}
        >
            <Select.Trigger
                class="h-input rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-full touch-none select-none items-center border px-[11px] text-sm transition-colors"
                aria-label="Select default user"
            >
                <User class="text-muted-foreground mr-[9px] size-6" />
                {selectedDefaultUser}
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
                        {#each defaultUserOptions as option}
                            <Select.Item
                                class="rounded-button data-highlighted:bg-muted outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm"
                                value={option.value}
                                label={option.label}
                            >
                                {#snippet children({ selected })}
                                    {option.label}
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

    <!-- Default Amount -->
    <div class="pr-18">
        <label for="amount" class="block text-sm font-medium text-foreground mb-1">
            Default Amount
        </label>
        <input
            type="number"
            id="amount"
            bind:value={formData.defaultAmount}
            step="0.01"
            min="0"
            placeholder="Optional default amount"
            class="w-full px-3 py-2 border rounded-md bg-background text-foreground"
        />
    </div>

    <!-- Default Note -->
    <div class="pr-18">
        <label for="note" class="block text-sm font-medium text-foreground mb-1">
            Default Note
        </label>
        <input
                type="text"
                id="note"
                bind:value={formData.note}
                placeholder="Optional default note"
                class="w-full px-3 py-2 border rounded-md bg-background text-foreground"
        />
    </div>

    <!-- Payment Type -->
    <div class="pr-18">
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
                {selectedPaymentType?.name}
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
                                    <!--{type.name}-->
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
        <div class="pr-18">
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
                        aria-label="Select default payment provider"
                >
                    <Cards class="text-muted-foreground mr-[9px] size-6" />
                    {selectedPaymentProvider?.name}
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
                                        <!--{option.label}-->
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

    <!-- Actions -->
    <div class="flex gap-3 pt-4">
        <Button type="submit" variant="default" disabled={isSubmitting} class="flex-1">
            {isSubmitting ? 'Creating...' : 'Create Template'}
        </Button>
        <Button type="button" variant="outline" onclick={onCancel} disabled={isSubmitting}>
            Cancel
        </Button>
    </div>
</form>
