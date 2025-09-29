import {sequence} from "@sveltejs/kit/hooks";
import {
    setupServicesHandler,
    checkSessionHandler,
    setupPersonalVaultHandler,
    adminOnlyHandler
} from "$lib/server/middleware";

export const handle = sequence(setupServicesHandler, checkSessionHandler, setupPersonalVaultHandler, adminOnlyHandler);
