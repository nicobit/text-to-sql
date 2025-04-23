import { CLIENT_ID } from "./constants";
import { TENANT_ID , REDIRECT_URI } from "./constants";



export const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: `${REDIRECT_URI}`,
  },
  cache: {
    cacheLocation: "sessionStorage" as const,
    storeAuthStateInCookie: false,
  },
};
//scopes: ["openid", "profile","https://management.azure.com/.default"],
export const loginRequest = {
  scopes: ["openid", "profile","https://management.azure.com/.default"],
};
