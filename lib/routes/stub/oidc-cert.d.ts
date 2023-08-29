import { OAuth2ConsentRequest, OAuth2LoginRequest, AcceptOAuth2ConsentRequestSession } from "@ory/client";
export declare const oidcConformityMaybeFakeAcr: (request: OAuth2LoginRequest, fallback: string) => string;
export declare const oidcConformityMaybeFakeSession: (grantScope: string[], request: OAuth2ConsentRequest, session: AcceptOAuth2ConsentRequestSession) => AcceptOAuth2ConsentRequestSession;
