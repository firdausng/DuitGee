import type {BetterAuthOptions, BetterAuthPlugin} from "better-auth";
import {plugins} from "$lib/better-auth";

export const betterAuthOptions: BetterAuthOptions = {
    appName: 'DUIT_GEE',
    plugins: plugins,
};

