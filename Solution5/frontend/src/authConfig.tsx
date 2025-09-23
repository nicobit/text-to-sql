import { CLIENT_ID } from "./constants";
import { TENANT_ID , REDIRECT_URI, API_CLIENT_ID } from "./constants";



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

export const apiScope = `api://${API_CLIENT_ID}/user_impersonation`;

//scopes: ["openid", "profile","https://management.azure.com/.default"],
// scopes: ["openid", "profile", apiScope],
export const loginRequest = {
 scopes: ["openid", "profile", apiScope],
  //scopes: ["openid", "profile","https://management.azure.com/.default"],
};
