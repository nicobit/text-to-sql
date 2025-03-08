import { PublicClientApplication } from "@azure/msal-browser";
export const msalConfig = {
  auth: {
    clientId: "c9e3713a-5a1a-4244-a3fe-b7abc11bf4a2",            // Azure AD app (frontend SPA) client ID
    authority: "https://login.microsoftonline.com/2bc68803-f1aa-44bb-b6b4-1831a4bd8d58",  // Tenant or common
    redirectUri: "/"   // redirect URI configured in Azure AD
  }
};

export const loginRequest = {
    scopes: ["openid", "profile"],
  //scopes: ["api://<YOUR_BACKEND_APP_CLIENT_ID>/.default"] 
  // or ["api://.../user_impersonation"] depending on how you expose the API
};
export const msalInstance = new PublicClientApplication(msalConfig);