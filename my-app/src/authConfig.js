//CLIENT_ID and TENANT_ID both extracted from constants file (externailsing them - not in source code repository)
import { CLIENT_ID } from "./constants";
import { TENANT_ID } from "./constants";

export const msalConfig = {
  auth: {
    clientId: "c9e3713a-5a1a-4244-a3fe-b7abc11bf4a2",
    authority: "https://login.microsoftonline.com/2bc68803-f1aa-44bb-b6b4-1831a4bd8d58",
    redirectUri: "http://localhost:3000",
  },
};

export const loginRequest = {
  scopes: ["openid", "profile"],
};