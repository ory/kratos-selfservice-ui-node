import { FrontendApi, IdentityApi, OAuth2Api } from "@ory/client";
export declare const apiBaseUrl: string;
declare const sdk: {
    basePath: string;
    frontend: FrontendApi;
    oauth2: OAuth2Api;
    identity: IdentityApi;
};
export default sdk;
