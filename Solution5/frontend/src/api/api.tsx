import { API_BASE_URL } from '../constants';
import { loginRequest } from "../authConfig";

import { IPublicClientApplication } from "@azure/msal-browser";



export async function submitQuery(instance: IPublicClientApplication, queryText: string): Promise<any> {
  try {
    const tokenResponse = await instance.acquireTokenSilent(loginRequest);
    const token = tokenResponse.accessToken;

    const response = await fetch(`${API_BASE_URL}/texttosql/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ query: queryText, session_id: "" }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Request failed');
    }

    const resultData = await response.json();
    return resultData;
  } catch (err) {
    console.error('Query submission error:', err);
    throw err;
  }
}
