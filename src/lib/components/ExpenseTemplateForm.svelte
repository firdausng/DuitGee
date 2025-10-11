<script lang="ts">
    import Button from '$lib/components/ui/Button.svelte';
    import IconDisplay from '$lib/components/IconDisplay.svelte';
    import IconPicker from '$lib/components/ui/IconPicker.svelte';
    import type {Category, CreateExpenseTemplate, ExpenseTemplate, UpdateExpenseTemplate} from "$lib/schemas/expense";
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

    type Member = {
        userId: string;
        firstName?: string;
        lastName?: string;
        email: string;
        role: string;
        status: string;
    };

    interface Props {
        template?: {
            id?: string;
            name: string;
            description?: string;
            categoryName: string|null;
            defaultAmount?: number;
            paymentType?: string;
            paymentProvider?: string;
            note?: string;
            icon?: string;
            iconType?: string;
            defaultUserId?: string;
        };
        categories: Category[];
        paymentTypes: PaymentType[];
        paymentProviders: PaymentProvider[];
        members?: Member[];
        currentUserId: string;
        vaultId: string;
        onSubmit: (data: UpdateExpenseTemplate) => void;
        onCancel: () => void;
        isSubmitting?: boolean;
    }

    let {
        template,
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
    let formData: UpdateExpenseTemplate = $state({
        name: template?.name || '',
        description: template?.description || '',
        defaultAmount: template?.defaultAmount || 0,
        paymentType: template?.paymentType || '',
        paymentProvider: template?.paymentProvider || '',
        note: template?.note || '',
        icon: template?.icon || '📝',
        iconType: template?.iconType || 'emoji',
        defaultUserId: template?.defaultUserId !== undefined ? template.defaultUserId : '__creator__', // Default to expense creator
        userId: currentUserId,
        categoryName: template?.categoryName ?? null ,
        vaultId: vaultId,
        templateId: template?.id || '',
    });

    $effect(() => {
        console.log("formData", formData);
    })

    // State for searchable categories
    let allCategories = $state(categories.map(cat => ({
        ...cat,
        value: cat.name,
        label: cat.name,
    })));

    let categorySearchValue = $state(template?.categoryName ?? "");
    const searchableCategories = $derived(
        categorySearchValue === ""
            ? allCategories
            : allCategories.filter((category) =>
                category.label.toLowerCase().includes(categorySearchValue.toLowerCase())
            )
    );

    function getCategory() {
        return categorySearchValue;
    }

    function setCategory(newValue: string) {
        formData.categoryName = newValue;
        categorySearchValue = newValue;
    }

    let defaultUser = $state(members.find((member) => member.userId === formData.defaultUserId)?.email ?? "");
    const selectedDefaultUser = $derived(
        defaultUser
            ? members.find((member) => member.email === defaultUser)?.email
            : "Select default User"
    );

    function getDefaultUser() {
        return categorySearchValue;
    }

    function setDefaultUser(newValue: string) {
        formData.defaultUserId = newValue;
        categorySearchValue = newValue;
    }

    // Get selected payment type to determine which providers to show
    let paymentType = $state(formData.paymentType ?? "");
    const selectedPaymentType = $derived(
        paymentType
            ? paymentTypes.find((type) => type.code === paymentType)?.code
            : "Select a payment type"
    );

    function getPaymentType() {
        return paymentType;
    }

    function setPaymentType(newValue: string) {
        formData.paymentType = newValue;
        paymentType = newValue;
    }

    let searchPaymentProviderValue = $state(formData.paymentProvider ?? "");

    const filteredPaymentProvider = $derived(
        searchPaymentProviderValue === ""
            ? paymentProviders
            : paymentProviders.filter((paymentProvider) =>
                paymentProvider.id.toLowerCase().includes(searchPaymentProviderValue.toLowerCase())
            )
    );

    let iconValue = $state(formData.icon ?? "");
    function getIcon() {
        return iconValue;
    }

    function setIcon(newValue: string) {
        formData.icon = newValue;
        iconValue = newValue;
    }


    function getPaymentProvider() {
        return searchPaymentProviderValue;
    }

    function setPaymentProvider(newValue: string) {
        formData.paymentProvider = newValue;
        searchPaymentProviderValue = newValue;
    }

    function handleSubmit(e: Event) {
        e.preventDefault();

        const submitData: UpdateExpenseTemplate = {
            ...formData,
            defaultAmount: formData.defaultAmount,
            categoryName: formData.categoryName,
            paymentType: formData.paymentType,
            paymentProvider: formData.paymentProvider,
            note: formData.note,
            description: formData.description
        };

        console.log("submitData", submitData);

        onSubmit(submitData);
    }

</script>

<form onsubmit={handleSubmit} class="space-y-4">
    <!-- Template Name -->
    <div>
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

    <!-- Description -->
    <div>
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

    <div class="flex gap-3">

        <Combobox.Root
                type="single"
                name="categoryName"
                bind:value={getCategory, setCategory}
                onOpenChangeComplete={(o) => {if (!o) categorySearchValue = "";}}
        >
            <div class="relative">
                <Cards
                        class="text-muted-foreground absolute start-3 top-1/2 size-6 -translate-y-1/2"
                />
                <Combobox.Input
                        oninput={(e) => (categorySearchValue = e.currentTarget.value)}
                        class="h-input rounded-9px border-border-input bg-background placeholder:text-foreground-alt/50 focus:ring-foreground focus:ring-offset-background focus:outline-hidden inline-flex w-[296px] touch-none truncate border px-11 text-base transition-colors focus:ring-2 focus:ring-offset-2 sm:text-sm"
                        placeholder="Search a category"
                        aria-label="Search a category"
                />
                <Combobox.Trigger
                        class="absolute end-3 top-1/2 size-6 -translate-y-1/2 touch-none"
                >
                    <CaretUpDown class="text-muted-foreground size-6" />
                </Combobox.Trigger>
            </div>
            <Combobox.Portal>
                <Combobox.Content
                        class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden z-50 h-96 max-h-[var(--bits-combobox-content-available-height)] w-[var(--bits-combobox-anchor-width)] min-w-[var(--bits-combobox-anchor-width)] select-none rounded-xl border px-1 py-3 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
                        sideOffset={10}
                >
                    <Combobox.ScrollUpButton
                            class="flex w-full items-center justify-center py-1"
                    >
                        <CaretDoubleUp class="size-3" />
                    </Combobox.ScrollUpButton>
                    <Combobox.Viewport class="p-1">
                        {#each searchableCategories as categories, i (i + categories.value)}
                            <Combobox.Item
                                    class="rounded-button data-highlighted:bg-muted outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm capitalize"
                                    value={categories.value}
                                    label={categories.label}
                            >
                                {#snippet children({ selected })}
                                    {categories.label}
                                    {#if selected}
                                        <div class="ml-auto">
                                            <Check />
                                        </div>
                                    {/if}
                                {/snippet}
                            </Combobox.Item>
                        {:else}
          <span class="block px-5 py-2 text-sm text-muted-foreground">
            No results found, try again.
          </span>
                        {/each}
                    </Combobox.Viewport>
                    <Combobox.ScrollDownButton
                            class="flex w-full items-center justify-center py-1"
                    >
                        <CaretDoubleDown class="size-3" />
                    </Combobox.ScrollDownButton>
                </Combobox.Content>
            </Combobox.Portal>
        </Combobox.Root>

        <!-- Default User/Creator -->
        <Select.Root
                type="single"
                name="defaultUserId"
                bind:value={getDefaultUser, setDefaultUser}
                onValueChange={(v) => (defaultUser = v)}
                items={members.map(member => ({
                ...member,
                value: member.email,
                label: member.email,
            }))}
                allowDeselect={true}
        >
            <Select.Trigger
                    class="h-input rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-[296px] touch-none select-none items-center border px-[11px] text-sm transition-colors"
                    aria-label="Select a theme"
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
                        {#each members as member, i ( member.email)}
                            <Select.Item
                                    class="rounded-button data-highlighted:bg-muted outline-hidden data-disabled:opacity-50 flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm capitalize"
                                    value={member.email}
                                    label={member.email}
                                    disabled={false}
                            >
                                {#snippet children({ selected })}
                                    {member.firstName} {member.lastName} ({member.email})
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
    <div>
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

    <div class="flex gap-3">
        <!-- Payment Type -->
        <Select.Root
                type="single"
                bind:value={getPaymentType, setPaymentType}
                items={paymentTypes.map(type => ({
                    ...type,
                    value: type.code,
                    label: type.name,
                }))}
                allowDeselect={true}
        >
            <Select.Trigger
                    class="h-input rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-[296px] touch-none select-none items-center border px-[11px] text-sm transition-colors"
                    aria-label="Select a theme"
            >
                <Wallet class="text-muted-foreground mr-[9px] size-6" />
                {selectedPaymentType}
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
                        {#each paymentTypes as paymentType, i (i + paymentType.code)}
                            <Select.Item
                                    class="rounded-button data-highlighted:bg-muted outline-hidden data-disabled:opacity-50 flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm capitalize"
                                    value={paymentType.code}
                                    label={paymentType.name}
                                    disabled={false}
                            >
                                {#snippet children({ selected })}
                                    {paymentType.name}
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

        <!-- Payment Provider -->
        {#if paymentType?.length > 0}
            <Combobox.Root
                    bind:value={getPaymentProvider, setPaymentProvider}
                    type="single"
                    name="paymentProvider"
                    onOpenChangeComplete={(o) => {
    if (!o) searchPaymentProviderValue = "";
  }}
            >
                <div class="relative">
                    <Bank
                            class="text-muted-foreground absolute start-3 top-1/2 size-6 -translate-y-1/2"
                    />
                    <Combobox.Input
                            oninput={(e) => (searchPaymentProviderValue = e.currentTarget.value)}
                            class="h-input rounded-9px border-border-input bg-background placeholder:text-foreground-alt/50 focus:ring-foreground focus:ring-offset-background focus:outline-hidden inline-flex w-[296px] touch-none truncate border px-11 text-base transition-colors focus:ring-2 focus:ring-offset-2 sm:text-sm"
                            placeholder="Search a payment provider"
                            aria-label="Search a payment provider"
                    />
                    <Combobox.Trigger
                            class="absolute end-3 top-1/2 size-6 -translate-y-1/2 touch-none"
                    >
                        <CaretUpDown class="text-muted-foreground size-6" />
                    </Combobox.Trigger>
                </div>
                <Combobox.Portal>
                    <Combobox.Content
                            class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden z-50 h-96 max-h-[var(--bits-combobox-content-available-height)] w-[var(--bits-combobox-anchor-width)] min-w-[var(--bits-combobox-anchor-width)] select-none rounded-xl border px-1 py-3 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
                            sideOffset={10}
                    >
                        <Combobox.ScrollUpButton
                                class="flex w-full items-center justify-center py-1"
                        >
                            <CaretDoubleUp class="size-3" />
                        </Combobox.ScrollUpButton>
                        <Combobox.Viewport class="p-1">
                            {#each filteredPaymentProvider as paymentProvider, i (i + paymentProvider.id)}
                                <Combobox.Item
                                        class="rounded-button data-highlighted:bg-muted outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm capitalize"
                                        value={paymentProvider.id}
                                        label={paymentProvider.name}
                                >
                                    {#snippet children({ selected })}
                                        {paymentProvider.name}
                                        {#if selected}
                                            <div class="ml-auto">
                                                <Check />
                                            </div>
                                        {/if}
                                    {/snippet}
                                </Combobox.Item>
                            {:else}
          <span class="block px-5 py-2 text-sm text-muted-foreground">
            No results found, try again.
          </span>
                            {/each}
                        </Combobox.Viewport>
                        <Combobox.ScrollDownButton
                                class="flex w-full items-center justify-center py-1"
                        >
                            <CaretDoubleDown class="size-3" />
                        </Combobox.ScrollDownButton>
                    </Combobox.Content>
                </Combobox.Portal>
            </Combobox.Root>
        {/if}
    </div>


    <!-- Default Note -->
    <div>
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

    <!-- Icon -->
    <div>
        <label class="block text-sm font-medium text-foreground mb-1">
            Icon
        </label>
        <IconPicker bind:value={getIcon, setIcon}/>
    </div>

    <!-- Actions -->
    <div class="flex gap-3 pt-4">
        <Button type="submit" variant="default" disabled={isSubmitting} class="flex-1">
            {isSubmitting ? 'Saving...' : template?.id ? 'Update Template' : 'Create Template'}
        </Button>
        <Button type="button" variant="outline" onclick={onCancel} disabled={isSubmitting}>
            Cancel
        </Button>
    </div>
</form>
