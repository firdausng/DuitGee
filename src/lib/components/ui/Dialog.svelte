<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import X from 'phosphor-svelte/lib/X';

	interface Props {
		open?: boolean;
		title?: string;
		description?: string;
		onClose?: () => void;
		children?: any;
	}

	let {
		open = $bindable(false),
		title,
		description,
		onClose,
		children
	}: Props = $props();

	function handleClose() {
		open = false;
		onClose?.();
	}
</script>

<DialogPrimitive.Root bind:open>
	<DialogPrimitive.Portal>
		<DialogPrimitive.Overlay
			class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
		/>
		<DialogPrimitive.Content
			class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[90vh] overflow-y-auto"
		>
			{#if title || description}
				<div class="flex flex-col space-y-1.5 text-center sm:text-left">
					{#if title}
						<DialogPrimitive.Title class="text-lg font-semibold leading-none tracking-tight text-foreground">
							{title}
						</DialogPrimitive.Title>
					{/if}
					{#if description}
						<DialogPrimitive.Description class="text-sm text-muted-foreground">
							{description}
						</DialogPrimitive.Description>
					{/if}
				</div>
			{/if}

			<div class="relative">
				{@render children?.()}
			</div>

			<DialogPrimitive.Close
				class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
			>
				<X class="h-4 w-4" />
				<span class="sr-only">Close</span>
			</DialogPrimitive.Close>
		</DialogPrimitive.Content>
	</DialogPrimitive.Portal>
</DialogPrimitive.Root>
