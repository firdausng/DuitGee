<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";

	let {
		open = $bindable(false),
		title,
		description,
		cancelText = "Cancel",
		confirmText = "Confirm",
		onConfirm,
		variant = "default"
	}: {
		open?: boolean;
		title: string;
		description: string;
		cancelText?: string;
		confirmText?: string;
		onConfirm: () => void;
		variant?: "default" | "destructive";
	} = $props();
</script>

<AlertDialogPrimitive.Root bind:open>
	<AlertDialogPrimitive.Portal>
		<AlertDialogPrimitive.Overlay
			class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
		/>
		<AlertDialogPrimitive.Content
			class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
		>
			<div class="flex flex-col space-y-2 text-center sm:text-left">
				<AlertDialogPrimitive.Title class="text-lg font-semibold text-foreground">
					{title}
				</AlertDialogPrimitive.Title>
				<AlertDialogPrimitive.Description class="text-sm text-muted-foreground">
					{description}
				</AlertDialogPrimitive.Description>
			</div>
			<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
				<AlertDialogPrimitive.Cancel
					class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
				>
					{cancelText}
				</AlertDialogPrimitive.Cancel>
				<AlertDialogPrimitive.Action
					onclick={onConfirm}
					class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 {variant === 'destructive'
						? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
						: 'bg-primary text-primary-foreground hover:bg-primary/90'}"
				>
					{confirmText}
				</AlertDialogPrimitive.Action>
			</div>
		</AlertDialogPrimitive.Content>
	</AlertDialogPrimitive.Portal>
</AlertDialogPrimitive.Root>
