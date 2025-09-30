import type {AuthenticateWithSessionCookieSuccessResponse} from "@workos-inc/node";

export class AuthenticationManager {
    #state = $state<AuthenticationState>({
        authData: undefined,
    })

    get authState(){
        return this.#state.authData;
    }

    public setAuthenticationResponse(response: AuthenticateWithSessionCookieSuccessResponse){
        this.#state.authData = response;
    }
}

export type AuthenticationState = {
    authData?: AuthenticateWithSessionCookieSuccessResponse
}

export const authManager = new AuthenticationManager();