import {WorkOS} from "@workos-inc/node";
import {createRemoteJWKSet, jwtVerify} from "jose";

export class AuthService {
    private workos: WorkOS;
    
    constructor(private apiKey: string, private clientId: string, private basePath:string, private cookiePassword:string) {
        this.workos = new WorkOS(this.apiKey, {
            clientId: this.clientId,
        });
    }
    
    getLoginRedirectUrl(){
        return this.workos.userManagement.getAuthorizationUrl({
            // Specify that we'd like AuthKit to handle the authentication flow
            provider: 'authkit',
            // The callback endpoint that WorkOS will redirect to after a user authenticates
            redirectUri: `${this.basePath}/callback`,
            clientId: this.clientId,
        });
    }

    getLogoutRedirectUrl(sessionData: string){
        const session = this.workos.userManagement.loadSealedSession({
            sessionData: sessionData,
            cookiePassword: this.cookiePassword,
        });

        return session.getLogoutUrl();
    }

    authenticateWithRefreshToken(refreshToken: string){
        return this.workos.userManagement.authenticateWithRefreshToken({
            clientId: this.clientId,
            refreshToken,
            session: {
                sealSession: true,
                cookiePassword: this.cookiePassword,
            }
        });
    }
    
    async authenticateWithCode(code: string){
        console.log("code", code);
        
        return this.workos.userManagement.authenticateWithCode({
            clientId: this.clientId,
            code,
            session: {
                sealSession: true,
                cookiePassword: this.cookiePassword,
            }
        });
    }

    async getSessionFromCookie(sealSession: string){
        return this.workos.userManagement.getSessionFromCookie({
            sessionData: sealSession,
            cookiePassword: this.cookiePassword,
        })
    }
    
    async authenticate(sealSession: string){
        const session = this.workos.userManagement.loadSealedSession({
            sessionData: sealSession,
            cookiePassword: this.cookiePassword,
        });
        
        return await session.authenticate();
    }

    async getProfile(code: string){
        console.log("code", code);

        return this.workos.sso.getProfileAndToken({
            code,
            clientId: this.clientId,
        })
    }
    
    public getJwksUrl(){
        
        return this.workos.userManagement.getJwksUrl(this.clientId);
    }

    public async verifiedSession(accessToken: string){
        const jwtkUrl = new URL(this.workos.userManagement.getJwksUrl(this.clientId));
        const jwks = createRemoteJWKSet(jwtkUrl);
        return jwtVerify(accessToken, jwks);
    }
}

export type WorkOSToken = {
    sid: string
}