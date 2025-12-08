<script lang="ts">
    import {Drawer, DrawerContent, DrawerHeader, DrawerTitle} from "$lib/components/ui/drawer";
    import {cn} from "$lib/utils";
    import type {VaultStatistics} from "../types";

    type Props = {
        open: boolean;
        statistics: VaultStatistics | null;
        filterType: 'template' | 'category' | 'member';
        filterId: string | undefined;
        filterName: string;
        onOpenChange: (open: boolean) => void;
        onFilterChange: (type: 'template' | 'category' | 'member', id: string | null, name: string) => void;
    };

    let {
        open = $bindable(),
        statistics,
        filterType,
        filterId,
        filterName,
        onOpenChange,
        onFilterChange
    }: Props = $props();
</script>

<Drawer bind:open={open}>
    <DrawerContent>
        <DrawerHeader>
            <DrawerTitle>Switch Filter</DrawerTitle>
            <p class="text-sm text-muted-foreground">View statistics by template, category, or member</p>
        </DrawerHeader>
        <div class="p-4 space-y-4 overflow-y-auto">
            <!-- Templates -->
            {#if statistics?.byTemplate.length}
                <div>
                    <h4 class="text-sm font-semibold mb-2 text-muted-foreground">By Template</h4>
                    <div class="flex flex-wrap gap-2">
                        {#each statistics.byTemplate as template}
                            <button
                                type="button"
                                onclick={() => onFilterChange('template', template.templateId, template.templateName)}
                                class={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                                    filterType === 'template' && filterId === template.templateId
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted hover:bg-muted/80"
                                )}
                            >
                                <span>{template.templateIcon}</span>
                                <span>{template.templateName}</span>
                                <span class="text-xs opacity-75">({template.count})</span>
                            </button>
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- Categories -->
            {#if statistics?.byCategory.length}
                <div>
                    <h4 class="text-sm font-semibold mb-2 text-muted-foreground">By Category</h4>
                    <div class="flex flex-wrap gap-2">
                        {#each statistics.byCategory as category}
                            <button
                                type="button"
                                onclick={() => onFilterChange('category', null, category.categoryName)}
                                class={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                                    filterType === 'category' && filterName === category.categoryName
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted hover:bg-muted/80"
                                )}
                            >
                                <span>{category.categoryName}</span>
                                <span class="text-xs opacity-75">({category.count})</span>
                            </button>
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- Members -->
            {#if statistics?.byMember.length}
                <div>
                    <h4 class="text-sm font-semibold mb-2 text-muted-foreground">By Member</h4>
                    <div class="flex flex-wrap gap-2">
                        {#each statistics.byMember as member}
                            <button
                                type="button"
                                onclick={() => onFilterChange('member', member.userId, member.displayName)}
                                class={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                                    filterType === 'member' && filterId === member.userId
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted hover:bg-muted/80"
                                )}
                            >
                                <span>{member.displayName}</span>
                                <span class="text-xs opacity-75">({member.count})</span>
                            </button>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </DrawerContent>
</Drawer>
