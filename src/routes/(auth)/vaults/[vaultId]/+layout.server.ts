import type { LayoutServerLoad } from './$types';
import {authConfig} from "$lib/server/better-auth";

export const load: LayoutServerLoad = async ({locals, url, params, platform}) => {
    if(platform === undefined){
        throw new Error("No platform")
    }

    let {vaultId} = params;

    const authServer = authConfig(platform.env);

    // const team = await authServer.api.setActiveTeam({
    //     body: {
    //         teamId,
    //     },
    // });
    console.log({
        message: "[vault:layout]vaultId",
        vaultId,
        session: locals.currentSession
    })

    return {
        activeUser: locals.currentUser,
        pathname: url.pathname,
        // team,
    };
}